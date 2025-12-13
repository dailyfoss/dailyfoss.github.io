#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_DIR = path.join(__dirname, '../public/json');
const ICONS_OUTPUT_DIR = path.join(__dirname, '../public/icons');
const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com/selfhst/icons/main/webp';
const CONCURRENT_DOWNLOADS = 10;

// Apps that need light variant for dark mode visibility
const APPS_NEEDING_LIGHT_VARIANT = new Set([
    'pocketbase', 'corecontrol', 'heimdall', 'slash', 'phpmyadmin', 'tirreno', 'vaulkey',
    'dokploy', 'semaphore', 'vito', 'pepo', 'tcoder', 'onedev', 'nocobase', 'element-fm',
    'neko', 'audiobookrequest', 'alexandrie', 'biblioreads', 'bookhaven', 'opencut',
    'riven', 'portracker', 'py-medusa', 'frigate', 'pigallery2', 'tubesync', 'clipcascade',
    'mumble', 'screenlit', 'invoicerr', 'ghost', 'storydend', 'directus', 'automad',
    'atomic-crm', 'docassemble', 'mayan-edms', 'invoice-ninja', 'mail-archiver', 'snappymail',
    'gathio', 'file-wizard', 'yeet', 'filebeaver', 'beaver-habit-tracker', 'kanba',
    'enclosed', 'karakeep', 'phorg', 'eteable', 'typebot', 'dagu', 'dubin', 'investbrain',
    'tiddlywiki', 'affine', 'rustpad', '2fauth', 'lldap', 'victoriametrics', 'cryptgeon',
    'infisical', 'ots', 'vaultwarden', 'private-captcha', 'secureai-tools', 'meshping',
    'amurex', 'solidtime', 'backrest', 'liwan', 'owncloud', 'astuto', 'commafeed',
    'feedbase', 'feedbin', 'miniflux', 'lancommander', 'basic-memory', 'scratch-map',
    'tracktor', 'openemr', 'broadcastchannel', 'converse', 'mattermost', 'synapse',
    'wallabag', 'meme-search', 'hollo', 'misskey', 'openchangelog', 'runson', 'ziit',
    'jackett', 'litlyx', 'umami', 'vincetian', 'ji', 'minio'
]);

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_OUTPUT_DIR)) {
    fs.mkdirSync(ICONS_OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${ICONS_OUTPUT_DIR}\n`);
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
                            process.stdout.write(`\rProgress: ${completed}/${icons.length} icons processed (${Math.round(completed / icons.length * 100)}%)`);
                            lastProgressUpdate = now;
                        }

                        return { ...icon, ...result };
                    })
                    .finally(() => {
                        inProgress.delete(promise);
                        if (inProgress.size === 0 && queue.length === 0) {
                            process.stdout.write(`\rProgress: ${completed}/${icons.length} icons processed (100%)\n`);
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
    console.log('Scanning JSON files for apps...\n');

    const jsonFiles = fs.readdirSync(JSON_DIR)
        .filter(file => file.endsWith('.json') && file !== 'versions.json')
        .map(file => path.join(JSON_DIR, file));

    console.log(`Found ${jsonFiles.length} JSON files\n`);

    const iconsToDownload = [];
    const iconSlugs = new Set();
    let appsWithSlugs = 0;
    let appsWithLightVariant = 0;

    // Collect all unique slugs from JSON files
    for (const file of jsonFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const data = JSON.parse(content);

            if (data.slug && data.slug.trim() !== '') {
                const slug = data.slug.trim();

                if (!iconSlugs.has(slug)) {
                    iconSlugs.add(slug);
                    
                    // Add default icon (without suffix)
                    iconsToDownload.push({
                        slug,
                        variant: 'default',
                        url: `${GITHUB_RAW_BASE_URL}/${slug}.webp`,
                        outputPath: path.join(ICONS_OUTPUT_DIR, `${slug}.webp`),
                        filename: `${slug}.webp`,
                        appName: data.name || slug
                    });
                    
                    // Add light variant for apps that need it
                    if (APPS_NEEDING_LIGHT_VARIANT.has(slug)) {
                        iconsToDownload.push({
                            slug,
                            variant: 'light',
                            url: `${GITHUB_RAW_BASE_URL}/${slug}-light.webp`,
                            outputPath: path.join(ICONS_OUTPUT_DIR, `${slug}-light.webp`),
                            filename: `${slug}-light.webp`,
                            appName: data.name || slug
                        });
                        appsWithLightVariant++;
                    }
                    
                    appsWithSlugs++;
                }
            }
        } catch (error) {
            console.error(`WARNING: Error processing ${path.basename(file)}:`, error.message);
        }
    }

    console.log(`Found ${appsWithSlugs} apps with slugs`);
    console.log(`  - ${appsWithLightVariant} apps need light variant for dark mode`);
    console.log(`Need to process ${iconsToDownload.length} icons\n`);

    if (iconsToDownload.length === 0) {
        console.log('WARNING: No icons to download!');
        return;
    }

    const stats = {
        downloaded: 0,
        skipped: 0,
        failed: 0
    };

    const startTime = Date.now();

    console.log('Starting parallel download...\n');
    const results = await downloadInParallel(iconsToDownload, CONCURRENT_DOWNLOADS, stats);
    await Promise.all(results);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Show failed downloads
    const failedIcons = await Promise.all(results);
    const failed = failedIcons.filter(r => r.success === false);

    if (failed.length > 0) {
        console.log('\nFailed downloads:');
        console.log('='.repeat(60));
        failed.slice(0, 10).forEach(f => {
            console.log(`  ${f.slug}: ${f.error || 'Unknown error'}`);
        });
        if (failed.length > 10) {
            console.log(`  ... and ${failed.length - 10} more`);
        }
    }

    // Update JSON files to use local paths
    console.log('\nUpdating JSON files with local icon paths...\n');

    let updated = 0;
    let updatedWithLight = 0;
    
    for (const file of jsonFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const data = JSON.parse(content);

            if (data.slug && data.slug.trim() !== '') {
                const slug = data.slug.trim();
                const iconPath = `/icons/${slug}.webp`;
                const lightIconPath = `/icons/${slug}-light.webp`;

                // Check if icons exist
                const iconExists = fs.existsSync(path.join(ICONS_OUTPUT_DIR, `${slug}.webp`));
                const lightIconExists = fs.existsSync(path.join(ICONS_OUTPUT_DIR, `${slug}-light.webp`));

                if (iconExists || lightIconExists || data.resources?.logo_light || data.resources?.logo_dark) {
                    if (!data.resources) data.resources = {};
                    
                    let needsUpdate = false;

                    // Update main logo if icon exists
                    if (iconExists && data.resources.logo !== iconPath) {
                        data.resources.logo = iconPath;
                        needsUpdate = true;
                    }

                    // For apps needing light variant
                    if (APPS_NEEDING_LIGHT_VARIANT.has(slug) && lightIconExists) {
                        if (data.resources.logo_light !== lightIconPath) {
                            data.resources.logo_light = lightIconPath;
                            needsUpdate = true;
                            updatedWithLight++;
                        }
                        // Remove logo_dark for these apps
                        if (data.resources.logo_dark !== undefined) {
                            delete data.resources.logo_dark;
                            needsUpdate = true;
                        }
                    } else {
                        // Remove both logo_light and logo_dark for other apps
                        if (data.resources.logo_light !== undefined) {
                            delete data.resources.logo_light;
                            needsUpdate = true;
                        }
                        if (data.resources.logo_dark !== undefined) {
                            delete data.resources.logo_dark;
                            needsUpdate = true;
                        }
                    }

                    if (needsUpdate) {
                        fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
                        updated++;
                    }
                }
            }
        } catch (error) {
            console.error(`WARNING: Error updating ${path.basename(file)}:`, error.message);
        }
    }

    console.log(`Updated ${updated} JSON files with local paths`);
    console.log(`  - ${updatedWithLight} apps with light variant for dark mode\n`);

    // Clean up old dark theme icons (we only use light variants now)
    console.log('Cleaning up old dark theme icons...\n');
    
    let cleanedUp = 0;
    const iconFiles = fs.readdirSync(ICONS_OUTPUT_DIR);
    
    for (const file of iconFiles) {
        // Only remove dark icons, keep light icons for apps that need them
        if (file.endsWith('-dark.webp')) {
            try {
                fs.unlinkSync(path.join(ICONS_OUTPUT_DIR, file));
                cleanedUp++;
            } catch (error) {
                console.error(`WARNING: Failed to delete ${file}:`, error.message);
            }
        }
        
        // Remove light icons for apps that don't need them
        if (file.endsWith('-light.webp')) {
            const slug = file.replace('-light.webp', '');
            if (!APPS_NEEDING_LIGHT_VARIANT.has(slug)) {
                try {
                    fs.unlinkSync(path.join(ICONS_OUTPUT_DIR, file));
                    cleanedUp++;
                } catch (error) {
                    console.error(`WARNING: Failed to delete ${file}:`, error.message);
                }
            }
        }
    }
    
    console.log(`Removed ${cleanedUp} old theme-specific icon files\n`);

    // Final summary
    console.log('='.repeat(60));
    console.log('Final Summary:');
    console.log('='.repeat(60));
    console.log(`Total icons:           ${iconsToDownload.length}`);
    console.log(`Downloaded:            ${stats.downloaded}`);
    console.log(`Already existed:       ${stats.skipped}`);
    console.log(`Failed:                ${stats.failed}`);
    console.log(`JSON files updated:    ${updated}`);
    console.log(`Duration:              ${duration}s`);
    console.log('='.repeat(60));
    console.log('\nDone!\n');

    // Explicitly exit to prevent hanging
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
