# Chunk 3.05 — ManualCreationWizard Shell

## Purpose
Multi-step wizard for manually creating components.

---

## Inputs
- Route /components/new?mode=manual

## Outputs
- Wizard container with step navigation

---

## Dependencies
- Chunk 3.04 must be complete

---

## Implementation Notes

### Wizard Steps
1. Basic Info — Name, description, category
2. Define Props — Add prop definitions
3. Define Variants — Create variant combinations
4. Link Tokens — Associate design tokens

```jsx
// src/components/components/create/ManualCreationWizard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentService } from '../../../services/componentService';
import { StepIndicator, Button } from '../../ui';
import BasicInfoStep from './BasicInfoStep';
import PropsStep from './PropsStep';
import VariantsStep from './VariantsStep';
import TokenLinkingStep from './TokenLinkingStep';
import { toast } from 'sonner';

const STEPS = ['Basic Info', 'Define Props', 'Define Variants', 'Link Tokens'];

export default function ManualCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [componentData, setComponentData] = useState({
    name: '',
    description: '',
    category: 'other',
    props: [],
    variants: [],
    linked_tokens: [],
    code: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateData = (updates) => {
    setComponentData(prev => ({ ...prev, ...updates }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const component = await componentService.createComponent(componentData);
      toast.success('Component created');
      navigate(`/components/${component.id}`);
    } catch (error) {
      toast.error('Failed to create component');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const props = { data: componentData, onUpdate: updateData };
    switch (currentStep) {
      case 0: return <BasicInfoStep {...props} />;
      case 1: return <PropsStep {...props} />;
      case 2: return <VariantsStep {...props} />;
      case 3: return <TokenLinkingStep {...props} />;
      default: return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return componentData.name.trim().length > 0;
    return true;
  };

  return (
    <div className="creation-wizard">
      <div className="wizard-header">
        <h1>Create Component</h1>
        <Button variant="ghost" onClick={() => navigate('/components')}>
          Cancel
        </Button>
      </div>

      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <div className="wizard-content">
        {renderStep()}
      </div>

      <div className="wizard-footer">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentStep(s => s - 1)}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        
        {currentStep < STEPS.length - 1 ? (
          <Button 
            onClick={() => setCurrentStep(s => s + 1)}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleComplete} loading={isSubmitting}>
            Create Component
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/components/create/ManualCreationWizard.jsx` — Wizard shell
- `src/pages/CreateComponentPage.jsx` — Page wrapper

---

## Tests

### Unit Tests
- [ ] Step navigation works
- [ ] Data persists across steps
- [ ] Complete creates component
- [ ] Cancel returns to components list

---

## Time Estimate
2 hours
