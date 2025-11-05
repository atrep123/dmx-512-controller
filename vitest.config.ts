import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { realpathSync } from 'fs'
const setupFile = realpathSync(fileURLToPath(new URL('./src/test/setup.ts', import.meta.url)))

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [setupFile],
        clearMocks: true,
        coverage: {
            reporter: ['text', 'lcov'],
        },
        sequence: {
            concurrent: false,
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
})
