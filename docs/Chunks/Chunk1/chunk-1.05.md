# Chunk 1.05 — Storage Buckets Setup

## Purpose
Configure Supabase Storage buckets for fonts and component images.

---

## Inputs
- Supabase project (from chunk 1.01)

## Outputs
- `fonts` bucket (consumed by chunk 1.09, 2.23)
- `component-images` bucket (consumed by chunk 1.10, 4.10)
- Public URL patterns documented

---

## Dependencies
- Chunk 1.01 must be complete

---

## Implementation Notes

### Key Considerations
- Buckets should be public for font loading
- Set file size limits
- Configure allowed MIME types

### Bucket Configuration

```sql
-- Create buckets (via Supabase dashboard or SQL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('fonts', 'fonts', true, 5242880, -- 5MB
   ARRAY['font/woff2', 'font/woff', 'font/ttf', 'font/otf', 'application/octet-stream']),
  ('component-images', 'component-images', true, 5242880, -- 5MB
   ARRAY['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']);

-- Storage policies (public read, authenticated write)
-- Since we're deferring auth, make both read/write public for now
CREATE POLICY "Public read fonts" ON storage.objects
  FOR SELECT USING (bucket_id = 'fonts');

CREATE POLICY "Public write fonts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'fonts');

CREATE POLICY "Public delete fonts" ON storage.objects
  FOR DELETE USING (bucket_id = 'fonts');

CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'component-images');

CREATE POLICY "Public write images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'component-images');

CREATE POLICY "Public delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'component-images');
```

### File Organization
```
fonts/
  {theme_id}/
    {typeface_role}/
      {family}-{weight}.woff2
      {family}-{weight}-italic.woff2

component-images/
  {component_id}/
    preview.png
    thumbnail.png
    {variant_name}.png
```

### Storage Helper Functions
```javascript
// src/lib/storage.js
import { supabase } from './supabase';

export const storage = {
  // Get public URL for a file
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Upload file
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

  // Delete file
  async remove(bucket, paths) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(Array.isArray(paths) ? paths : [paths]);
    
    if (error) throw error;
    return true;
  }
};
```

---

## Files Created
- `supabase/migrations/004_storage.sql` — Storage setup
- `src/lib/storage.js` — Storage helper functions

---

## Tests

### Unit Tests
- [ ] Can upload file to fonts bucket
- [ ] Can upload file to component-images bucket
- [ ] Can get public URL for uploaded file
- [ ] Can delete uploaded file

### Verification
- [ ] Buckets visible in Supabase dashboard
- [ ] Public URLs accessible in browser

---

## Time Estimate
1 hour

---

## Notes
Public buckets are intentional for now (no auth). When auth is added later, policies will need to be updated to restrict write access to authenticated users.
