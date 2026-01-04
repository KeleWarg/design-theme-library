/**
 * @chunk 2.07 - ImportWizard Shell
 * 
 * Unit tests for ImportWizard and StepIndicator components.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import ImportWizard from '../../src/components/themes/import/ImportWizard';
import StepIndicator from '../../src/components/ui/StepIndicator';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: () => [new URLSearchParams()]
  };
});

const mockNavigate = vi.fn();

beforeEach(() => {
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  mockNavigate.mockClear();
});

/**
 * Helper to wrap components with Router
 */
function renderWithRouter(ui) {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
}

describe('StepIndicator', () => {
  const steps = ['Upload', 'Map', 'Review', 'Complete'];

  it('renders all steps', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    
    steps.forEach(step => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('highlights current step as active', () => {
    render(<StepIndicator steps={steps} currentStep={1} />);
    
    const stepElements = document.querySelectorAll('.step');
    expect(stepElements[1].classList.contains('active')).toBe(true);
  });

  it('marks previous steps as completed', () => {
    render(<StepIndicator steps={steps} currentStep={2} />);
    
    const stepElements = document.querySelectorAll('.step');
    expect(stepElements[0].classList.contains('completed')).toBe(true);
    expect(stepElements[1].classList.contains('completed')).toBe(true);
    expect(stepElements[2].classList.contains('active')).toBe(true);
    expect(stepElements[3].classList.contains('upcoming')).toBe(true);
  });

  it('marks future steps as upcoming', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    
    const stepElements = document.querySelectorAll('.step');
    expect(stepElements[0].classList.contains('active')).toBe(true);
    expect(stepElements[1].classList.contains('upcoming')).toBe(true);
    expect(stepElements[2].classList.contains('upcoming')).toBe(true);
    expect(stepElements[3].classList.contains('upcoming')).toBe(true);
  });

  it('shows checkmark for completed steps', () => {
    render(<StepIndicator steps={steps} currentStep={2} />);
    
    const checkmarks = document.querySelectorAll('.step-check');
    expect(checkmarks.length).toBe(2); // First two steps completed
  });

  it('shows step numbers for non-completed steps', () => {
    render(<StepIndicator steps={steps} currentStep={1} />);
    
    // Step 2, 3, 4 should show numbers
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});

describe('ImportWizard', () => {
  it('renders the wizard title', () => {
    renderWithRouter(<ImportWizard />);
    
    expect(screen.getByText('Import Theme')).toBeInTheDocument();
  });

  it('renders the step indicator', () => {
    renderWithRouter(<ImportWizard />);
    
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('starts at first step (Upload)', () => {
    renderWithRouter(<ImportWizard />);
    
    // First step should be active
    expect(screen.getByText('UploadStep')).toBeInTheDocument();
    
    const stepIndicator = document.querySelector('.step-indicator');
    const steps = stepIndicator.querySelectorAll('.step');
    expect(steps[0].classList.contains('active')).toBe(true);
  });

  it('nextStep advances to next step', () => {
    renderWithRouter(<ImportWizard />);
    
    // Should be on Upload step
    expect(screen.getByText('UploadStep')).toBeInTheDocument();
    
    // Click Next button
    fireEvent.click(screen.getByText('Next'));
    
    // Should now be on Map step
    expect(screen.getByText('MappingStep')).toBeInTheDocument();
  });

  it('prevStep goes back to previous step', () => {
    renderWithRouter(<ImportWizard />);
    
    // Advance to second step
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('MappingStep')).toBeInTheDocument();
    
    // Click Back button
    fireEvent.click(screen.getByText('Back'));
    
    // Should be back on Upload step
    expect(screen.getByText('UploadStep')).toBeInTheDocument();
  });

  it('cannot go past last step', () => {
    renderWithRouter(<ImportWizard />);
    
    // Advance to last step
    fireEvent.click(screen.getByText('Next')); // Step 2
    fireEvent.click(screen.getByText('Next')); // Step 3
    fireEvent.click(screen.getByText('Next')); // Step 4
    
    expect(screen.getByText('CompleteStep')).toBeInTheDocument();
    
    // Check we're on the complete step (no Next button, has Go to Themes)
    expect(screen.getByText('Go to Themes')).toBeInTheDocument();
  });

  it('cancel navigates back to themes page', () => {
    renderWithRouter(<ImportWizard />);
    
    // Click cancel button (X icon)
    const cancelButton = document.querySelector('.wizard-cancel-btn');
    fireEvent.click(cancelButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/themes');
  });

  it('renders cancel button in header', () => {
    renderWithRouter(<ImportWizard />);
    
    const cancelButton = document.querySelector('.wizard-cancel-btn');
    expect(cancelButton).toBeInTheDocument();
  });

  it('step content changes when navigating', () => {
    renderWithRouter(<ImportWizard />);
    
    const stepIndicator = document.querySelector('.step-indicator');
    
    // Step 1
    expect(screen.getByText('UploadStep')).toBeInTheDocument();
    let steps = stepIndicator.querySelectorAll('.step');
    expect(steps[0].classList.contains('active')).toBe(true);
    
    // Step 2
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('MappingStep')).toBeInTheDocument();
    steps = stepIndicator.querySelectorAll('.step');
    expect(steps[1].classList.contains('active')).toBe(true);
    
    // Step 3
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('ReviewStep')).toBeInTheDocument();
    steps = stepIndicator.querySelectorAll('.step');
    expect(steps[2].classList.contains('active')).toBe(true);
    
    // Step 4
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('CompleteStep')).toBeInTheDocument();
    steps = stepIndicator.querySelectorAll('.step');
    expect(steps[3].classList.contains('active')).toBe(true);
  });
});


