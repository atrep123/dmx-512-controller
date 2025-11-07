import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { realpathSync } from 'fs'

const realRoot = realpathSync(process.cwd())
if (realRoot !== process.cwd()) {
  process.chdir(realRoot)
}

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(realRoot, 'src'),
    },
  },
})
