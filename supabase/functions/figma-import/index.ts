/**
 * @chunk 4.11 - Figma Import API Endpoint
 * 
 * Supabase Edge Function to receive component data and images from Figma plugin.
 * Handles chunked uploads and stores data in staging tables.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    // Path format: /figma-import or /figma-import/{importId}
    const existingImportId = pathParts.length > 1 ? pathParts[1] : null;

    const body = await req.json();
    const { components = [], images = [], metadata = {} } = body;

    let importId = existingImportId;

    // Create new import record if this is the first chunk
    if (!importId) {
      const { data: importRecord, error: importError } = await supabase
        .from('figma_imports')
        .insert({
          file_key: metadata.fileKey || null,
          file_name: metadata.fileName || null,
          exported_at: metadata.exportedAt ? new Date(metadata.exportedAt).toISOString() : null,
          component_count: components.length,
          status: 'pending'
        })
        .select()
        .single();

      if (importError) {
        throw new Error(`Failed to create import: ${importError.message}`);
      }

      importId = importRecord.id;
    } else {
      // Update component count for subsequent chunks
      const { data: currentImport } = await supabase
        .from('figma_imports')
        .select('component_count')
        .eq('id', importId)
        .single();

      if (currentImport) {
        await supabase
          .from('figma_imports')
          .update({ 
            component_count: (currentImport.component_count || 0) + components.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', importId);
      }
    }

    // Store components
    if (components.length > 0) {
      const componentRecords = components.map((component: any) => ({
        import_id: importId,
        figma_id: component.id || component.figma_id || null,
        name: component.name || null,
        description: component.description || null,
        component_type: component.type || component.component_type || null,
        properties: component.properties || null,
        variants: component.variants || null,
        structure: component.structure || null,
        bound_variables: component.boundVariables || component.bound_variables || null
      }));

      const { error: componentsError } = await supabase
        .from('figma_import_components')
        .insert(componentRecords);

      if (componentsError) {
        console.error('Failed to store components:', componentsError);
        // Continue processing images even if components fail
      }
    }

    // Store images in storage and create records
    if (images.length > 0) {
      for (const image of images) {
        try {
          // Decode base64 to bytes
          const base64Data = image.data || image.base64;
          if (!base64Data) {
            console.warn('Image missing data field:', image.nodeName || image.node_id);
            continue;
          }

          const bytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const nodeId = image.nodeId || image.node_id || 'unknown';
          const format = (image.format || 'png').toLowerCase();
          const sanitizedNodeId = nodeId.replace(/[/:]/g, '_');
          const path = `imports/${importId}/${sanitizedNodeId}.${format}`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('component-images')
            .upload(path, bytes, {
              contentType: `image/${format}`,
              upsert: true
            });

          if (uploadError) {
            console.error(`Failed to upload image ${image.nodeName || nodeId}:`, uploadError);
            continue;
          }

          // Create database record
          const { error: imageRecordError } = await supabase
            .from('figma_import_images')
            .insert({
              import_id: importId,
              node_id: nodeId,
              node_name: image.nodeName || image.node_name || null,
              storage_path: path,
              format: format,
              width: image.width || null,
              height: image.height || null
            });

          if (imageRecordError) {
            console.error(`Failed to create image record for ${image.nodeName || nodeId}:`, imageRecordError);
          }
        } catch (error) {
          console.error(`Failed to process image ${image.nodeName || image.node_id}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        importId,
        componentsStored: components.length,
        imagesStored: images.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Import endpoint error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});



