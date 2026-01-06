/**
 * aiService Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('aiService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Ensure localStorage exists in test env
    const store = {}
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => {
          store[k] = String(v)
        },
        removeItem: (k) => {
          delete store[k]
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k])
        },
      },
      writable: true,
    })
  })

  it('treats ds-admin-claude-key as configured', async () => {
    window.localStorage.setItem('ds-admin-claude-key', 'test-key')

    // Import after localStorage setup
    const { aiService } = await import('../../src/services/aiService')
    expect(aiService.isConfigured()).toBe(true)
  })
})


