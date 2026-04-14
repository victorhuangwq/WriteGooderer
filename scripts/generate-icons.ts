// Simple script to generate SVG icon files for the extension
// Run: npx tsx scripts/generate-icons.ts

import { writeFileSync } from "fs";

function generateSVG(size: number): string {
  const padding = Math.round(size * 0.12);
  const radius = Math.round(size * 0.18);
  const fontSize = Math.round(size * 0.55);
  const yOffset = Math.round(size * 0.05);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FE6B8B"/>
      <stop offset="100%" stop-color="#FF8E53"/>
    </linearGradient>
  </defs>
  <rect x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}" rx="${radius}" fill="url(#g)"/>
  <text x="50%" y="${50 + yOffset}%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="${fontSize}">W</text>
</svg>`;
}

const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  const svg = generateSVG(size);
  writeFileSync(`public/icons/icon-${size}.svg`, svg);
  console.log(`Generated icon-${size}.svg`);
}

console.log("\nNote: Convert SVGs to PNGs for production. For development, update manifest.json to use .svg files.");
