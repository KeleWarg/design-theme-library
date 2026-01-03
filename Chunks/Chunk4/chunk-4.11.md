# Chunk 4.11 — Import API Endpoint

## Purpose
API endpoint to receive Figma plugin exports.

---

## Inputs
- HTTP POST from Figma plugin

## Outputs
- Import record in database
- API route handling

---

## Dependencies
- Chunk 4.04 must be complete
- Chunk 1.10 must be complete

---

## Implementation Notes

### Database Tables
```sql
-- supabase/migrations/005_figma_imports.sql

-- Figma import sessions
CREATE TABLE figma_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_key VARCHAR(100),
  file_name VARCHAR(255),
  exported_at TIMESTAMPTZ,
  component_count INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imported component data (staging)
CREATE TABLE figma_import_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES figma_imports(id) ON DELETE CASCADE,
  figma_id VARCHAR(100),
  name VARCHAR(255),
  description TEXT,
  component_type VARCHAR(50),
  properties JSONB,
  variants JSONB,
  structure JSONB,
  bound_variables JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imported images
CREATE TABLE figma_import_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES figma_imports(id) ON DELETE CASCADE,
  node_id VARCHAR(100),
  node_name VARCHAR(255),
  storage_path VARCHAR(500),
  format VARCHAR(10),
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_figma_import_components_import_id ON figma_import_components(import_id);
CREATE INDEX idx_figma_import_images_import_id ON figma_import_images(import_id);
```

### Supabase Edge Function
```typescript
// supabase/functions/figma-import/index.ts
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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const existingImportId = pathParts.length > 2 ? pathParts[2] : null;

    const body = await req.json();
    const { components, images, metadata } = body;

    let importId = existingImportId;

    // Create new import record if this is the first chunk
    if (!importId) {
      const { data: importRecord, error: importError } = await supabase
        .from('figma_imports')
        .insert({
          file_key: metadata.fileKey,
          file_name: metadata.fileName,
          exported_at: metadata.exportedAt,
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
      await supabase
        .from('figma_imports')
        .update({ 
          component_count: supabase.rpc('increment_component_count', { 
            import_id: importId, 
            count: components.length 
          })
        })
        .eq('id', importId);
    }

    // Store components
    for (const component of components) {
      const { error } = await supabase
        .from('figma_import_components')
        .insert({
          import_id: importId,
          figma_id: component.id,
          name: component.name,
          description: component.description,
          component_type: component.type,
          properties: component.properties,
          variants: component.variants,
          structure: component.structure,
          bound_variables: component.boundVariables
        });

      if (error) {
        console.error(`Failed to store component ${component.name}:`, error);
      }
    }

    // Store images in storage and create records
    for (const image of images) {
      try {
        // Decode base64 to bytes
        const bytes = Uint8Array.from(atob(image.data), c => c.charCodeAt(0));
        const path = `imports/${importId}/${image.nodeId.replace(/[/:]/g, '_')}.${image.format.toLowerCase()}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('component-images')
          .upload(path, bytes, {
            contentType: `image/${image.format.toLowerCase()}`,
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload image:`, uploadError);
          continue;
        }

        // Create database record
        await supabase
          .from('figma_import_images')
          .insert({
            import_id: importId,
            node_id: image.nodeId,
            node_name: image.nodeName,
            storage_path: path,
            format: image.format,
            width: image.width,
            height: image.height
          });
      } catch (error) {
        console.error(`Failed to process image ${image.nodeName}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, importId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
```

### Storage Bucket Setup
```sql
-- Create storage bucket for component images
INSERT INTO storage.buckets (id, name, public)
VALUES ('component-images', 'component-images', true);

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'component-images');

-- Allow authenticated uploads (or service role)
CREATE POLICY "Service upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'component-images');
```

---

## Files Created
- `supabase/functions/figma-import/index.ts` — API endpoint
- `supabase/migrations/005_figma_imports.sql` — Import tables

---

## Tests

### Unit Tests
- [ ] Creates import record
- [ ] Stores components with all fields
- [ ] Uploads images to storage
- [ ] Returns import ID
- [ ] Handles chunked uploads

---

## Time Estimate
2 hours
