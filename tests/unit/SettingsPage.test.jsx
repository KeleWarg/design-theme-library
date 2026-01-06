/**
 * SettingsPage Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../../src/pages/SettingsPage';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock useThemes hook
vi.mock('../../src/hooks/useThemes', () => ({
  useThemes: vi.fn(() => ({
    data: [
      { id: 'theme-1', name: 'Light Theme' },
      { id: 'theme-2', name: 'Dark Theme' },
    ],
    isLoading: false,
  })),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Save: () => <span data-testid="icon-save" />,
  Key: () => <span data-testid="icon-key" />,
  Database: () => <span data-testid="icon-database" />,
  Palette: () => <span data-testid="icon-palette" />,
  Check: () => <span data-testid="icon-check" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
}));

import { toast } from 'sonner';

describe('SettingsPage', () => {
  let localStorageMock;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = {
      store: {},
      getItem: vi.fn((key) => localStorageMock.store[key] || null),
      setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
      removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
      clear: vi.fn(() => { localStorageMock.store = {}; }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('renders settings page with all sections', () => {
      render(<SettingsPage />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('API Keys')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
      expect(screen.getByText('Storage Information')).toBeInTheDocument();
    });

    it('renders all form inputs', () => {
      render(<SettingsPage />);
      expect(screen.getByLabelText('Figma Access Token')).toBeInTheDocument();
      expect(screen.getByLabelText('Claude API Key')).toBeInTheDocument();
      expect(screen.getByLabelText('Supabase URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Supabase Anon Key')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Theme')).toBeInTheDocument();
    });

    it('loads available themes in dropdown', () => {
      render(<SettingsPage />);
      const themeSelect = screen.getByLabelText('Default Theme');
      expect(themeSelect).toBeInTheDocument();
      expect(screen.getByText('Light Theme')).toBeInTheDocument();
      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    });
  });

  describe('Loading Settings from localStorage', () => {
    it('loads saved settings on mount', () => {
      localStorageMock.store = {
        'ds-admin-figma-token': 'test-figma-token',
        'ds-admin-claude-key': 'test-claude-key',
        'ds-admin-default-theme': 'theme-1',
      };
      render(<SettingsPage />);
      expect(screen.getByLabelText('Figma Access Token')).toHaveValue('test-figma-token');
      expect(screen.getByLabelText('Claude API Key')).toHaveValue('test-claude-key');
      expect(screen.getByLabelText('Default Theme')).toHaveValue('theme-1');
    });

    it('shows empty fields when no settings saved', () => {
      render(<SettingsPage />);
      expect(screen.getByLabelText('Figma Access Token')).toHaveValue('');
      expect(screen.getByLabelText('Claude API Key')).toHaveValue('');
    });
  });

  describe('Form State Management', () => {
    it('tracks changes and shows unsaved warning', () => {
      render(<SettingsPage />);
      expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();
      const figmaInput = screen.getByLabelText('Figma Access Token');
      fireEvent.change(figmaInput, { target: { value: 'new-token' } });
      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    });

    it('shows Discard button when changes exist', () => {
      render(<SettingsPage />);
      expect(screen.queryByText('Discard')).not.toBeInTheDocument();
      const figmaInput = screen.getByLabelText('Figma Access Token');
      fireEvent.change(figmaInput, { target: { value: 'new-token' } });
      expect(screen.getByText('Discard')).toBeInTheDocument();
    });

    it('enables Save button when changes exist', () => {
      render(<SettingsPage />);
      const saveButton = screen.getByRole('button', { name: /Saved/i });
      expect(saveButton).toBeDisabled();
      const figmaInput = screen.getByLabelText('Figma Access Token');
      fireEvent.change(figmaInput, { target: { value: 'new-token' } });
      const updatedSaveButton = screen.getByRole('button', { name: /Save Changes/i });
      expect(updatedSaveButton).not.toBeDisabled();
    });
  });

  describe('Save Settings', () => {
    it('saves settings to localStorage on save', async () => {
      render(<SettingsPage />);
      fireEvent.change(screen.getByLabelText('Figma Access Token'), { target: { value: 'my-figma-token' } });
      fireEvent.change(screen.getByLabelText('Claude API Key'), { target: { value: 'my-claude-key' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('ds-admin-figma-token', 'my-figma-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('ds-admin-claude-key', 'my-claude-key');
      });
    });

    it('shows success toast on save', async () => {
      render(<SettingsPage />);
      fireEvent.change(screen.getByLabelText('Figma Access Token'), { target: { value: 'new-token' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Settings saved successfully');
      });
    });
  });

  describe('Discard Changes', () => {
    it('reverts changes when Discard is clicked', () => {
      localStorageMock.store = { 'ds-admin-figma-token': 'original-token' };
      render(<SettingsPage />);
      expect(screen.getByLabelText('Figma Access Token')).toHaveValue('original-token');
      fireEvent.change(screen.getByLabelText('Figma Access Token'), { target: { value: 'new-token' } });
      expect(screen.getByLabelText('Figma Access Token')).toHaveValue('new-token');
      fireEvent.click(screen.getByText('Discard'));
      expect(screen.getByLabelText('Figma Access Token')).toHaveValue('original-token');
    });

    it('shows info toast when discarding', () => {
      render(<SettingsPage />);
      fireEvent.change(screen.getByLabelText('Figma Access Token'), { target: { value: 'new-token' } });
      fireEvent.click(screen.getByText('Discard'));
      expect(toast.info).toHaveBeenCalledWith('Changes discarded');
    });
  });

  describe('Clear All Settings', () => {
    it('clears all settings when confirmed', async () => {
      localStorageMock.store = { 'ds-admin-figma-token': 'test-token' };
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<SettingsPage />);
      fireEvent.click(screen.getByText('Clear All Settings'));
      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('All settings cleared');
      });
      window.confirm.mockRestore();
    });

    it('does not clear settings when cancelled', () => {
      localStorageMock.store = { 'ds-admin-figma-token': 'test-token' };
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      render(<SettingsPage />);
      fireEvent.click(screen.getByText('Clear All Settings'));
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      window.confirm.mockRestore();
    });
  });

  describe('Default Theme Selection', () => {
    it('saves default theme preference', async () => {
      render(<SettingsPage />);
      const themeSelect = screen.getByLabelText('Default Theme');
      fireEvent.change(themeSelect, { target: { value: 'theme-2' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('ds-admin-default-theme', 'theme-2');
      });
    });
  });
});
