# Chunk 2.07 — ImportWizard Shell

## Purpose
Create the multi-step import wizard container with step navigation.

---

## Inputs
- ThemesPage/CreateThemeModal (from chunk 2.01, 2.03)
- Route /themes/import

## Outputs
- ImportWizard container (consumed by chunk 2.08-2.11)
- Step state management

---

## Dependencies
- Chunk 2.01 must be complete

---

## Implementation Notes

### Wizard Steps
1. **Upload** — Drop/select JSON file
2. **Map** — Review and adjust category mappings
3. **Review** — Final preview before import
4. **Complete** — Success confirmation

### Component Structure

```jsx
// src/components/themes/import/ImportWizard.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StepIndicator from '../../ui/StepIndicator';
import UploadStep from './UploadStep';
import MappingStep from './MappingStep';
import ReviewStep from './ReviewStep';
import CompleteStep from './CompleteStep';

const STEPS = ['Upload', 'Map', 'Review', 'Complete'];

export default function ImportWizard() {
  const [searchParams] = useSearchParams();
  const existingThemeId = searchParams.get('themeId');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    file: null,
    parsedTokens: [],
    warnings: [],
    mappings: {},
    themeName: '',
    themeId: existingThemeId
  });
  const navigate = useNavigate();

  const updateWizardData = (updates) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const cancel = () => navigate('/themes');

  const renderStep = () => {
    const props = { data: wizardData, onUpdate: updateWizardData };
    
    switch (currentStep) {
      case 0: return <UploadStep {...props} onNext={nextStep} />;
      case 1: return <MappingStep {...props} onNext={nextStep} onBack={prevStep} />;
      case 2: return <ReviewStep {...props} onNext={nextStep} onBack={prevStep} />;
      case 3: return <CompleteStep {...props} />;
      default: return null;
    }
  };

  return (
    <div className="import-wizard">
      <div className="wizard-header">
        <h1>Import Theme</h1>
        <button className="cancel-btn" onClick={cancel}>Cancel</button>
      </div>

      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <div className="wizard-content">
        {renderStep()}
      </div>
    </div>
  );
}
```

### StepIndicator Component
```jsx
// src/components/ui/StepIndicator.jsx
export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div 
          key={step}
          className={cn('step', {
            completed: index < currentStep,
            active: index === currentStep,
            upcoming: index > currentStep
          })}
        >
          <div className="step-number">{index + 1}</div>
          <div className="step-label">{step}</div>
          {index < steps.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/import/ImportWizard.jsx` — Wizard container
- `src/components/ui/StepIndicator.jsx` — Step progress indicator
- `src/pages/ImportWizardPage.jsx` — Page wrapper
- `src/styles/import-wizard.css` — Wizard styles

---

## Tests

### Unit Tests
- [ ] Renders correct step based on currentStep
- [ ] Step indicator highlights current step
- [ ] nextStep increments step
- [ ] prevStep decrements step
- [ ] Cancel navigates back to themes
- [ ] wizardData updates propagate to children

---

## Time Estimate
2 hours

---

## Notes
The wizard maintains all state in the parent component and passes it down to steps. This allows going back and forth between steps without losing data.
