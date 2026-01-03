/**
 * @chunk 2.07 - ImportWizard Shell
 * 
 * Step progress indicator for multi-step wizards.
 * Shows completed, active, and upcoming steps with connectors.
 */

export default function StepIndicator({ steps, currentStep }) {
  const getStepClassName = (index) => {
    const classes = ['step'];
    
    if (index < currentStep) {
      classes.push('completed');
    } else if (index === currentStep) {
      classes.push('active');
    } else {
      classes.push('upcoming');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={step} className={getStepClassName(index)}>
          <div className="step-marker">
            {index < currentStep ? (
              <svg 
                className="step-check" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <span className="step-number">{index + 1}</span>
            )}
          </div>
          <div className="step-label">{step}</div>
          {index < steps.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  );
}

