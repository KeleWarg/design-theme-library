# Chunk 4.13 — Generate from Figma Flow

## Purpose
Connect import review to AI generation with Figma context.

---

## Inputs
- Import review modal
- Figma prompt builder

## Outputs
- Complete import → generate flow

---

## Dependencies
- Chunk 4.12 must be complete
- Chunk 4.08 must be complete

---

## Implementation Notes

```jsx
// src/components/figma-import/GenerateFromFigma.jsx
import { aiService } from '../../services/aiService';
import { componentService } from '../../services/componentService';
import { buildFigmaEnhancedPrompt } from '../../lib/figmaPromptBuilder';
import { useThemeContext } from '../../contexts/ThemeContext';

export async function handleImportAndGenerate(importedComponent, images, themeTokens) {
  // Build enhanced prompt with Figma context
  const prompt = buildFigmaEnhancedPrompt({
    component: importedComponent,
    themeTokens,
    images
  });

  // Generate code using AI
  const result = await aiService.generateWithCustomPrompt(prompt);

  // Create component in database
  const component = await componentService.createComponent({
    name: importedComponent.name,
    description: importedComponent.description,
    category: detectCategory(importedComponent),
    code: result.code,
    props: result.props,
    variants: (importedComponent.variants || []).map(v => ({
      name: v.name,
      props: v.props,
      description: ''
    })),
    linked_tokens: (importedComponent.bound_variables || []).map(bv => bv.variableName),
    figma_id: importedComponent.figma_id,
    figma_file_key: importedComponent.file_key,
    status: 'draft'
  });

  // Upload images to component
  const nonPreviewImages = images.filter(i => !i.node_name?.includes('_preview'));
  for (const image of nonPreviewImages) {
    try {
      const blob = base64ToBlob(
        image.data || await fetchImageData(image.storage_path),
        `image/${image.format.toLowerCase()}`
      );
      await componentService.uploadImage(
        component.id,
        blob,
        image.node_name
      );
    } catch (error) {
      console.error(`Failed to upload image ${image.node_name}:`, error);
    }
  }

  return component;
}

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

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

async function fetchImageData(storagePath) {
  const { data } = await supabase.storage
    .from('component-images')
    .download(storagePath);
  
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(data);
  });
}
```

### AI Service Extension
```javascript
// Add to src/services/aiService.js

export const aiService = {
  // ... existing methods ...

  async generateWithCustomPrompt(prompt) {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    const content = data.content[0].text;

    return parseGeneratedComponent(content);
  }
};
```

### Component Usage in Modal
```jsx
// Update ImportReviewModal to use the generation flow

import { handleImportAndGenerate } from './GenerateFromFigma';
import { useThemeContext } from '../../contexts/ThemeContext';

// In ImportReviewModal component:
const { tokens } = useThemeContext();

const handleImport = async () => {
  setIsGenerating(true);
  try {
    const result = await handleImportAndGenerate(
      {
        ...editedComponent,
        props: editedProps,
        bound_variables: component.bound_variables,
      },
      selectedImages,
      tokens
    );
    onImport(result);
  } catch (error) {
    toast.error('Failed to generate component');
  } finally {
    setIsGenerating(false);
  }
};
```

---

## Files Created
- `src/components/figma-import/GenerateFromFigma.jsx` — Generation flow

---

## Tests

### Integration Tests
- [ ] Full flow from import to component creation
- [ ] Code generated with Figma context
- [ ] Images uploaded to component
- [ ] Component saved to database with all fields
- [ ] Category auto-detection works
- [ ] Token linking preserved

---

## Time Estimate
2 hours
