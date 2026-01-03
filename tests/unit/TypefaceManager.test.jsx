/**
 * @chunk 2.21 - TypefaceManager Tests
 * 
 * Unit tests for TypefaceManager and TypefaceCard components.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock Supabase client before importing services
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/font.woff2' } }),
      })),
    },
  },
}));

// Mock the typefaceService
vi.mock('../../src/services/typefaceService', () => ({
  typefaceService: {
    getTypefacesByTheme: vi.fn(),
    getTypeface: vi.fn(),
    createTypeface: vi.fn(),
    updateTypeface: vi.fn(),
    deleteTypeface: vi.fn(),
  },
}));

import TypefaceManager from '../../src/components/themes/typography/TypefaceManager';
import TypefaceCard from '../../src/components/themes/typography/TypefaceCard';
import { typefaceService } from '../../src/services/typefaceService';

describe('TypefaceCard', () => {
  const mockTypeface = {
    id: 'tf-1',
    role: 'display',
    family: 'Inter',
    fallback: 'sans-serif',
    source_type: 'google',
    weights: [400, 500, 700],
    is_variable: false,
    font_files: [
      { id: 'ff-1', storage_path: 'fonts/inter-400.woff2' }
    ]
  };

  it('shows all 4 role slots', () => {
    const roles = ['display', 'text', 'mono', 'accent'];
    
    roles.forEach(role => {
      const { container } = render(
        <TypefaceCard
          role={role}
          typeface={null}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );
      
      // Each role should have its label displayed
      const roleLabels = {
        display: 'Display',
        text: 'Text',
        mono: 'Mono',
        accent: 'Accent'
      };
      
      expect(screen.getByText(roleLabels[role])).toBeInTheDocument();
      container.remove();
    });
  });

  it('shows assigned typeface details', () => {
    render(
      <TypefaceCard
        role="display"
        typeface={mockTypeface}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Font family appears in both preview and details, so use getAllByText
    const interElements = screen.getAllByText('Inter');
    expect(interElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Google Fonts/)).toBeInTheDocument();
    expect(screen.getByText(/400, 500, 700/)).toBeInTheDocument();
  });

  it('shows empty state for unassigned roles', () => {
    render(
      <TypefaceCard
        role="display"
        typeface={null}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/Assign Display Font/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Assign Display typeface/ })).toBeInTheDocument();
  });

  it('edit button calls onEdit', () => {
    const onEdit = vi.fn();
    render(
      <TypefaceCard
        role="display"
        typeface={mockTypeface}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Edit typeface/ }));
    expect(onEdit).toHaveBeenCalled();
  });

  it('delete button calls onDelete', () => {
    const onDelete = vi.fn();
    render(
      <TypefaceCard
        role="display"
        typeface={mockTypeface}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Remove typeface/ }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('clicking empty state calls onEdit', () => {
    const onEdit = vi.fn();
    render(
      <TypefaceCard
        role="display"
        typeface={null}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Assign Display typeface/ }));
    expect(onEdit).toHaveBeenCalled();
  });

  it('shows font file count in footer', () => {
    render(
      <TypefaceCard
        role="display"
        typeface={mockTypeface}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/1 font file/)).toBeInTheDocument();
  });

  it('shows variable font indicator', () => {
    const variableTypeface = { ...mockTypeface, is_variable: true };
    render(
      <TypefaceCard
        role="display"
        typeface={variableTypeface}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/Variable/)).toBeInTheDocument();
  });
});

describe('TypefaceManager', () => {
  const mockTypefaces = [
    {
      id: 'tf-1',
      role: 'display',
      family: 'Playfair Display',
      fallback: 'serif',
      source_type: 'google',
      weights: [400, 700],
      is_variable: false,
      font_files: []
    },
    {
      id: 'tf-2',
      role: 'text',
      family: 'Inter',
      fallback: 'sans-serif',
      source_type: 'google',
      weights: [400, 500, 600],
      is_variable: false,
      font_files: []
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    typefaceService.getTypefacesByTheme.mockResolvedValue(mockTypefaces);
    typefaceService.deleteTypeface.mockResolvedValue(true);
  });

  it('shows all 4 role slots', async () => {
    render(<TypefaceManager themeId="theme-1" />);

    await waitFor(() => {
      expect(screen.getByText('Display')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText('Mono')).toBeInTheDocument();
      expect(screen.getByText('Accent')).toBeInTheDocument();
    });
  });

  it('shows assigned typefaces', async () => {
    render(<TypefaceManager themeId="theme-1" />);

    await waitFor(() => {
      // Font family appears in both preview and details, so use getAllByText
      const playfairElements = screen.getAllByText('Playfair Display');
      expect(playfairElements.length).toBeGreaterThanOrEqual(1);
      const interElements = screen.getAllByText('Inter');
      expect(interElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows empty state for unassigned roles', async () => {
    render(<TypefaceManager themeId="theme-1" />);

    await waitFor(() => {
      // Mono and Accent are not assigned in mockTypefaces
      expect(screen.getByText(/Assign Mono Font/)).toBeInTheDocument();
      expect(screen.getByText(/Assign Accent Font/)).toBeInTheDocument();
    });
  });

  it('edit opens modal', async () => {
    render(<TypefaceManager themeId="theme-1" />);

    await waitFor(() => {
      const playfairElements = screen.getAllByText('Playfair Display');
      expect(playfairElements.length).toBeGreaterThanOrEqual(1);
    });

    // Click edit button on the first typeface
    const editButtons = screen.getAllByRole('button', { name: /Edit typeface/ });
    fireEvent.click(editButtons[0]);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText('Edit Typeface')).toBeInTheDocument();
    });
  });

  it('delete removes typeface with confirmation', async () => {
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<TypefaceManager themeId="theme-1" />);

    await waitFor(() => {
      const playfairElements = screen.getAllByText('Playfair Display');
      expect(playfairElements.length).toBeGreaterThanOrEqual(1);
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /Remove typeface/ });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(typefaceService.deleteTypeface).toHaveBeenCalledWith('tf-1');
    });

    window.confirm.mockRestore();
  });

  it('delete is cancelled if user declines confirmation', async () => {
    // Mock window.confirm to return false
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<TypefaceManager themeId="theme-1" />);

    await waitFor(() => {
      const playfairElements = screen.getAllByText('Playfair Display');
      expect(playfairElements.length).toBeGreaterThanOrEqual(1);
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /Remove typeface/ });
    fireEvent.click(deleteButtons[0]);

    expect(typefaceService.deleteTypeface).not.toHaveBeenCalled();

    window.confirm.mockRestore();
  });

  it('shows loading state', () => {
    typefaceService.getTypefacesByTheme.mockImplementation(() => new Promise(() => {}));
    
    render(<TypefaceManager themeId="theme-1" />);

    expect(screen.getByText('Loading typefaces...')).toBeInTheDocument();
  });

  it('shows error state with retry button', async () => {
    typefaceService.getTypefacesByTheme.mockRejectedValue(new Error('Failed to load'));
    
    render(<TypefaceManager themeId="theme-1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load typefaces')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
    });
  });

  it('Add Typeface button is disabled when all 4 roles are assigned', async () => {
    const allAssigned = [
      ...mockTypefaces,
      { id: 'tf-3', role: 'mono', family: 'JetBrains Mono', fallback: 'monospace', source_type: 'google', weights: [400], is_variable: false, font_files: [] },
      { id: 'tf-4', role: 'accent', family: 'Dancing Script', fallback: 'cursive', source_type: 'google', weights: [400, 700], is_variable: false, font_files: [] }
    ];
    typefaceService.getTypefacesByTheme.mockResolvedValue(allAssigned);

    render(<TypefaceManager themeId="theme-1" />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add Typeface/ });
      expect(addButton).toBeDisabled();
    });
  });

  it('clicking Add Typeface opens modal for adding new typeface', async () => {
    render(<TypefaceManager themeId="theme-1" />);

    await waitFor(() => {
      const playfairElements = screen.getAllByText('Playfair Display');
      expect(playfairElements.length).toBeGreaterThanOrEqual(1);
    });

    // Click Add Typeface button
    fireEvent.click(screen.getByRole('button', { name: /Add Typeface/ }));

    // Modal should open - check for modal-specific content
    await waitFor(() => {
      expect(screen.getByText('Font Family')).toBeInTheDocument();
      expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });
  });
});

