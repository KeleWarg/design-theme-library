/**
 * @chunk 2.22 - TypefaceForm Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock google fonts helpers used by TypefaceForm
vi.mock('../../src/lib/googleFonts', () => ({
  SYSTEM_FONTS: [],
  FONT_WEIGHTS: [
    { value: 400, label: 'Regular' },
    { value: 700, label: 'Bold' },
  ],
  getSuggestedFallback: () => 'sans-serif',
  getAvailableWeights: () => null,
  loadGoogleFont: vi.fn().mockResolvedValue(undefined),
}));

// Mock typefaceService (TypefaceForm imports it)
vi.mock('../../src/services/typefaceService', () => ({
  typefaceService: {
    createTypeface: vi.fn(),
    updateTypeface: vi.fn(),
    uploadFontFile: vi.fn(),
  },
}));

import TypefaceForm from '../../src/components/themes/typography/TypefaceForm';

describe('TypefaceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a real font upload interaction when editing a custom typeface', () => {
    render(
      <TypefaceForm
        typeface={{
          id: 'tf-1',
          role: 'display',
          family: 'My Custom Font',
          fallback: 'sans-serif',
          source_type: 'custom',
          weights: [400],
          is_variable: false,
          font_files: [],
        }}
        themeId="theme-1"
        availableRoles={['display']}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/drop font files here or click to browse/i)).toBeInTheDocument();
    expect(screen.getByText(/woff2, woff, ttf, otf/i)).toBeInTheDocument();
  });

  it('disables family renaming when a custom typeface already has uploaded fonts', () => {
    render(
      <TypefaceForm
        typeface={{
          id: 'tf-1',
          role: 'display',
          family: 'My Custom Font',
          fallback: 'sans-serif',
          source_type: 'custom',
          weights: [400],
          is_variable: false,
          font_files: [{ id: 'ff-1', format: 'woff2', weight: 400, style: 'normal', file_size: 1000 }],
        }}
        themeId="theme-1"
        availableRoles={['display']}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/font family/i)).toBeDisabled();
  });
});


