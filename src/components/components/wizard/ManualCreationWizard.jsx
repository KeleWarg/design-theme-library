/**
 * @chunk 3.05 - ManualCreationWizard Shell
 * 
 * Multi-step wizard for manually creating components.
 * Steps: Basic Info → Define Props → Define Variants → Link Tokens
 * 
 * State is managed locally until final "Create Component" action.
 * Warns user on navigation away if there is unsaved data.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { componentService } from '../../../services/componentService';
import WizardProgress from './WizardProgress';
import WizardNavigation from './WizardNavigation';
import { BasicInfoStep, PropsStep, VariantsStep, TokenLinkingStep } from './steps';
import '../../../styles/component-wizard.css';

const STEPS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'props', label: 'Define Props' },
  { id: 'variants', label: 'Define Variants' },
  { id: 'tokens', label: 'Link Tokens' }
];

const INITIAL_COMPONENT_DATA = {
  name: '',
  description: '',
  category: 'other',
  props: [],
  variants: [],
  linked_tokens: [],
  code: ''
};

/**
 * Check if component data has been modified from initial state
 */
function hasUnsavedChanges(data) {
  return (
    data.name.trim() !== '' ||
    data.description.trim() !== '' ||
    data.category !== 'other' ||
    data.props.length > 0 ||
    data.variants.length > 0 ||
    data.linked_tokens.length > 0 ||
    data.code.trim() !== ''
  );
}

export default function ManualCreationWizard() {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [componentData, setComponentData] = useState(INITIAL_COMPONENT_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track unsaved changes for navigation warning
  const hasUnsavedData = hasUnsavedChanges(componentData);

  /**
   * Warn user when leaving page with unsaved data
   */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedData) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedData]);

  /**
   * Update component data with partial updates
   */
  const updateData = useCallback((updates) => {
    setComponentData(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Navigate to next step
   */
  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  /**
   * Navigate to previous step
   */
  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  /**
   * Cancel wizard and return to components list
   */
  const handleCancel = useCallback(() => {
    if (hasUnsavedData) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }
    navigate('/components');
  }, [navigate, hasUnsavedData]);

  /**
   * Create component on final step
   */
  const handleComplete = useCallback(async () => {
    if (!componentData.name.trim()) {
      toast.error('Component name is required');
      setCurrentStep(0);
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data - convert empty strings to null/undefined for optional fields
      const component = await componentService.createComponent({
        name: componentData.name.trim(),
        description: componentData.description?.trim() || null,
        category: componentData.category || 'other',
        props: componentData.props || [],
        variants: componentData.variants || [],
        linked_tokens: componentData.linked_tokens || [],
        code: componentData.code?.trim() || null,
        status: 'draft'
      });
      
      toast.success('Component created successfully');
      navigate(`/components/${component.id}`);
    } catch (error) {
      console.error('Failed to create component:', error);
      // Show detailed error message
      const errorMessage = error?.message || error?.details || 'Failed to create component';
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error(`Failed to create component: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [componentData, navigate]);

  /**
   * Check if user can proceed to next step
   */
  const canProceed = useCallback(() => {
    // Step 0 (Basic Info): Name is required
    if (currentStep === 0) {
      return componentData.name.trim().length > 0;
    }
    // Other steps are optional
    return true;
  }, [currentStep, componentData.name]);

  /**
   * Render the current step content
   * Placeholder components will be replaced by subsequent chunks (3.06-3.09)
   */
  const renderStep = () => {
    const stepProps = {
      data: componentData,
      onUpdate: updateData
    };

    switch (currentStep) {
      case 0:
        // BasicInfoStep - Chunk 3.06
        return <BasicInfoStep {...stepProps} />;
      case 1:
        // PropsStep - Chunk 3.07
        return <PropsStep {...stepProps} />;
      case 2:
        // VariantsStep - Chunk 3.08
        return <VariantsStep {...stepProps} />;
      case 3:
        // TokenLinkingStep - Chunk 3.09
        return <TokenLinkingStep {...stepProps} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="creation-wizard">
      <WizardProgress 
        steps={STEPS.map(s => s.label)} 
        currentStep={currentStep} 
      />

      <div className="wizard-content">
        {renderStep()}
      </div>

      <WizardNavigation
        onBack={handleBack}
        onNext={isLastStep ? handleComplete : handleNext}
        onCancel={handleCancel}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        canProceed={canProceed()}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}


