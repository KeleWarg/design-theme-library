/**
 * @chunk 3.05 - ManualCreationWizard Shell
 * 
 * Visual step progress indicator for the component creation wizard.
 * Shows completed, active, and upcoming steps with connecting lines.
 */

import { Check } from 'lucide-react';

/**
 * WizardProgress - Shows multi-step progress
 * @param {Object} props
 * @param {string[]} props.steps - Array of step labels
 * @param {number} props.currentStep - Zero-based current step index
 */
export default function WizardProgress({ steps, currentStep }) {
  const getStepState = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'upcoming';
  };

  return (
    <div className="wizard-progress">
      <div className="wizard-progress-track">
        {steps.map((step, index) => {
          const state = getStepState(index);
          const isLast = index === steps.length - 1;

          return (
            <div 
              key={step} 
              className={`wizard-progress-step wizard-progress-step--${state}`}
            >
              {/* Step marker (number or checkmark) */}
              <div className="wizard-progress-marker">
                {state === 'completed' ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span className="wizard-progress-number">{index + 1}</span>
                )}
              </div>

              {/* Step label */}
              <span className="wizard-progress-label">{step}</span>

              {/* Connector line (except for last step) */}
              {!isLast && (
                <div 
                  className={`wizard-progress-connector ${
                    state === 'completed' ? 'wizard-progress-connector--completed' : ''
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


