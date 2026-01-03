/**
 * @chunk 2.07 - ImportWizard Shell
 * 
 * Multi-step import wizard container with step navigation.
 * Manages wizard state and renders the appropriate step component.
 * 
 * Steps:
 * 1. Upload — Drop/select JSON file
 * 2. Map — Review and adjust category mappings
 * 3. Review — Final preview before import
 * 4. Complete — Success confirmation
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import StepIndicator from '../../ui/StepIndicator';
import UploadStep from './UploadStep';
import MappingStep from './MappingStep';
import ReviewStep from './ReviewStep';
import CompleteStep from './CompleteStep';

const STEPS = ['Upload', 'Map', 'Review', 'Complete'];

export default function ImportWizard() {
  const [searchParams] = useSearchParams();
  const existingThemeId = searchParams.get('themeId');
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    file: null,
    parsedTokens: [],
    warnings: [],
    errors: [],
    mappings: {},
    metadata: null,
    themeName: '',
    themeId: existingThemeId
  });

  /**
   * Update wizard data with partial updates
   */
  const updateWizardData = (updates) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  /**
   * Navigate to next step
   */
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  /**
   * Navigate to previous step
   */
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  /**
   * Cancel wizard and return to themes page
   */
  const cancel = () => {
    navigate('/themes');
  };

  /**
   * Render the current step component
   */
  const renderStep = () => {
    const stepProps = {
      data: wizardData,
      onUpdate: updateWizardData,
      onNext: nextStep,
      onBack: prevStep,
      onCancel: cancel
    };

    switch (currentStep) {
      case 0:
        return <UploadStep {...stepProps} />;
      case 1:
        return <MappingStep {...stepProps} />;
      case 2:
        return <ReviewStep {...stepProps} />;
      case 3:
        return <CompleteStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="import-wizard">
      <div className="wizard-header">
        <h1 className="wizard-title">
          {existingThemeId ? 'Import Tokens to Theme' : 'Import Theme'}
        </h1>
        <button 
          className="wizard-cancel-btn" 
          onClick={cancel}
          aria-label="Cancel import"
        >
          <X size={20} />
        </button>
      </div>

      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <div className="wizard-content">
        {renderStep()}
      </div>
    </div>
  );
}

