/**
 * @chunk 4.06 - FigmaImportPage Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import FigmaImportPage from '@/pages/FigmaImportPage'

vi.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: () => () => <span />,
    }
  )
})

const mockRefetch = vi.fn()

vi.mock('@/hooks/useFigmaImport', () => ({
  useFigmaImport: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
  useFigmaImports: vi.fn(() => ({
    data: [
      {
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
      },
    ],
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
}))

describe('FigmaImportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders import list without crashing when imports exist', () => {
    render(
      <MemoryRouter initialEntries={['/figma-import']}>
        <Routes>
          <Route path="/figma-import" element={<FigmaImportPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Figma Imports')).toBeInTheDocument()
    expect(screen.getByText('DS Components')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Review/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Import All/i })).toBeInTheDocument()
  })
})


