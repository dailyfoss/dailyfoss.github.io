#!/usr/bin/env node
/**
 * OG Image Generator Script
 * Generates OG images for apps using the og-railway service
 * 
 * Usage: 
 *   node tools/generate-og-images.cjs              - uses og-apps-list.txt
 *   node tools/generate-og-images.cjs --all        - processes all apps in public/json
 *   node tools/generate-og-images.cjs --list file  - uses custom list file
 *   node tools/generate-og-images.cjs --convert    - convert SVGs to high-quality PNGs
 * 
 * Generates beta-dark template and outputs to /public/media/images/og/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const OG_SERVICE_URL = process.env.OG_SERVICE_URL || 'https://og.dailyfoss.biz.id';
const SITE_URL = process.env.SITE_URL || 'https://dailyfoss.com';
const OUTPUT_DIR = '/root/dailyfoss-assets/og';
const SVG_SOURCE_DIR = path.join(OUTPUT_DIR, 'svg-temp');
const JSON_DIR = path.join(__dirname, '../public/json');
const APPS_LIST_FILE = path.join(__dirname, 'og-apps-list.txt');

const args = process.argv.slice(2);

// Check if convert mode
const isConvertMode = args.includes('--convert');

// Get apps to process
let APPS_TO_PROCESS;

if (args.includes('--all')) {
  APPS_TO_PROCESS = fs.readdirSync(JSON_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
} else {
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

// Only template with dark theme
const VARIANT = { layout: 'template', theme: 'dark' };

// Ensure output directory exists
function ensureDirectories() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }
}

// Read app JSON file
function readAppJson(appName) {
  const filePath = path.join(JSON_DIR, `${appName}.json`);
  if (!fs.existsSync(filePath)) {
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
function buildOgParams(app, fileType = 'svg') {
  const params = new URLSearchParams();
  
  params.set('layoutName', VARIANT.layout);
  params.set('fileType', fileType);
  params.set('Theme', VARIANT.theme);
  params.set('Title', app.name || app.slug);
  params.set('Description', app.tagline || app.description?.substring(0, 100) || '');
  
  if (app.metadata?.license) {
    params.set('License', app.metadata.license);
  }
  
  // Explicitly set self-hosted status
  params.set('SelfHosted', app.hosting_options?.self_hosted === true ? 'true' : 'false');
  
  const platform = app.platform_support || {};
  const desktop = platform.desktop || {};
  const mobile = platform.mobile || {};
  
  if (desktop.windows) params.set('Windows', 'true');
  if (desktop.macos) params.set('MacOS', 'true');
  if (desktop.linux) params.set('Linux', 'true');
  if (platform.web_app) params.set('Web', 'true');
  if (mobile.android) params.set('Android', 'true');
  if (mobile.ios) params.set('iOS', 'true');
  
  if (app.resources?.screenshot) {
    let screenshotUrl = app.resources.screenshot;
    if (screenshotUrl.startsWith('/uploads/') || screenshotUrl.startsWith('/')) {
      screenshotUrl = OG_SERVICE_URL + screenshotUrl;
    }
    params.set('ScreenshotUrl', screenshotUrl);
  } else if (app.resources?.screenshots?.length > 0) {
    // Handle screenshots array - use first screenshot
    let screenshotUrl = app.resources.screenshots[0];
    if (screenshotUrl.startsWith('/uploads/') || screenshotUrl.startsWith('/')) {
      screenshotUrl = OG_SERVICE_URL + screenshotUrl;
    }
    params.set('ScreenshotUrl', screenshotUrl);
  }
  
  return params.toString();
}

// Download file from URL
function downloadFile(url, outputPath) {
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
        file.close();
        fs.unlinkSync(outputPath);
        downloadFile(response.headers.location, outputPath).then(resolve).catch(reject);
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

// Convert SVG to high-quality PNG using sharp
async function convertSvgToPng(svgPath, pngPath) {
  const sharp = require('sharp');
  const svgBuffer = fs.readFileSync(svgPath);
  
  await sharp(svgBuffer, { density: 300 })
    .resize(1200, 630, { fit: 'fill' })
    .png({ quality: 100 })
    .toFile(pngPath);
}

// Generate SVG and convert to PNG for a single app
async function generateOgImage(app, overwrite = true) {
  const svgPath = path.join(SVG_SOURCE_DIR, `${app.slug}.svg`);
  const pngPath = path.join(OUTPUT_DIR, `${app.slug}.png`);
  
  // Skip if PNG already exists and not overwriting
  if (!overwrite && fs.existsSync(pngPath)) {
    return { status: 'skipped', path: pngPath };
  }
  
  try {
    // Step 1: Download SVG from og service
    const params = buildOgParams(app, 'svg');
    const url = `${OG_SERVICE_URL}/api/image?${params}`;
    
    // Ensure SVG temp directory exists
    if (!fs.existsSync(SVG_SOURCE_DIR)) {
      fs.mkdirSync(SVG_SOURCE_DIR, { recursive: true });
    }
    
    await downloadFile(url, svgPath);
    
    // Step 2: Convert SVG to PNG
    await convertSvgToPng(svgPath, pngPath);
    
    return { status: 'success', path: pngPath };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

// Convert existing SVG to PNG (for --convert mode)
async function convertExistingSvg(appName) {
  const svgPath = path.join(SVG_SOURCE_DIR, `${appName}.svg`);
  const pngPath = path.join(OUTPUT_DIR, `${appName}.png`);
  
  if (!fs.existsSync(svgPath)) {
    return { status: 'not_found', path: svgPath };
  }
  
  try {
    await convertSvgToPng(svgPath, pngPath);
    return { status: 'success', path: pngPath };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

// Process a single app
async function processApp(appName) {
  if (isConvertMode) {
    return await convertExistingSvg(appName);
  }
  
  const app = readAppJson(appName);
  if (!app) {
    return { status: 'not_found' };
  }
  
  return await generateOgImage(app);
}

// Main function
async function main() {
  console.log('🖼️  OG Image Generator');
  console.log('='.repeat(50));
  console.log(`Mode: ${isConvertMode ? 'Convert SVG to PNG' : 'Generate from API'}`);
  console.log(`OG Service URL: ${OG_SERVICE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Apps to process: ${APPS_TO_PROCESS.length}`);
  console.log('='.repeat(50));
  
  ensureDirectories();
  
  const summary = { success: 0, skipped: 0, errors: [], notFound: [] };
  
  for (let i = 0; i < APPS_TO_PROCESS.length; i++) {
    const appName = APPS_TO_PROCESS[i];
    process.stdout.write(`[${i + 1}/${APPS_TO_PROCESS.length}] ${appName}... `);
    
    const result = await processApp(appName);
    
    if (result.status === 'success') {
      summary.success++;
      console.log('✅');
    } else if (result.status === 'skipped') {
      summary.skipped++;
      console.log('⏭️ (exists)');
    } else if (result.status === 'not_found') {
      summary.notFound.push(appName);
      console.log('❌ not found');
    } else {
      summary.errors.push({ app: appName, error: result.error });
      console.log(`❌ ${result.error}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  console.log(`✅ Generated: ${summary.success}`);
  console.log(`⏭️  Skipped: ${summary.skipped}`);
  console.log(`❌ Errors: ${summary.errors.length}`);
  console.log(`🔍 Not found: ${summary.notFound.length}`);
  
  if (summary.errors.length > 0) {
    console.log('\nErrors:');
    summary.errors.forEach(e => console.log(`  - ${e.app}: ${e.error}`));
  }
}

main().catch(console.error);
