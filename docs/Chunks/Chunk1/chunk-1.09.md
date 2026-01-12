# Chunk 1.09 — Typeface Service

## Purpose
Create service layer for typeface management and font file uploads.

---

## Inputs
- Supabase client (from chunk 1.01)
- Typography tables (from chunk 1.03)
- Storage buckets (from chunk 1.05)

## Outputs
- typefaceService module (consumed by chunk 2.21, 2.23, 2.25)

---

## Dependencies
- Chunk 1.03 must be complete
- Chunk 1.05 must be complete

---

## Implementation Notes

### Key Considerations
- Handle both database records and storage uploads
- Support multiple font formats (woff2, woff, ttf, otf)
- Generate public URLs for font loading

### Service Interface

```javascript
// src/services/typefaceService.js
import { supabase } from '../lib/supabase';

export const typefaceService = {
  // Get typefaces by theme
  async getTypefacesByTheme(themeId) {
    const { data, error } = await supabase
      .from('typefaces')
      .select(`
        *,
        font_files(*)
      `)
      .eq('theme_id', themeId);
    
    if (error) throw error;
    return data;
  },

  // Get single typeface
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

  // Get typeface by role
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
    
    if (error) return null; // May not exist
    return data;
  },

  // Create typeface
  async createTypeface(data) {
    const { data: typeface, error } = await supabase
      .from('typefaces')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return typeface;
  },

  // Update typeface
  async updateTypeface(id, updates) {
    const { data, error } = await supabase
      .from('typefaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete typeface (cascades to font_files)
  async deleteTypeface(id) {
    // First get typeface to find font files
    const typeface = await this.getTypeface(id);
    
    // Delete files from storage
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

  // Upload font file
  async uploadFontFile(typefaceId, file, weight, style = 'normal') {
    // Get typeface for path construction
    const typeface = await this.getTypeface(typefaceId);
    
    // Determine format from file
    const format = getFormatFromFile(file);
    
    // Construct storage path
    const styleSuffix = style === 'italic' ? '-italic' : '';
    const path = `${typeface.theme_id}/${typeface.role}/${typeface.family}-${weight}${styleSuffix}.${format}`;
    
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

  // Delete font file
  async deleteFontFile(id) {
    const { data: fontFile } = await supabase
      .from('font_files')
      .select('storage_path')
      .eq('id', id)
      .single();
    
    if (fontFile) {
      await supabase.storage.from('fonts').remove([fontFile.storage_path]);
    }
    
    const { error } = await supabase
      .from('font_files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get public URL for font file
  getFontUrl(storagePath) {
    const { data } = supabase.storage.from('fonts').getPublicUrl(storagePath);
    return data.publicUrl;
  },

  // Get typography roles by theme
  async getTypographyRoles(themeId) {
    const { data, error } = await supabase
      .from('typography_roles')
      .select('*')
      .eq('theme_id', themeId)
      .order('role_name');
    
    if (error) throw error;
    return data;
  },

  // Create typography role
  async createTypographyRole(roleData) {
    const { data, error } = await supabase
      .from('typography_roles')
      .insert(roleData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update typography role
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

  // Upsert typography role (create or update)
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

  // Bulk create default typography roles
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
  }
};

function getFormatFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  return ext;
}

function getMimeType(format) {
  const mimes = {
    woff2: 'font/woff2',
    woff: 'font/woff',
    ttf: 'font/ttf',
    otf: 'font/otf'
  };
  return mimes[format] || 'application/octet-stream';
}
```

---

## Files Created
- `src/services/typefaceService.js` — Typeface service

---

## Tests

### Unit Tests
- [ ] getTypefacesByTheme returns with font_files
- [ ] getTypeface returns single with files
- [ ] getTypefaceByRole finds by role
- [ ] createTypeface creates record
- [ ] updateTypeface updates and returns
- [ ] deleteTypeface removes files from storage
- [ ] uploadFontFile uploads and creates record
- [ ] deleteFontFile removes from storage and database
- [ ] getFontUrl returns valid URL
- [ ] getTypographyRoles returns array
- [ ] upsertTypographyRole creates or updates
- [ ] createDefaultTypographyRoles creates all 11 roles

---

## Time Estimate
2 hours

---

## Notes
Typeface service manages the complex relationship between typefaces, font files, and typography roles. The 4-role system (display/text/mono/accent) simplifies font selection while the 11 typography roles provide semantic mapping for actual text usage.
