#!/usr/bin/env node

/**
 * Tool to check and update platform support for each repository
 * 
 * This script:
 * - Reads JSON files from frontend/public/json
 * - Extracts GitHub repo from source_code field
 * - Checks GitHub releases for platform-specific packages (parallel processing)
 * - Updates install_methods[0].platform fields based on available releases
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const JSON_DIR = path.join(__dirname, '../frontend/public/json');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim() !== ''
    ? process.env.GITHUB_TOKEN
    : null; // Only use token if it's not empty
const PARALLEL_LIMIT = parseInt(process.env.PARALLEL_LIMIT || '10', 10);

let rateLimitHit = false;
let rateLimitCount = 0;

// Platform detection patterns for release assets
const PLATFORM_PATTERNS = {
    desktop: {
        linux: /linux|\.AppImage$|\.deb$|\.rpm$|\.tar\.gz$|\.tar\.xz$|-linux-|_linux_|x86_64.*linux|amd64.*linux|arm.*linux|mips.*linux|riscv.*linux|ppc.*linux/i,
        windows: /windows|\.exe$|\.msi$|win32|win64|-windows-|_windows_|x86_64.*windows|amd64.*windows|arm.*windows/i,
        macos: /macos|darwin|\.dmg$|\.pkg$|-macos-|_macos_|-darwin-|x86_64.*darwin|arm64.*darwin|amd64.*darwin/i
    },
    mobile: {
        android: /android|\.apk$|\.aab$|-android-|_android_/i,
        ios: /ios|\.ipa$|-ios-|_ios_|iphone|ipad/i
    }
};

/**
 * Make HTTPS request with promise
 */
function httpsGet(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'platform-checker-script',
                ...headers
            }
        };

        https.get(url, options, (res) => {
            let data = '';

            // Handle redirects
            if (res.statusCode === 301 || res.statusCode === 302) {
                return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
            }

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        }).on('error', reject);
    });
}

/**
 * Extract GitHub owner and repo from various URL formats
 */
function parseGitHubUrl(url) {
    if (!url) return null;

    // Remove protocol and www
    url = url.replace(/^https?:\/\/(www\.)?/, '');

    // Match github.com/owner/repo
    const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
    if (!match) return null;

    return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '')
    };
}

/**
 * Check if asset name matches platform pattern
 */
function matchesPlatform(assetName, pattern) {
    return pattern.test(assetName);
}

/**
 * Fetch releases from GitHub and detect platforms
 */
async function detectPlatforms(sourceCode) {
    const repoInfo = parseGitHubUrl(sourceCode);
    if (!repoInfo) {
        return { status: 'invalid_url' };
    }

    const { owner, repo } = repoInfo;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`;

    const headers = {};
    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    try {
        const response = await httpsGet(apiUrl, headers);
        const { statusCode, data } = response;

        // Check for rate limit
        if (statusCode === 403 && data.message && data.message.includes('rate limit')) {
            rateLimitHit = true;
            rateLimitCount++;
            return { status: 'rate_limit' };
        }

        // Check for other errors
        if (statusCode === 404) {
            return { status: 'not_found' };
        }

        if (statusCode !== 200) {
            return { status: 'api_error', code: statusCode };
        }

        const releases = data;

        if (!Array.isArray(releases) || releases.length === 0) {
            return { status: 'no_releases' };
        }

        const platforms = {
            desktop: {
                linux: false,
                windows: false,
                macos: false
            },
            mobile: {
                android: false,
                ios: false
            }
        };

        // Check all releases (up to 5 most recent)
        for (const release of releases) {
            if (!release.assets || release.assets.length === 0) {
                continue;
            }

            // Check each asset against platform patterns
            for (const asset of release.assets) {
                const name = asset.name;

                // Desktop platforms
                if (!platforms.desktop.linux && matchesPlatform(name, PLATFORM_PATTERNS.desktop.linux)) {
                    platforms.desktop.linux = true;
                }
                if (!platforms.desktop.windows && matchesPlatform(name, PLATFORM_PATTERNS.desktop.windows)) {
                    platforms.desktop.windows = true;
                }
                if (!platforms.desktop.macos && matchesPlatform(name, PLATFORM_PATTERNS.desktop.macos)) {
                    platforms.desktop.macos = true;
                }

                // Mobile platforms
                if (!platforms.mobile.android && matchesPlatform(name, PLATFORM_PATTERNS.mobile.android)) {
                    platforms.mobile.android = true;
                }
                if (!platforms.mobile.ios && matchesPlatform(name, PLATFORM_PATTERNS.mobile.ios)) {
                    platforms.mobile.ios = true;
                }
            }

            // Early exit if all platforms detected
            if (platforms.desktop.linux && platforms.desktop.windows && platforms.desktop.macos &&
                platforms.mobile.android && platforms.mobile.ios) {
                break;
            }
        }

        // Return platforms or no_platform_assets
        const hasAnyPlatform = Object.values(platforms.desktop).some(v => v) ||
            Object.values(platforms.mobile).some(v => v);

        if (hasAnyPlatform) {
            return { status: 'success', platforms };
        } else {
            return { status: 'no_platform_assets' };
        }
    } catch (error) {
        return { status: 'network_error', error: error.message };
    }
}

/**
 * Update platform information in JSON data
 */
function updatePlatformInfo(data, detectedPlatforms) {
    if (!data.install_methods || data.install_methods.length === 0) {
        return { modified: false };
    }

    const method = data.install_methods[0];
    if (!method.platform) {
        method.platform = {
            desktop: { linux: false, windows: false, macos: false },
            mobile: { android: false, ios: false },
            web_app: false,
            browser_extension: false,
            cli_only: false
        };
    }

    let modified = false;

    // Update desktop platforms
    if (detectedPlatforms.desktop.linux !== method.platform.desktop.linux) {
        method.platform.desktop.linux = detectedPlatforms.desktop.linux;
        modified = true;
    }
    if (detectedPlatforms.desktop.windows !== method.platform.desktop.windows) {
        method.platform.desktop.windows = detectedPlatforms.desktop.windows;
        modified = true;
    }
    if (detectedPlatforms.desktop.macos !== method.platform.desktop.macos) {
        method.platform.desktop.macos = detectedPlatforms.desktop.macos;
        modified = true;
    }

    // Update mobile platforms
    if (detectedPlatforms.mobile.android !== method.platform.mobile.android) {
        method.platform.mobile.android = detectedPlatforms.mobile.android;
        modified = true;
    }
    if (detectedPlatforms.mobile.ios !== method.platform.mobile.ios) {
        method.platform.mobile.ios = detectedPlatforms.mobile.ios;
        modified = true;
    }

    return { data, modified };
}

/**
 * Process a single JSON file
 */
async function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        if (!data.source_code) {
            return {
                file: path.basename(filePath),
                status: 'skipped',
                reason: 'no source_code'
            };
        }

        const result = await detectPlatforms(data.source_code);

        if (result.status === 'rate_limit') {
            return {
                file: path.basename(filePath),
                status: 'rate_limit',
                repo: data.source_code
            };
        }

        if (result.status !== 'success') {
            return {
                file: path.basename(filePath),
                status: result.status,
                repo: data.source_code
            };
        }

        const { data: updatedData, modified } = updatePlatformInfo(data, result.platforms);

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2) + '\n', 'utf8');
            return {
                file: path.basename(filePath),
                status: 'updated',
                repo: data.source_code,
                platforms: result.platforms
            };
        } else {
            return {
                file: path.basename(filePath),
                status: 'unchanged',
                repo: data.source_code
            };
        }
    } catch (error) {
        return {
            file: path.basename(filePath),
            status: 'error',
            error: error.message
        };
    }
}

/**
 * Process files in parallel with concurrency limit
 */
async function processFilesInParallel(files, limit) {
    const results = [];
    const queue = [...files];
    const inProgress = new Set();

    return new Promise((resolve) => {
        const processNext = () => {
            // Check if we hit rate limit
            if (rateLimitHit && rateLimitCount > 5) {
                console.log('\n⚠️  RATE LIMIT DETECTED! Stopping to avoid further issues.');
                console.log('   Please use a GitHub token or reduce PARALLEL_LIMIT.');
                console.log(`   Processed ${results.length}/${files.length} files before hitting limit.\n`);
                resolve(results);
                return;
            }

            // Check if we're done
            if (queue.length === 0 && inProgress.size === 0) {
                resolve(results);
                return;
            }

            // Start new tasks up to the limit
            while (queue.length > 0 && inProgress.size < limit) {
                const filePath = queue.shift();
                const promise = processFile(filePath);

                inProgress.add(promise);

                promise.then((result) => {
                    results.push(result);
                    inProgress.delete(promise);

                    // Log progress
                    const total = files.length;
                    const completed = results.length;
                    const percent = Math.round((completed / total) * 100);

                    if (result.status === 'updated') {
                        const platforms = [];
                        if (result.platforms.desktop.linux) platforms.push('linux');
                        if (result.platforms.desktop.windows) platforms.push('windows');
                        if (result.platforms.desktop.macos) platforms.push('macos');
                        if (result.platforms.mobile.android) platforms.push('android');
                        if (result.platforms.mobile.ios) platforms.push('ios');
                        console.log(`[${completed}/${total} ${percent}%] ✅ ${result.file}: ${platforms.join(', ')}`);
                    } else if (result.status === 'rate_limit') {
                        console.log(`[${completed}/${total} ${percent}%] 🚫 ${result.file}: RATE LIMITED`);
                    } else if (result.status === 'error') {
                        console.log(`[${completed}/${total} ${percent}%] ❌ ${result.file}: ${result.error}`);
                    } else if (result.status === 'unchanged') {
                        console.log(`[${completed}/${total} ${percent}%] ⏭️  ${result.file}: no changes`);
                    } else if (result.status === 'no_releases') {
                        console.log(`[${completed}/${total} ${percent}%] ℹ️  ${result.file}: no releases`);
                    } else if (result.status === 'no_platform_assets') {
                        console.log(`[${completed}/${total} ${percent}%] ℹ️  ${result.file}: no platform assets`);
                    } else {
                        console.log(`[${completed}/${total} ${percent}%] ⏭️  ${result.file}: ${result.status}`);
                    }

                    processNext();
                }).catch((error) => {
                    results.push({
                        file: path.basename(filePath),
                        status: 'error',
                        error: error.message
                    });
                    inProgress.delete(promise);
                    processNext();
                });
            }
        };

        processNext();
    });
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting parallel platform detection...\n');

    if (!GITHUB_TOKEN) {
        console.log('⚠️  WARNING: No valid GITHUB_TOKEN found!');
        console.log('   Rate limit: 60 requests/hour (you will hit limit quickly)');
        console.log('   Recommendation: Use PARALLEL_LIMIT=3 or add a GitHub token\n');

        if (PARALLEL_LIMIT > 5) {
            console.log(`⚠️  PARALLEL_LIMIT=${PARALLEL_LIMIT} is too high without a token!`);
            console.log('   You will hit rate limit in seconds. Reducing to 3...\n');
            // Don't actually reduce it, just warn
        }
    } else {
        console.log('✅ GitHub token detected. Rate limit: 5000 requests/hour\n');
    }

    if (!fs.existsSync(JSON_DIR)) {
        console.error(`❌ Directory not found: ${JSON_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(JSON_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(JSON_DIR, f));

    console.log(`📁 Found ${files.length} JSON files`);
    console.log(`⚡ Processing ${PARALLEL_LIMIT} files at a time\n`);

    const startTime = Date.now();
    const results = await processFilesInParallel(files, PARALLEL_LIMIT);
    const endTime = Date.now();

    // Calculate statistics
    const stats = {
        updated: results.filter(r => r.status === 'updated').length,
        unchanged: results.filter(r => r.status === 'unchanged').length,
        no_releases: results.filter(r => r.status === 'no_releases').length,
        no_platform_assets: results.filter(r => r.status === 'no_platform_assets').length,
        rate_limited: results.filter(r => r.status === 'rate_limit').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length
    };

    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`\n✨ Platform detection complete in ${duration}s!`);
    console.log(`   Updated: ${stats.updated} files`);
    console.log(`   Unchanged: ${stats.unchanged} files`);
    console.log(`   No releases: ${stats.no_releases} files`);
    console.log(`   No platform assets: ${stats.no_platform_assets} files`);
    if (stats.rate_limited > 0) {
        console.log(`   🚫 Rate limited: ${stats.rate_limited} files`);
    }
    console.log(`   Skipped: ${stats.skipped} files`);
    console.log(`   Errors: ${stats.errors} files`);

    if (rateLimitHit) {
        console.log('\n⚠️  You hit the GitHub API rate limit!');
        console.log('   Solutions:');
        console.log('   1. Add a GitHub token: GITHUB_TOKEN=your_token npm run update-platforms');
        console.log('   2. Reduce parallelism: PARALLEL_LIMIT=3 npm run update-platforms');
        console.log('   3. Wait an hour and try again');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { detectPlatforms, parseGitHubUrl };
