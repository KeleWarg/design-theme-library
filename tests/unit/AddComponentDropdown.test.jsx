/**
 * @chunk 3.04 - AddComponentDropdown Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddComponentDropdown from '../../src/components/components/AddComponentDropdown';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}

describe('AddComponentDropdown', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the trigger button', () => {
    renderWithRouter(<AddComponentDropdown />);
    
    expect(screen.getByRole('button', { name: /add component/i })).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    renderWithRouter(<AddComponentDropdown />);
    
    const trigger = screen.getByRole('button', { name: /add component/i });
    fireEvent.click(trigger);
    
    // All three options should be visible
    expect(screen.getByText('Create Manually')).toBeInTheDocument();
    expect(screen.getByText('Generate with AI')).toBeInTheDocument();
    expect(screen.getByText('Extract from Figma')).toBeInTheDocument();
  });

  it('shows descriptions for all options', () => {
    renderWithRouter(<AddComponentDropdown />);
    
    const trigger = screen.getByRole('button', { name: /add component/i });
    fireEvent.click(trigger);
    
    expect(screen.getByText('Define props and code by hand')).toBeInTheDocument();
    expect(screen.getByText('Describe your component')).toBeInTheDocument();
    expect(screen.getByText('Import via Figma plugin')).toBeInTheDocument();
  });

  it('navigates to manual mode when "Create Manually" is clicked', () => {
    renderWithRouter(<AddComponentDropdown />);
    
    const trigger = screen.getByRole('button', { name: /add component/i });
    fireEvent.click(trigger);
    
    const manualOption = screen.getByText('Create Manually');
    fireEvent.click(manualOption);
    
    expect(mockNavigate).toHaveBeenCalledWith('/components/new?mode=manual');
  });

  it('navigates to AI mode when "Generate with AI" is clicked', () => {
    renderWithRouter(<AddComponentDropdown />);
    
    const trigger = screen.getByRole('button', { name: /add component/i });
    fireEvent.click(trigger);
    
    const aiOption = screen.getByText('Generate with AI');
    fireEvent.click(aiOption);
    
    expect(mockNavigate).toHaveBeenCalledWith('/components/new?mode=ai');
  });

  it('navigates to Figma mode when "Extract from Figma" is clicked', () => {
    renderWithRouter(<AddComponentDropdown />);
    
    const trigger = screen.getByRole('button', { name: /add component/i });
    fireEvent.click(trigger);
    
    const figmaOption = screen.getByText('Extract from Figma');
    fireEvent.click(figmaOption);
    
    expect(mockNavigate).toHaveBeenCalledWith('/components/new?mode=figma');
  });
});


