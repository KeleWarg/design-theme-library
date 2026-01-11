/**
 * @chunk 1.11 - App Shell & Routing
 * Test setup for Vitest
 */
import '@testing-library/jest-dom'

// Provide stable env values for tests so modules that read `import.meta.env.*`
// (via Vite loadEnv) have something to work with in sandboxed runs.
//
// Note: Vitest will still use Vite's env system, but setting these here ensures
// any code that falls back to process.env (or expects values to exist) doesn't break.
process.env.VITE_SUPABASE_URL ||= 'http://localhost:54321'
process.env.VITE_SUPABASE_ANON_KEY ||= 'test-anon-key'
process.env.VITE_CLAUDE_API_KEY ||= 'test-claude-key'


