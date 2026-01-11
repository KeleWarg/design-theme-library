import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Load env vars for tests from a committed, sandbox-readable location.
  // This avoids Vitest/Vite trying to read the developer’s ignored `.env.local`.
  envDir: './tests/env',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}', 'tests/**/*.test.{js,jsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})


