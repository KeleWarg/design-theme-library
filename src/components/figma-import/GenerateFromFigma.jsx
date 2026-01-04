/**
 * @chunk 4.13 - Generate from Figma Flow
 * 
 * Connect import review to AI generation with Figma context.
 * Handles the complete flow from Figma import to generated component.
 */

import { aiService } from '../../services/aiService';
import { componentService } from '../../services/componentService';
import { buildFigmaEnhancedPrompt } from '../../lib/figmaPromptBuilder';
import { storage, BUCKETS } from '../../lib/storage';

/**
 * Handle import and generate flow from Figma
 * @param {Object} importedComponent - Figma component data
 * @param {Array} images - Component images array
 * @param {Object} themeTokens - Theme tokens grouped by category
 * @returns {Promise<Object>} Created component
 */
export async function handleImportAndGenerate(importedComponent, images, themeTokens) {
  // Build enhanced prompt with Figma context
  const prompt = buildFigmaEnhancedPrompt({
    component: importedComponent,
    themeTokens,
    images
  });

  // Generate code using AI
  const result = await aiService.generateWithCustomPrompt(prompt);

  // Auto-detect category
  const category = detectCategory(importedComponent);

  // Extract linked tokens from bound variables (use paths, not IDs!)
  const linkedTokens = (importedComponent.bound_variables || []).map(bv => {
    // Use variableName which should be the path like "Color/Primary/500"
    return bv.variableName || bv.variable_name || '';
  }).filter(Boolean);

  // Create component in database
  const component = await componentService.createComponent({
    name: importedComponent.name,
    description: importedComponent.description || '',
    category,
    code: result.code,
    props: result.props || importedComponent.properties || [],
    variants: (importedComponent.variants || []).map(v => ({
      name: v.name || '',
      props: v.props || {},
      description: v.description || ''
    })),
    linked_tokens: linkedTokens,
    figma_id: importedComponent.figma_id,
    figma_structure: importedComponent.structure,
    status: 'draft'
  });

  // Upload images to component (filter out preview images)
  const nonPreviewImages = images.filter(i => {
    const nodeName = i.node_name || i.nodeName || '';
    return !nodeName.includes('_preview') && !nodeName.includes('preview');
  });

  for (const image of nonPreviewImages) {
    try {
      let blob;
      
      // If image has base64 data directly
      if (image.data) {
        blob = base64ToBlob(image.data, `image/${(image.format || 'png').toLowerCase()}`);
      } 
      // If image has storage_path, download it
      else if (image.storage_path) {
        blob = await storage.download(BUCKETS.COMPONENT_IMAGES, image.storage_path);
      }
      // Skip if no data available
      else {
        console.warn(`Image ${image.node_name || image.node_id} has no data or storage_path, skipping`);
        continue;
      }

      // Upload to component
      const imageName = image.node_name || image.node_id || `image-${Date.now()}`;
      await componentService.uploadImage(
        component.id,
        blob,
        imageName
      );
    } catch (error) {
      console.error(`Failed to upload image ${image.node_name || image.node_id}:`, error);
      // Continue with other images even if one fails
    }
  }

  return component;
}

/**
 * Auto-detect component category from name
 * @param {Object} component - Component object with name
 * @returns {string} Category name
 */
function detectCategory(component) {
  const name = (component.name || '').toLowerCase();
  
  if (/button|btn|cta/.test(name)) return 'buttons';
  if (/input|field|form|select|checkbox|radio|textarea/.test(name)) return 'forms';
  if (/card|container|layout|section|wrapper/.test(name)) return 'layout';
  if (/nav|menu|tab|breadcrumb|pagination/.test(name)) return 'navigation';
  if (/alert|toast|notification|banner|badge/.test(name)) return 'feedback';
  if (/table|list|grid|avatar|icon/.test(name)) return 'data-display';
  if (/modal|dialog|popup|drawer|tooltip|dropdown/.test(name)) return 'overlay';
  
  return 'other';
}

/**
 * Convert base64 string to Blob
 * @param {string} base64 - Base64 string (with or without data URL prefix)
 * @param {string} mimeType - MIME type (e.g., 'image/png')
 * @returns {Blob} Blob object
 */
function base64ToBlob(base64, mimeType) {
  // Remove data URL prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

