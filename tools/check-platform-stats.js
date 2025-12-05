#!/usr/bin/env node

/**
 * Check current platform statistics across all JSON files
 * Shows how many apps support each platform
 */

const fs = require('fs');
const path = require('path');

const JSON_DIR = path.join(__dirname, '../frontend/public/json');

function main() {
    console.log('📊 Platform Support Statistics\n');

    if (!fs.existsSync(JSON_DIR)) {
        console.error(`❌ Directory not found: ${JSON_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));

    const stats = {
        total: files.length,
        desktop: {
            linux: 0,
            windows: 0,
            macos: 0,
            any: 0
        },
        mobile: {
            android: 0,
            ios: 0,
            any: 0
        },
        web_app: 0,
        browser_extension: 0,
        cli_only: 0,
        no_platform: 0
    };

    const examples = {
        desktop: { linux: [], windows: [], macos: [] },
        mobile: { android: [], ios: [] }
    };

    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(JSON_DIR, file), 'utf8');
            const data = JSON.parse(content);

            if (!data.install_methods || data.install_methods.length === 0) {
                stats.no_platform++;
                continue;
            }

            const platform = data.install_methods[0].platform;
            if (!platform) {
                stats.no_platform++;
                continue;
            }

            let hasAnyPlatform = false;

            // Desktop
            if (platform.desktop) {
                if (platform.desktop.linux) {
                    stats.desktop.linux++;
                    hasAnyPlatform = true;
                    if (examples.desktop.linux.length < 5) {
                        examples.desktop.linux.push(data.name);
                    }
                }
                if (platform.desktop.windows) {
                    stats.desktop.windows++;
                    hasAnyPlatform = true;
                    if (examples.desktop.windows.length < 5) {
                        examples.desktop.windows.push(data.name);
                    }
                }
                if (platform.desktop.macos) {
                    stats.desktop.macos++;
                    hasAnyPlatform = true;
                    if (examples.desktop.macos.length < 5) {
                        examples.desktop.macos.push(data.name);
                    }
                }
                if (platform.desktop.linux || platform.desktop.windows || platform.desktop.macos) {
                    stats.desktop.any++;
                }
            }

            // Mobile
            if (platform.mobile) {
                if (platform.mobile.android) {
                    stats.mobile.android++;
                    hasAnyPlatform = true;
                    if (examples.mobile.android.length < 5) {
                        examples.mobile.android.push(data.name);
                    }
                }
                if (platform.mobile.ios) {
                    stats.mobile.ios++;
                    hasAnyPlatform = true;
                    if (examples.mobile.ios.length < 5) {
                        examples.mobile.ios.push(data.name);
                    }
                }
                if (platform.mobile.android || platform.mobile.ios) {
                    stats.mobile.any++;
                }
            }

            // Other platforms
            if (platform.web_app) {
                stats.web_app++;
                hasAnyPlatform = true;
            }
            if (platform.browser_extension) {
                stats.browser_extension++;
                hasAnyPlatform = true;
            }
            if (platform.cli_only) {
                stats.cli_only++;
                hasAnyPlatform = true;
            }

            if (!hasAnyPlatform) {
                stats.no_platform++;
            }
        } catch (error) {
            console.error(`Error reading ${file}:`, error.message);
        }
    }

    // Display results
    console.log(`Total apps: ${stats.total}\n`);

    console.log('🖥️  Desktop Support:');
    console.log(`   Linux:   ${stats.desktop.linux.toString().padStart(4)} (${((stats.desktop.linux / stats.total) * 100).toFixed(1)}%)`);
    if (examples.desktop.linux.length > 0) {
        console.log(`            Examples: ${examples.desktop.linux.join(', ')}`);
    }
    console.log(`   Windows: ${stats.desktop.windows.toString().padStart(4)} (${((stats.desktop.windows / stats.total) * 100).toFixed(1)}%)`);
    if (examples.desktop.windows.length > 0) {
        console.log(`            Examples: ${examples.desktop.windows.join(', ')}`);
    }
    console.log(`   macOS:   ${stats.desktop.macos.toString().padStart(4)} (${((stats.desktop.macos / stats.total) * 100).toFixed(1)}%)`);
    if (examples.desktop.macos.length > 0) {
        console.log(`            Examples: ${examples.desktop.macos.join(', ')}`);
    }
    console.log(`   Any:     ${stats.desktop.any.toString().padStart(4)} (${((stats.desktop.any / stats.total) * 100).toFixed(1)}%)\n`);

    console.log('📱 Mobile Support:');
    console.log(`   Android: ${stats.mobile.android.toString().padStart(4)} (${((stats.mobile.android / stats.total) * 100).toFixed(1)}%)`);
    if (examples.mobile.android.length > 0) {
        console.log(`            Examples: ${examples.mobile.android.join(', ')}`);
    }
    console.log(`   iOS:     ${stats.mobile.ios.toString().padStart(4)} (${((stats.mobile.ios / stats.total) * 100).toFixed(1)}%)`);
    if (examples.mobile.ios.length > 0) {
        console.log(`            Examples: ${examples.mobile.ios.join(', ')}`);
    }
    console.log(`   Any:     ${stats.mobile.any.toString().padStart(4)} (${((stats.mobile.any / stats.total) * 100).toFixed(1)}%)\n`);

    console.log('🌐 Other Platforms:');
    console.log(`   Web App:           ${stats.web_app.toString().padStart(4)} (${((stats.web_app / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   Browser Extension: ${stats.browser_extension.toString().padStart(4)} (${((stats.browser_extension / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   CLI Only:          ${stats.cli_only.toString().padStart(4)} (${((stats.cli_only / stats.total) * 100).toFixed(1)}%)\n`);

    console.log(`❓ No Platform Info: ${stats.no_platform.toString().padStart(4)} (${((stats.no_platform / stats.total) * 100).toFixed(1)}%)`);
}

main();
