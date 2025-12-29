#!/usr/bin/env node
/**
 * OG Image Generator Script
 * Generates OG images for apps using the og-railway service
 * 
 * Usage: node scripts/generate-og-images.cjs
 * 
 * Generates 4 variants per app:
 * - dailyfoss-alpha dark
 * - dailyfoss-alpha light  
 * - dailyfoss-beta dark
 * - dailyfoss-beta light
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const OG_SERVICE_URL = process.env.OG_SERVICE_URL || 'http://192.168.1.102:3001';
const OUTPUT_DIR = path.join(__dirname, '../public/og-images');
const JSON_DIR = path.join(__dirname, '../public/json');
const APPS_LIST_FILE = path.join(__dirname, 'og-apps-list.txt');

// Usage:
//   node scripts/generate-og-images.cjs              - uses og-apps-list.txt
//   node scripts/generate-og-images.cjs --all        - processes all apps in public/json
//   node scripts/generate-og-images.cjs --list file  - uses custom list file

const args = process.argv.slice(2);

// Get apps to process
let APPS_TO_PROCESS;

if (args.includes('--all')) {
  // Process all apps
  APPS_TO_PROCESS = fs.readdirSync(JSON_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
} else {
  // Use list file (default or custom)
  let listFile = APPS_LIST_FILE;
  const listIndex = args.indexOf('--list');
  if (listIndex !== -1 && args[listIndex + 1]) {
    listFile = args[listIndex + 1];
  }
  
  if (fs.existsSync(listFile)) {
    const listContent = fs.readFileSync(listFile, 'utf-8').trim();
    if (listContent) {
      APPS_TO_PROCESS = listContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    } else {
      console.log('List file is empty. Use --all to process all apps.');
      process.exit(1);
    }
  } else {
    console.log(`List file not found: ${listFile}`);
    console.log('Use --all to process all apps, or create the list file.');
    process.exit(1);
  }
}

// Layout variants to generate
const VARIANTS = [
  { layout: 'dailyfoss-alpha', theme: 'dark' },
  { layout: 'dailyfoss-alpha', theme: 'light' },
  { layout: 'dailyfoss-beta', theme: 'dark' },
  { layout: 'dailyfoss-beta', theme: 'light' },
];

// Ensure output directories exist
function ensureDirectories() {
  const dirs = [
    OUTPUT_DIR,
    path.join(OUTPUT_DIR, 'alpha-dark'),
    path.join(OUTPUT_DIR, 'alpha-light'),
    path.join(OUTPUT_DIR, 'beta-dark'),
    path.join(OUTPUT_DIR, 'beta-light'),
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Read app JSON file
function readAppJson(appName) {
  const filePath = path.join(JSON_DIR, `${appName}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${filePath} not found`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

// Build URL params for OG image API
function buildOgParams(app, layout, theme) {
  const params = new URLSearchParams();
  
  params.set('layoutName', layout);
  params.set('fileType', 'png');
  params.set('Theme', theme);
  params.set('Title', app.name || app.slug);
  params.set('Description', app.tagline || app.description?.substring(0, 100) || '');
  
  // License
  if (app.metadata?.license) {
    params.set('License', app.metadata.license);
  }
  
  // Self-hosted
  if (app.hosting_options?.self_hosted) {
    params.set('SelfHosted', 'true');
  }
  
  // Platform support
  const platform = app.platform_support || {};
  const desktop = platform.desktop || {};
  const mobile = platform.mobile || {};
  
  if (desktop.windows) params.set('Windows', 'true');
  if (desktop.macos) params.set('MacOS', 'true');
  if (desktop.linux) params.set('Linux', 'true');
  if (platform.web_app) params.set('Web', 'true');
  if (mobile.android) params.set('Android', 'true');
  if (mobile.ios) params.set('iOS', 'true');
  
  // Screenshot URL - use OG service's local uploads if available
  if (app.resources?.screenshot) {
    let screenshotUrl = app.resources.screenshot;
    
    // Convert local /uploads/ path to OG service URL
    if (screenshotUrl.startsWith('/uploads/')) {
      screenshotUrl = OG_SERVICE_URL + screenshotUrl;
    }
    
    params.set('ScreenshotUrl', screenshotUrl);
  }
  
  return params.toString();
}

// Download image from URL
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(outputPath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(outputPath);
        });
      } else if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirects
        file.close();
        fs.unlinkSync(outputPath);
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      reject(err);
    });
  });
}

// Generate OG image for a single app variant
async function generateOgImage(app, variant, overwrite = true) {
  const { layout, theme } = variant;
  const layoutShort = layout.replace('dailyfoss-', '');
  const folderName = `${layoutShort}-${theme}`;
  const outputPath = path.join(OUTPUT_DIR, folderName, `${app.slug}.png`);
  
  // Skip if already exists and not overwriting
  if (!overwrite && fs.existsSync(outputPath)) {
    return { status: 'skipped', path: outputPath };
  }
  
  const params = buildOgParams(app, layout, theme);
  const url = `${OG_SERVICE_URL}/api/image?${params}`;
  
  try {
    await downloadImage(url, outputPath);
    return { status: 'success', path: outputPath };
  } catch (err) {
    return { status: 'error', error: err.message, url };
  }
}

// Process a single app
async function processApp(appName) {
  const app = readAppJson(appName);
  if (!app) {
    return { app: appName, status: 'not_found' };
  }
  
  const results = [];
  
  for (const variant of VARIANTS) {
    const result = await generateOgImage(app, variant);
    results.push({
      variant: `${variant.layout}-${variant.theme}`,
      ...result
    });
  }
  
  return { app: appName, results };
}

// Main function
async function main() {
  console.log('🖼️  OG Image Generator');
  console.log('='.repeat(50));
  console.log(`Service URL: ${OG_SERVICE_URL}`);
  console.log(`Apps to process: ${APPS_TO_PROCESS.length}`);
  console.log(`Variants per app: ${VARIANTS.length}`);
  console.log(`Total images: ${APPS_TO_PROCESS.length * VARIANTS.length}`);
  console.log('='.repeat(50));
  
  ensureDirectories();
  
  const summary = {
    success: 0,
    skipped: 0,
    errors: [],
    notFound: []
  };
  
  for (let i = 0; i < APPS_TO_PROCESS.length; i++) {
    const appName = APPS_TO_PROCESS[i];
    console.log(`\n[${i + 1}/${APPS_TO_PROCESS.length}] Processing: ${appName}`);
    
    const result = await processApp(appName);
    
    if (result.status === 'not_found') {
      summary.notFound.push(appName);
      console.log(`  ❌ JSON file not found`);
      continue;
    }
    
    for (const r of result.results) {
      if (r.status === 'success') {
        summary.success++;
        console.log(`  ✅ ${r.variant}`);
      } else if (r.status === 'skipped') {
        summary.skipped++;
        console.log(`  ⏭️  ${r.variant} (already exists)`);
      } else {
        summary.errors.push({ app: appName, variant: r.variant, error: r.error });
        console.log(`  ❌ ${r.variant}: ${r.error}`);
      }
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));
  console.log(`✅ Generated: ${summary.success}`);
  console.log(`⏭️  Skipped: ${summary.skipped}`);
  console.log(`❌ Errors: ${summary.errors.length}`);
  console.log(`🔍 Not found: ${summary.notFound.length}`);
  
  if (summary.notFound.length > 0) {
    console.log(`\nMissing JSON files: ${summary.notFound.join(', ')}`);
  }
  
  if (summary.errors.length > 0) {
    console.log('\nErrors:');
    summary.errors.forEach(e => {
      console.log(`  - ${e.app} (${e.variant}): ${e.error}`);
    });
  }
}

// Run
main().catch(console.error);
