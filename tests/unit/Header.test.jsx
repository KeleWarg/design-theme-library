/**
 * Header Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../src/components/layout/Header';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Layers: () => <span data-testid="icon-layers">Layers</span>,
  Menu: () => <span data-testid="icon-menu">Menu</span>,
  Download: () => <span data-testid="icon-download">Download</span>,
  Palette: () => <span data-testid="icon-palette">Palette</span>,
  ChevronDown: () => <span data-testid="icon-chevron">Chevron</span>,
  Check: () => <span data-testid="icon-check">Check</span>,
}));

// Mock ThemeSelector component
vi.mock('../../src/components/layout/ThemeSelector', () => ({
  default: () => <div data-testid="theme-selector">Theme Selector</div>,
}));

// Mock ExportModal component
vi.mock('../../src/components/export', () => ({
  ExportModal: ({ open, onClose }) => (
    open ? (
      <div data-testid="export-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
  ),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header', () => {
  const mockOnMenuToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Logo and Branding', () => {
    it('renders logo with Design System text', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      expect(screen.getByText('Design System')).toBeInTheDocument();
    });

    it('logo links to home page', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      const logoLink = screen.getByText('Design System').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders logo icon', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      expect(screen.getByTestId('icon-layers')).toBeInTheDocument();
    });
  });

  describe('Menu Toggle', () => {
    it('renders menu toggle button', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      expect(screen.getByRole('button', { name: /Toggle navigation menu/i })).toBeInTheDocument();
    });

    it('calls onMenuToggle when clicked', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      const menuButton = screen.getByRole('button', { name: /Toggle navigation menu/i });
      fireEvent.click(menuButton);
      expect(mockOnMenuToggle).toHaveBeenCalledTimes(1);
    });

    it('renders menu icon', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      expect(screen.getByTestId('icon-menu')).toBeInTheDocument();
    });
  });

  describe('Theme Selector', () => {
    it('renders ThemeSelector component', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      expect(screen.getByTestId('theme-selector')).toBeInTheDocument();
    });
  });

  describe('Export Button', () => {
    it('renders Export button', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });

    it('Export button has primary style', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      const exportButton = screen.getByRole('button', { name: /Export/i });
      expect(exportButton).toHaveClass('btn-primary');
    });
  });

  describe('Export Modal', () => {
    it('opens export modal when Export button clicked', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Export/i }));
      expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    });

    it('closes export modal when close is triggered', () => {
      renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      fireEvent.click(screen.getByRole('button', { name: /Export/i }));
      expect(screen.getByTestId('export-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Close Modal'));
      expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
    });
  });

  describe('Header Structure', () => {
    it('has header element with correct class', () => {
      const { container } = renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      expect(container.querySelector('header.header')).toBeInTheDocument();
    });

    it('has left section with logo and menu', () => {
      const { container } = renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      const leftSection = container.querySelector('.header-left');
      expect(leftSection).toBeInTheDocument();
      expect(leftSection.querySelector('.menu-toggle')).toBeInTheDocument();
      expect(leftSection.querySelector('.header-logo')).toBeInTheDocument();
    });

    it('has right section with theme selector and export', () => {
      const { container } = renderWithRouter(<Header onMenuToggle={mockOnMenuToggle} />);
      const rightSection = container.querySelector('.header-right');
      expect(rightSection).toBeInTheDocument();
    });
  });
});
