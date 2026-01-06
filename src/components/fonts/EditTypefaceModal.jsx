/**
 * @chunk 2.23 - EditTypefaceModal
 * 
 * Enhanced Edit Typeface modal with font file uploads.
 * Features:
 * - Details tab: Font family selector (Google/custom/system fonts), weights
 * - Font Files tab: Upload, view, and manage custom font files
 * - Preview tab: Live preview with uploaded fonts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Check, 
  ChevronsUpDown, 
  Upload, 
  Trash2, 
  FileText, 
  Globe, 
  HardDrive,
  Loader2,
  X 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { typefaceService } from '@/services/typefaceService';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/Popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

// Popular Google Fonts + System fonts
const FONT_OPTIONS = [
  // Sans-serif
  { value: 'Inter', label: 'Inter', category: 'Sans-serif' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Sans-serif' },
  { value: 'Lato', label: 'Lato', category: 'Sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans-serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans-serif' },
  { value: 'Work Sans', label: 'Work Sans', category: 'Sans-serif' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Sans-serif' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Sans-serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Sans-serif' },
  { value: 'Euclid Circular B', label: 'Euclid Circular B', category: 'Sans-serif' },
  { value: 'Graphik', label: 'Graphik', category: 'Sans-serif' },
  { value: 'Manrope', label: 'Manrope', category: 'Sans-serif' },
  { value: 'Outfit', label: 'Outfit', category: 'Sans-serif' },
  // Serif
  { value: 'Georgia', label: 'Georgia', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Lora', label: 'Lora', category: 'Serif' },
  { value: 'Schnyder S', label: 'Schnyder S', category: 'Serif' },
  { value: 'Source Serif Pro', label: 'Source Serif Pro', category: 'Serif' },
  // Monospace
  { value: 'Fira Code', label: 'Fira Code', category: 'Monospace' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace' },
  { value: 'Source Code Pro', label: 'Source Code Pro', category: 'Monospace' },
  // System
  { value: 'system-ui', label: 'System UI', category: 'System' },
  { value: 'Arial', label: 'Arial', category: 'System' },
  { value: 'Helvetica', label: 'Helvetica', category: 'System' },
];

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
];

const ACCEPTED_FORMATS = {
  'font/woff2': ['.woff2'],
  'font/woff': ['.woff'],
  'font/ttf': ['.ttf'],
  'font/otf': ['.otf'],
  'application/x-font-woff': ['.woff'],
  'application/x-font-woff2': ['.woff2'],
  'application/x-font-ttf': ['.ttf'],
  'application/x-font-opentype': ['.otf'],
};

/**
 * Parse font weight from filename
 */
function parseWeightFromFilename(filename) {
  const lower = filename.toLowerCase();
  
  if (lower.includes('thin') || lower.includes('100')) return 100;
  if (lower.includes('extralight') || lower.includes('200')) return 200;
  if (lower.includes('light') || lower.includes('300')) return 300;
  if (lower.includes('medium') || lower.includes('500')) return 500;
  if (lower.includes('semibold') || lower.includes('600')) return 600;
  if ((lower.includes('bold') && !lower.includes('extra') && !lower.includes('semi')) || lower.includes('700')) return 700;
  if (lower.includes('extrabold') || lower.includes('800')) return 800;
  if (lower.includes('black') || lower.includes('900')) return 900;
  
  return 400;
}

/**
 * Parse font style from filename
 */
function parseStyleFromFilename(filename) {
  return filename.toLowerCase().includes('italic') ? 'italic' : 'normal';
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get weight label
 */
function getWeightLabel(weight) {
  const w = FONT_WEIGHTS.find(fw => fw.value === weight);
  return w ? w.label : weight.toString();
}

/**
 * EditTypefaceModal component
 */
export default function EditTypefaceModal({ 
  open, 
  onOpenChange, 
  typeface, 
  themeId, 
  onSuccess 
}) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [openFontPicker, setOpenFontPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    family: '',
    source: 'google',
    weights: [400],
    isVariable: false,
    fallback: 'sans-serif',
  });

  // Font files state
  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [previewFontsLoaded, setPreviewFontsLoaded] = useState({});

  // Initialize form with typeface data
  useEffect(() => {
    if (typeface && open) {
      setFormData({
        family: typeface.family || '',
        source: typeface.source_type || 'google',
        weights: typeface.weights || [400],
        isVariable: typeface.is_variable || false,
        fallback: typeface.fallback || 'sans-serif',
      });
      
      // Load existing font files
      if (typeface.id) {
        loadFontFiles(typeface.id);
      }
      
      // Reset state
      setNewFiles([]);
      setDeletedFileIds([]);
      setActiveTab('details');
      setSearchQuery('');
    }
  }, [typeface, open]);

  const loadFontFiles = async (typefaceId) => {
    try {
      const files = await typefaceService.getFontFiles(typefaceId);
      setExistingFiles(files || []);
    } catch (error) {
      console.error('Failed to load font files:', error);
      setExistingFiles([]);
    }
  };

  // Load Google Font for preview
  useEffect(() => {
    if (formData.family && formData.source === 'google') {
      const isGoogleFont = FONT_OPTIONS.find(
        f => f.value === formData.family && f.category !== 'System'
      );
      
      if (isGoogleFont) {
        const weights = formData.weights.join(';');
        const familyEncoded = formData.family.replace(/\s+/g, '+');
        const linkId = `preview-font-${formData.family.replace(/\s+/g, '-')}`;
        
        // Remove existing link if any
        const existing = document.getElementById(linkId);
        if (existing) existing.remove();
        
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${familyEncoded}:wght@${weights}&display=swap`;
        link.rel = 'stylesheet';
        link.id = linkId;
        
        document.head.appendChild(link);
      }
    }
  }, [formData.family, formData.weights, formData.source]);

  // Load preview fonts from new file blobs
  useEffect(() => {
    newFiles.forEach(fileData => {
      if (!previewFontsLoaded[fileData.file.name]) {
        const fontFace = new FontFace(
          `${formData.family}-preview`,
          `url(${fileData.preview})`,
          { weight: String(fileData.weight), style: fileData.style }
        );
        
        fontFace.load().then(loadedFace => {
          document.fonts.add(loadedFace);
          setPreviewFontsLoaded(prev => ({ ...prev, [fileData.file.name]: true }));
        }).catch(err => {
          console.warn('Failed to load preview font:', err);
        });
      }
    });
  }, [newFiles, formData.family]);

  // File dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const processedFiles = acceptedFiles.map(file => {
      const weight = parseWeightFromFilename(file.name);
      const style = parseStyleFromFilename(file.name);
      const format = file.name.split('.').pop().toLowerCase();

      return {
        file,
        weight,
        style,
        format,
        preview: URL.createObjectURL(file),
        isNew: true,
      };
    });

    setNewFiles(prev => [...prev, ...processedFiles]);
    
    // Auto-switch to custom source when files are uploaded
    if (processedFiles.length > 0 && formData.source !== 'custom') {
      setFormData(prev => ({ ...prev, source: 'custom' }));
    }
  }, [formData.source]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    multiple: true,
  });

  const removeNewFile = (index) => {
    setNewFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const markFileForDeletion = (fileId) => {
    setDeletedFileIds(prev => [...prev, fileId]);
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateNewFileWeight = (index, weight) => {
    setNewFiles(prev => prev.map((f, i) => i === index ? { ...f, weight } : f));
  };

  const toggleWeight = (weight) => {
    setFormData(prev => ({
      ...prev,
      weights: prev.weights.includes(weight)
        ? prev.weights.filter(w => w !== weight)
        : [...prev.weights, weight].sort((a, b) => a - b)
    }));
  };

  const handleSave = async () => {
    if (!formData.family.trim()) {
      toast.error('Please enter a font family name');
      return;
    }

    setSaving(true);

    try {
      // 1. Update typeface record
      await typefaceService.updateTypeface(typeface.id, {
        family: formData.family,
        source_type: formData.source,
        weights: formData.weights,
        is_variable: formData.isVariable,
        fallback: formData.fallback,
      });

      // 2. Delete marked files
      for (const fileId of deletedFileIds) {
        try {
          await typefaceService.deleteFontFile(fileId);
        } catch (err) {
          console.error('Failed to delete font file:', err);
        }
      }

      // 3. Upload new files
      for (const fileData of newFiles) {
        try {
          await typefaceService.uploadFontFile(
            typeface.id,
            fileData.file,
            fileData.weight,
            fileData.style
          );
        } catch (err) {
          console.error('Failed to upload font file:', err);
          toast.error(`Failed to upload ${fileData.file.name}`);
        }
      }

      toast.success('Typeface updated successfully');
      onSuccess?.();
      onOpenChange(false);

    } catch (error) {
      console.error('Failed to update typeface:', error);
      toast.error('Failed to update typeface');
    } finally {
      setSaving(false);
    }
  };

  // Filter fonts by search query
  const filteredFonts = FONT_OPTIONS.filter(font =>
    font.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group fonts by category
  const groupedFonts = filteredFonts.reduce((acc, font) => {
    if (!acc[font.category]) acc[font.category] = [];
    acc[font.category].push(font);
    return acc;
  }, {});

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      newFiles.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, []);

  const totalFilesCount = existingFiles.length + newFiles.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="edit-typeface-modal max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Typeface</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="edit-typeface-tabs-list">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="files">
              Font Files
              {totalFilesCount > 0 && (
                <span className="edit-typeface-tab-badge">
                  {totalFilesCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="edit-typeface-tab-content">
            {/* DETAILS TAB */}
            <TabsContent value="details" className="edit-typeface-details">
              {/* Font Source */}
              <div className="edit-typeface-field">
                <Label>Font Source</Label>
                <div className="edit-typeface-source-grid">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, source: 'google' }))}
                    className={cn(
                      "edit-typeface-source-btn",
                      formData.source === 'google' && "selected"
                    )}
                  >
                    <Globe className="w-5 h-5" />
                    <span>Google Fonts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, source: 'custom' }))}
                    className={cn(
                      "edit-typeface-source-btn",
                      formData.source === 'custom' && "selected"
                    )}
                  >
                    <Upload className="w-5 h-5" />
                    <span>Custom Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, source: 'system' }))}
                    className={cn(
                      "edit-typeface-source-btn",
                      formData.source === 'system' && "selected"
                    )}
                  >
                    <HardDrive className="w-5 h-5" />
                    <span>System Font</span>
                  </button>
                </div>
              </div>

              {/* Font Family Selector */}
              <div className="edit-typeface-field">
                <Label>Font Family</Label>
                {formData.source === 'google' ? (
                  <Popover open={openFontPicker} onOpenChange={setOpenFontPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="edit-typeface-font-picker-trigger"
                      >
                        {formData.family ? (
                          <span style={{ fontFamily: `"${formData.family}", sans-serif` }}>{formData.family}</span>
                        ) : (
                          <span className="text-muted-foreground">Select a font...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="edit-typeface-font-picker-dropdown" align="start">
                      <div className="edit-typeface-font-search">
                        <Input
                          ref={searchInputRef}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search fonts..."
                          className="edit-typeface-font-search-input"
                        />
                      </div>
                      <div className="edit-typeface-font-list">
                        {Object.entries(groupedFonts).map(([category, fonts]) => (
                          <div key={category} className="edit-typeface-font-group">
                            <div className="edit-typeface-font-group-label">{category}</div>
                            {fonts.map((font) => (
                              <button
                                key={font.value}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, family: font.value }));
                                  setOpenFontPicker(false);
                                }}
                                className={cn(
                                  "edit-typeface-font-option",
                                  formData.family === font.value && "selected"
                                )}
                              >
                                {formData.family === font.value && (
                                  <Check className="w-4 h-4 mr-2" />
                                )}
                                <span style={{ fontFamily: `"${font.value}", sans-serif` }}>{font.label}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                        {filteredFonts.length === 0 && (
                          <div className="edit-typeface-font-empty">No fonts found.</div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    value={formData.family}
                    onChange={(e) => setFormData(prev => ({ ...prev, family: e.target.value }))}
                    placeholder={formData.source === 'custom' ? "Enter font family name..." : "Enter system font name..."}
                  />
                )}
                <p className="edit-typeface-hint">
                  {formData.source === 'custom' 
                    ? 'Enter the exact font family name that matches your font files.'
                    : formData.source === 'google'
                    ? 'Select from Google Fonts library.'
                    : 'Enter a system font name like Arial, Helvetica, etc.'}
                </p>
              </div>

              {/* Font Weights */}
              <div className="edit-typeface-field">
                <div className="edit-typeface-weights-header">
                  <Label>Font Weights</Label>
                  <div className="edit-typeface-weights-actions">
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, weights: FONT_WEIGHTS.map(w => w.value) }))}
                      className="edit-typeface-link-btn"
                    >
                      All
                    </button>
                    <span className="edit-typeface-divider">|</span>
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, weights: [400] }))}
                      className="edit-typeface-link-btn"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                
                <div className="edit-typeface-weights-grid">
                  {FONT_WEIGHTS.map((weight) => (
                    <button
                      key={weight.value}
                      type="button"
                      onClick={() => toggleWeight(weight.value)}
                      className={cn(
                        "edit-typeface-weight-chip",
                        formData.weights.includes(weight.value) && "selected"
                      )}
                    >
                      <span className="edit-typeface-weight-value">{weight.value}</span>
                      <span className="edit-typeface-weight-label">{weight.label}</span>
                    </button>
                  ))}
                </div>
                <p className="edit-typeface-hint">
                  {formData.weights.length} weight{formData.weights.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Variable Font */}
              <div className="edit-typeface-variable-field">
                <input
                  id="isVariable"
                  type="checkbox"
                  checked={formData.isVariable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVariable: e.target.checked }))}
                  className="edit-typeface-checkbox"
                />
                <div>
                  <Label htmlFor="isVariable" className="cursor-pointer">Variable font</Label>
                  <p className="edit-typeface-hint">
                    Enable if this is a variable font with adjustable weight axis.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* FILES TAB */}
            <TabsContent value="files" className="edit-typeface-files">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={cn(
                  "edit-typeface-dropzone",
                  isDragActive && "dragging"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-gray-400" />
                {isDragActive ? (
                  <p className="edit-typeface-dropzone-text active">Drop font files here...</p>
                ) : (
                  <>
                    <p className="edit-typeface-dropzone-text">Drag & drop font files here</p>
                    <p className="edit-typeface-dropzone-hint">or click to browse</p>
                    <p className="edit-typeface-dropzone-formats">.woff2, .woff, .ttf, .otf</p>
                  </>
                )}
              </div>

              {/* Existing Files */}
              {existingFiles.length > 0 && (
                <div className="edit-typeface-file-section">
                  <Label>Existing Files ({existingFiles.length})</Label>
                  <div className="edit-typeface-file-list">
                    {existingFiles.map((file) => (
                      <div key={file.id} className="edit-typeface-file-item">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div className="edit-typeface-file-info">
                          <p className="edit-typeface-file-name">
                            {file.storage_path?.split('/').pop() || 'Font file'}
                          </p>
                          <p className="edit-typeface-file-meta">
                            {getWeightLabel(file.weight)} • {file.style} • {formatBytes(file.file_size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markFileForDeletion(file.id)}
                          className="edit-typeface-file-delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Files to Upload */}
              {newFiles.length > 0 && (
                <div className="edit-typeface-file-section">
                  <Label>New Files ({newFiles.length})</Label>
                  <div className="edit-typeface-file-list">
                    {newFiles.map((fileData, index) => (
                      <div key={index} className="edit-typeface-file-item new">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div className="edit-typeface-file-info">
                          <p className="edit-typeface-file-name">{fileData.file.name}</p>
                          <p className="edit-typeface-file-meta">{formatBytes(fileData.file.size)}</p>
                        </div>
                        
                        <Select 
                          value={String(fileData.weight)} 
                          onValueChange={(value) => updateNewFileWeight(index, parseInt(value))}
                        >
                          <SelectTrigger className="edit-typeface-weight-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_WEIGHTS.map(w => (
                              <SelectItem key={w.value} value={String(w.value)}>
                                {w.value} {w.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNewFile(index)}
                          className="edit-typeface-file-delete"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingFiles.length === 0 && newFiles.length === 0 && (
                <div className="edit-typeface-no-files">
                  <p>No font files uploaded yet.</p>
                  <p className="edit-typeface-hint">Upload .woff2 files for best performance.</p>
                </div>
              )}
            </TabsContent>

            {/* PREVIEW TAB */}
            <TabsContent value="preview" className="edit-typeface-preview">
              <div className="edit-typeface-preview-card">
                <div className="edit-typeface-preview-section">
                  <Label className="edit-typeface-preview-label">Font Family</Label>
                  <p className="edit-typeface-preview-family">{formData.family || 'No font selected'}</p>
                </div>

                <div className="edit-typeface-preview-section">
                  <Label className="edit-typeface-preview-label">Sample Text</Label>
                  <p 
                    className="edit-typeface-preview-sample"
                    style={{ fontFamily: `"${formData.family}", "${formData.family}-preview", ${formData.fallback}` }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>

                <div className="edit-typeface-preview-section">
                  <Label className="edit-typeface-preview-label">Characters</Label>
                  <p 
                    className="edit-typeface-preview-chars"
                    style={{ fontFamily: `"${formData.family}", "${formData.family}-preview", ${formData.fallback}` }}
                  >
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    0123456789 !@#$%^&*()
                  </p>
                </div>

                <div className="edit-typeface-preview-section">
                  <Label className="edit-typeface-preview-label">Weights</Label>
                  <div className="edit-typeface-preview-weights">
                    {formData.weights.map(weight => (
                      <p 
                        key={weight}
                        className="edit-typeface-preview-weight-sample"
                        style={{ 
                          fontFamily: `"${formData.family}", "${formData.family}-preview", ${formData.fallback}`,
                          fontWeight: weight 
                        }}
                      >
                        <span className="edit-typeface-preview-weight-num">{weight}</span>
                        The quick brown fox jumps over the lazy dog
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="edit-typeface-footer">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

