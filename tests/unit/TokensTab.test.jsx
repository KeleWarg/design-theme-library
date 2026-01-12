/**
 * TokensTab Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import TokensTab from '../../src/components/components/detail/TokensTab'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock lucide icons used by TokensTab (partial mock pattern)
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    SearchIcon: () => <span data-testid="icon-search" />,
    XIcon: () => <span data-testid="icon-x" />,
    AlertCircleIcon: () => <span data-testid="icon-alert" />,
    RotateCcw: () => <span data-testid="icon-rotate" />,
    Save: () => <span data-testid="icon-save" />,
    LinkIcon: () => <span data-testid="icon-link" />,
  }
})

// Mock ThemeContext hook (TokensTab only needs activeTheme for default catalog selection)
vi.mock('../../src/contexts/ThemeContext', () => ({
  useThemeContext: () => ({
    activeTheme: { id: 'theme-1', name: 'Theme 1' },
  }),
}))

const mockThemes = [
  { id: 'theme-1', name: 'Theme 1', status: 'published' },
  { id: 'theme-2', name: 'Theme 2', status: 'published' },
]

const mockCatalogTheme = {
  id: 'theme-1',
  name: 'Theme 1',
  tokens: [
    {
      id: 't1',
      name: 'Primary',
      path: 'color/primary',
      category: 'color',
      type: 'color',
      css_variable: '--color-primary',
      value: { hex: '#000000' },
    },
    {
      id: 't2',
      name: 'Secondary',
      path: 'color/secondary',
      category: 'color',
      type: 'color',
      css_variable: '--color-secondary',
      value: { hex: '#ffffff' },
    },
    {
      id: 't3',
      name: 'Heading LG',
      path: 'typography/role/heading-lg',
      category: 'typography',
      type: 'typography-composite',
      css_variable: '--typography-heading-lg',
      value: { fontSize: { desktop: '20px', tablet: '18px', mobile: '16px' } },
    },
    {
      id: 't4',
      name: 'Body SM',
      path: 'typography/role/body-sm',
      category: 'typography',
      type: 'typography-composite',
      css_variable: '--typography-body-sm',
      value: { fontSize: { desktop: '14px', tablet: '13px', mobile: '12px' } },
    },
  ],
}

// Mock useThemes/useTheme hooks
vi.mock('../../src/hooks/useThemes', () => ({
  useThemes: () => ({ data: mockThemes, isLoading: false, error: null, refetch: vi.fn(), mutate: vi.fn() }),
  useTheme: (id) => ({
    data: id ? mockCatalogTheme : null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('TokensTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('auto-links tokens detected in code by persisting linked_tokens via onUpdate', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    const component = {
      id: 'comp-1',
      code: `
        export default function Button() {
          return <div style={{ color: 'var(--color-primary)' }} />
        }
      `,
      linked_tokens: [],
    }

    render(<TokensTab component={component} onUpdate={onUpdate} />)

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
    })

    const calls = onUpdate.mock.calls.map(c => c[0])
    const autoLinkCall = calls.find(c => Array.isArray(c.linked_tokens))
    expect(autoLinkCall.linked_tokens).toContain('color/primary')
  })

  it('swaps token usage by updating component code (global across themes) and linked_tokens', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    const component = {
      id: 'comp-2',
      code: `
        export default function Button() {
          return <div style={{ color: 'var(--color-primary)' }} />
        }
      `,
      linked_tokens: ['color/primary'],
    }

    render(<TokensTab component={component} onUpdate={onUpdate} />)

    // Wait for token usage section to appear
    expect(await screen.findByText(/Token Usage \(Detected from Code\)/i)).toBeInTheDocument()

    const usageVarEl = screen
      .getAllByText('--color-primary')
      .find((el) => el.classList?.contains('tokens-tab-usage-from-var'))
    expect(usageVarEl).toBeTruthy()
    const row = usageVarEl.closest('.tokens-tab-usage-row')
    expect(row).toBeTruthy()

    // Choose replacement for --color-primary within its row
    const swapSelect = within(row).getByLabelText('Swap to')
    fireEvent.change(swapSelect, { target: { value: 'color/secondary' } })

    // Apply within the same row
    fireEvent.click(within(row).getByRole('button', { name: /apply/i }))

    await waitFor(() => {
      expect(onUpdate.mock.calls.some(c => typeof c?.[0]?.code === 'string')).toBe(true)
    })

    const swapCall = [...onUpdate.mock.calls].map(c => c[0]).reverse().find(u => typeof u?.code === 'string')
    expect(swapCall.code).toMatch(/--color-secondary/)
    expect(swapCall.code).not.toMatch(/--color-primary(?![-\w])/)
    expect(swapCall.linked_tokens).toContain('color/secondary')
    expect(swapCall.linked_tokens).not.toContain('color/primary')
  })

  it('swaps composite typography tokens by replacing base prefix (keeps suffix like -size)', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    const component = {
      id: 'comp-3',
      code: `
        export default function Button() {
          return <div style={{ fontSize: 'var(--typography-heading-lg-size)' }} />
        }
      `,
      linked_tokens: ['typography/role/heading-lg'],
    }

    render(<TokensTab component={component} onUpdate={onUpdate} />)

    expect(await screen.findByText(/Token Usage \(Detected from Code\)/i)).toBeInTheDocument()

    const usageVarEl = screen
      .getAllByText('--typography-heading-lg')
      .find((el) => el.classList?.contains('tokens-tab-usage-from-var'))
    expect(usageVarEl).toBeTruthy()
    const row = usageVarEl.closest('.tokens-tab-usage-row')
    expect(row).toBeTruthy()

    const targetSelect = within(row).getByLabelText('Swap to')
    fireEvent.change(targetSelect, { target: { value: 'typography/role/body-sm' } })
    fireEvent.click(within(row).getByRole('button', { name: /apply/i }))

    await waitFor(() => {
      expect(onUpdate.mock.calls.some(c => typeof c?.[0]?.code === 'string')).toBe(true)
    })

    const swapCall = [...onUpdate.mock.calls].map(c => c[0]).reverse().find(u => typeof u?.code === 'string')
    expect(swapCall.code).toMatch(/--typography-body-sm-size/)
    expect(swapCall.code).not.toMatch(/--typography-heading-lg/)
    expect(swapCall.linked_tokens).toContain('typography/role/body-sm')
    expect(swapCall.linked_tokens).not.toContain('typography/role/heading-lg')
  })
})


