#!/usr/bin/env node
/* eslint-env node */
/**
 * Generates Android/Chrome PWA icon PNGs from public/icon.svg.
 */
import path from "node:path";
import fs from "node:fs";
import sharp from "sharp";

const projectRoot = path.resolve(process.cwd());
const sourceSvg = path.join(projectRoot, "public", "icon.svg");
const outputDir = path.join(projectRoot, "public", "icons");

const targets = [
  { size: 192, name: "android-chrome-192x192.png" },
  { size: 256, name: "android-chrome-256x256.png" },
  { size: 384, name: "android-chrome-384x384.png" },
  { size: 512, name: "android-chrome-512x512.png" },
  { size: 1024, name: "android-chrome-1024x1024.png" },
];

if (!fs.existsSync(sourceSvg)) {
  console.error(`[pwa-icons] Missing source SVG at ${sourceSvg}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const tasks = targets.map(async ({ size, name }) => {
  const dest = path.join(outputDir, name);
  await sharp(sourceSvg, { density: 512 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log(`[pwa-icons] Generated ${name}`);
});

Promise.all(tasks)
  .then(() => {
    console.log(`[pwa-icons] Done. Assets in ${outputDir}`);
  })
  .catch((error) => {
    console.error("[pwa-icons] Failed:", error);
    process.exitCode = 1;
  });
