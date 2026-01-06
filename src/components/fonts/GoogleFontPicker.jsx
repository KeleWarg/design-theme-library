/**
 * @chunk 7.06 - GoogleFontPicker
 * 
 * Component for selecting and adding Google Fonts to a theme.
 * Provides search, preview, and weight selection.
 */

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { typefaceService } from '../../services/typefaceService';
import { loadGoogleFont } from '../../lib/fontLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Checkbox from '@/components/ui/Checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Popular Google Fonts - curated list
const POPULAR_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Source Sans Pro', 'Raleway', 'Nunito', 'Ubuntu', 'Merriweather',
  'Playfair Display', 'PT Sans', 'Rubik', 'Work Sans', 'Fira Sans',
  'Quicksand', 'Mulish', 'Barlow', 'Josefin Sans', 'Libre Baskerville',
  'DM Sans', 'Space Grotesk', 'Outfit', 'Plus Jakarta Sans',
  'Manrope', 'Karla', 'Crimson Text', 'Lora', 'Noto Sans',
  'IBM Plex Sans', 'IBM Plex Serif', 'IBM Plex Mono',
  'Source Serif Pro', 'PT Serif', 'Bitter', 'Cormorant Garamond',
  'JetBrains Mono', 'Fira Code', 'Source Code Pro',
];

// Available font weights
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

// Font roles
const FONT_ROLES = [
  { value: 'display', label: 'Display' },
  { value: 'text', label: 'Text / Body' },
  { value: 'mono', label: 'Monospace' },
  { value: 'accent', label: 'Accent' },
];

/**
 * Google Font Picker component
 * @param {Object} props
 * @param {string} props.themeId - Theme UUID to add font to
 * @param {Array<string>} props.availableRoles - Roles not yet assigned
 * @param {function} props.onSuccess - Callback when font is added
 * @param {function} props.onClose - Callback to close the picker
 */
export default function GoogleFontPicker({ 
  themeId, 
  availableRoles = FONT_ROLES.map(r => r.value),
  onSuccess, 
  onClose 
}) {
  const [search, setSearch] = useState('');
  const [selectedFont, setSelectedFont] = useState('');
  const [selectedWeights, setSelectedWeights] = useState([400]);
  const [role, setRole] = useState(availableRoles[0] || 'text');
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Filter fonts based on search
  const filteredFonts = POPULAR_FONTS.filter(font =>
    font.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle weight selection
  const toggleWeight = (weight) => {
    setSelectedWeights(prev =>
      prev.includes(weight)
        ? prev.filter(w => w !== weight)
        : [...prev, weight].sort((a, b) => a - b)
    );
  };

  // Load font preview when selected
  useEffect(() => {
    if (selectedFont) {
      setPreviewLoading(true);
      loadGoogleFont(selectedFont, selectedWeights)
        .then(() => setPreviewLoading(false))
        .catch(() => setPreviewLoading(false));
    }
  }, [selectedFont, selectedWeights]);

  // Handle font selection
  const handleSelectFont = (font) => {
    setSelectedFont(font);
    // Reset weights to just 400 when changing fonts
    setSelectedWeights([400]);
  };

  // Save font to theme
  const handleSave = async () => {
    if (!selectedFont) {
      toast.error('Please select a font');
      return;
    }

    if (selectedWeights.length === 0) {
      toast.error('Please select at least one weight');
      return;
    }

    setSaving(true);

    try {
      await typefaceService.createTypeface(themeId, {
        name: selectedFont,
        family: selectedFont,
        role,
        source_type: 'google',
        weights: selectedWeights,
        styles: ['normal'],
      });

      toast.success(`Added ${selectedFont} to theme`);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add font:', error);
      toast.error('Failed to add font');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="google-font-picker">
      {/* Search */}
      <div className="gfp-search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Google Fonts..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Font List */}
      <div className="gfp-font-list">
        {filteredFonts.length === 0 ? (
          <div className="gfp-no-results">
            No fonts found matching "{search}"
          </div>
        ) : (
          filteredFonts.map(font => (
            <button
              key={font}
              type="button"
              onClick={() => handleSelectFont(font)}
              className={`gfp-font-option ${selectedFont === font ? 'selected' : ''}`}
            >
              <span style={{ fontFamily: `"${font}", sans-serif` }}>{font}</span>
            </button>
          ))
        )}
      </div>

      {/* Selected Font Options */}
      {selectedFont && (
        <div className="gfp-options">
          {/* Role */}
          <div className="gfp-option-group">
            <Label>Font Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_ROLES.filter(r => availableRoles.includes(r.value)).map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weights */}
          <div className="gfp-option-group">
            <Label>Font Weights</Label>
            <div className="gfp-weights">
              {FONT_WEIGHTS.map(w => (
                <label key={w.value} className="gfp-weight-option">
                  <Checkbox
                    checked={selectedWeights.includes(w.value)}
                    onCheckedChange={() => toggleWeight(w.value)}
                  />
                  <span>{w.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="gfp-preview">
            <Label>Preview</Label>
            {previewLoading ? (
              <div className="gfp-preview-loading">
                <Loader2 className="animate-spin" size={16} />
                <span>Loading font...</span>
              </div>
            ) : (
              <div 
                className="gfp-preview-text"
                style={{ fontFamily: `"${selectedFont}", sans-serif` }}
              >
                {selectedWeights.map(w => (
                  <p key={w} style={{ fontWeight: w }}>
                    {FONT_WEIGHTS.find(fw => fw.value === w)?.label}: The quick brown fox jumps over the lazy dog
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="gfp-actions">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !selectedFont}>
          {saving ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Adding...
            </>
          ) : (
            'Add Font'
          )}
        </Button>
      </div>

      <style>{`
        .google-font-picker {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 16px);
        }

        .gfp-search {
          margin-bottom: var(--spacing-sm, 8px);
        }

        .gfp-font-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: var(--radius-md, 6px);
        }

        .gfp-font-option {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          border: none;
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          background: transparent;
          cursor: pointer;
          transition: background-color 0.15s;
          font-size: 16px;
        }

        .gfp-font-option:last-child {
          border-bottom: none;
        }

        .gfp-font-option:hover {
          background: var(--color-muted, #f1f5f9);
        }

        .gfp-font-option.selected {
          background: var(--color-primary-light, #dbeafe);
          color: var(--color-primary, #3b82f6);
        }

        .gfp-no-results {
          padding: 24px;
          text-align: center;
          color: var(--color-muted-foreground, #64748b);
        }

        .gfp-options {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 16px);
          padding: var(--spacing-md, 16px);
          background: var(--color-muted, #f8fafc);
          border-radius: var(--radius-md, 6px);
        }

        .gfp-option-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 4px);
        }

        .gfp-weights {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm, 8px);
        }

        .gfp-weight-option {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: var(--radius-sm, 4px);
          cursor: pointer;
          font-size: 13px;
          background: white;
          transition: background-color 0.15s, border-color 0.15s;
        }

        .gfp-weight-option:hover {
          background: var(--color-muted, #f1f5f9);
        }

        .gfp-preview {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 4px);
        }

        .gfp-preview-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
          color: var(--color-muted-foreground, #64748b);
        }

        .gfp-preview-text {
          padding: 16px;
          background: white;
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: var(--radius-md, 6px);
        }

        .gfp-preview-text p {
          margin: 0 0 8px;
          font-size: 16px;
          line-height: 1.5;
        }

        .gfp-preview-text p:last-child {
          margin-bottom: 0;
        }

        .gfp-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm, 8px);
          padding-top: var(--spacing-md, 16px);
          border-top: 1px solid var(--color-border, #e2e8f0);
        }
      `}</style>
    </div>
  );
}

