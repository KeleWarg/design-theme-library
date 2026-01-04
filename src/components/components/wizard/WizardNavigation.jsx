/**
 * @chunk 3.05 - ManualCreationWizard Shell
 * 
 * Navigation footer for wizard with Back, Next/Create, and Cancel buttons.
 * Handles disabled states and loading for form submission.
 */

import { ArrowLeft, ArrowRight, X, Loader2 } from 'lucide-react';
import Button from '../../ui/Button';

/**
 * WizardNavigation - Footer navigation for wizard
 * @param {Object} props
 * @param {Function} props.onBack - Handler for back button
 * @param {Function} props.onNext - Handler for next/complete button
 * @param {Function} props.onCancel - Handler for cancel button
 * @param {boolean} props.isFirstStep - Is this the first step?
 * @param {boolean} props.isLastStep - Is this the last step?
 * @param {boolean} props.canProceed - Can user proceed to next step?
 * @param {boolean} props.isSubmitting - Is form being submitted?
 */
export default function WizardNavigation({
  onBack,
  onNext,
  onCancel,
  isFirstStep = false,
  isLastStep = false,
  canProceed = true,
  isSubmitting = false
}) {
  return (
    <div className="wizard-navigation">
      <div className="wizard-navigation-left">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="wizard-cancel-btn"
        >
          <X size={16} />
          Cancel
        </Button>
      </div>

      <div className="wizard-navigation-right">
        {/* Back button - hidden on first step */}
        {!isFirstStep && (
          <Button 
            variant="secondary" 
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        )}

        {/* Next/Create button */}
        <Button 
          variant="primary"
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="btn-spinner" />
              Creating...
            </>
          ) : isLastStep ? (
            'Create Component'
          ) : (
            <>
              Next
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


