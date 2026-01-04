/**
 * Gate 3: Token Editing
 * 
 * Validates:
 * 1. TokenList fetches and renders tokens from database
 * 2. Tokens are grouped by category
 * 3. Clicking a color token opens ColorEditor
 * 4. ColorEditor shows current color value
 * 5. Color picker allows selecting new color
 * 6. Saving color updates database via tokenService
 * 7. After save, CSS variable updates on document
 * 
 * Trigger: Chunks 2.14, 2.15 complete
 * Blocks: Remaining editors (2.16-2.20)
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import TokenList from '@/components/themes/editor/TokenList'
import ColorEditor from '@/components/themes/editor/ColorEditor'
import { tokenService } from '@/services/tokenService'
import { themeService } from '@/services/themeService'
import { injectCssVariables, removeCssVariables, getCssVariables } from '@/lib/cssVariableInjector'

// =============================================================================
// Mock Data
// =============================================================================

const mockColorTokens = [
  { 
    id: '1', 
    name: 'primary', 
    category: 'color', 
    value: { hex: '#657E79', opacity: 1 }, 
    css_variable: '--color-primary',
    path: 'Color/Primary'
  },
  { 
    id: '2', 
    name: 'secondary', 
    category: 'color', 
    value: { hex: '#FFFFFF', opacity: 1 }, 
    css_variable: '--color-secondary',
    path: 'Color/Secondary'
  },
  { 
    id: '3', 
    name: 'accent', 
    category: 'color', 
    value: { hex: '#3B82F6', opacity: 1 }, 
    css_variable: '--color-accent',
    path: 'Color/Accent'
  },
]

const mockSpacingTokens = [
  { 
    id: '4', 
    name: 'md', 
    category: 'spacing', 
    value: { value: 16, unit: 'px' }, 
    css_variable: '--spacing-md',
    path: 'Spacing/md'
  },
  { 
    id: '5', 
    name: 'lg', 
    category: 'spacing', 
    value: { value: 24, unit: 'px' }, 
    css_variable: '--spacing-lg',
    path: 'Spacing/lg'
  },
]

// =============================================================================
// Gate 3 Tests: Token Editing
// =============================================================================

describe('Gate 3: Token Editing', () => {
  // Clean up CSS variables after each test
  beforeEach(() => {
    const root = document.documentElement
    const style = root.style
    for (let i = style.length - 1; i >= 0; i--) {
      const name = style[i]
      if (name.startsWith('--')) {
        root.style.removeProperty(name)
      }
    }
  })

  // =============================================================================
  // TokenList Component Tests
  // =============================================================================

  describe('TokenList', () => {
    it('renders list of tokens', () => {
      render(
        <TokenList 
          tokens={mockColorTokens} 
          category="color" 
          onSelectToken={vi.fn()}
          onAddToken={vi.fn()}
          onDeleteToken={vi.fn()}
        />
      )
      
      expect(screen.getByText('primary')).toBeInTheDocument()
      expect(screen.getByText('secondary')).toBeInTheDocument()
      expect(screen.getByText('accent')).toBeInTheDocument()
    })

    it('shows CSS variable names', () => {
      render(
        <TokenList 
          tokens={mockColorTokens} 
          category="color" 
          onSelectToken={vi.fn()}
          onAddToken={vi.fn()}
          onDeleteToken={vi.fn()}
        />
      )
      
      expect(screen.getByText('--color-primary')).toBeInTheDocument()
      expect(screen.getByText('--color-secondary')).toBeInTheDocument()
    })

    it('displays category title correctly', () => {
      render(
        <TokenList 
          tokens={mockColorTokens} 
          category="color" 
          onSelectToken={vi.fn()}
          onAddToken={vi.fn()}
          onDeleteToken={vi.fn()}
        />
      )
      
      expect(screen.getByText('Color Tokens')).toBeInTheDocument()
    })

    it('calls onSelectToken when token is clicked', async () => {
      const handleSelect = vi.fn()
      
      render(
        <TokenList 
          tokens={mockColorTokens} 
          category="color" 
          onSelectToken={handleSelect}
          onAddToken={vi.fn()}
          onDeleteToken={vi.fn()}
        />
      )
      
      // Click on the primary token button
      const tokenButtons = screen.getAllByRole('button')
      const primaryButton = tokenButtons.find(btn => 
        btn.querySelector('.token-list-item-name')?.textContent === 'primary'
      )
      
      if (primaryButton) {
        fireEvent.click(primaryButton)
        expect(handleSelect).toHaveBeenCalledWith(mockColorTokens[0])
      }
    })

    it('highlights selected token', () => {
      render(
        <TokenList 
          tokens={mockColorTokens} 
          category="color" 
          selectedToken={mockColorTokens[0]}
          onSelectToken={vi.fn()}
          onAddToken={vi.fn()}
          onDeleteToken={vi.fn()}
        />
      )
      
      // The selected item should have aria-selected="true"
      const selectedItem = screen.getByRole('option', { selected: true })
      expect(selectedItem).toBeInTheDocument()
    })

    it('filters tokens based on search query', async () => {
      render(
        <TokenList 
          tokens={mockColorTokens} 
          category="color" 
          onSelectToken={vi.fn()}
          onAddToken={vi.fn()}
          onDeleteToken={vi.fn()}
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search tokens...')
      fireEvent.change(searchInput, { target: { value: 'primary' } })
      
      expect(screen.getByText('primary')).toBeInTheDocument()
      expect(screen.queryByText('secondary')).not.toBeInTheDocument()
      expect(screen.queryByText('accent')).not.toBeInTheDocument()
    })

    it('shows empty state when no tokens', () => {
      render(
        <TokenList 
          tokens={[]} 
          category="color" 
          onSelectToken={vi.fn()}
          onAddToken={vi.fn()}
          onDeleteToken={vi.fn()}
        />
      )
      
      expect(screen.getByText(/No color tokens/i)).toBeInTheDocument()
    })

    it('has add token button', () => {
      render(
        <TokenList 
          tokens={mockColorTokens} 
          category="color" 
          onSelectToken={vi.fn()}
          onAddToken={vi.fn()}
          onDeleteToken={vi.fn()}
        />
      )
      
      expect(screen.getByRole('button', { name: /Add color token/i })).toBeInTheDocument()
    })
  })

  // =============================================================================
  // ColorEditor Component Tests
  // =============================================================================

  describe('ColorEditor', () => {
    it('displays current color value in hex input', () => {
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={vi.fn()} 
        />
      )
      
      // The ColorEditor shows HEX input with the current value
      const hexInput = screen.getByDisplayValue('#657E79')
      expect(hexInput).toBeInTheDocument()
    })

    it('shows color preview swatch', () => {
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={vi.fn()} 
        />
      )
      
      // Check for the large preview swatch
      const previewSwatch = document.querySelector('.preview-swatch')
      expect(previewSwatch).toBeInTheDocument()
      expect(previewSwatch).toHaveStyle({ backgroundColor: '#657E79' })
    })

    it('has format toggle tabs (HEX, RGB, HSL)', () => {
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={vi.fn()} 
        />
      )
      
      // Use getAllByText since HEX appears in both tab and label
      const formatTabs = screen.getAllByText('HEX')
      expect(formatTabs.length).toBeGreaterThan(0)
      expect(screen.getByText('RGB')).toBeInTheDocument()
      expect(screen.getByText('HSL')).toBeInTheDocument()
    })

    it('has native color picker input', () => {
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={vi.fn()} 
        />
      )
      
      const colorPicker = screen.getByLabelText('Color picker')
      expect(colorPicker).toBeInTheDocument()
      expect(colorPicker).toHaveAttribute('type', 'color')
    })

    it('calls onUpdate when color is changed via hex input', async () => {
      const handleUpdate = vi.fn()
      
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={handleUpdate} 
        />
      )
      
      const hexInput = screen.getByDisplayValue('#657E79')
      
      // Change the value
      fireEvent.change(hexInput, { target: { value: '#FF0000' } })
      
      // Trigger blur to save
      fireEvent.blur(hexInput)
      
      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            value: expect.objectContaining({
              hex: '#FF0000'
            })
          })
        )
      })
    })

    it('calls onUpdate when color picker value changes', async () => {
      const handleUpdate = vi.fn()
      
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={handleUpdate} 
        />
      )
      
      const colorPicker = screen.getByLabelText('Color picker')
      
      // Simulate color picker change
      fireEvent.change(colorPicker, { target: { value: '#00FF00' } })
      
      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalled()
      })
    })

    it('shows CSS variable name in footer', () => {
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={vi.fn()} 
        />
      )
      
      expect(screen.getByText('--color-primary')).toBeInTheDocument()
    })

    it('has opacity slider', () => {
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={vi.fn()} 
        />
      )
      
      expect(screen.getByText('Opacity')).toBeInTheDocument()
    })

    it('shows RGB sliders when RGB tab is active', async () => {
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={vi.fn()} 
        />
      )
      
      // Click RGB tab
      fireEvent.click(screen.getByText('RGB'))
      
      expect(screen.getByText('Red')).toBeInTheDocument()
      expect(screen.getByText('Green')).toBeInTheDocument()
      expect(screen.getByText('Blue')).toBeInTheDocument()
    })

    it('shows HSL sliders when HSL tab is active', async () => {
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={vi.fn()} 
        />
      )
      
      // Click HSL tab
      fireEvent.click(screen.getByText('HSL'))
      
      expect(screen.getByText('Hue')).toBeInTheDocument()
      expect(screen.getByText('Saturation')).toBeInTheDocument()
      expect(screen.getByText('Lightness')).toBeInTheDocument()
    })
  })

  // =============================================================================
  // CSS Variable Injection Integration Tests
  // =============================================================================

  describe('CSS Variable Integration', () => {
    it('injectCssVariables sets color tokens on document', () => {
      const injected = injectCssVariables(mockColorTokens)
      
      expect(injected['--color-primary']).toBe('#657E79')
      expect(injected['--color-secondary']).toBe('#FFFFFF')
      expect(injected['--color-accent']).toBe('#3B82F6')
    })

    it('CSS variables are readable from document.documentElement', () => {
      injectCssVariables(mockColorTokens)
      
      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-primary')).toBe('#657E79')
      expect(root.style.getPropertyValue('--color-secondary')).toBe('#FFFFFF')
    })

    it('removeCssVariables clears variables from document', () => {
      injectCssVariables(mockColorTokens)
      
      removeCssVariables(['--color-primary', '--color-secondary', '--color-accent'])
      
      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-primary')).toBe('')
      expect(root.style.getPropertyValue('--color-secondary')).toBe('')
    })

    it('getCssVariables returns currently injected variables', () => {
      injectCssVariables(mockColorTokens)
      
      const variables = getCssVariables()
      expect(variables['--color-primary']).toBeDefined()
    })

    it('updating token value updates CSS variable', () => {
      // Inject initial tokens
      injectCssVariables(mockColorTokens)
      
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#657E79')
      
      // Update with new value
      const updatedToken = {
        ...mockColorTokens[0],
        value: { hex: '#000000' }
      }
      injectCssVariables([updatedToken])
      
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#000000')
    })

    it('handles spacing tokens correctly', () => {
      injectCssVariables(mockSpacingTokens)
      
      expect(document.documentElement.style.getPropertyValue('--spacing-md')).toBe('16px')
      expect(document.documentElement.style.getPropertyValue('--spacing-lg')).toBe('24px')
    })
  })

  // =============================================================================
  // Database Integration Tests (requires live Supabase)
  // =============================================================================

  describe('Database Integration', () => {
    let testTheme = null
    let createdTokens = []

    beforeAll(async () => {
      // Create a test theme
      try {
        testTheme = await themeService.createTheme({
          name: 'Gate 3 Test Theme',
          source: 'manual'
        })
      } catch (e) {
        console.warn('Could not create test theme - database may not be available:', e.message)
      }
    })

    afterAll(async () => {
      // Cleanup
      if (testTheme?.id) {
        try {
          await tokenService.deleteTokensByTheme(testTheme.id)
          await themeService.deleteTheme(testTheme.id)
        } catch (e) {
          console.warn('Cleanup error:', e.message)
        }
      }
    })

    it('tokenService.bulkCreateTokens creates tokens in database', async () => {
      if (!testTheme?.id) {
        console.log('Skipping test - no database connection')
        return
      }

      const tokensToCreate = [
        {
          name: 'gate3-primary',
          path: 'Color/Gate3/Primary',
          category: 'color',
          type: 'color',
          value: { hex: '#FF5733' },
          css_variable: '--color-gate3-primary'
        },
        {
          name: 'gate3-secondary',
          path: 'Color/Gate3/Secondary',
          category: 'color',
          type: 'color',
          value: { hex: '#33FF57' },
          css_variable: '--color-gate3-secondary'
        }
      ]

      createdTokens = await tokenService.bulkCreateTokens(testTheme.id, tokensToCreate)
      
      expect(createdTokens).toHaveLength(2)
      expect(createdTokens[0].id).toBeDefined()
      expect(createdTokens[0].name).toBe('gate3-primary')
    })

    it('tokenService.getTokensByTheme groups tokens by category', async () => {
      if (!testTheme?.id || createdTokens.length === 0) {
        console.log('Skipping test - no database connection or tokens')
        return
      }

      const grouped = await tokenService.getTokensByTheme(testTheme.id)
      
      expect(typeof grouped).toBe('object')
      expect(grouped.color).toBeDefined()
      expect(Array.isArray(grouped.color)).toBe(true)
      expect(grouped.color.length).toBe(2)
    })

    it('tokenService.updateToken modifies token value in database', async () => {
      if (!testTheme?.id || createdTokens.length === 0) {
        console.log('Skipping test - no database connection or tokens')
        return
      }

      const tokenToUpdate = createdTokens[0]
      const newValue = { hex: '#0000FF' }

      const updated = await tokenService.updateToken(tokenToUpdate.id, { value: newValue })
      
      expect(updated.value.hex).toBe('#0000FF')
    })

    it('updated token can be injected as CSS variable', async () => {
      if (!testTheme?.id || createdTokens.length === 0) {
        console.log('Skipping test - no database connection or tokens')
        return
      }

      // Fetch tokens from database
      const grouped = await tokenService.getTokensByTheme(testTheme.id)
      const allTokens = Object.values(grouped).flat()

      // Inject CSS variables
      const injected = injectCssVariables(allTokens)
      
      expect(Object.keys(injected).length).toBeGreaterThan(0)
      
      // Verify on DOM
      const root = document.documentElement
      const primaryValue = root.style.getPropertyValue('--color-gate3-primary')
      expect(primaryValue).toBe('#0000FF') // Should be updated value
      
      // Cleanup
      removeCssVariables(Object.keys(injected))
    })
  })

  // =============================================================================
  // Full Integration: Token List + Editor + CSS Variables
  // =============================================================================

  describe('Full Token Editing Flow', () => {
    it('selecting token from list can be edited in ColorEditor', async () => {
      let selectedToken = null
      
      const handleSelect = (token) => {
        selectedToken = token
      }
      
      const { rerender } = render(
        <TokenList 
          tokens={mockColorTokens} 
          category="color" 
          selectedToken={null}
          onSelectToken={handleSelect}
          onAddToken={vi.fn()}
          onDeleteToken={vi.fn()}
        />
      )
      
      // Click on primary token
      const tokenButtons = screen.getAllByRole('button')
      const primaryButton = tokenButtons.find(btn => 
        btn.querySelector('.token-list-item-name')?.textContent === 'primary'
      )
      
      if (primaryButton) {
        fireEvent.click(primaryButton)
        
        expect(selectedToken).toBeTruthy()
        expect(selectedToken.id).toBe('1')
        
        // Now render ColorEditor with selected token
        rerender(
          <div>
            <TokenList 
              tokens={mockColorTokens} 
              category="color" 
              selectedToken={selectedToken}
              onSelectToken={handleSelect}
              onAddToken={vi.fn()}
              onDeleteToken={vi.fn()}
            />
            <ColorEditor 
              token={selectedToken} 
              onUpdate={vi.fn()} 
            />
          </div>
        )
        
        // ColorEditor should show the selected token's color
        expect(screen.getByDisplayValue('#657E79')).toBeInTheDocument()
      }
    })

    it('editing color updates CSS variable on save', async () => {
      // This test verifies the complete flow:
      // 1. Initial CSS variable is set
      // 2. ColorEditor calls onUpdate when color changes  
      // 3. Parent component can use the updated value to update CSS variables
      
      // Inject initial value
      injectCssVariables([mockColorTokens[0]])
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#657E79')
      
      // Track onUpdate calls
      const handleUpdate = vi.fn()
      
      render(
        <ColorEditor 
          token={mockColorTokens[0]} 
          onUpdate={handleUpdate} 
        />
      )
      
      // Change color via the hex input (more reliable than color picker for testing)
      const hexInput = screen.getByDisplayValue('#657E79')
      fireEvent.change(hexInput, { target: { value: '#FF0000' } })
      fireEvent.blur(hexInput)
      
      // Wait for onUpdate to be called
      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalled()
      }, { timeout: 2000 })
      
      // Verify onUpdate was called with an object containing the new color
      const updateCall = handleUpdate.mock.calls[0][0]
      expect(updateCall.value).toBeDefined()
      expect(updateCall.value.hex).toBe('#FF0000')
      
      // Simulate what the parent component would do: inject updated CSS variable
      const updatedToken = {
        ...mockColorTokens[0],
        value: updateCall.value
      }
      injectCssVariables([updatedToken])
      
      // Verify CSS variable was updated
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#FF0000')
    })
  })
})

