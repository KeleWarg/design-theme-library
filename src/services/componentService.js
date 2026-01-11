/**
 * @chunk 1.10 - Component Service
 * 
 * Service layer for component CRUD operations.
 * Handles components, images, examples, and token linking.
 * Components are theme-independent (can work with any theme).
 */

import { supabase } from '../lib/supabase';

/**
 * Generate URL-friendly slug from name
 * @param {string} name - Component name
 * @returns {string} - URL-safe slug
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate linked_tokens format
 * Checks if array contains UUIDs (incorrect) instead of paths (correct)
 * @param {Array} linkedTokens - Array of token identifiers
 * @returns {boolean} - True if contains UUIDs (invalid format)
 */
function hasUUIDsInLinkedTokens(linkedTokens) {
  if (!Array.isArray(linkedTokens)) return false;
  
  // UUID regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  return linkedTokens.some(token => {
    // Check if token is a string that matches UUID pattern
    if (typeof token === 'string') {
      return uuidPattern.test(token);
    }
    return false;
  });
}

/**
 * Normalize linked_tokens to the expected path-based format
 * - Drops UUIDs to avoid mixing formats that the UI/export layers can't consume
 * - Trims/filters invalid entries and deduplicates
 * @param {Array} tokens - Incoming linked token identifiers
 * @returns {Array} - Sanitized array of token paths
 */
function sanitizeLinkedTokens(tokens) {
  if (!Array.isArray(tokens)) return [];

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const cleaned = tokens
    .filter(t => typeof t === 'string')
    .map(t => t.trim())
    .filter(t => {
      if (!t) return false;
      if (uuidPattern.test(t)) {
        console.warn(
          'linked_tokens sanitize: dropping UUID entry; expected path format like "Color/Primary/500"'
        );
        return false;
      }
      return true;
    });

  return [...new Set(cleaned)];
}

export const componentService = {
  // ==========================================
  // Component CRUD Operations
  // ==========================================

  /**
   * Get components with optional filters
   * @param {Object} filters - Filter options
   * @param {string} [filters.status] - Filter by status (draft, published, archived)
   * @param {string} [filters.category] - Filter by category
   * @param {string} [filters.search] - Search by name
   * @returns {Promise<Array>} - Array of components
   */
  async getComponents(filters = {}) {
    const { status, category, search } = filters;
    
    // Start with base query - all components, newest first
    let query = supabase
      .from('components')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Only apply filters if they have a value (undefined/null/empty = show all)
    // This allows useComponents hook to pass 'all' → undefined transformation
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get published components only
   * @returns {Promise<Array>} - Array of published components
   */
  async getPublishedComponents() {
    return this.getComponents({ status: 'published' });
  },

  /**
   * Get single component with relations (images and examples)
   * @param {string} id - Component UUID
   * @returns {Promise<Object|null>} - Component with images and examples, or null if not found
   */
  async getComponent(id) {
    const { data, error } = await supabase
      .from('components')
      .select(`
        *,
        component_images(*),
        component_examples(*)
      `)
      .eq('id', id)
      .single();

    // Return null if not found (consistent with themeService pattern)
    if (error?.code === 'PGRST116') return null;
    if (error) throw error;

    // Sort examples by sort_order
    if (data?.component_examples) {
      data.component_examples.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }

    return data;
  },

  /**
   * Get component by slug
   * @param {string} slug - Component slug
   * @returns {Promise<Object|null>} - Component with images and examples, or null if not found
   */
  async getComponentBySlug(slug) {
    const { data, error } = await supabase
      .from('components')
      .select(`
        *,
        component_images(*),
        component_examples(*)
      `)
      .eq('slug', slug)
      .single();

    // Return null if not found (consistent with themeService pattern)
    if (error?.code === 'PGRST116') return null;
    if (error) throw error;

    // Sort examples by sort_order
    if (data?.component_examples) {
      data.component_examples.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }

    return data;
  },

  /**
   * Create a new component
   * @param {Object} data - Component data
   * @param {string} data.name - Component name (required)
   * @param {string} [data.description] - Component description
   * @param {string} [data.category] - Component category
   * @param {string} [data.code] - Component code
   * @param {Array} [data.props] - Component props
   * @param {Array} [data.variants] - Component variants
   * @param {Array} [data.linked_tokens] - Linked token paths (e.g., ["Color/Primary/500", "Spacing/MD"])
   * @param {string} [data.figma_id] - Figma component ID
   * @param {Object} [data.figma_structure] - Figma structure data
   * @returns {Promise<Object>} - Created component
   */
  async createComponent(data) {
    // Validate required fields
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error('Component name is required and cannot be empty');
    }

    // Validate category if provided
    const validCategories = ['buttons', 'forms', 'layout', 'navigation', 'feedback', 'data-display', 'overlay', 'other'];
    if (data.category && !validCategories.includes(data.category)) {
      console.warn(`Invalid category "${data.category}". Using "other" instead.`);
      data.category = 'other';
    }

    // Validate linked_tokens format (should be paths, not UUIDs)
    if (data.linked_tokens) {
      if (hasUUIDsInLinkedTokens(data.linked_tokens)) {
        console.warn(
          '⚠️ linked_tokens contains UUIDs instead of paths. ' +
          'This may cause issues with token linking. Expected format: ["Color/Primary/500", "Spacing/MD"]'
        );
      }
    }

    const slug = generateSlug(data.name.trim());
    
    const { data: component, error } = await supabase
      .from('components')
      .insert({ 
        ...data, 
        slug,
        status: data.status || 'draft'
      })
      .select()
      .single();
    
    if (error) throw error;
    return component;
  },

  /**
   * Update a component
   * @param {string} id - Component UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated component
   */
  async updateComponent(id, updates) {
    // Update slug if name changed
    if (updates.name) {
      updates.slug = generateSlug(updates.name);
    }
    
    // Validate linked_tokens format (should be paths, not UUIDs)
    if (updates.linked_tokens) {
      if (hasUUIDsInLinkedTokens(updates.linked_tokens)) {
        console.warn(
          '⚠️ linked_tokens contains UUIDs instead of paths. ' +
          'This may cause issues with token linking. Expected format: ["Color/Primary/500", "Spacing/MD"]'
        );
      }
      updates.linked_tokens = sanitizeLinkedTokens(updates.linked_tokens);
    }
    
    const { data, error } = await supabase
      .from('components')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a component (also removes storage files)
   * @param {string} id - Component UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteComponent(id) {
    // Delete images from storage first
    const component = await this.getComponent(id);
    if (component?.component_images?.length) {
      const paths = component.component_images.map(i => i.storage_path);
      await supabase.storage.from('component-images').remove(paths);
    }
    
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Update component status
   * @param {string} id - Component UUID
   * @param {string} status - New status (draft, published, archived)
   * @returns {Promise<Object>} - Updated component
   */
  async updateComponentStatus(id, status) {
    return this.updateComponent(id, { status });
  },

  /**
   * Publish component (shorthand for updateComponentStatus)
   * @param {string} id - Component UUID
   * @returns {Promise<Object>} - Updated component
   */
  async publishComponent(id) {
    return this.updateComponentStatus(id, 'published');
  },

  /**
   * Unpublish component (shorthand for updateComponentStatus to draft)
   * @param {string} id - Component UUID
   * @returns {Promise<Object>} - Updated component
   */
  async unpublishComponent(id) {
    return this.updateComponentStatus(id, 'draft');
  },

  /**
   * Archive component (shorthand for updateComponentStatus)
   * @param {string} id - Component UUID
   * @returns {Promise<Object>} - Updated component
   */
  async archiveComponent(id) {
    return this.updateComponentStatus(id, 'archived');
  },

  /**
   * Unarchive component (set to draft)
   * @param {string} id - Component UUID
   * @returns {Promise<Object>} - Updated component
   */
  async unarchiveComponent(id) {
    return this.updateComponentStatus(id, 'draft');
  },

  /**
   * Duplicate a component
   * @param {string} id - Component UUID to duplicate
   * @returns {Promise<Object>} - New duplicated component
   */
  async duplicateComponent(id) {
    const original = await this.getComponent(id);
    if (!original) throw new Error('Component not found');
    
    // Create a copy without the id and with modified name
    const { id: _, slug: __, created_at, updated_at, component_images, component_examples, ...componentData } = original;
    
    const newComponent = await this.createComponent({
      ...componentData,
      name: `${original.name} (Copy)`,
      status: 'draft' // Always start duplicates as draft
    });
    
    return newComponent;
  },

  // ==========================================
  // Token Linking
  // ==========================================

  /**
   * Link design tokens to a component
   * @param {string} componentId - Component UUID
   * @param {Array<string>} tokenPaths - Array of token paths to link (e.g., "Color/Primary/500")
   * @returns {Promise<Object>} - Updated component
   */
  async linkTokens(componentId, tokenPaths) {
    const cleaned = sanitizeLinkedTokens(tokenPaths);
    return this.updateComponent(componentId, { 
      linked_tokens: cleaned 
    });
  },

  /**
   * Add tokens to existing linked tokens
   * @param {string} componentId - Component UUID
   * @param {Array<string>} tokenPaths - Array of token paths to add
   * @returns {Promise<Object>} - Updated component
   */
  async addLinkedTokens(componentId, tokenPaths) {
    const cleaned = sanitizeLinkedTokens(tokenPaths);
    const component = await this.getComponent(componentId);
    const currentTokens = component.linked_tokens || [];
    const newTokens = sanitizeLinkedTokens([...currentTokens, ...cleaned]);
    return this.linkTokens(componentId, newTokens);
  },

  /**
   * Remove tokens from linked tokens
   * @param {string} componentId - Component UUID
   * @param {Array<string>} tokenPaths - Array of token paths to remove
   * @returns {Promise<Object>} - Updated component
   */
  async removeLinkedTokens(componentId, tokenPaths) {
    const cleaned = sanitizeLinkedTokens(tokenPaths);
    const component = await this.getComponent(componentId);
    const currentTokens = component.linked_tokens || [];
    const newTokens = currentTokens.filter(id => !cleaned.includes(id));
    return this.linkTokens(componentId, newTokens);
  },

  // ==========================================
  // Examples
  // ==========================================

  /**
   * Get examples for a component
   * @param {string} componentId - Component UUID
   * @returns {Promise<Array>} - Array of examples
   */
  async getExamples(componentId) {
    const { data, error } = await supabase
      .from('component_examples')
      .select('*')
      .eq('component_id', componentId)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  /**
   * Add an example to a component
   * @param {string} componentId - Component UUID
   * @param {Object} example - Example data
   * @param {string} example.title - Example title
   * @param {string} example.code - Example code
   * @param {string} [example.description] - Example description
   * @returns {Promise<Object>} - Created example
   */
  async addExample(componentId, example) {
    // Get max sort_order for this component
    const { data: existing } = await supabase
      .from('component_examples')
      .select('sort_order')
      .eq('component_id', componentId)
      .order('sort_order', { ascending: false })
      .limit(1);
    
    const nextOrder = existing?.length ? (existing[0].sort_order + 1) : 0;
    
    const { data, error } = await supabase
      .from('component_examples')
      .insert({ 
        component_id: componentId, 
        ...example,
        sort_order: example.sort_order ?? nextOrder
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update an example
   * @param {string} id - Example UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated example
   */
  async updateExample(id, updates) {
    const { data, error } = await supabase
      .from('component_examples')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete an example
   * @param {string} id - Example UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteExample(id) {
    const { error } = await supabase
      .from('component_examples')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Reorder examples
   * @param {string} componentId - Component UUID
   * @param {Array<string>} orderedIds - Array of example IDs in desired order
   * @returns {Promise<Array>} - Updated examples
   */
  async reorderExamples(componentId, orderedIds) {
    const updates = orderedIds.map((id, index) => 
      supabase
        .from('component_examples')
        .update({ sort_order: index })
        .eq('id', id)
    );
    
    await Promise.all(updates);
    return this.getExamples(componentId);
  },

  // ==========================================
  // Images
  // ==========================================

  /**
   * Get images for a component
   * @param {string} componentId - Component UUID
   * @returns {Promise<Array>} - Array of images
   */
  async getImages(componentId) {
    const { data, error } = await supabase
      .from('component_images')
      .select('*')
      .eq('component_id', componentId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  },

  /**
   * Upload a component image
   * @param {string} componentId - Component UUID
   * @param {File} file - Image file to upload
   * @param {string} name - Image name/label
   * @returns {Promise<Object>} - Created image record
   */
  async uploadImage(componentId, file, name) {
    const format = file.name.split('.').pop().toLowerCase();
    const timestamp = Date.now();
    const path = `${componentId}/${name}-${timestamp}.${format}`;
    
    const { error: uploadError } = await supabase.storage
      .from('component-images')
      .upload(path, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    const { data, error } = await supabase
      .from('component_images')
      .insert({
        component_id: componentId,
        name,
        storage_path: path,
        format,
        file_size: file.size
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete an image
   * @param {string} id - Image UUID
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteImage(id) {
    // Get the image to find storage path
    const { data: image } = await supabase
      .from('component_images')
      .select('storage_path')
      .eq('id', id)
      .single();
    
    if (image) {
      await supabase.storage.from('component-images').remove([image.storage_path]);
    }
    
    const { error } = await supabase
      .from('component_images')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Get public URL for an image
   * @param {string} storagePath - Storage path of the image
   * @returns {string|null} - Public URL or null if invalid path
   */
  getImageUrl(storagePath) {
    if (!storagePath) {
      console.warn('getImageUrl called with empty storagePath');
      return null;
    }
    const { data } = supabase.storage
      .from('component-images')
      .getPublicUrl(storagePath);
    return data?.publicUrl || null;
  },

  // ==========================================
  // Bulk Operations
  // ==========================================

  /**
   * Get component counts by status
   * @returns {Promise<Object>} - Count by status { draft: 5, published: 10, archived: 2 }
   */
  async getComponentCountsByStatus() {
    const { data, error } = await supabase
      .from('components')
      .select('status');
    
    if (error) throw error;
    
    return data.reduce((acc, component) => {
      const status = component.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  },

  /**
   * Get component counts by category
   * @returns {Promise<Object>} - Count by category { buttons: 3, forms: 5, ... }
   */
  async getComponentCountsByCategory() {
    const { data, error } = await supabase
      .from('components')
      .select('category');
    
    if (error) throw error;
    
    return data.reduce((acc, component) => {
      const cat = component.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  },

  /**
   * Bulk update component status
   * @param {Array<string>} ids - Array of component UUIDs
   * @param {string} status - New status
   * @returns {Promise<Array>} - Updated components
   */
  async bulkUpdateStatus(ids, status) {
    const { data, error } = await supabase
      .from('components')
      .update({ status })
      .in('id', ids)
      .select();
    
    if (error) throw error;
    return data;
  },

  /**
   * Bulk delete components
   * @param {Array<string>} ids - Array of component UUIDs
   * @returns {Promise<boolean>} - True if successful
   */
  async bulkDelete(ids) {
    // First, get all images for these components
    const { data: images } = await supabase
      .from('component_images')
      .select('storage_path')
      .in('component_id', ids);
    
    // Remove images from storage
    if (images?.length) {
      const paths = images.map(i => i.storage_path);
      await supabase.storage.from('component-images').remove(paths);
    }
    
    // Delete components (cascades to images and examples)
    const { error } = await supabase
      .from('components')
      .delete()
      .in('id', ids);
    
    if (error) throw error;
    return true;
  }
};

export default componentService;

