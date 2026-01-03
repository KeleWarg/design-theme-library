/**
 * @chunk 1.07 - Theme Service
 * 
 * Service layer for theme CRUD operations.
 * Handles themes with related tokens, typefaces, and typography roles.
 */

import { supabase } from '../lib/supabase';

/**
 * Generate URL-friendly slug from name
 * @param {string} name - Theme name
 * @returns {string} - URL-safe slug
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const themeService = {
  /**
   * Get all themes with token counts
   * @returns {Promise<Array>} - Array of themes with token counts
   */
  async getThemes() {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        tokens:tokens(count)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform token count from array to number
    return data.map(theme => ({
      ...theme,
      tokenCount: theme.tokens?.[0]?.count || 0
    }));
  },

  /**
   * Get single theme with all related data
   * @param {string} id - Theme UUID
   * @returns {Promise<Object>} - Theme with tokens, typefaces, and typography roles
   */
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

  /**
   * Get theme by slug
   * @param {string} slug - Theme slug
   * @returns {Promise<Object>} - Theme with all related data
   */
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

  /**
   * Get the default theme
   * @returns {Promise<Object|null>} - Default theme or null if none set
   */
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
    
    // Return null if no default theme (not an error condition)
    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  /**
   * Create a new theme
   * @param {Object} params - Theme parameters
   * @param {string} params.name - Theme name
   * @param {string} [params.description] - Theme description
   * @param {string} [params.source='manual'] - Theme source (manual, figma, import)
   * @param {string} [params.figma_file_key] - Figma file key if source is 'figma'
   * @returns {Promise<Object>} - Created theme
   */
  async createTheme({ name, description, source = 'manual', figma_file_key }) {
    const slug = generateSlug(name);
    
    const { data, error } = await supabase
      .from('themes')
      .insert({ 
        name, 
        slug, 
        description, 
        source,
        figma_file_key,
        status: 'draft'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a theme
   * @param {string} id - Theme UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated theme
   */
  async updateTheme(id, updates) {
    // If name changed, regenerate slug
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

  /**
   * Delete a theme (cascades to tokens, typefaces, typography_roles)
   * @param {string} id - Theme UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteTheme(id) {
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Set a theme as the default (unsets other defaults)
   * @param {string} id - Theme UUID
   * @returns {Promise<Object>} - Updated theme
   */
  async setDefaultTheme(id) {
    // First, unset all other defaults
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

  /**
   * Duplicate a theme with all its tokens, typefaces, and typography roles
   * @param {string} id - Source theme UUID
   * @param {string} newName - Name for the duplicated theme
   * @returns {Promise<Object>} - New theme with all related data
   */
  async duplicateTheme(id, newName) {
    // Get the source theme with all related data
    const sourceTheme = await this.getTheme(id);
    
    // Create new theme
    const newTheme = await this.createTheme({
      name: newName,
      description: sourceTheme.description,
      source: 'manual'
    });
    
    // Copy tokens
    if (sourceTheme.tokens?.length) {
      const newTokens = sourceTheme.tokens.map(token => ({
        theme_id: newTheme.id,
        name: token.name,
        path: token.path,
        category: token.category,
        type: token.type,
        value: token.value,
        css_variable: token.css_variable,
        description: token.description,
        sort_order: token.sort_order
      }));
      
      const { error: tokenError } = await supabase
        .from('tokens')
        .insert(newTokens);
      
      if (tokenError) throw tokenError;
    }
    
    // Copy typefaces
    if (sourceTheme.typefaces?.length) {
      const newTypefaces = sourceTheme.typefaces.map(typeface => ({
        theme_id: newTheme.id,
        role: typeface.role,
        family: typeface.family,
        fallback: typeface.fallback,
        source_type: typeface.source_type,
        weights: typeface.weights,
        is_variable: typeface.is_variable
      }));
      
      const { error: typefaceError } = await supabase
        .from('typefaces')
        .insert(newTypefaces);
      
      if (typefaceError) throw typefaceError;
    }
    
    // Copy typography roles
    if (sourceTheme.typography_roles?.length) {
      const newRoles = sourceTheme.typography_roles.map(role => ({
        theme_id: newTheme.id,
        role_name: role.role_name,
        typeface_role: role.typeface_role,
        font_size: role.font_size,
        font_weight: role.font_weight,
        line_height: role.line_height,
        letter_spacing: role.letter_spacing
      }));
      
      const { error: roleError } = await supabase
        .from('typography_roles')
        .insert(newRoles);
      
      if (roleError) throw roleError;
    }
    
    // Return the new theme with all copied data
    return this.getTheme(newTheme.id);
  },

  /**
   * Publish a theme (change status to 'published')
   * @param {string} id - Theme UUID
   * @returns {Promise<Object>} - Updated theme
   */
  async publishTheme(id) {
    return this.updateTheme(id, { status: 'published' });
  },

  /**
   * Unpublish a theme (change status to 'draft')
   * @param {string} id - Theme UUID
   * @returns {Promise<Object>} - Updated theme
   */
  async unpublishTheme(id) {
    return this.updateTheme(id, { status: 'draft' });
  }
};

export default themeService;

