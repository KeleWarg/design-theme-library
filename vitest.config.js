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
    // In some sandboxed environments, the default pool (forks) can fail to terminate cleanly,
    // causing noisy unhandled rejections. Threads + singleThread is more stable here.
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})


