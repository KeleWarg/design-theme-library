/**
 * ThemeSelector Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ThemeSelector from '../../src/components/layout/ThemeSelector';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Palette: ({ className }) => <span data-testid="icon-palette" className={className}>Palette</span>,
  ChevronDown: ({ className }) => <span data-testid="icon-chevron" className={className}>Chevron</span>,
  Check: ({ className }) => <span data-testid="icon-check" className={className}>Check</span>,
}));

// Mock ThemeContext
const mockSetActiveTheme = vi.fn();
const mockUseThemeContext = vi.fn();
vi.mock('../../src/contexts/ThemeContext', () => ({
  useThemeContext: () => mockUseThemeContext(),
}));

// Mock useThemes hook
const mockUseThemes = vi.fn();
vi.mock('../../src/hooks/useThemes', () => ({
  useThemes: () => mockUseThemes(),
}));

// Mock Popover component
vi.mock('../../src/components/ui/Popover', () => ({
  Popover: ({ children }) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children, className }) => <div data-testid="popover-content" className={className}>{children}</div>,
}));

// Mock cn utility
vi.mock('../../src/lib/utils', () => ({
  cn: (...classes) => classes.filter(c => c && typeof c === 'string').join(' '),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const defaultThemes = [
  {
    id: 'theme-1',
    name: 'Light Theme',
    status: 'published',
    is_default: true,
    tokens: [
      { category: 'color', value: { hex: '#ffffff' } },
      { category: 'color', value: { hex: '#3b82f6' } },
    ]
  },
  {
    id: 'theme-2',
    name: 'Dark Theme',
    status: 'published',
    tokens: [{ category: 'color', value: '#1a1a1a' }]
  },
  {
    id: 'theme-3',
    name: 'Draft Theme',
    status: 'draft',
    tokens: []
  },
];

describe('ThemeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetActiveTheme.mockResolvedValue(undefined);

    // Default mock values
    mockUseThemeContext.mockReturnValue({
      activeTheme: { id: 'theme-1', name: 'Light Theme' },
      setActiveTheme: mockSetActiveTheme,
      isLoading: false,
    });

    mockUseThemes.mockReturnValue({
      data: defaultThemes,
      isLoading: false,
    });
  });

  describe('Trigger Button', () => {
    it('renders trigger button with current theme name', () => {
      renderWithRouter(<ThemeSelector />);
      // Use getAllByText since name appears in trigger and list
      const elements = screen.getAllByText('Light Theme');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows "Select Theme" when no active theme', () => {
      mockUseThemeContext.mockReturnValue({
        activeTheme: null,
        setActiveTheme: mockSetActiveTheme,
        isLoading: false,
      });
      renderWithRouter(<ThemeSelector />);
      expect(screen.getByText('Select Theme')).toBeInTheDocument();
    });

    it('renders palette icon', () => {
      renderWithRouter(<ThemeSelector />);
      expect(screen.getByTestId('icon-palette')).toBeInTheDocument();
    });

    it('renders chevron icon', () => {
      renderWithRouter(<ThemeSelector />);
      expect(screen.getByTestId('icon-chevron')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows skeleton when context is loading', () => {
      mockUseThemeContext.mockReturnValue({
        activeTheme: null,
        setActiveTheme: mockSetActiveTheme,
        isLoading: true,
      });
      const { container } = renderWithRouter(<ThemeSelector />);
      expect(container.querySelector('.theme-selector-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when themes are loading', () => {
      mockUseThemes.mockReturnValue({ data: [], isLoading: true });
      const { container } = renderWithRouter(<ThemeSelector />);
      expect(container.querySelector('.theme-selector-skeleton')).toBeInTheDocument();
    });
  });

  describe('Theme List', () => {
    it('displays published themes', () => {
      renderWithRouter(<ThemeSelector />);
      // Use getAllByText for theme names that appear multiple times
      expect(screen.getAllByText('Light Theme').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    });

    it('hides draft themes (unless active)', () => {
      renderWithRouter(<ThemeSelector />);
      expect(screen.queryByText('Draft Theme')).not.toBeInTheDocument();
    });

    it('shows draft theme if it is the active theme', () => {
      mockUseThemeContext.mockReturnValue({
        activeTheme: { id: 'theme-3', name: 'Draft Theme' },
        setActiveTheme: mockSetActiveTheme,
        isLoading: false,
      });
      renderWithRouter(<ThemeSelector />);
      // Draft theme should appear (at least in trigger)
      expect(screen.getAllByText('Draft Theme').length).toBeGreaterThanOrEqual(1);
    });

    it('shows Default badge for default theme', () => {
      renderWithRouter(<ThemeSelector />);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('shows check icon for active theme', () => {
      renderWithRouter(<ThemeSelector />);
      expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    });
  });

  describe('Theme Selection', () => {
    it('calls setActiveTheme when theme option is clicked', async () => {
      renderWithRouter(<ThemeSelector />);
      const darkThemeOption = screen.getByText('Dark Theme').closest('button');
      fireEvent.click(darkThemeOption);
      await waitFor(() => {
        expect(mockSetActiveTheme).toHaveBeenCalledWith('theme-2');
      });
    });
  });

  describe('Color Preview', () => {
    it('displays mini swatches for theme colors', () => {
      const { container } = renderWithRouter(<ThemeSelector />);
      const swatches = container.querySelectorAll('.mini-swatch');
      expect(swatches.length).toBeGreaterThan(0);
    });

    it('shows empty swatch when theme has no colors', () => {
      mockUseThemes.mockReturnValue({
        data: [{ id: 'theme-1', name: 'Empty Theme', status: 'published', tokens: [] }],
        isLoading: false,
      });
      const { container } = renderWithRouter(<ThemeSelector />);
      expect(container.querySelector('.mini-swatch.empty')).toBeInTheDocument();
    });
  });

  describe('Manage Themes Link', () => {
    it('displays Manage Themes link', () => {
      renderWithRouter(<ThemeSelector />);
      expect(screen.getByText('Manage Themes')).toBeInTheDocument();
    });

    it('Manage Themes links to /themes', () => {
      renderWithRouter(<ThemeSelector />);
      const manageLink = screen.getByText('Manage Themes');
      expect(manageLink.closest('a')).toHaveAttribute('href', '/themes');
    });
  });

  describe('Empty State', () => {
    it('shows "No themes available" when no themes exist', () => {
      mockUseThemeContext.mockReturnValue({
        activeTheme: null,
        setActiveTheme: mockSetActiveTheme,
        isLoading: false,
      });
      mockUseThemes.mockReturnValue({ data: [], isLoading: false });
      renderWithRouter(<ThemeSelector />);
      expect(screen.getByText('No themes available')).toBeInTheDocument();
    });
  });
});
