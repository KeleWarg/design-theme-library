/**
 * @chunk 3.10 - AIGenerationFlow
 * 
 * Prompt input component for describing the component to generate.
 * Includes description textarea, category selector, and optional token linking.
 */

import { Textarea, Select } from '../../ui';
import { Sparkles, Info } from 'lucide-react';
import { COMPONENT_CATEGORIES } from '../../../lib/componentCategories';

const CATEGORY_OPTIONS = COMPONENT_CATEGORIES;

const PROMPT_SUGGESTIONS = [
  'A primary button with hover and active states, supporting an optional icon on the left',
  'An input field with label, error state, and helper text',
  'A card component with image, title, description, and action buttons',
  'A modal dialog with header, content area, and footer actions',
  'A dropdown menu with icons and keyboard navigation'
];

/**
 * Prompt input component for AI generation
 * @param {Object} props
 * @param {string} props.description - Component description
 * @param {Function} props.onDescriptionChange - Description change handler
 * @param {string} props.category - Selected category
 * @param {Function} props.onCategoryChange - Category change handler
 */
export default function PromptInput({
  description,
  onDescriptionChange,
  category,
  onCategoryChange
}) {
  const handleSuggestionClick = (suggestion) => {
    onDescriptionChange(suggestion);
  };

  return (
    <div className="prompt-input">
      <div className="prompt-input-header">
        <div className="prompt-input-icon">
          <Sparkles size={24} />
        </div>
        <div className="prompt-input-title">
          <h2>Describe Your Component</h2>
          <p>Tell the AI what component you want to create. Be specific about states, variants, and behavior.</p>
        </div>
      </div>

      <div className="prompt-input-form">
        <Textarea
          label="Component Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="e.g., A primary button with hover and active states, supporting an optional icon on the left. Should have variants for different sizes (small, medium, large) and a loading state."
          rows={5}
          maxLength={2000}
          showCount
        />

        <Select
          label="Category"
          value={category}
          onChange={onCategoryChange}
          options={CATEGORY_OPTIONS}
          placeholder="Select a category..."
        />
      </div>

      <div className="prompt-suggestions">
        <div className="prompt-suggestions-header">
          <Info size={14} />
          <span>Example prompts</span>
        </div>
        <div className="prompt-suggestions-list">
          {PROMPT_SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="prompt-suggestion-chip"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.length > 60 ? `${suggestion.slice(0, 60)}...` : suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


