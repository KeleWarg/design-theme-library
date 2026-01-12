/**
 * @chunk B.3 - Icon Service
 * 
 * Service layer for icon library CRUD operations.
 * Handles icons, SVG file uploads, and imports from external sources.
 */

import { supabase } from '../lib/supabase';

/**
 * Generate URL-friendly slug from name
 * @param {string} name - Icon name
 * @returns {string} - URL-safe slug
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Sanitize SVG content for safe inline rendering
 * Removes scripts, event handlers, and external references
 * @param {string} svgText - Raw SVG content
 * @returns {string} - Sanitized SVG
 */
function sanitizeSvg(svgText) {
  if (!svgText) return '';
  
  let sanitized = svgText;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  
  // Remove external references (xlink:href to external URLs)
  sanitized = sanitized.replace(/xlink:href\s*=\s*["']https?:[^"']*["']/gi, '');
  
  return sanitized.trim();
}

/**
 * Extract viewBox from SVG content
 * @param {string} svgText - SVG content
 * @returns {string} - viewBox value or default
 */
function extractViewBox(svgText) {
  if (!svgText) return '0 0 24 24';
  
  const match = svgText.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  return match ? match[1] : '0 0 24 24';
}

/**
 * Extract width/height from SVG content
 * @param {string} svgText - SVG content
 * @returns {{ width: number, height: number }}
 */
function extractDimensions(svgText) {
  if (!svgText) return { width: 24, height: 24 };
  
  const widthMatch = svgText.match(/\bwidth\s*=\s*["'](\d+)/i);
  const heightMatch = svgText.match(/\bheight\s*=\s*["'](\d+)/i);
  
  return {
    width: widthMatch ? parseInt(widthMatch[1], 10) : 24,
    height: heightMatch ? parseInt(heightMatch[1], 10) : 24
  };
}

export const iconService = {
  // ==========================================
  // Icon CRUD Operations
  // ==========================================

  /**
   * Get icons with optional filters
   * @param {Object} filters - Filter options
   * @param {string} [filters.search] - Search by name
   * @param {string} [filters.style] - Filter by style (outline, filled, etc.)
   * @param {string} [filters.source] - Filter by source (icons8, custom, etc.)
   * @param {string[]} [filters.tags] - Filter by tags (any match)
   * @returns {Promise<Array>} - Array of icons
   */
  async getIcons(filters = {}) {
    const { search, style, source, tags } = filters;
    
    let query = supabase
      .from('icons')
      .select('*')
      .order('name', { ascending: true });
    
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    if (style) {
      query = query.eq('style', style);
    }
    
    if (source) {
      query = query.eq('source', source);
    }
    
    if (tags && tags.length > 0) {
      // Match any of the provided tags
      query = query.overlaps('tags', tags);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get a single icon by ID
   * @param {string} id - Icon UUID
   * @returns {Promise<Object|null>} - Icon or null if not found
   */
  async getIcon(id) {
    const { data, error } = await supabase
      .from('icons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  /**
   * Get a single icon by slug
   * @param {string} slug - Icon slug
   * @returns {Promise<Object|null>} - Icon or null if not found
   */
  async getIconBySlug(slug) {
    const { data, error } = await supabase
      .from('icons')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  /**
   * Create a new icon with SVG file upload
   * @param {Object} data - Icon data
   * @param {string} data.name - Icon name (required)
   * @param {string} [data.style] - Style (outline, filled, etc.)
   * @param {string} [data.source] - Source (custom, icons8, etc.)
   * @param {string[]} [data.tags] - Tags for searching
   * @param {File|Blob|string} svgContent - SVG file, blob, or string content
   * @returns {Promise<Object>} - Created icon
   */
  async createIcon(data, svgContent) {
    if (!data.name || !svgContent) {
      throw new Error('Icon name and SVG content are required');
    }
    
    const slug = generateSlug(data.name);
    
    // Check for slug uniqueness
    const existing = await this.getIconBySlug(slug);
    if (existing) {
      throw new Error(`Icon with slug "${slug}" already exists`);
    }
    
    // Get SVG text content
    let svgText;
    if (typeof svgContent === 'string') {
      svgText = svgContent;
    } else if (svgContent instanceof Blob || svgContent instanceof File) {
      svgText = await svgContent.text();
    } else {
      throw new Error('Invalid SVG content type');
    }
    
    // Sanitize and extract metadata
    const sanitizedSvg = sanitizeSvg(svgText);
    const viewbox = extractViewBox(sanitizedSvg);
    const { width, height } = extractDimensions(sanitizedSvg);
    
    // Upload to storage
    const storagePath = `${data.source || 'custom'}/${slug}.svg`;
    const { error: uploadError } = await supabase.storage
      .from('icons')
      .upload(storagePath, new Blob([sanitizedSvg], { type: 'image/svg+xml' }), {
        contentType: 'image/svg+xml',
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    // Create database record
    const { data: icon, error } = await supabase
      .from('icons')
      .insert({
        name: data.name,
        slug,
        tags: data.tags || [],
        style: data.style || 'outline',
        source: data.source || 'custom',
        storage_path: storagePath,
        svg_text: sanitizedSvg,
        viewbox,
        width,
        height
      })
      .select()
      .single();
    
    if (error) {
      // Clean up uploaded file on DB error
      await supabase.storage.from('icons').remove([storagePath]);
      throw error;
    }
    
    return icon;
  },

  /**
   * Update an icon
   * @param {string} id - Icon UUID
   * @param {Object} updates - Fields to update (name, tags, style)
   * @returns {Promise<Object>} - Updated icon
   */
  async updateIcon(id, updates) {
    // If name is being updated, update slug too
    if (updates.name) {
      updates.slug = generateSlug(updates.name);
    }
    
    const { data, error } = await supabase
      .from('icons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete an icon and its storage file
   * @param {string} id - Icon UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteIcon(id) {
    // Get icon first to find storage path
    const icon = await this.getIcon(id);
    if (!icon) {
      throw new Error('Icon not found');
    }
    
    // Delete from storage
    if (icon.storage_path) {
      await supabase.storage.from('icons').remove([icon.storage_path]);
    }
    
    // Delete database record
    const { error } = await supabase
      .from('icons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Bulk delete icons
   * @param {string[]} ids - Array of icon UUIDs
   * @returns {Promise<boolean>} - True if successful
   */
  async bulkDelete(ids) {
    // Get all icons to find storage paths
    const { data: icons } = await supabase
      .from('icons')
      .select('storage_path')
      .in('id', ids);
    
    // Delete from storage
    if (icons?.length) {
      const paths = icons.map(i => i.storage_path).filter(Boolean);
      if (paths.length) {
        await supabase.storage.from('icons').remove(paths);
      }
    }
    
    // Delete database records
    const { error } = await supabase
      .from('icons')
      .delete()
      .in('id', ids);
    
    if (error) throw error;
    return true;
  },

  // ==========================================
  // Import from External Sources
  // ==========================================

  /**
   * Import an icon from an external SVG URL
   * @param {string} svgUrl - URL to fetch SVG from
   * @param {Object} metadata - Icon metadata
   * @param {string} metadata.name - Icon name
   * @param {string} [metadata.style] - Style (outline, filled)
   * @param {string} [metadata.source] - Source identifier
   * @param {string[]} [metadata.tags] - Tags
   * @returns {Promise<Object>} - Created icon
   */
  async importFromUrl(svgUrl, metadata) {
    if (!svgUrl || !metadata.name) {
      throw new Error('SVG URL and icon name are required');
    }
    
    // Fetch SVG content
    const response = await fetch(svgUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`);
    }
    
    const svgText = await response.text();
    
    // Create icon using the standard method
    return this.createIcon(metadata, svgText);
  },

  /**
   * Import icon from Icons8 (via MCP or direct API)
   * @param {Object} iconData - Icon data from Icons8
   * @param {string} iconData.name - Icon name
   * @param {string} iconData.svgUrl - SVG download URL
   * @param {string} [iconData.style] - Icon style
   * @param {string[]} [iconData.tags] - Tags/categories
   * @returns {Promise<Object>} - Created icon
   */
  async importFromIcons8(iconData) {
    return this.importFromUrl(iconData.svgUrl, {
      name: iconData.name,
      style: iconData.style || 'outline',
      source: 'icons8',
      tags: iconData.tags || []
    });
  },

  // ==========================================
  // Utility Methods
  // ==========================================

  /**
   * Get public URL for an icon's SVG file
   * @param {string} storagePath - Storage path
   * @returns {string|null} - Public URL or null
   */
  getIconUrl(storagePath) {
    if (!storagePath) return null;
    const { data } = supabase.storage.from('icons').getPublicUrl(storagePath);
    return data?.publicUrl || null;
  },

  /**
   * Get all unique styles in the library
   * @returns {Promise<string[]>} - Array of unique styles
   */
  async getStyles() {
    const { data, error } = await supabase
      .from('icons')
      .select('style')
      .order('style');
    
    if (error) throw error;
    return [...new Set(data.map(d => d.style).filter(Boolean))];
  },

  /**
   * Get all unique tags in the library
   * @returns {Promise<string[]>} - Array of unique tags
   */
  async getTags() {
    const { data, error } = await supabase
      .from('icons')
      .select('tags');
    
    if (error) throw error;
    
    const allTags = data.flatMap(d => d.tags || []);
    return [...new Set(allTags)].sort();
  },

  /**
   * Get icon count by source
   * @returns {Promise<Object>} - Count by source { icons8: 10, custom: 5 }
   */
  async getCountBySource() {
    const { data, error } = await supabase
      .from('icons')
      .select('source');
    
    if (error) throw error;
    
    return data.reduce((acc, icon) => {
      const source = icon.source || 'custom';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
  }
};

export default iconService;

