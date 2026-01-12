/**
 * @chunk 2.27 - Preview Components Tests
 *
 * Unit tests for theme preview components (theme-prop based).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PreviewTypography from '../../src/components/themes/preview/PreviewTypography'
import PreviewColors from '../../src/components/themes/preview/PreviewColors'
import PreviewButtons from '../../src/components/themes/preview/PreviewButtons'
import PreviewCard from '../../src/components/themes/preview/PreviewCard'
import PreviewForm from '../../src/components/themes/preview/PreviewForm'
import ThemePreview from '../../src/components/themes/preview/ThemePreview'

// Mock lucide-react icons used across preview components
vi.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart">♥</span>,
  MessageCircle: () => <span data-testid="icon-message">💬</span>,
  Share2: () => <span data-testid="icon-share">↗</span>,
  MoreHorizontal: () => <span data-testid="icon-more">⋯</span>,
  Check: () => <span data-testid="icon-check">✓</span>,
  ChevronDown: () => <span data-testid="icon-chevron-down">▼</span>,
  ChevronUp: () => <span data-testid="icon-chevron-up">▲</span>,
  AlertCircle: () => <span data-testid="icon-alert">⚠</span>,
  Monitor: () => <span data-testid="icon-monitor">🖥</span>,
  Tablet: () => <span data-testid="icon-tablet">📱</span>,
  Smartphone: () => <span data-testid="icon-smartphone">📱</span>,
  Sun: () => <span data-testid="icon-sun">☀</span>,
  Moon: () => <span data-testid="icon-moon">🌙</span>,
  Maximize2: () => <span data-testid="icon-maximize">⤢</span>,
  Minimize2: () => <span data-testid="icon-minimize">⤡</span>,
  X: () => <span data-testid="icon-x">✕</span>,
}))

const baseTheme = {
  id: 'theme-1',
  name: 'Test Theme',
  tokens: [
    // Core colors
    { id: 'c1', category: 'color', name: 'Background', css_variable: '--background-white', value: '#ffffff' },
    { id: 'c2', category: 'color', name: 'Heading', css_variable: '--foreground-heading', value: '#111111' },
    { id: 'c3', category: 'color', name: 'Body', css_variable: '--foreground-body', value: '#222222' },
    { id: 'c4', category: 'color', name: 'Caption', css_variable: '--foreground-caption', value: '#666666' },
    { id: 'c5', category: 'color', name: 'Stroke', css_variable: '--foreground-stroke-default', value: '#dddddd' },

    // Button tokens
    { id: 'b1', category: 'color', name: 'Primary BG', css_variable: '--button-primary-bg', value: '#3b82f6' },
    { id: 'b2', category: 'color', name: 'Primary Text', css_variable: '--button-primary-text', value: '#ffffff' },
    { id: 'b3', category: 'color', name: 'Secondary BG', css_variable: '--button-secondary-bg', value: '#f3f4f6' },
    { id: 'b4', category: 'color', name: 'Secondary Text', css_variable: '--button-secondary-text', value: '#111827' },
    { id: 'b5', category: 'color', name: 'Secondary Border', css_variable: '--button-secondary-border', value: '#d1d5db' },

    // Radius tokens
    { id: 'r1', category: 'radius', name: 'Radius MD', css_variable: '--radius-md', value: '6px' },
    { id: 'r2', category: 'radius', name: 'Radius LG', css_variable: '--radius-lg', value: '8px' },
    { id: 'r3', category: 'radius', name: 'Radius XL', css_variable: '--radius-xl', value: '12px' },
  ],
  typefaces: [],
}

describe('PreviewTypography', () => {
  it('shows empty state when no typography tokens or typefaces exist', () => {
    render(<PreviewTypography theme={{ id: 't', tokens: [], typefaces: [] }} />)
    expect(screen.getByText(/no typography tokens or typefaces defined/i)).toBeInTheDocument()
  })
})

describe('PreviewColors', () => {
  it('renders grouped swatches from theme tokens', () => {
    render(<PreviewColors theme={baseTheme} />)
    // grouped by css var prefix (e.g. --button-*)
    expect(screen.getByText('button')).toBeInTheDocument()
    expect(screen.getByText('#3b82f6')).toBeInTheDocument()
  })
})

describe('PreviewButtons', () => {
  it('renders primary/secondary buttons and size row', () => {
    render(<PreviewButtons theme={baseTheme} />)
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Sizes')).toBeInTheDocument()
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })
})

describe('PreviewCard', () => {
  it('renders card variants and footer action counts', () => {
    render(<PreviewCard theme={baseTheme} />)
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Structured Card')).toBeInTheDocument()
    expect(screen.getByText('Elevated Card')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })
})

describe('PreviewForm', () => {
  it('renders common inputs and toggles checkbox', () => {
    render(<PreviewForm theme={baseTheme} />)

    expect(screen.getByText('Text Input')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
    expect(screen.getByText('With Error')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByText('Select')).toBeInTheDocument()
    expect(screen.getByText('Textarea')).toBeInTheDocument()
    expect(screen.getByText('Disabled Input')).toBeInTheDocument()

    // Toggle checkbox
    const checkboxLabel = screen.getByText('Checked option')
    const checkboxContainer = checkboxLabel.parentElement
    const checkbox = checkboxContainer.querySelector('div[style*="cursor: pointer"]')
    fireEvent.click(checkbox)
  })
})

describe('ThemePreview', () => {
  it('renders the preview sections when expanded', () => {
    render(<ThemePreview theme={baseTheme} />)
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('Buttons')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
    expect(screen.getByText('Form')).toBeInTheDocument()
  })

  it('collapses and expands via header click', () => {
    const { container } = render(<ThemePreview theme={baseTheme} />)
    expect(screen.getByText('Typography')).toBeInTheDocument()

    const header = container.querySelector('.theme-preview-header')
    fireEvent.click(header)
    expect(screen.queryByText('Typography')).not.toBeInTheDocument()

    fireEvent.click(header)
    expect(screen.getByText('Typography')).toBeInTheDocument()
  })

  it('injects composite typography variables and role-based typeface font variables into the scoped viewport', () => {
    const theme = {
      ...baseTheme,
      tokens: [
        ...baseTheme.tokens,
        {
          id: 'typo1',
          category: 'typography',
          type: 'typography-composite',
          css_variable: '--typography-body',
          value: {
            fontFamily: '"My Display", serif',
            fontSize: { value: 16, unit: 'px' },
            fontWeight: 600,
            lineHeight: { value: 1.4, unit: '' },
          },
        },
      ],
      typefaces: [{ id: 'tf1', role: 'display', family: 'Inter', fallback: 'sans-serif', source_type: 'google', weights: [400] }],
    }

    const { container } = render(<ThemePreview theme={theme} />)
    const viewport = container.querySelector('.theme-preview-viewport')
    const style = viewport?.getAttribute('style') || ''

    // Composite expansion
    expect(style).toContain('--typography-body-size: 16px')
    expect(style).toContain('--typography-body-weight: 600')
    expect(style).toContain('--typography-body-line-height: 1.4')

    // Typeface-derived variable
    expect(style).toContain('--font-family-display: Inter, sans-serif')
  })
})




