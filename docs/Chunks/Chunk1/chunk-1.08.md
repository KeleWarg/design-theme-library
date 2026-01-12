# Chunk 1.08 — Token Service

## Purpose
Create service layer for token CRUD and bulk operations.

---

## Inputs
- Supabase client (from chunk 1.01)
- tokens table (from chunk 1.02)

## Outputs
- tokenService module (consumed by chunk 2.04, 2.11, 2.14)

---

## Dependencies
- Chunk 1.02 must be complete

---

## Implementation Notes

### Key Considerations
- Support bulk operations for import
- Group tokens by category for editors
- Enable search by path or name

### Service Interface

```javascript
// src/services/tokenService.js
import { supabase } from '../lib/supabase';

export const tokenService = {
  // Get tokens by theme, grouped by category
  async getTokensByTheme(themeId) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('theme_id', themeId)
      .order('sort_order');
    
    if (error) throw error;
    
    // Group by category
    return data.reduce((acc, token) => {
      const cat = token.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(token);
      return acc;
    }, {});
  },

  // Get tokens by theme as flat array
  async getTokensByThemeFlat(themeId) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('theme_id', themeId)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  // Get single token
  async getToken(id) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get token by path within theme
  async getTokenByPath(themeId, path) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('theme_id', themeId)
      .eq('path', path)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create single token
  async createToken(token) {
    const { data, error } = await supabase
      .from('tokens')
      .insert(token)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update token value
  async updateToken(id, updates) {
    const { data, error } = await supabase
      .from('tokens')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Bulk create tokens (for import)
  async bulkCreateTokens(themeId, tokens) {
    const prepared = tokens.map((t, i) => ({
      ...t,
      theme_id: themeId,
      sort_order: t.sort_order ?? i
    }));
    
    const { data, error } = await supabase
      .from('tokens')
      .insert(prepared)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Bulk update tokens
  async bulkUpdateTokens(updates) {
    // updates: [{ id, ...changes }]
    const results = await Promise.all(
      updates.map(({ id, ...changes }) => 
        this.updateToken(id, changes)
      )
    );
    return results;
  },

  // Delete token
  async deleteToken(id) {
    const { error } = await supabase
      .from('tokens')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Delete all tokens in a category
  async deleteTokensByCategory(themeId, category) {
    const { error } = await supabase
      .from('tokens')
      .delete()
      .eq('theme_id', themeId)
      .eq('category', category);
    
    if (error) throw error;
    return true;
  },

  // Search tokens by path or name
  async searchTokens(themeId, query) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('theme_id', themeId)
      .or(`path.ilike.%${query}%,name.ilike.%${query}%`);
    
    if (error) throw error;
    return data;
  },

  // Reorder tokens within category
  async reorderTokens(themeId, category, orderedIds) {
    const updates = orderedIds.map((id, index) => ({
      id,
      sort_order: index
    }));
    
    return this.bulkUpdateTokens(updates);
  }
};
```

---

## Files Created
- `src/services/tokenService.js` — Token service

---

## Tests

### Unit Tests
- [ ] getTokensByTheme returns grouped object
- [ ] getTokensByThemeFlat returns array
- [ ] getToken returns single token
- [ ] getTokenByPath finds by path
- [ ] createToken creates and returns
- [ ] updateToken updates and returns data
- [ ] bulkCreateTokens creates multiple
- [ ] deleteToken removes token
- [ ] searchTokens finds by path or name
- [ ] reorderTokens updates sort_order

---

## Time Estimate
2 hours

---

## Notes
Bulk operations are critical for import performance. Consider using Supabase upsert for handling duplicates during re-import.
