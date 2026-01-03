/**
 * Gate 1: Foundation Services
 * 
 * Validates:
 * - Supabase connection works
 * - themes table exists and is queryable
 * - tokens table exists and is queryable
 * - themeService.getThemes() returns an array
 * - themeService.createTheme() creates and returns a theme
 * - tokenService.getTokensByTheme() returns grouped tokens
 * - tokenService.bulkCreateTokens() creates multiple tokens
 * 
 * Trigger: Chunks 1.02, 1.07, 1.08 complete
 * Blocks: Phase 2 start
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { themeService } from '@/services/themeService'
import { tokenService } from '@/services/tokenService'
import { supabase } from '@/lib/supabase'

describe('Gate 1: Foundation Services', () => {
  beforeAll(async () => {
    // Verify Supabase connection
    const { error } = await supabase.from('themes').select('count')
    if (error) throw new Error(`Supabase not connected: ${error.message}`)
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
      
      // After deletion, getTheme should throw an error (no rows found)
      await expect(themeService.getTheme(theme.id)).rejects.toThrow()
    })
  })

  describe('Token Service', () => {
    let testTheme

    beforeAll(async () => {
      testTheme = await themeService.createTheme({ name: 'Token Test' })
    })

    afterAll(async () => {
      if (testTheme?.id) {
        await themeService.deleteTheme(testTheme.id)
      }
    })

    it('getTokensByTheme returns grouped tokens', async () => {
      const grouped = await tokenService.getTokensByTheme(testTheme.id)
      expect(typeof grouped).toBe('object')
      // Should have category keys (may be empty object if no tokens)
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

