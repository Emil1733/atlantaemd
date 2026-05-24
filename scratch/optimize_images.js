/**
 * Image Optimization Script for Atlanta Pool Removal Pros
 * - Converts all PNG images in /assets to WebP (quality 82)
 * - Resizes images wider than 1400px to max 1400px
 * - Generates a before/after size report
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets');
const QUALITY = 82;
const MAX_WIDTH = 1400;

async function optimizeImages() {
  console.log('--- STARTING IMAGE OPTIMIZATION ---\n');

  const files = fs.readdirSync(ASSETS_DIR).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

  if (files.length === 0) {
    console.log('No PNG/JPG images found in /assets.');
    return;
  }

  let totalOriginal = 0;
  let totalOptimized = 0;

  const results = [];

  for (const file of files) {
    const inputPath = path.join(ASSETS_DIR, file);
    const outputName = file.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const outputPath = path.join(ASSETS_DIR, outputName);

    const originalSize = fs.statSync(inputPath).size;
    totalOriginal += originalSize;

    try {
      const meta = await sharp(inputPath).metadata();
      const resizeOpts = meta.width > MAX_WIDTH ? { width: MAX_WIDTH } : {};

      await sharp(inputPath)
        .resize(resizeOpts)
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      const optimizedSize = fs.statSync(outputPath).size;
      totalOptimized += optimizedSize;

      const savingPct = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);
      results.push({
        File: file,
        'Original KB': (originalSize / 1024).toFixed(0),
        'WebP KB': (optimizedSize / 1024).toFixed(0),
        'Saving %': `${savingPct}%`,
        'Width': `${meta.width}px → ${resizeOpts.width ? MAX_WIDTH : meta.width}px`
      });

      console.log(`[DONE] ${file} → ${outputName} | ${(originalSize/1024).toFixed(0)}KB → ${(optimizedSize/1024).toFixed(0)}KB (-${savingPct}%)`);
    } catch (err) {
      console.error(`[FAIL] ${file}: ${err.message}`);
    }
  }

  console.log('\n--- SUMMARY ---');
  console.table(results);
  console.log(`\nTotal Original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Optimized: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Saved: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB (${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1)}%)`);
  console.log('\n--- DONE ---');
}

optimizeImages().catch(console.error);
