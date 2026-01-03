/**
 * @chunk 1.05 - Storage Buckets Setup
 * Helper functions for Supabase Storage operations
 */

import { supabase } from './supabase';

// Bucket names
export const BUCKETS = {
  FONTS: 'fonts',
  COMPONENT_IMAGES: 'component-images'
};

export const storage = {
  /**
   * Get public URL for a file
   * @param {string} bucket - Bucket name (use BUCKETS constant)
   * @param {string} path - File path within bucket
   * @returns {string} Public URL
   */
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Upload a file to storage
   * @param {string} bucket - Bucket name (use BUCKETS constant)
   * @param {string} path - Destination path within bucket
   * @param {File|Blob} file - File to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result data
   */
  async upload(bucket, path, file, options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      });
    
    if (error) throw error;
    return data;
  },

  /**
   * Upload a file, replacing if exists
   * @param {string} bucket - Bucket name (use BUCKETS constant)
   * @param {string} path - Destination path within bucket
   * @param {File|Blob} file - File to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result data
   */
  async upsert(bucket, path, file, options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        ...options
      });
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete file(s) from storage
   * @param {string} bucket - Bucket name (use BUCKETS constant)
   * @param {string|string[]} paths - Path(s) to delete
   * @returns {Promise<boolean>} Success
   */
  async remove(bucket, paths) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(Array.isArray(paths) ? paths : [paths]);
    
    if (error) throw error;
    return true;
  },

  /**
   * List files in a folder
   * @param {string} bucket - Bucket name (use BUCKETS constant)
   * @param {string} folder - Folder path
   * @param {Object} options - List options
   * @returns {Promise<Object[]>} List of files
   */
  async list(bucket, folder = '', options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
        ...options
      });
    
    if (error) throw error;
    return data;
  },

  /**
   * Download a file
   * @param {string} bucket - Bucket name (use BUCKETS constant)
   * @param {string} path - File path
   * @returns {Promise<Blob>} File blob
   */
  async download(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    return data;
  },

  /**
   * Move/rename a file
   * @param {string} bucket - Bucket name (use BUCKETS constant)
   * @param {string} fromPath - Source path
   * @param {string} toPath - Destination path
   * @returns {Promise<Object>} Move result
   */
  async move(bucket, fromPath, toPath) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);
    
    if (error) throw error;
    return data;
  },

  /**
   * Copy a file
   * @param {string} bucket - Bucket name (use BUCKETS constant)
   * @param {string} fromPath - Source path
   * @param {string} toPath - Destination path
   * @returns {Promise<Object>} Copy result
   */
  async copy(bucket, fromPath, toPath) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .copy(fromPath, toPath);
    
    if (error) throw error;
    return data;
  },

  // Font-specific helpers
  fonts: {
    /**
     * Get the storage path for a font file
     * @param {string} themeId - Theme ID
     * @param {string} typefaceRole - Typeface role (e.g., 'heading', 'body')
     * @param {string} fileName - Font file name
     * @returns {string} Storage path
     */
    getPath(themeId, typefaceRole, fileName) {
      return `${themeId}/${typefaceRole}/${fileName}`;
    },

    /**
     * Upload a font file
     * @param {string} themeId - Theme ID
     * @param {string} typefaceRole - Typeface role
     * @param {string} fileName - Font file name
     * @param {File} file - Font file
     * @returns {Promise<{path: string, url: string}>}
     */
    async upload(themeId, typefaceRole, fileName, file) {
      const path = this.getPath(themeId, typefaceRole, fileName);
      await storage.upsert(BUCKETS.FONTS, path, file, {
        contentType: file.type || 'application/octet-stream'
      });
      return {
        path,
        url: storage.getPublicUrl(BUCKETS.FONTS, path)
      };
    },

    /**
     * Delete a font file
     * @param {string} path - Font file path
     * @returns {Promise<boolean>}
     */
    async remove(path) {
      return storage.remove(BUCKETS.FONTS, path);
    },

    /**
     * Get public URL for a font
     * @param {string} path - Font file path
     * @returns {string}
     */
    getUrl(path) {
      return storage.getPublicUrl(BUCKETS.FONTS, path);
    }
  },

  // Component image helpers
  images: {
    /**
     * Get the storage path for a component image
     * @param {string} componentId - Component ID
     * @param {string} fileName - Image file name
     * @returns {string} Storage path
     */
    getPath(componentId, fileName) {
      return `${componentId}/${fileName}`;
    },

    /**
     * Upload a component image
     * @param {string} componentId - Component ID
     * @param {string} fileName - Image file name (e.g., 'preview.png')
     * @param {File|Blob} file - Image file
     * @returns {Promise<{path: string, url: string}>}
     */
    async upload(componentId, fileName, file) {
      const path = this.getPath(componentId, fileName);
      await storage.upsert(BUCKETS.COMPONENT_IMAGES, path, file, {
        contentType: file.type || 'image/png'
      });
      return {
        path,
        url: storage.getPublicUrl(BUCKETS.COMPONENT_IMAGES, path)
      };
    },

    /**
     * Delete a component image
     * @param {string} path - Image file path
     * @returns {Promise<boolean>}
     */
    async remove(path) {
      return storage.remove(BUCKETS.COMPONENT_IMAGES, path);
    },

    /**
     * Delete all images for a component
     * @param {string} componentId - Component ID
     * @returns {Promise<boolean>}
     */
    async removeAll(componentId) {
      const files = await storage.list(BUCKETS.COMPONENT_IMAGES, componentId);
      if (files.length === 0) return true;
      
      const paths = files.map(f => `${componentId}/${f.name}`);
      return storage.remove(BUCKETS.COMPONENT_IMAGES, paths);
    },

    /**
     * Get public URL for a component image
     * @param {string} path - Image file path
     * @returns {string}
     */
    getUrl(path) {
      return storage.getPublicUrl(BUCKETS.COMPONENT_IMAGES, path);
    }
  }
};

export default storage;

