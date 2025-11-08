#!/usr/bin/env node
/**
 * Generate a Tauri-compatible release manifest for a given channel.
 *
 * Usage:
 *   node desktop/scripts/create-release-json.mjs --channel stable --version 1.2.3 --tag desktop-v1.2.3
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

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
const signature = process.env.TAURI_UPDATE_SIGNATURE || 'REPLACE_WITH_SIGNATURE'

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

createManifest().catch((error) => {
  console.error('[desktop-release] failed to create manifest:', error)
  process.exitCode = 1
})
