# Chunk 2.23 — FontUploader

## Purpose
Upload custom font files (.woff2, .woff, .ttf, .otf) for custom typefaces.

---

## Inputs
- TypefaceForm (from chunk 2.22)
- typefaceService (from chunk 1.09)

## Outputs
- FontUploader component
- File upload to Supabase Storage

---

## Dependencies
- Chunk 2.22 must be complete

---

## Implementation Notes

### Supported Formats
| Format | MIME Type | Priority |
|--------|-----------|----------|
| woff2 | font/woff2 | Highest (best compression) |
| woff | font/woff | High (wide support) |
| ttf | font/ttf | Medium (legacy) |
| otf | font/otf | Medium (legacy) |

### Component Structure

```jsx
// src/components/themes/typography/FontUploader.jsx
const ACCEPTED_FORMATS = {
  'woff2': 'font/woff2',
  'woff': 'font/woff',
  'ttf': 'font/ttf',
  'otf': 'font/otf'
};

export default function FontUploader({ typefaceId, onUploadComplete }) {
  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ACCEPTED_FORMATS[ext];
    });

    if (validFiles.length === 0) {
      toast.error('Please upload woff2, woff, ttf, or otf files');
      return;
    }

    setIsUploading(true);

    for (const file of validFiles) {
      try {
        // Parse weight from filename (e.g., "Inter-Bold.woff2" -> 700)
        const weight = parseWeightFromFilename(file.name);
        const style = parseStyleFromFilename(file.name);

        const fontFile = await typefaceService.uploadFontFile(
          typefaceId,
          file,
          weight,
          style
        );

        setUploads(prev => [...prev, fontFile]);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    onUploadComplete?.();
  };

  return (
    <div className="font-uploader">
      <div
        className={cn('upload-zone', { uploading: isUploading })}
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".woff2,.woff,.ttf,.otf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          hidden
        />
        
        {isUploading ? (
          <Spinner />
        ) : (
          <>
            <UploadIcon size={24} />
            <p>Drop font files here or click to browse</p>
            <p className="hint">woff2, woff, ttf, otf (max 5MB each)</p>
          </>
        )}
      </div>

      {uploads.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files</h4>
          {uploads.map(file => (
            <div key={file.id} className="file-item">
              <span className="format">{file.format}</span>
              <span className="weight">{file.weight}</span>
              <span className="style">{file.style}</span>
              <span className="size">{formatBytes(file.file_size)}</span>
              <button onClick={() => handleDelete(file.id)}>
                <TrashIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function parseWeightFromFilename(filename) {
  const weightMap = {
    'thin': 100, 'hairline': 100,
    'extralight': 200, 'ultralight': 200,
    'light': 300,
    'regular': 400, 'normal': 400,
    'medium': 500,
    'semibold': 600, 'demibold': 600,
    'bold': 700,
    'extrabold': 800, 'ultrabold': 800,
    'black': 900, 'heavy': 900
  };

  const lower = filename.toLowerCase();
  for (const [name, weight] of Object.entries(weightMap)) {
    if (lower.includes(name)) return weight;
  }
  return 400;
}

function parseStyleFromFilename(filename) {
  return filename.toLowerCase().includes('italic') ? 'italic' : 'normal';
}
```

---

## Files Created
- `src/components/themes/typography/FontUploader.jsx` — File upload component

---

## Tests

### Unit Tests
- [ ] Accepts valid font formats
- [ ] Rejects invalid formats
- [ ] Parses weight from filename
- [ ] Parses style from filename
- [ ] Uploads to storage
- [ ] Shows uploaded files
- [ ] Delete removes file

---

## Time Estimate
2.5 hours

---

## Notes
Weight parsing from filename is a convenience feature - users can override the detected weight. Prefer woff2 format for best performance.
