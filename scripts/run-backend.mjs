#!/usr/bin/env node
/**
 * Helper script to launch the FastAPI backend in watch mode.
 * Spawns `python -m uvicorn server.app:app --reload`.
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve, delimiter, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

const PORT = process.env.DMX_PORT || process.env.PORT || '8080'
const HOST = process.env.DMX_HOST || '0.0.0.0'

const pythonCandidates = []

const possibleVenv =
  process.env.VIRTUAL_ENV && existsSync(process.env.VIRTUAL_ENV)
    ? process.env.VIRTUAL_ENV
    : resolve(repoRoot, '.venv')

const venvPython =
  process.platform === 'win32'
    ? join(possibleVenv, 'Scripts', 'python.exe')
    : join(possibleVenv, 'bin', 'python')

if (existsSync(venvPython)) {
  pythonCandidates.push(venvPython)
}

pythonCandidates.push(
  process.env.PYTHON,
  process.env.PY,
  process.platform === 'win32' ? 'py' : null,
  'python3',
  'python'
)

const pythonCmd = pythonCandidates.find((candidate) => {
  if (!candidate) {
    return false
  }
  if (candidate.includes('/') || candidate.includes('\\')) {
    return existsSync(candidate)
  }
  return true
})

if (!pythonCmd) {
  console.error('[backend] Unable to locate a Python interpreter (set PYTHON env var).')
  process.exit(1)
}

const args = ['-m', 'uvicorn', 'server.app:app', '--host', HOST, '--port', PORT, '--reload']
const finalArgs = pythonCmd === 'py' ? ['-3', ...args] : args

const envPythonPath = process.env.PYTHONPATH
const child = spawn(
  pythonCmd,
  finalArgs,
  {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      PYTHONPATH: envPythonPath ? `${repoRoot}${delimiter}${envPythonPath}` : repoRoot,
    },
  }
)

child.on('error', (error) => {
  console.error('[backend] Failed to start Python process:', error.message)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`[backend] Backend exited due to signal ${signal}`)
    process.exit(1)
  }
  process.exit(code ?? 0)
})
