# Chunk 1.10 — Component Service

## Purpose
Create service layer for component CRUD operations.

---

## Inputs
- Supabase client (from chunk 1.01)
- Component tables (from chunk 1.04)

## Outputs
- componentService module (consumed by chunk 3.01, 3.10, 3.12)

---

## Dependencies
- Chunk 1.04 must be complete

---

## Implementation Notes

### Key Considerations
- Support filtering by status and category
- Include related images and examples
- Handle storage uploads for images

### Service Interface

```javascript
// src/services/componentService.js
import { supabase } from '../lib/supabase';

export const componentService = {
  // Get components with filters
  async getComponents({ status, category, search } = {}) {
    let query = supabase
      .from('components')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get published components only
  async getPublishedComponents() {
    return this.getComponents({ status: 'published' });
  },

  // Get single component with relations
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
    
    if (error) throw error;
    return data;
  },

  // Get component by slug
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
    
    if (error) throw error;
    return data;
  },

  // Create component
  async createComponent(data) {
    const slug = generateSlug(data.name);
    const { data: component, error } = await supabase
      .from('components')
      .insert({ ...data, slug })
      .select()
      .single();
    
    if (error) throw error;
    return component;
  },

  // Update component
  async updateComponent(id, updates) {
    // Update slug if name changed
    if (updates.name) {
      updates.slug = generateSlug(updates.name);
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

  // Delete component
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

  // Publish component
  async publishComponent(id) {
    return this.updateComponent(id, { status: 'published' });
  },

  // Archive component
  async archiveComponent(id) {
    return this.updateComponent(id, { status: 'archived' });
  },

  // === Examples ===

  // Get examples for component
  async getExamples(componentId) {
    const { data, error } = await supabase
      .from('component_examples')
      .select('*')
      .eq('component_id', componentId)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  // Add example
  async addExample(componentId, example) {
    const { data, error } = await supabase
      .from('component_examples')
      .insert({ component_id: componentId, ...example })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update example
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

  // Delete example
  async deleteExample(id) {
    const { error } = await supabase
      .from('component_examples')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Reorder examples
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

  // === Images ===

  // Upload component image
  async uploadImage(componentId, file, name) {
    const format = file.name.split('.').pop().toLowerCase();
    const path = `${componentId}/${name}.${format}`;
    
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

  // Delete image
  async deleteImage(id) {
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

  // Get image URL
  getImageUrl(storagePath) {
    const { data } = supabase.storage
      .from('component-images')
      .getPublicUrl(storagePath);
    return data.publicUrl;
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
- `src/services/componentService.js` — Component service

---

## Tests

### Unit Tests
- [ ] getComponents returns filtered results
- [ ] getPublishedComponents filters by published
- [ ] getComponent includes images and examples
- [ ] getComponentBySlug finds by slug
- [ ] createComponent generates slug
- [ ] updateComponent returns updated data
- [ ] deleteComponent removes storage files
- [ ] publishComponent updates status
- [ ] addExample creates record
- [ ] updateExample updates record
- [ ] deleteExample removes record
- [ ] uploadImage uploads and creates record
- [ ] deleteImage removes from storage
- [ ] getImageUrl returns valid URL

---

## Time Estimate
2 hours

---

## Notes
Component service handles both component records and their related images/examples. The slug is auto-generated from name but can be customized if needed later.
