/**
 * PreviewTab Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PreviewTab from '../../src/components/components/detail/PreviewTab'

// Simplify icon rendering
vi.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: () => () => null,
    }
  )
})

// Mock ThemeContext + hooks used by PreviewTab
vi.mock('../../src/contexts/ThemeContext', () => ({
  useThemeContext: () => ({
    activeTheme: { id: 'theme-1', name: 'Theme 1', tokens: [] },
  }),
}))

vi.mock('../../src/hooks/useThemes', () => ({
  useThemes: () => ({
    data: [{ id: 'theme-1', name: 'Theme 1', status: 'published' }],
    isLoading: false,
    error: null,
  }),
  useTheme: () => ({
    data: { id: 'theme-1', name: 'Theme 1', tokens: [] },
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../../src/hooks/useIcons', () => ({
  useIcons: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}))

// Mock renderer so we don't execute dynamic code in tests
vi.mock('../../src/components/components/detail/ComponentRenderer', () => ({
  default: () => <div data-testid="component-renderer" />,
}))

describe('PreviewTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows a single Variant control and avoids duplicate `variant` prop control when a variant prop exists', () => {
    const component = {
      id: 'comp-1',
      code: 'export default function Button(){ return null }',
      props: [
        { name: 'variant', type: 'enum', options: ['primary', 'secondary'], default: 'primary' },
        { name: 'disabled', type: 'boolean', default: false },
      ],
      variants: [
        { name: 'primary', props: { variant: 'primary' } },
        { name: 'secondary', props: { variant: 'secondary' } },
      ],
    }

    render(
      <MemoryRouter>
        <PreviewTab component={component} />
      </MemoryRouter>
    )

    // Top-level Variant selector
    expect(screen.getByLabelText('Variant')).toBeInTheDocument()

    // The prop-controls grid should not render a separate enum select labelled "variant"
    expect(screen.queryByLabelText('variant')).not.toBeInTheDocument()

    // Other props still render
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })
})


