/**
 * ExportModal Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock UI components used by ExportModal
vi.mock('../../src/components/ui', () => ({
  Modal: ({ open, children }) => (open ? <div data-testid="modal">{children}</div> : null),
  Button: ({ children, disabled, onClick }) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}))

// Mock child components so we can drive selection state easily
vi.mock('../../src/components/export/ThemeSelector', () => ({
  default: ({ onChange }) => (
    <button onClick={() => onChange([])}>Select no themes</button>
  ),
}))

vi.mock('../../src/components/export/ComponentSelector', () => ({
  default: ({ onChange }) => (
    <button onClick={() => onChange(['comp-1'])}>Select one component</button>
  ),
}))

vi.mock('../../src/components/export/FormatTabs', () => ({ default: () => null }))
vi.mock('../../src/components/export/TokenFormatOptions', () => ({ default: () => null }))
vi.mock('../../src/components/export/AIFormatOptions', () => ({ default: () => null }))
vi.mock('../../src/components/export/MCPServerOptions', () => ({ default: () => null }))
vi.mock('../../src/components/export/FullPackageOptions', () => ({ default: () => null }))
vi.mock('../../src/components/export/ExportPreview', () => ({ default: () => null }))
vi.mock('../../src/components/export/ExportResultDialog', () => ({ default: () => null }))

vi.mock('../../src/services/exportService', () => ({
  exportService: {
    buildPackage: vi.fn().mockResolvedValue({ files: {}, fileCount: 0 }),
  },
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

import ExportModal from '../../src/components/export/ExportModal'

describe('ExportModal', () => {
  it('enables export when components selected even if no themes selected', () => {
    render(<ExportModal open={true} onClose={vi.fn()} />)

    const exportBtn = screen.getByRole('button', { name: 'Export' })
    expect(exportBtn).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /select one component/i }))
    expect(screen.getByRole('button', { name: 'Export' })).not.toBeDisabled()
  })
})




