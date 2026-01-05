/**
 * @chunk 1.09 - Typeface Service
 * 
 * Service layer for typeface management and font file uploads.
 * Handles typefaces, font files storage, and typography roles.
 */

import { supabase } from '../lib/supabase';

/**
 * Get file format from file name
 * @param {File} file - File object
 * @returns {string} - File extension (woff2, woff, ttf, otf)
 */
function getFormatFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  return ext;
}

/**
 * Get MIME type for font format
 * @param {string} format - Font format (woff2, woff, ttf, otf)
 * @returns {string} - MIME type
 */
function getMimeType(format) {
  const mimes = {
    woff2: 'font/woff2',
    woff: 'font/woff',
    ttf: 'font/ttf',
    otf: 'font/otf'
  };
  return mimes[format] || 'application/octet-stream';
}

export const typefaceService = {
  /**
   * Get all typefaces for a theme with their font files
   * @param {string} themeId - Theme UUID
   * @returns {Promise<Array>} - Array of typefaces with font_files
   */
  async getTypefacesByTheme(themeId) {
    const { data, error } = await supabase
      .from('typefaces')
      .select(`
        *,
        font_files(*)
      `)
      .eq('theme_id', themeId)
      .order('role');
    
    if (error) throw error;
    return data;
  },

  /**
   * Get single typeface with font files
   * @param {string} id - Typeface UUID
   * @returns {Promise<Object>} - Typeface with font_files
   */
  async getTypeface(id) {
    const { data, error } = await supabase
      .from('typefaces')
      .select(`
        *,
        font_files(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get typeface by role for a theme
   * @param {string} themeId - Theme UUID
   * @param {string} role - Typeface role (display, text, mono, accent)
   * @returns {Promise<Object|null>} - Typeface or null if not found
   */
  async getTypefaceByRole(themeId, role) {
    const { data, error } = await supabase
      .from('typefaces')
      .select(`
        *,
        font_files(*)
      `)
      .eq('theme_id', themeId)
      .eq('role', role)
      .single();
    
    // Return null if not found (not an error condition)
    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  /**
   * Create a new typeface
   * @param {string} themeId - Theme UUID
   * @param {Object} data - Typeface data
   * @param {string} data.role - Role (display, text, mono, accent)
   * @param {string} data.family - Font family name
   * @param {string} [data.fallback='sans-serif'] - Fallback font stack
   * @param {string} [data.source_type='custom'] - Source type (google, adobe, system, custom)
   * @param {Array<number>} [data.weights=[400]] - Available weights
   * @param {boolean} [data.is_variable=false] - Whether it's a variable font
   * @returns {Promise<Object>} - Created typeface
   */
  async createTypeface(themeId, data) {
    const { data: typeface, error } = await supabase
      .from('typefaces')
      .insert({
        theme_id: themeId,
        role: data.role,
        family: data.family,
        fallback: data.fallback || 'sans-serif',
        source_type: data.source_type || 'custom',
        weights: data.weights || [400],
        is_variable: data.is_variable || false
      })
      .select()
      .single();
    
    if (error) throw error;
    return typeface;
  },

  /**
   * Update a typeface
   * @param {string} id - Typeface UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated typeface
   */
  async updateTypeface(id, updates) {
    const { data, error } = await supabase
      .from('typefaces')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        font_files(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a typeface and its font files from storage
   * @param {string} id - Typeface UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteTypeface(id) {
    // First get typeface to find font files
    const typeface = await this.getTypeface(id);
    
    // Delete files from storage if they exist
    if (typeface?.font_files?.length) {
      const paths = typeface.font_files.map(f => f.storage_path);
      await supabase.storage.from('fonts').remove(paths);
    }
    
    // Delete database record (cascades to font_files table)
    const { error } = await supabase
      .from('typefaces')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Upload a font file to storage and create database record
   * @param {string} typefaceId - Typeface UUID
   * @param {File} file - Font file to upload
   * @param {number} weight - Font weight (100-900)
   * @param {string} [style='normal'] - Font style (normal, italic)
   * @returns {Promise<Object>} - Created font_file record
   */
  async uploadFontFile(typefaceId, file, weight, style = 'normal') {
    // Get typeface for path construction
    const typeface = await this.getTypeface(typefaceId);
    
    // Determine format from file
    const format = getFormatFromFile(file);
    
    // Construct storage path: {theme_id}/{role}/{family}-{weight}[-italic].{format}
    const styleSuffix = style === 'italic' ? '-italic' : '';
    const sanitizedFamily = typeface.family.toLowerCase().replace(/\s+/g, '-');
    const path = `${typeface.theme_id}/${typeface.role}/${sanitizedFamily}-${weight}${styleSuffix}.${format}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('fonts')
      .upload(path, file, { 
        contentType: getMimeType(format),
        upsert: true // Allow overwrite
      });
    
    if (uploadError) throw uploadError;
    
    // Create font_file record
    const { data, error } = await supabase
      .from('font_files')
      .insert({
        typeface_id: typefaceId,
        storage_path: path,
        format,
        weight,
        style,
        file_size: file.size
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a font file from storage and database
   * @param {string} id - Font file UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteFontFile(id) {
    // Get file record first
    const { data: fontFile, error: fetchError } = await supabase
      .from('font_files')
      .select('storage_path')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Remove from storage
    if (fontFile?.storage_path) {
      await supabase.storage.from('fonts').remove([fontFile.storage_path]);
    }
    
    // Delete database record
    const { error } = await supabase
      .from('font_files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Get public URL for a font file
   * @param {string} storagePath - Storage path of the font file
   * @returns {string|null} - Public URL or null if invalid path
   */
  getFontUrl(storagePath) {
    if (!storagePath) {
      console.warn('getFontUrl called with empty storagePath');
      return null;
    }
    const { data } = supabase.storage.from('fonts').getPublicUrl(storagePath);
    return data?.publicUrl || null;
  },

  /**
   * Get all font files for a typeface
   * @param {string} typefaceId - Typeface UUID
   * @returns {Promise<Array>} - Array of font files with URLs
   */
  async getFontFiles(typefaceId) {
    const { data, error } = await supabase
      .from('font_files')
      .select('*')
      .eq('typeface_id', typefaceId)
      .order('weight')
      .order('style');
    
    if (error) throw error;
    
    // Add public URLs
    return data.map(file => ({
      ...file,
      url: this.getFontUrl(file.storage_path)
    }));
  },

  // ===================
  // Typography Roles
  // ===================

  /**
   * Get all typography roles for a theme
   * @param {string} themeId - Theme UUID
   * @returns {Promise<Array>} - Array of typography roles
   */
  async getTypographyRoles(themeId) {
    const { data, error } = await supabase
      .from('typography_roles')
      .select('*')
      .eq('theme_id', themeId)
      .order('role_name');
    
    if (error) throw error;
    return data;
  },

  /**
   * Get single typography role by name
   * @param {string} themeId - Theme UUID
   * @param {string} roleName - Role name (e.g., 'heading-xl', 'body-md')
   * @returns {Promise<Object|null>} - Typography role or null
   */
  async getTypographyRole(themeId, roleName) {
    const { data, error } = await supabase
      .from('typography_roles')
      .select('*')
      .eq('theme_id', themeId)
      .eq('role_name', roleName)
      .single();
    
    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  /**
   * Create a typography role
   * @param {string} themeId - Theme UUID
   * @param {Object} roleData - Role configuration
   * @returns {Promise<Object>} - Created typography role
   */
  async createTypographyRole(themeId, roleData) {
    const { data, error } = await supabase
      .from('typography_roles')
      .insert({
        theme_id: themeId,
        ...roleData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a typography role
   * @param {string} id - Typography role UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated typography role
   */
  async updateTypographyRole(id, updates) {
    const { data, error } = await supabase
      .from('typography_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update typography role by theme and role name
   * @param {string} themeId - Theme UUID
   * @param {string} roleName - Role name
   * @param {Object} updates - Fields to update (e.g., { typeface_role: 'display' })
   * @returns {Promise<Object>} - Updated typography role
   */
  async updateTypographyRoleByName(themeId, roleName, updates) {
    const { data, error } = await supabase
      .from('typography_roles')
      .update(updates)
      .eq('theme_id', themeId)
      .eq('role_name', roleName)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a typography role
   * @param {string} id - Typography role UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteTypographyRole(id) {
    const { error } = await supabase
      .from('typography_roles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Upsert typography role (create or update)
   * @param {string} themeId - Theme UUID
   * @param {Object} roleData - Role data with role_name
   * @returns {Promise<Object>} - Upserted typography role
   */
  async upsertTypographyRole(themeId, roleData) {
    const { data, error } = await supabase
      .from('typography_roles')
      .upsert({
        theme_id: themeId,
        ...roleData
      }, {
        onConflict: 'theme_id,role_name'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Bulk create default typography roles for a theme
   * Creates the standard 11 semantic roles mapped to typeface roles
   * @param {string} themeId - Theme UUID
   * @returns {Promise<Array>} - Created typography roles
   */
  async createDefaultTypographyRoles(themeId) {
    const defaultRoles = [
      { role_name: 'display', typeface_role: 'display', font_size: '3rem', font_weight: 700, line_height: '1.1' },
      { role_name: 'heading-xl', typeface_role: 'display', font_size: '2.25rem', font_weight: 700, line_height: '1.2' },
      { role_name: 'heading-lg', typeface_role: 'display', font_size: '1.875rem', font_weight: 600, line_height: '1.25' },
      { role_name: 'heading-md', typeface_role: 'display', font_size: '1.5rem', font_weight: 600, line_height: '1.3' },
      { role_name: 'heading-sm', typeface_role: 'display', font_size: '1.25rem', font_weight: 600, line_height: '1.4' },
      { role_name: 'body-lg', typeface_role: 'text', font_size: '1.125rem', font_weight: 400, line_height: '1.6' },
      { role_name: 'body-md', typeface_role: 'text', font_size: '1rem', font_weight: 400, line_height: '1.5' },
      { role_name: 'body-sm', typeface_role: 'text', font_size: '0.875rem', font_weight: 400, line_height: '1.5' },
      { role_name: 'label', typeface_role: 'text', font_size: '0.875rem', font_weight: 500, line_height: '1.4' },
      { role_name: 'caption', typeface_role: 'text', font_size: '0.75rem', font_weight: 400, line_height: '1.4' },
      { role_name: 'mono', typeface_role: 'mono', font_size: '0.875rem', font_weight: 400, line_height: '1.5' },
    ];

    const roles = defaultRoles.map(r => ({ ...r, theme_id: themeId }));
    
    const { data, error } = await supabase
      .from('typography_roles')
      .insert(roles)
      .select();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get typography roles with resolved typeface information
   * @param {string} themeId - Theme UUID
   * @returns {Promise<Array>} - Roles with typeface family info
   */
  async getTypographyRolesWithTypefaces(themeId) {
    const [roles, typefaces] = await Promise.all([
      this.getTypographyRoles(themeId),
      this.getTypefacesByTheme(themeId)
    ]);
    
    // Create a map of typeface roles to typeface data
    const typefaceMap = typefaces.reduce((acc, tf) => {
      acc[tf.role] = tf;
      return acc;
    }, {});
    
    // Attach typeface info to each role
    return roles.map(role => ({
      ...role,
      typeface: typefaceMap[role.typeface_role] || null
    }));
  }
};

export default typefaceService;


