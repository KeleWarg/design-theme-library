/**
 * ThemeContext startup selection tests
 *
 * Ensures startup theme selection is deterministic and respects user preference.
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Vitest hoists `vi.mock` calls, so anything referenced inside the mock factories
// must be created via `vi.hoisted` to avoid init-order recursion.
const { mockThemeService, mockLoadThemeFonts } = vi.hoisted(() => ({
  mockThemeService: {
    getThemes: vi.fn(),
    getTheme: vi.fn(),
  },
  mockLoadThemeFonts: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../src/services/themeService', () => ({ themeService: mockThemeService }))
vi.mock('../../src/lib/fontLoader', () => ({ loadThemeFonts: mockLoadThemeFonts }))

import { ThemeProvider, useThemeContext } from '../../src/contexts/ThemeContext'

function Consumer() {
  const { isLoading, activeTheme } = useThemeContext()
  if (isLoading) return <div data-testid="loading">loading</div>
  return <div data-testid="active-theme">{activeTheme?.name || 'none'}</div>
}

describe('ThemeContext startup theme selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    mockThemeService.getTheme.mockImplementation(async (id) => ({
      id,
      name: `Theme ${id}`,
      tokens: [],
      typefaces: [],
      typography_roles: [],
    }))
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('prefers Settings defaultTheme (localStorage) over DB is_default', async () => {
    const themes = [
      { id: 'a', name: 'DB Default', is_default: true },
      { id: 'b', name: 'User Preferred', is_default: false },
    ]
    mockThemeService.getThemes.mockResolvedValue(themes)
    localStorage.setItem('ds-admin-default-theme', 'b')

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('active-theme').textContent).toBe('Theme b')
  })

  it('falls back to DB is_default if Settings defaultTheme is missing/invalid (and clears it)', async () => {
    const themes = [
      { id: 'a', name: 'DB Default', is_default: true },
      { id: 'b', name: 'Other', is_default: false },
    ]
    mockThemeService.getThemes.mockResolvedValue(themes)
    localStorage.setItem('ds-admin-default-theme', 'missing-theme-id')

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('active-theme').textContent).toBe('Theme a')
    expect(localStorage.getItem('ds-admin-default-theme')).toBe(null)
  })

  it('uses stable deterministic fallback (name asc) when no Settings default and no DB default', async () => {
    const themes = [
      { id: 'z', name: 'Zeta', is_default: false },
      { id: 'a', name: 'Alpha', is_default: false },
      { id: 'm', name: 'Mango', is_default: false },
    ]
    mockThemeService.getThemes.mockResolvedValue(themes)

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    // Alpha should win the fallback
    expect(screen.getByTestId('active-theme').textContent).toBe('Theme a')
  })
})


