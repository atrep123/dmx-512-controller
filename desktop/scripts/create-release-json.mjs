#!/usr/bin/env node
/* eslint-env node */
import process from 'node:process'
import console from 'node:console'
/**
 * Generate a Tauri-compatible release manifest for a given channel.
 *
 * Usage:
 *   node desktop/scripts/create-release-json.mjs --channel stable --version 1.2.3 --tag desktop-v1.2.3
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { spawn } from 'node:child_process'

const args = process.argv.slice(2)
const getArg = (flag, fallback) => {
  const index = args.indexOf(flag)
  if (index !== -1 && args[index + 1]) return args[index + 1]
  return fallback
}

const channel = getArg('--channel', process.env.RELEASE_CHANNEL || 'stable')
const version = getArg('--version', process.env.RELEASE_VERSION || '0.0.0')
const tag =
  getArg('--tag', process.env.GITHUB_REF_NAME) ||
  (version.startsWith('desktop-v') ? version : `desktop-v${version}`)
const repo = process.env.GITHUB_REPOSITORY || 'atrep123/dmx-512-controller'
const downloadBase =
  getArg('--download-base', `https://github.com/${repo}/releases/download/${tag}`) || ''
const notes = process.env.RELEASE_NOTES || ''
const privateKeyEnv = process.env.TAURI_SIGNING_PRIVATE_KEY || ''
const privateKeyPathArg = getArg('--private-key', process.env.TAURI_SIGNING_PRIVATE_KEY_PATH)
const privateKeyPassword = getArg('--private-key-password', process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD)

const bundleRoot = path.resolve('desktop', 'src-tauri', 'target', 'release', 'bundle')

const findBinary = async (dir, extension) => {
  const entries = await fs.readdir(dir)
  const file = entries.find((entry) => entry.toLowerCase().endsWith(extension.toLowerCase()))
  if (!file) {
    throw new Error(`No *${extension} artifact found in ${dir}`)
  }
  return path.join(dir, file)
}

const createManifest = async () => {
  const msiPath = await findBinary(path.join(bundleRoot, 'msi'), '.msi')
  const nsisPath = await findBinary(path.join(bundleRoot, 'nsis'), '.exe')

  const signature = await resolveSignature(nsisPath)

  const manifest = {
    version,
    notes,
    pub_date: new Date().toISOString(),
    platforms: {
      'windows-x86_64': {
        signature,
        url: `${downloadBase}/${path.basename(nsisPath)}`,
        installer: {
          exe: `${downloadBase}/${path.basename(nsisPath)}`,
          msi: `${downloadBase}/${path.basename(msiPath)}`,
        },
      },
    },
  }

  const outDir = path.resolve('dist', 'desktop')
  await fs.mkdir(outDir, { recursive: true })
  const outPath = path.join(outDir, `${channel}-release.json`)
  await fs.writeFile(outPath, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`[desktop-release] wrote ${outPath}`)
}

async function resolveSignature(artifactPath) {
  const keyPath = await resolvePrivateKeyPath()
  if (!keyPath) {
    throw new Error(
      'Missing signing key. Provide --private-key, TAURI_SIGNING_PRIVATE_KEY_PATH, or TAURI_SIGNING_PRIVATE_KEY.'
    )
  }
  const signature = await runSigner(artifactPath, keyPath)
  return signature
}

async function resolvePrivateKeyPath() {
  if (privateKeyPathArg) {
    return path.resolve(privateKeyPathArg)
  }
  if (!privateKeyEnv) {
    return null
  }
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'tauri-signing-'))
  const keyPath = path.join(tempDir, 'signing.key')
  await fs.writeFile(keyPath, Buffer.from(privateKeyEnv.trim(), 'base64'))
  cleanupTasks.push(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
  })
  return keyPath
}

async function runSigner(artifactPath, keyPath) {
  const isWin = process.platform === 'win32'
  const cmd = isWin ? 'npx.cmd' : 'npx'
  const signerArgs = ['--yes', 'tauri', 'signer', 'sign', '--private-key', keyPath]
  if (privateKeyPassword) {
    signerArgs.push('--password', privateKeyPassword)
  }
  signerArgs.push(artifactPath)
  const { stdout } = await execCommand(cmd, signerArgs)
  const match = stdout.split('\n').find((line) => line.toLowerCase().includes('signature'))
  if (!match) {
    throw new Error(`Unable to parse signature from signer output:\n${stdout}`)
  }
  const value = match.split(':').pop()?.trim()
  if (!value) {
    throw new Error(`Signer output did not contain a signature line: ${stdout}`)
  }
  return value
}

function execCommand(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        reject(
          new Error(
            `Command "${command} ${commandArgs.join(' ')}" failed with exit code ${code}\n${stderr || stdout}`
          )
        )
      }
    })
  })
}

const cleanupTasks = []

createManifest()
  .catch((error) => {
    console.error('[desktop-release] failed to create manifest:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await Promise.allSettled(cleanupTasks.map((fn) => fn()))
})
