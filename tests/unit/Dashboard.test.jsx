/**
 * Dashboard Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../src/pages/Dashboard';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Palette: () => <span data-testid="icon-palette">Palette</span>,
  Box: () => <span data-testid="icon-box">Box</span>,
  Download: () => <span data-testid="icon-download">Download</span>,
  Activity: () => <span data-testid="icon-activity">Activity</span>,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Dashboard', () => {
  describe('Page Structure', () => {
    it('renders dashboard page with header', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('has correct page class', () => {
      const { container } = renderWithRouter(<Dashboard />);
      expect(container.querySelector('.dashboard-page')).toBeInTheDocument();
    });
  });

  describe('Stats Cards', () => {
    it('displays all 4 stat cards', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText('Themes')).toBeInTheDocument();
      expect(screen.getByText('Components')).toBeInTheDocument();
      expect(screen.getByText('Tokens')).toBeInTheDocument();
      expect(screen.getByText('Exports')).toBeInTheDocument();
    });

    it('shows zero values for stats (initial state)', () => {
      renderWithRouter(<Dashboard />);
      const statValues = screen.getAllByText('0');
      expect(statValues.length).toBe(4);
    });

    it('renders stat icons', () => {
      renderWithRouter(<Dashboard />);
      // Icons appear in both stat cards and action cards, so use getAllByTestId
      expect(screen.getAllByTestId('icon-palette').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('icon-box').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('icon-activity').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('icon-download')).toBeInTheDocument();
    });
  });

  describe('Quick Actions Section', () => {
    it('displays Quick Actions heading', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('displays all 3 action cards', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText('Create Theme')).toBeInTheDocument();
      expect(screen.getByText('Import from Figma')).toBeInTheDocument();
      expect(screen.getByText('Manage Components')).toBeInTheDocument();
    });

    it('displays action card descriptions', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText('Start a new design theme from scratch')).toBeInTheDocument();
      expect(screen.getByText('Sync components from your Figma files')).toBeInTheDocument();
      expect(screen.getByText('View and edit your component library')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('Create Theme links to /themes', () => {
      renderWithRouter(<Dashboard />);
      const createThemeCard = screen.getByText('Create Theme').closest('a');
      expect(createThemeCard).toHaveAttribute('href', '/themes');
    });

    it('Import from Figma links to /figma-import', () => {
      renderWithRouter(<Dashboard />);
      const importCard = screen.getByText('Import from Figma').closest('a');
      expect(importCard).toHaveAttribute('href', '/figma-import');
    });

    it('Manage Components links to /components', () => {
      renderWithRouter(<Dashboard />);
      const componentsCard = screen.getByText('Manage Components').closest('a');
      expect(componentsCard).toHaveAttribute('href', '/components');
    });
  });

  describe('Styling', () => {
    it('stat cards have proper structure', () => {
      const { container } = renderWithRouter(<Dashboard />);
      const statCards = container.querySelectorAll('.stat-card');
      expect(statCards.length).toBe(4);
      statCards.forEach(card => {
        expect(card.querySelector('.stat-icon')).toBeInTheDocument();
        expect(card.querySelector('.stat-content')).toBeInTheDocument();
      });
    });

    it('action cards have proper class', () => {
      const { container } = renderWithRouter(<Dashboard />);
      const actionCards = container.querySelectorAll('.action-card');
      expect(actionCards.length).toBe(3);
    });
  });
});
