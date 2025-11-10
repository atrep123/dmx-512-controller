#!/usr/bin/env node
/**
 * Cross-platform helper that mirrors scripts\build-server-exe.bat.
 * Usage: node scripts/build-server-exe.mjs
 */
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { mkdir, copyFile } from 'node:fs/promises'
import fs from 'node:fs'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function run(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: projectRoot,
      ...options,
    })
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise()
      } else {
        rejectPromise(new Error(`Command "${command} ${args.join(' ')}" failed with exit code ${code}`))
      }
    })
  })
}

const pip = ['-m', 'pip']
async function ensureDeps() {
  console.log('[build-server-exe] Upgrading pip…')
  await run('python', [...pip, 'install', '--upgrade', 'pip'])
  console.log('[build-server-exe] Installing backend requirements…')
  await run('python', [...pip, 'install', '-r', 'server/requirements.txt'])
}

async function buildPyInstaller() {
  console.log('[build-server-exe] Running PyInstaller…')
  const dist = join('server', 'dist')
  const build = join('server', 'build')
  const spec = join('server', 'desktop.spec')
  await run('python', [
    '-m',
    'PyInstaller',
    '--noconfirm',
    '--clean',
    '--distpath',
    dist,
    '--workpath',
    build,
    spec,
  ])
}

async function syncSidecar() {
  const source = join(projectRoot, 'server', 'dist', 'dmx-backend.exe')
  const targetDir = join(projectRoot, 'desktop', 'src-tauri', 'resources', 'bin')
  if (!fs.existsSync(source)) {
    throw new Error(`Expected PyInstaller artifact at ${source}`)
  }
  await mkdir(targetDir, { recursive: true })
  await copyFile(source, join(targetDir, 'dmx-backend.exe'))
  console.log(`[build-server-exe] Synced ${source} -> ${targetDir}`)
}

try {
  await ensureDeps()
  await buildPyInstaller()
  await syncSidecar()
  console.log('[build-server-exe] Done.')
} catch (error) {
  console.error('[build-server-exe] Failed:', error.message)
  process.exitCode = 1
}
