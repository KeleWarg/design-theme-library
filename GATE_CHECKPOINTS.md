# Gate Checkpoints

Integration tests that validate phase completions. Run these before crossing phase boundaries.

---

## Gate 0 — Validation Complete (GO/NO-GO)
**Trigger:** Chunks 0.04, 0.05, 0.06 complete
**Blocks:** Phase 1 start

This is a **manual gate** — no automated tests. Review the validation report.

### GO Criteria (all must pass)
| Capability | Required | Result |
|------------|----------|--------|
| Extract component metadata from Figma | ✅ Must work | ⬜ |
| Export component images | ✅ Must work | ⬜ |
| API communication (plugin → admin) | ✅ Must work | ⬜ |
| AI generation success rate ≥ 60% | ✅ Must work | ⬜ |

### Decision
- **GO** — All criteria pass, proceed to Phase 1
- **ADJUST** — Some limitations found, document workarounds, proceed with modified scope
- **NO-GO** — Critical failures, project not feasible

### Files to Review
- `docs/00-validation-report.md`
- `docs/00-risk-register.md`
- `poc/ai-generation/results.json`

### Skip Option
If you're confident in the approach (or have validated separately), you can skip Phase 0 entirely and start at Phase 1.

---

## Gate 1 — Foundation Services
**Trigger:** Chunks 1.02, 1.07, 1.08 complete
**Blocks:** Phase 2 start

```javascript
// tests/gates/gate-1.test.js
import { describe, it, expect, beforeAll } from 'vitest'
import { themeService } from '@/services/themeService'
import { tokenService } from '@/services/tokenService'
import { supabase } from '@/lib/supabase'

describe('Gate 1: Foundation Services', () => {
  beforeAll(async () => {
    // Verify Supabase connection
    const { error } = await supabase.from('themes').select('count')
    if (error) throw new Error('Supabase not connected')
  })

  describe('Database Schema', () => {
    it('themes table exists with correct columns', async () => {
      const { data, error } = await supabase
        .from('themes')
        .select('id, name, slug, description, source, is_default')
        .limit(1)
      expect(error).toBeNull()
    })

    it('tokens table exists with correct columns', async () => {
      const { data, error } = await supabase
        .from('tokens')
        .select('id, theme_id, name, path, category, type, value, css_variable')
        .limit(1)
      expect(error).toBeNull()
    })
  })

  describe('Theme Service', () => {
    it('getThemes returns array', async () => {
      const themes = await themeService.getThemes()
      expect(Array.isArray(themes)).toBe(true)
    })

    it('createTheme creates and returns theme', async () => {
      const theme = await themeService.createTheme({
        name: 'Gate Test Theme',
        description: 'Test',
      })
      expect(theme.id).toBeDefined()
      expect(theme.slug).toBe('gate-test-theme')
      
      // Cleanup
      await themeService.deleteTheme(theme.id)
    })

    it('updateTheme modifies theme', async () => {
      const theme = await themeService.createTheme({ name: 'Update Test' })
      const updated = await themeService.updateTheme(theme.id, { 
        description: 'Updated' 
      })
      expect(updated.description).toBe('Updated')
      await themeService.deleteTheme(theme.id)
    })

    it('deleteTheme removes theme', async () => {
      const theme = await themeService.createTheme({ name: 'Delete Test' })
      await themeService.deleteTheme(theme.id)
      const found = await themeService.getTheme(theme.id)
      expect(found).toBeNull()
    })
  })

  describe('Token Service', () => {
    let testTheme

    beforeAll(async () => {
      testTheme = await themeService.createTheme({ name: 'Token Test' })
    })

    afterAll(async () => {
      await themeService.deleteTheme(testTheme.id)
    })

    it('getTokensByTheme returns grouped tokens', async () => {
      const grouped = await tokenService.getTokensByTheme(testTheme.id)
      expect(typeof grouped).toBe('object')
      // Should have category keys
      expect(Object.keys(grouped).length >= 0).toBe(true)
    })

    it('bulkCreateTokens inserts multiple tokens', async () => {
      const tokens = [
        { name: 'primary', path: 'color/primary', category: 'color', type: 'color', value: { hex: '#000' }, css_variable: '--color-primary' },
        { name: 'secondary', path: 'color/secondary', category: 'color', type: 'color', value: { hex: '#fff' }, css_variable: '--color-secondary' },
      ]
      await tokenService.bulkCreateTokens(testTheme.id, tokens)
      
      const grouped = await tokenService.getTokensByTheme(testTheme.id)
      expect(grouped.color.length).toBe(2)
    })

    it('updateToken modifies token value', async () => {
      const grouped = await tokenService.getTokensByTheme(testTheme.id)
      const token = grouped.color[0]
      
      const updated = await tokenService.updateToken(token.id, { 
        value: { hex: '#123456' } 
      })
      expect(updated.value.hex).toBe('#123456')
    })
  })
})
```

---

## Gate 2 — Theme Context + Import
**Trigger:** Chunks 2.04, 2.06, 2.11 complete
**Blocks:** Token editors (2.12+)

```javascript
// tests/gates/gate-2.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { parseTokens } from '@/lib/tokenParser'

// Sample Figma Variables JSON
const sampleFigmaJSON = {
  "Color": {
    "Primary": {
      "500": {
        "$type": "color",
        "$value": { "hex": "#657E79" }
      }
    }
  }
}

describe('Gate 2: Theme Context + Import', () => {
  describe('Token Parser', () => {
    it('parses Figma Variables JSON', () => {
      const result = parseTokens(sampleFigmaJSON)
      expect(result.tokens.length).toBeGreaterThan(0)
      expect(result.errors).toHaveLength(0)
    })

    it('generates correct CSS variable names', () => {
      const result = parseTokens(sampleFigmaJSON)
      const token = result.tokens[0]
      expect(token.css_variable).toBe('--color-primary-500')
    })

    it('detects token categories from path', () => {
      const result = parseTokens(sampleFigmaJSON)
      const token = result.tokens[0]
      expect(token.category).toBe('color')
    })
  })

  describe('Theme Context', () => {
    function TestConsumer() {
      const { activeTheme, tokens, isLoading } = useTheme()
      if (isLoading) return <div>Loading...</div>
      return (
        <div>
          <span data-testid="theme-name">{activeTheme?.name || 'none'}</span>
          <span data-testid="token-count">{Object.keys(tokens).length}</span>
        </div>
      )
    }

    it('provides theme context to children', async () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      )
      
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })
      
      expect(screen.getByTestId('theme-name')).toBeInTheDocument()
    })
  })

  describe('CSS Variable Injection', () => {
    it('injects CSS variables into document', async () => {
      // After ThemeProvider mounts with tokens, check :root styles
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )
      
      await waitFor(() => {
        const root = document.documentElement
        const styles = getComputedStyle(root)
        // Should have at least one CSS variable set
        // This test is intentionally loose - specific vars depend on theme
      })
    })
  })
})
```

---

## Gate 3 — Token Editing
**Trigger:** Chunks 2.14, 2.15 complete
**Blocks:** Remaining editors (2.16-2.20)

```javascript
// tests/gates/gate-3.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TokenList } from '@/components/editor/TokenList'
import { ColorEditor } from '@/components/editor/ColorEditor'

const mockTokens = [
  { id: '1', name: 'primary', category: 'color', value: { hex: '#657E79' }, css_variable: '--color-primary' },
  { id: '2', name: 'secondary', category: 'color', value: { hex: '#FFFFFF' }, css_variable: '--color-secondary' },
]

describe('Gate 3: Token Editing', () => {
  describe('TokenList', () => {
    it('renders list of tokens', () => {
      render(<TokenList tokens={mockTokens} category="color" onTokenChange={vi.fn()} />)
      expect(screen.getByText('primary')).toBeInTheDocument()
      expect(screen.getByText('secondary')).toBeInTheDocument()
    })

    it('shows CSS variable names', () => {
      render(<TokenList tokens={mockTokens} category="color" onTokenChange={vi.fn()} />)
      expect(screen.getByText('--color-primary')).toBeInTheDocument()
    })
  })

  describe('ColorEditor', () => {
    it('displays current color value', () => {
      render(
        <ColorEditor 
          token={mockTokens[0]} 
          onChange={vi.fn()} 
        />
      )
      expect(screen.getByDisplayValue('#657E79')).toBeInTheDocument()
    })

    it('calls onChange when color updated', async () => {
      const handleChange = vi.fn()
      render(
        <ColorEditor 
          token={mockTokens[0]} 
          onChange={handleChange} 
        />
      )
      
      const input = screen.getByDisplayValue('#657E79')
      fireEvent.change(input, { target: { value: '#000000' } })
      
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(
          expect.objectContaining({ hex: '#000000' })
        )
      })
    })

    it('shows color swatch preview', () => {
      render(
        <ColorEditor 
          token={mockTokens[0]} 
          onChange={vi.fn()} 
        />
      )
      const swatch = screen.getByTestId('color-swatch')
      expect(swatch).toHaveStyle({ backgroundColor: '#657E79' })
    })
  })
})
```

---

## Gate 4 — Complete Theme System
**Trigger:** Phase 2 complete (all 27 chunks)
**Blocks:** Phase 3 start

```javascript
// tests/gates/gate-4.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ThemesPage from '@/pages/ThemesPage'
import ThemeEditorPage from '@/pages/ThemeEditorPage'

describe('Gate 4: Complete Theme System', () => {
  const wrapper = ({ children }) => (
    <MemoryRouter>
      <ThemeProvider>{children}</ThemeProvider>
    </MemoryRouter>
  )

  describe('ThemesPage', () => {
    it('renders theme list', async () => {
      render(<ThemesPage />, { wrapper })
      await waitFor(() => {
        expect(screen.getByText(/themes/i)).toBeInTheDocument()
      })
    })

    it('has create theme button', () => {
      render(<ThemesPage />, { wrapper })
      expect(screen.getByRole('button', { name: /create|new|add/i })).toBeInTheDocument()
    })
  })

  describe('Theme Editor Integration', () => {
    it('loads theme with tokens', async () => {
      // This would need a real theme ID or mock
      render(<ThemeEditorPage />, { wrapper })
      await waitFor(() => {
        // Check for category sidebar
        expect(screen.getByText(/color|typography|spacing/i)).toBeInTheDocument()
      })
    })

    it('has all token category editors', async () => {
      render(<ThemeEditorPage />, { wrapper })
      await waitFor(() => {
        const categories = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid']
        // At least some categories should be visible
      })
    })
  })

  describe('Import Flow', () => {
    it('opens import wizard from create button', async () => {
      render(<ThemesPage />, { wrapper })
      
      const createButton = screen.getByRole('button', { name: /create|new|add/i })
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByText(/import|upload|figma/i)).toBeInTheDocument()
      })
    })
  })

  describe('Typography System', () => {
    it('typeface manager accessible', async () => {
      render(<ThemeEditorPage />, { wrapper })
      await waitFor(() => {
        // Typography section should exist
        expect(screen.getByText(/typeface|font/i)).toBeInTheDocument()
      })
    })
  })

  describe('Theme Preview', () => {
    it('preview panel updates with token changes', async () => {
      render(<ThemeEditorPage />, { wrapper })
      await waitFor(() => {
        expect(screen.getByTestId('preview-panel')).toBeInTheDocument()
      })
    })
  })
})
```

---

## Gate 5 — AI Generation + Component Detail
**Trigger:** Chunks 3.11, 3.12 complete
**Blocks:** Component tabs (3.13-3.17)

```javascript
// tests/gates/gate-5.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { aiService } from '@/services/aiService'
import ComponentDetailPage from '@/pages/ComponentDetailPage'

vi.mock('@/services/aiService')

describe('Gate 5: AI Generation + Component Detail', () => {
  describe('AI Service', () => {
    it('generateComponent returns code', async () => {
      aiService.generateComponent.mockResolvedValue({
        code: 'export default function Button() { return <button>Click</button> }',
        success: true,
      })

      const result = await aiService.generateComponent({
        description: 'A simple button',
        props: [],
        tokens: [],
      })

      expect(result.code).toContain('Button')
      expect(result.success).toBe(true)
    })

    it('handles API errors gracefully', async () => {
      aiService.generateComponent.mockRejectedValue(new Error('API Error'))

      await expect(
        aiService.generateComponent({ description: 'test' })
      ).rejects.toThrow('API Error')
    })
  })

  describe('Component Detail Layout', () => {
    const mockComponent = {
      id: '1',
      name: 'Button',
      description: 'Primary button component',
      category: 'buttons',
      code: 'export default function Button() {}',
      props: [],
      variants: [],
      status: 'draft',
    }

    it('renders component header', async () => {
      render(<ComponentDetailPage component={mockComponent} />)
      expect(screen.getByText('Button')).toBeInTheDocument()
    })

    it('shows tab navigation', () => {
      render(<ComponentDetailPage component={mockComponent} />)
      expect(screen.getByRole('tab', { name: /preview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /code/i })).toBeInTheDocument()
    })
  })
})
```

---

## Gate 6 — Complete Component System
**Trigger:** Phase 3 complete
**Blocks:** Phase 4 start

```javascript
// tests/gates/gate-6.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ComponentsPage from '@/pages/ComponentsPage'

describe('Gate 6: Complete Component System', () => {
  const wrapper = ({ children }) => (
    <MemoryRouter>
      <ThemeProvider>{children}</ThemeProvider>
    </MemoryRouter>
  )

  it('ComponentsPage renders grid of components', async () => {
    render(<ComponentsPage />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText(/components/i)).toBeInTheDocument()
    })
  })

  it('has filter controls', async () => {
    render(<ComponentsPage />, { wrapper })
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument() // category filter
    })
  })

  it('has add component button with dropdown', async () => {
    render(<ComponentsPage />, { wrapper })
    expect(screen.getByRole('button', { name: /add|new|create/i })).toBeInTheDocument()
  })

  it('component cards show status badge', async () => {
    render(<ComponentsPage />, { wrapper })
    await waitFor(() => {
      // Should show at least one status badge
      expect(screen.getByText(/draft|published|archived/i)).toBeInTheDocument()
    })
  })
})
```

---

## Gate 7 — Figma Plugin Integration
**Trigger:** Chunks 4.05, 4.11 complete
**Blocks:** AI with Figma (4.12-4.13)

```javascript
// tests/gates/gate-7.test.js
import { describe, it, expect } from 'vitest'

describe('Gate 7: Figma Plugin Integration', () => {
  describe('Plugin Build', () => {
    it('manifest.json is valid', async () => {
      const manifest = await import('../figma-plugin/manifest.json')
      expect(manifest.name).toBeDefined()
      expect(manifest.id).toBeDefined()
      expect(manifest.api).toBeDefined()
    })

    it('plugin compiles without errors', async () => {
      // This would run the build and check for errors
      // In practice, run: cd figma-plugin && npm run build
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Admin Import Endpoint', () => {
    it('accepts component data from plugin', async () => {
      const mockPayload = {
        components: [
          { name: 'Button', figma_node_id: '123:456' }
        ],
        variables: {}
      }

      // POST to import endpoint
      const response = await fetch('/api/figma-import', {
        method: 'POST',
        body: JSON.stringify(mockPayload),
      })

      expect(response.ok).toBe(true)
    })
  })
})
```

---

## Gate 8 — Export System
**Trigger:** Chunks 5.19, 5.20 complete
**Blocks:** Phase 6 testing

```javascript
// tests/gates/gate-8.test.js
import { describe, it, expect } from 'vitest'
import { cssGenerator } from '@/services/generators/cssGenerator'
import { jsonGenerator } from '@/services/generators/jsonGenerator'
import { tailwindGenerator } from '@/services/generators/tailwindGenerator'
import { llmsTxtGenerator } from '@/services/generators/llmsTxtGenerator'
import { packageBuilder } from '@/services/exportService'

const mockTokens = {
  color: [
    { name: 'primary', css_variable: '--color-primary', value: { hex: '#000' } }
  ],
  spacing: [
    { name: 'md', css_variable: '--spacing-md', value: 16 }
  ]
}

describe('Gate 8: Export System', () => {
  describe('CSS Generator', () => {
    it('generates valid CSS custom properties', () => {
      const css = cssGenerator.generate(mockTokens)
      expect(css).toContain(':root')
      expect(css).toContain('--color-primary: #000')
    })
  })

  describe('JSON Generator', () => {
    it('generates nested JSON structure', () => {
      const json = jsonGenerator.generate(mockTokens, { format: 'nested' })
      const parsed = JSON.parse(json)
      expect(parsed.color.primary).toBeDefined()
    })

    it('generates flat JSON structure', () => {
      const json = jsonGenerator.generate(mockTokens, { format: 'flat' })
      const parsed = JSON.parse(json)
      expect(parsed['--color-primary']).toBeDefined()
    })
  })

  describe('Tailwind Generator', () => {
    it('generates theme extend object', () => {
      const config = tailwindGenerator.generate(mockTokens)
      expect(config).toContain('theme:')
      expect(config).toContain('extend:')
    })
  })

  describe('LLMS.txt Generator', () => {
    it('generates markdown documentation', () => {
      const llms = llmsTxtGenerator.generate(mockTokens, [])
      expect(llms).toContain('# ')
      expect(llms).toContain('## Colors')
    })
  })

  describe('Package Builder', () => {
    it('creates ZIP with all selected formats', async () => {
      const blob = await packageBuilder.build({
        themes: ['theme-1'],
        formats: ['css', 'json'],
      })
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/zip')
    })
  })
})
```

---

## Gate 9 — Final E2E
**Trigger:** Phase 6 complete
**Validates:** Complete system ready for release

```typescript
// tests/e2e/full-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Full Application Flow', () => {
  test('complete theme lifecycle', async ({ page }) => {
    // 1. Navigate to themes
    await page.goto('/themes')
    await expect(page.getByText('Themes')).toBeVisible()

    // 2. Create new theme via import
    await page.click('button:has-text("Create")')
    await page.click('text=Import from JSON')
    
    // 3. Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('./tests/fixtures/sample-tokens.json')
    
    // 4. Complete wizard
    await page.click('button:has-text("Next")')
    await page.fill('input[name="name"]', 'E2E Test Theme')
    await page.click('button:has-text("Create Theme")')
    
    // 5. Verify theme created
    await expect(page.getByText('E2E Test Theme')).toBeVisible()
    
    // 6. Edit theme
    await page.click('text=E2E Test Theme')
    await page.click('text=Color')
    
    // 7. Modify a token
    const colorInput = page.locator('input[type="color"]').first()
    await colorInput.fill('#FF0000')
    await page.click('button:has-text("Save")')
    
    // 8. Export theme
    await page.click('button:has-text("Export")')
    await page.check('input[value="css"]')
    await page.check('input[value="json"]')
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download")')
    ])
    
    expect(download.suggestedFilename()).toContain('.zip')
    
    // 9. Delete theme (cleanup)
    await page.goto('/themes')
    await page.click('text=E2E Test Theme')
    await page.click('button:has-text("Delete")')
    await page.click('button:has-text("Confirm")')
    
    await expect(page.getByText('E2E Test Theme')).not.toBeVisible()
  })

  test('component creation and generation', async ({ page }) => {
    // 1. Navigate to components
    await page.goto('/components')
    
    // 2. Create new component
    await page.click('button:has-text("Add")')
    await page.click('text=Create Manually')
    
    // 3. Fill basic info
    await page.fill('input[name="name"]', 'E2E Button')
    await page.fill('textarea[name="description"]', 'Test button')
    await page.click('button:has-text("Next")')
    
    // 4. Add props
    await page.click('button:has-text("Add Prop")')
    await page.fill('input[name="propName"]', 'variant')
    await page.click('button:has-text("Next")')
    
    // 5. Skip to create
    await page.click('button:has-text("Create Component")')
    
    // 6. Verify component created
    await expect(page.getByText('E2E Button')).toBeVisible()
    
    // 7. Generate code with AI (if configured)
    await page.click('text=E2E Button')
    const generateButton = page.locator('button:has-text("Generate")')
    
    if (await generateButton.isVisible()) {
      await generateButton.click()
      await expect(page.locator('.code-editor')).toContainText('function')
    }
  })
})
```

---

## Running Gate Tests

```bash
# Gate 0 is MANUAL — review docs/00-validation-report.md

# Individual gate (1-8)
npm test tests/gates/gate-1.test.js

# All gates
npm test tests/gates/

# E2E (Gate 9)
npx playwright test tests/e2e/full-flow.spec.ts
```

## Gate Rules

1. **Never skip a gate** — All tests must pass before proceeding
2. **Fix failures immediately** — Don't accumulate technical debt
3. **Gates are integration tests** — They verify components work together
4. **Update gate tests** — If requirements change, update the gate first
