#!/usr/bin/env node
/**
 * Copies the root Vite build (../dist) into Tauri's resource directory.
 * Run `npm run build` at repo root first.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const src = path.join(root, "dist");
const dest = path.join(process.cwd(), "src-tauri", "resources", "app");

if (!fs.existsSync(src)) {
  console.error(
    `[copy-dist] Missing build output at ${src}. Run "npm run build" in repo root first.`,
  );
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

function copyRecursive(source, target) {
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
  } else {
    fs.copyFileSync(source, target);
  }
}

copyRecursive(src, dest);
console.log(`[copy-dist] Copied ${src} -> ${dest}`);
