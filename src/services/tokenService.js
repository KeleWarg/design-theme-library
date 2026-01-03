/**
 * @chunk 1.08 - Token Service
 * 
 * Service layer for token CRUD and bulk operations.
 * Supports grouping by category and bulk import for token sync.
 */

import { supabase } from '../lib/supabase';

export const tokenService = {
  /**
   * Get tokens by theme, grouped by category
   * @param {string} themeId - Theme UUID
   * @returns {Promise<Object>} - Tokens grouped by category { color: [...], spacing: [...], ... }
   */
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

  /**
   * Get tokens by theme as flat array
   * @param {string} themeId - Theme UUID
   * @returns {Promise<Array>} - Array of tokens
   */
  async getTokensByThemeFlat(themeId) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('theme_id', themeId)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  /**
   * Get single token by ID
   * @param {string} id - Token UUID
   * @returns {Promise<Object>} - Token object
   */
  async getToken(id) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get token by path within a theme
   * @param {string} themeId - Theme UUID
   * @param {string} path - Token path (e.g., 'Color/Primary/500')
   * @returns {Promise<Object>} - Token object
   */
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

  /**
   * Create a single token
   * @param {string} themeId - Theme UUID
   * @param {Object} tokenData - Token data (name, path, category, type, value, etc.)
   * @returns {Promise<Object>} - Created token
   */
  async createToken(themeId, tokenData) {
    const { data, error } = await supabase
      .from('tokens')
      .insert({
        ...tokenData,
        theme_id: themeId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a token
   * @param {string} id - Token UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated token
   */
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

  /**
   * Bulk create tokens (for import operations)
   * @param {string} themeId - Theme UUID
   * @param {Array} tokens - Array of token objects
   * @returns {Promise<Array>} - Created tokens
   */
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

  /**
   * Bulk update tokens
   * @param {Array} updates - Array of { id, ...changes }
   * @returns {Promise<Array>} - Updated tokens
   */
  async bulkUpdateTokens(updates) {
    const results = await Promise.all(
      updates.map(({ id, ...changes }) => 
        this.updateToken(id, changes)
      )
    );
    return results;
  },

  /**
   * Delete a token
   * @param {string} id - Token UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteToken(id) {
    const { error } = await supabase
      .from('tokens')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Delete all tokens in a category for a theme
   * @param {string} themeId - Theme UUID
   * @param {string} category - Token category (color, spacing, etc.)
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteTokensByCategory(themeId, category) {
    const { error } = await supabase
      .from('tokens')
      .delete()
      .eq('theme_id', themeId)
      .eq('category', category);
    
    if (error) throw error;
    return true;
  },

  /**
   * Delete all tokens for a theme
   * @param {string} themeId - Theme UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteTokensByTheme(themeId) {
    const { error } = await supabase
      .from('tokens')
      .delete()
      .eq('theme_id', themeId);
    
    if (error) throw error;
    return true;
  },

  /**
   * Search tokens by path or name
   * @param {string} themeId - Theme UUID
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Matching tokens
   */
  async searchTokens(themeId, query) {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('theme_id', themeId)
      .or(`path.ilike.%${query}%,name.ilike.%${query}%`);
    
    if (error) throw error;
    return data;
  },

  /**
   * Reorder tokens within a category
   * @param {string} themeId - Theme UUID
   * @param {string} category - Token category
   * @param {Array} orderedIds - Array of token IDs in desired order
   * @returns {Promise<Array>} - Updated tokens
   */
  async reorderTokens(themeId, category, orderedIds) {
    const updates = orderedIds.map((id, index) => ({
      id,
      sort_order: index
    }));
    
    return this.bulkUpdateTokens(updates);
  },

  /**
   * Get token count by category for a theme
   * @param {string} themeId - Theme UUID
   * @returns {Promise<Object>} - Count by category { color: 10, spacing: 5, ... }
   */
  async getTokenCountsByCategory(themeId) {
    const { data, error } = await supabase
      .from('tokens')
      .select('category')
      .eq('theme_id', themeId);
    
    if (error) throw error;
    
    return data.reduce((acc, token) => {
      const cat = token.category;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  },

  /**
   * Upsert tokens (create or update based on path)
   * Useful for re-importing tokens from Figma
   * @param {string} themeId - Theme UUID
   * @param {Array} tokens - Array of token objects with path
   * @returns {Promise<Array>} - Upserted tokens
   */
  async upsertTokens(themeId, tokens) {
    const prepared = tokens.map((t, i) => ({
      ...t,
      theme_id: themeId,
      sort_order: t.sort_order ?? i
    }));
    
    const { data, error } = await supabase
      .from('tokens')
      .upsert(prepared, { 
        onConflict: 'theme_id,path',
        ignoreDuplicates: false 
      })
      .select();
    
    if (error) throw error;
    return data;
  }
};

export default tokenService;

