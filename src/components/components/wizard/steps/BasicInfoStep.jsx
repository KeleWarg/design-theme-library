/**
 * @chunk 3.06 - BasicInfoStep
 * 
 * First step of the component creation wizard.
 * Collects: Component name (required), description, and category.
 * 
 * Validation: Name is required and should be PascalCase.
 */

import { Input, Select, Textarea } from '../../../ui';
import { COMPONENT_CATEGORIES } from '../../../../lib/componentCategories';

const CATEGORIES = COMPONENT_CATEGORIES;

/**
 * Validate if name follows PascalCase convention
 */
function isPascalCase(str) {
  if (!str) return false;
  // PascalCase: starts with uppercase, contains only letters and numbers
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Get validation error for name field
 */
function getNameError(name) {
  if (!name || name.trim() === '') {
    return null; // Don't show error for empty (will be handled by required)
  }
  if (!isPascalCase(name)) {
    return 'Use PascalCase (e.g., PrimaryButton, UserCard)';
  }
  return null;
}

export default function BasicInfoStep({ data, onUpdate }) {
  const nameError = getNameError(data.name);

  const handleNameChange = (e) => {
    onUpdate({ name: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    onUpdate({ description: e.target.value });
  };

  const handleCategoryChange = (value) => {
    onUpdate({ category: value });
  };

  return (
    <div className="basic-info-step">
      <div className="basic-info-step-header">
        <h2 className="basic-info-step-title">Basic Information</h2>
        <p className="basic-info-step-description">
          Start by giving your component a name and description.
        </p>
      </div>

      <div className="basic-info-step-form">
        <div className="form-field-with-helper">
          <Input
            label="Component Name"
            value={data.name}
            onChange={handleNameChange}
            maxLength={50}
            placeholder="e.g., PrimaryButton"
            required
            error={nameError}
            autoFocus
          />
          <span className="form-helper-text">
            Use PascalCase for component names (e.g., PrimaryButton, UserCard)
          </span>
        </div>

        <Select
          label="Category"
          value={data.category}
          onChange={handleCategoryChange}
          options={CATEGORIES}
          placeholder="Select a category..."
        />

        <Textarea
          label="Description"
          value={data.description}
          onChange={handleDescriptionChange}
          maxLength={200}
          placeholder="Briefly describe this component's purpose and when to use it..."
          rows={3}
          showCount
        />
      </div>
    </div>
  );
}


