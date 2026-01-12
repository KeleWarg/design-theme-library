/**
 * @chunk 2.24 - TypographyRoleModal Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import TypographyRoleModal from '../../src/components/themes/typography/TypographyRoleModal';

describe('TypographyRoleModal', () => {
  it('uses defaultTypefaceRole when role.typeface_role is missing', () => {
    render(
      <TypographyRoleModal
        role={{
          id: 'role-1',
          role_name: 'heading-xl',
          // typeface_role intentionally missing to simulate older / partial data
          font_size: '2.25rem',
          font_weight: 700,
          line_height: '1.2',
          letter_spacing: '-0.01em',
        }}
        defaultTypefaceRole="display"
        typefaces={[
          {
            id: 'tf-1',
            role: 'display',
            family: 'Inter',
            fallback: 'sans-serif',
            source_type: 'google',
            weights: [400, 700],
            is_variable: false,
            font_files: [],
          },
        ]}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const typefaceSelect = screen.getByLabelText('Typeface');
    expect(typefaceSelect).toHaveValue('display');

    const preview = screen.getByText(/the quick brown fox jumps over the lazy dog/i);
    expect(preview).toHaveStyle({ fontFamily: "'Inter', sans-serif" });
  });

  it('shows a hint when the selected typeface role is not configured', () => {
    render(
      <TypographyRoleModal
        role={{
          id: 'role-1',
          role_name: 'body-md',
          typeface_role: 'accent',
          font_size: '1rem',
          font_weight: 400,
          line_height: '1.5',
          letter_spacing: 'normal',
        }}
        typefaces={[
          // No accent typeface provided
          { id: 'tf-1', role: 'text', family: 'Inter', fallback: 'sans-serif', weights: [400], font_files: [] },
        ]}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/no typeface configured for this role yet/i)).toBeInTheDocument();
  });
});




