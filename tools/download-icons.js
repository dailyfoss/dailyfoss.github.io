#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_DIR = path.join(__dirname, '../frontend/public/json');
const ICONS_OUTPUT_DIR = path.join(__dirname, '../frontend/public/icons');
const CDN_BASE_URL = 'https://cdn.jsdelivr.net/gh/selfhst/icons/webp';
const CONCURRENT_DOWNLOADS = 10;

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_OUTPUT_DIR)) {
    fs.mkdirSync(ICONS_OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${ICONS_OUTPUT_DIR}\n`);
}

function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        // Check if file already exists
        if (fs.existsSync(outputPath)) {
            resolve({ success: true, existed: true });
            return;
        }

        const file = fs.createWriteStream(outputPath);

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve({ success: true, existed: false });
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirects
                file.close();
                fs.unlinkSync(outputPath);
                https.get(response.headers.location, (redirectResponse) => {
                    const redirectFile = fs.createWriteStream(outputPath);
                    redirectResponse.pipe(redirectFile);
                    redirectFile.on('finish', () => {
                        redirectFile.close();
                        resolve({ success: true, existed: false });
                    });
                }).on('error', (err) => {
                    fs.unlinkSync(outputPath);
                    resolve({ success: false, existed: false, error: err.message });
                });
            } else {
                file.close();
                fs.unlinkSync(outputPath);
                resolve({ success: false, existed: false, error: `HTTP ${response.statusCode}` });
            }
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
            resolve({ success: false, existed: false, error: err.message });
        });
    });
}

// Download icons in parallel with concurrency limit
async function downloadInParallel(icons, concurrency, stats) {
    const results = [];
    let completed = 0;
    let lastProgressUpdate = Date.now();

    const queue = [...icons];
    const inProgress = new Set();

    return new Promise((resolve) => {
        const processNext = () => {
            while (inProgress.size < concurrency && queue.length > 0) {
                const icon = queue.shift();

                const promise = downloadFile(icon.url, icon.outputPath)
                    .then(result => {
                        completed++;

                        if (result.existed) {
                            stats.skipped++;
                        } else if (result.success) {
                            stats.downloaded++;
                        } else {
                            stats.failed++;
                        }

                        const now = Date.now();
                        if (now - lastProgressUpdate > 1000) {
                            process.stdout.write(`\r📊 Progress: ${completed}/${icons.length} icons processed (${Math.round(completed / icons.length * 100)}%)`);
                            lastProgressUpdate = now;
                        }

                        return { ...icon, ...result };
                    })
                    .finally(() => {
                        inProgress.delete(promise);
                        if (inProgress.size === 0 && queue.length === 0) {
                            process.stdout.write(`\r📊 Progress: ${completed}/${icons.length} icons processed (100%)\n`);
                            resolve(results);
                        } else {
                            processNext();
                        }
                    });

                inProgress.add(promise);
                results.push(promise);
            }
        };

        processNext();
    });
}

async function main() {
    console.log('🔍 Scanning JSON files for apps...\n');

    const jsonFiles = fs.readdirSync(JSON_DIR)
        .filter(file => file.endsWith('.json') && file !== 'versions.json')
        .map(file => path.join(JSON_DIR, file));

    console.log(`📦 Found ${jsonFiles.length} JSON files\n`);

    const iconsToDownload = [];
    const iconSlugs = new Set();
    let appsWithSlugs = 0;

    // Collect all unique slugs from JSON files
    for (const file of jsonFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const data = JSON.parse(content);

            if (data.slug && data.slug.trim() !== '') {
                const slug = data.slug.trim();
                const filename = `${slug}.webp`;
                const url = `${CDN_BASE_URL}/${filename}`;
                const outputPath = path.join(ICONS_OUTPUT_DIR, filename);

                if (!iconSlugs.has(slug)) {
                    iconSlugs.add(slug);
                    iconsToDownload.push({
                        slug,
                        url,
                        outputPath,
                        filename,
                        appName: data.name || slug
                    });
                    appsWithSlugs++;
                }
            }
        } catch (error) {
            console.error(`⚠️  Error processing ${path.basename(file)}:`, error.message);
        }
    }

    console.log(`🔍 Found ${appsWithSlugs} apps with slugs`);
    console.log(`📥 Need to process ${iconsToDownload.length} unique icons\n`);

    if (iconsToDownload.length === 0) {
        console.log('⚠️  No icons to download!');
        return;
    }

    const stats = {
        downloaded: 0,
        skipped: 0,
        failed: 0
    };

    const startTime = Date.now();

    console.log('📥 Starting parallel download...\n');
    const results = await downloadInParallel(iconsToDownload, CONCURRENT_DOWNLOADS, stats);
    await Promise.all(results);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Show failed downloads
    const failedIcons = await Promise.all(results);
    const failed = failedIcons.filter(r => r.success === false);

    if (failed.length > 0) {
        console.log('\n⚠️  Failed downloads:');
        console.log('='.repeat(60));
        failed.slice(0, 10).forEach(f => {
            console.log(`  ${f.slug}: ${f.error || 'Unknown error'}`);
        });
        if (failed.length > 10) {
            console.log(`  ... and ${failed.length - 10} more`);
        }
    }

    // Update JSON files to use local paths with base path
    console.log('\n🔄 Updating JSON files with local icon paths...\n');

    let updated = 0;
    for (const file of jsonFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const data = JSON.parse(content);

            if (data.slug && data.slug.trim() !== '') {
                const slug = data.slug.trim();
                const newPath = `/ProxmoxVE/icons/${slug}.webp`;

                if (data.logo !== newPath) {
                    data.logo = newPath;
                    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
                    updated++;
                }
            }
        } catch (error) {
            console.error(`⚠️  Error updating ${path.basename(file)}:`, error.message);
        }
    }

    console.log(`✅ Updated ${updated} JSON files with local paths\n`);

    // Final summary
    console.log('='.repeat(60));
    console.log('📊 Final Summary:');
    console.log('='.repeat(60));
    console.log(`Total icons:           ${iconsToDownload.length}`);
    console.log(`✅ Downloaded:         ${stats.downloaded}`);
    console.log(`⏭️  Already existed:    ${stats.skipped}`);
    console.log(`❌ Failed:             ${stats.failed}`);
    console.log(`📝 JSON files updated: ${updated}`);
    console.log(`⏱️  Duration:           ${duration}s`);
    console.log('='.repeat(60));
    console.log('\n✨ Done!\n');

    // Explicitly exit to prevent hanging
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
