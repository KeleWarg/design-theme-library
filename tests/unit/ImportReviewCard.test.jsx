/**
 * @chunk 4.07 - ImportReviewCard
 * 
 * Unit tests for ImportReviewCard component.
 * Tests file-level import record rendering, status badges, and action buttons.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import ImportReviewCard from '../../src/components/figma-import/ImportReviewCard';

describe('ImportReviewCard', () => {
  const baseImport = {
    id: 'import-1',
    file_name: 'DS Components',
    file_key: 'abc123',
    exported_at: '2026-01-01T12:00:00.000Z',
    status: 'pending',
    componentCount: 2,
    metadata: {
      fileName: 'DS Components',
      exportedAt: '2026-01-01T12:00:00.000Z',
    },
  }

  const mockOnReview = vi.fn()
  const mockOnImport = vi.fn()
  const mockOnRetry = vi.fn()
  const mockOnReset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the import record and shows Import All for pending', () => {
    render(
      <ImportReviewCard
        import={baseImport}
        onReview={mockOnReview}
        onImport={mockOnImport}
        onRetry={mockOnRetry}
        onReset={mockOnReset}
      />
    )

    expect(screen.getByText('DS Components')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Review/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Import All/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reset/i })).not.toBeInTheDocument()
  })

  it('calls onReview when Review is clicked', () => {
    render(
      <ImportReviewCard
        import={baseImport}
        onReview={mockOnReview}
        onImport={mockOnImport}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Review/i }))
    expect(mockOnReview).toHaveBeenCalledWith(baseImport)
  })

  it('calls onImport when Import All is clicked (pending)', () => {
    render(
      <ImportReviewCard
        import={baseImport}
        onImport={mockOnImport}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Import All/i }))
    expect(mockOnImport).toHaveBeenCalledWith(baseImport)
  })

  it('shows Reset + Retry Import for failed imports', () => {
    const failed = { ...baseImport, status: 'failed' }
    render(
      <ImportReviewCard
        import={failed}
        onRetry={mockOnRetry}
        onReset={mockOnReset}
      />
    )

    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry Import/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Reset/i }))
    expect(mockOnReset).toHaveBeenCalledWith(failed)

    fireEvent.click(screen.getByRole('button', { name: /Retry Import/i }))
    expect(mockOnRetry).toHaveBeenCalledWith(failed)
  })

  it('shows Reset + Re-import for imported imports', () => {
    const imported = { ...baseImport, status: 'imported' }
    render(
      <ImportReviewCard
        import={imported}
        onRetry={mockOnRetry}
        onReset={mockOnReset}
      />
    )

    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Re-import/i })).toBeInTheDocument()
  })
});

