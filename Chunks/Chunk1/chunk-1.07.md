# Chunk 1.07 — Theme Service

## Purpose
Create service layer for theme CRUD operations.

---

## Inputs
- Supabase client (from chunk 1.01)
- themes table (from chunk 1.02)

## Outputs
- themeService module (consumed by chunk 2.01, 2.03, 2.04)

---

## Dependencies
- Chunk 1.02 must be complete

---

## Implementation Notes

### Key Considerations
- Return consistent data shapes
- Handle errors gracefully
- Include related data (token counts) where useful

### Service Interface

```javascript
// src/services/themeService.js
import { supabase } from '../lib/supabase';

export const themeService = {
  // Get all themes with token counts
  async getThemes() {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        tokens:tokens(count)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get single theme with all tokens
  async getTheme(id) {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        tokens(*),
        typefaces(*),
        typography_roles(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get theme by slug
  async getThemeBySlug(slug) {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        tokens(*),
        typefaces(*),
        typography_roles(*)
      `)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get default theme
  async getDefaultTheme() {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        tokens(*),
        typefaces(*),
        typography_roles(*)
      `)
      .eq('is_default', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new theme
  async createTheme({ name, description, source = 'manual' }) {
    const slug = generateSlug(name);
    const { data, error } = await supabase
      .from('themes')
      .insert({ name, slug, description, source })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update theme
  async updateTheme(id, updates) {
    // If name changed, update slug
    if (updates.name) {
      updates.slug = generateSlug(updates.name);
    }
    
    const { data, error } = await supabase
      .from('themes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete theme
  async deleteTheme(id) {
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Set default theme (unset others)
  async setDefaultTheme(id) {
    // First unset all
    await supabase
      .from('themes')
      .update({ is_default: false })
      .neq('id', id);
    
    // Then set the new default
    const { data, error } = await supabase
      .from('themes')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Duplicate theme with all tokens
  async duplicateTheme(id, newName) {
    const theme = await this.getTheme(id);
    const newTheme = await this.createTheme({
      name: newName,
      description: theme.description,
      source: 'manual'
    });
    
    // Copy tokens
    if (theme.tokens?.length) {
      const newTokens = theme.tokens.map(t => ({
        ...t,
        id: undefined,
        theme_id: newTheme.id,
        created_at: undefined,
        updated_at: undefined
      }));
      await supabase.from('tokens').insert(newTokens);
    }
    
    // Copy typefaces
    if (theme.typefaces?.length) {
      const newTypefaces = theme.typefaces.map(t => ({
        ...t,
        id: undefined,
        theme_id: newTheme.id,
        created_at: undefined
      }));
      await supabase.from('typefaces').insert(newTypefaces);
    }
    
    // Copy typography roles
    if (theme.typography_roles?.length) {
      const newRoles = theme.typography_roles.map(r => ({
        ...r,
        id: undefined,
        theme_id: newTheme.id,
        created_at: undefined
      }));
      await supabase.from('typography_roles').insert(newRoles);
    }
    
    return this.getTheme(newTheme.id);
  },

  // Publish theme
  async publishTheme(id) {
    return this.updateTheme(id, { status: 'published' });
  }
};

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

---

## Files Created
- `src/services/themeService.js` — Theme service

---

## Tests

### Unit Tests
- [ ] getThemes returns array with token counts
- [ ] getTheme returns theme with tokens
- [ ] getThemeBySlug works correctly
- [ ] getDefaultTheme returns default
- [ ] createTheme generates slug
- [ ] updateTheme returns updated data
- [ ] deleteTheme removes theme
- [ ] setDefaultTheme updates is_default correctly
- [ ] duplicateTheme copies tokens, typefaces, and roles
- [ ] publishTheme updates status

---

## Time Estimate
3 hours

---

## Notes
Theme service is the most complex service due to duplicate functionality. Consider extracting slug generation to a shared utility.
