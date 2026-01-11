# Test env directory

Vitest/Vite is configured to use `envDir: ./tests/env` so it **does not attempt to read** the developer’s ignored root `.env.local` (which is blocked in sandboxed runs).

Environment values needed by tests are set in `src/test/setup.js`.


