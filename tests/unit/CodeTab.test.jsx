/**
 * CodeTab Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CodeTab from '../../src/components/components/detail/CodeTab'

// Mock monaco editor with a simple textarea
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }) => (
    <textarea
      data-testid="monaco"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

// Mock icons (lucide-react) - partial mock so other UI deps (e.g. StatusBadge) still work
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    CopyIcon: () => <span data-testid="icon-copy" />,
    CheckIcon: () => <span data-testid="icon-check" />,
    EditIcon: () => <span data-testid="icon-edit" />,
    XIcon: () => <span data-testid="icon-x" />,
  }
})

// Mock toast (used for copy failures/success)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('CodeTab', () => {
  it('saves via onSave exactly once (no internal service write)', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const component = {
      id: 'comp-1',
      code: 'export default function A(){ return null }',
    }

    render(<CodeTab component={component} onSave={onSave} />)

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    // Change code
    fireEvent.change(screen.getByTestId('monaco'), {
      target: { value: 'export default function A(){ return <div/> }' },
    })

    // Save
    const saveBtn = screen.getByRole('button', { name: /save code/i })
    expect(saveBtn).not.toBeDisabled()
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1)
    })
  })
})


