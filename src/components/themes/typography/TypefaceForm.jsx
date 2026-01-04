/**
 * @chunk 2.22 - TypefaceForm
 * 
 * Form modal for adding/editing typefaces with source selection.
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { typefaceService } from '../../../services/typefaceService';
import { 
  SYSTEM_FONTS, 
  getSuggestedFallback, 
  getAvailableWeights,
  loadGoogleFont 
} from '../../../lib/googleFonts';
import Modal from '../../ui/Modal';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import GoogleFontSearch from './GoogleFontSearch';
import WeightSelector from './WeightSelector';

// Fallback options
const FALLBACK_OPTIONS = [
  { value: 'sans-serif', label: 'sans-serif' },
  { value: 'serif', label: 'serif' },
  { value: 'monospace', label: 'monospace' },
  { value: 'cursive', label: 'cursive' },
  { value: 'system-ui', label: 'system-ui' },
];

// Source type options
const SOURCE_OPTIONS = [
  { value: 'google', label: 'Google Fonts' },
  { value: 'adobe', label: 'Adobe Fonts' },
  { value: 'system', label: 'System Font' },
  { value: 'custom', label: 'Custom (Upload)' },
];

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * TypefaceForm component
 * @param {Object} props
 * @param {Object|null} props.typeface - Existing typeface to edit (null for create)
 * @param {string} props.themeId - Theme UUID
 * @param {Array<string>} props.availableRoles - Available roles to choose from
 * @param {function} props.onClose - Close callback
 * @param {function} props.onSave - Save success callback
 */
export default function TypefaceForm({ typeface, themeId, availableRoles, onClose, onSave }) {
  const isEditing = !!typeface?.id;
  
  const [formData, setFormData] = useState({
    role: typeface?.role || availableRoles[0] || '',
    family: typeface?.family || '',
    fallback: typeface?.fallback || getSuggestedFallback(typeface?.role || availableRoles[0]),
    source_type: typeface?.source_type || 'google',
    weights: typeface?.weights || [400],
    is_variable: typeface?.is_variable || false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableWeights, setAvailableWeights] = useState(null);

  // Update fallback suggestion when role changes (only for new typefaces)
  useEffect(() => {
    if (!isEditing && formData.role) {
      setFormData(prev => ({
        ...prev,
        fallback: getSuggestedFallback(formData.role)
      }));
    }
  }, [formData.role, isEditing]);

  // Update available weights when source/family changes
  useEffect(() => {
    if (formData.source_type === 'google' && formData.family) {
      const weights = getAvailableWeights(formData.family);
      setAvailableWeights(weights);
      
      // Validate selected weights
      if (weights) {
        const validWeights = formData.weights.filter(w => weights.includes(w));
        if (validWeights.length === 0) {
          setFormData(prev => ({ ...prev, weights: [weights.includes(400) ? 400 : weights[0]] }));
        } else if (validWeights.length !== formData.weights.length) {
          setFormData(prev => ({ ...prev, weights: validWeights }));
        }
      }
    } else {
      setAvailableWeights(null);
    }
  }, [formData.source_type, formData.family]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle source type change
  const handleSourceChange = (source_type) => {
    setFormData(prev => ({
      ...prev,
      source_type,
      family: '',
      weights: [400],
    }));
    setAvailableWeights(null);
  };

  // Handle Google Font selection
  const handleGoogleFontSelect = (family, weights) => {
    setFormData(prev => ({
      ...prev,
      family,
      weights: weights?.length > 0 ? [weights.includes(400) ? 400 : weights[0]] : [400],
    }));
  };

  // Handle system font selection
  const handleSystemFontSelect = (family) => {
    const font = SYSTEM_FONTS.find(f => f.family === family);
    setFormData(prev => ({
      ...prev,
      family,
      fallback: font?.category || prev.fallback,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.family.trim()) {
      toast.error('Please enter a font family name');
      return;
    }
    
    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For Google Fonts, load the font to verify it works
      if (formData.source_type === 'google') {
        try {
          await loadGoogleFont(formData.family, formData.weights);
        } catch (err) {
          console.warn('Could not preload font:', err);
        }
      }
      
      if (isEditing) {
        await typefaceService.updateTypeface(typeface.id, {
          family: formData.family,
          fallback: formData.fallback,
          source_type: formData.source_type,
          weights: formData.weights,
          is_variable: formData.is_variable,
        });
        toast.success('Typeface updated');
      } else {
        await typefaceService.createTypeface(themeId, formData);
        toast.success('Typeface added');
      }
      
      onSave();
    } catch (error) {
      console.error('Failed to save typeface:', error);
      toast.error('Failed to save typeface');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render source-specific fields
  const renderSourceFields = () => {
    switch (formData.source_type) {
      case 'google':
        return (
          <GoogleFontSearch
            value={formData.family}
            onChange={handleGoogleFontSelect}
            disabled={isSubmitting}
          />
        );
      
      case 'system':
        return (
          <Select
            label="Font Family"
            value={formData.family}
            onChange={handleSystemFontSelect}
            options={SYSTEM_FONTS.map(f => ({ 
              value: f.family, 
              label: f.family 
            }))}
            placeholder="Select system font..."
            disabled={isSubmitting}
          />
        );
      
      case 'adobe':
        return (
          <>
            <Input
              label="Font Family"
              value={formData.family}
              onChange={(e) => handleChange('family', e.target.value)}
              placeholder="Adobe font family name"
              disabled={isSubmitting}
              required
            />
            <p className="form-hint">
              Enter the font family name from Adobe Fonts. Make sure the font is 
              activated in your Adobe Creative Cloud account.
            </p>
          </>
        );
      
      case 'custom':
        return (
          <>
            <Input
              label="Font Family"
              value={formData.family}
              onChange={(e) => handleChange('family', e.target.value)}
              placeholder="Custom font family name"
              disabled={isSubmitting}
              required
            />
            <p className="form-hint">
              Enter the font family name. You'll be able to upload font files 
              after creating the typeface.
            </p>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal 
      open 
      onClose={onClose} 
      title={isEditing ? 'Edit Typeface' : 'Add Typeface'}
      size="default"
    >
      <form onSubmit={handleSubmit} className="typeface-form">
        {/* Role Selection */}
        <Select
          label="Role"
          value={formData.role}
          onChange={(role) => handleChange('role', role)}
          options={availableRoles.map(r => ({ value: r, label: capitalize(r) }))}
          disabled={isEditing || isSubmitting}
          required
        />
        
        {/* Source Type */}
        <Select
          label="Source"
          value={formData.source_type}
          onChange={handleSourceChange}
          options={SOURCE_OPTIONS}
          disabled={isSubmitting}
        />
        
        {/* Source-specific fields */}
        {renderSourceFields()}
        
        {/* Fallback Stack */}
        <Select
          label="Fallback Stack"
          value={formData.fallback}
          onChange={(fallback) => handleChange('fallback', fallback)}
          options={FALLBACK_OPTIONS}
          disabled={isSubmitting}
        />
        
        {/* Weight Selector */}
        <WeightSelector
          selected={formData.weights}
          available={availableWeights}
          onChange={(weights) => handleChange('weights', weights)}
          disabled={isSubmitting}
        />
        
        {/* Variable Font Toggle */}
        <div className="form-field">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={formData.is_variable}
              onChange={(e) => handleChange('is_variable', e.target.checked)}
              disabled={isSubmitting}
            />
            <span className="form-checkbox-label">Variable font</span>
          </label>
          <p className="form-hint">
            Enable if this is a variable font with adjustable weight axis.
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="modal-footer">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={!formData.family.trim() || !formData.role}
          >
            {isEditing ? 'Save Changes' : 'Add Typeface'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


