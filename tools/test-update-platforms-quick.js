#!/usr/bin/env node

/**
 * Quick test script for platform detection
 * Tests on a few sample files to verify functionality
 */

const fs = require('fs');
const path = require('path');

// Temporarily modify the JSON_DIR and run a subset
const originalScript = require('./update-platforms.js');

const JSON_DIR = path.join(__dirname, '../frontend/public/json');

// Test files - apps known to have desktop/mobile releases
const TEST_FILES = [
    'actual-budget.json',
    'adguard-home.json',
    'affine.json',
    'bitwarden.json',
    'immich.json'
];

async function main() {
    console.log('🧪 Quick test on 5 sample files...\n');

    const testDir = path.join(__dirname, '../frontend/public/json');
    const files = TEST_FILES.map(f => path.join(testDir, f));

    // Check if files exist
    const existingFiles = files.filter(f => fs.existsSync(f));
    console.log(`Found ${existingFiles.length}/${TEST_FILES.length} test files\n`);

    if (existingFiles.length === 0) {
        console.log('❌ No test files found');
        return;
    }

    // Process each file
    for (const file of existingFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);

        console.log(`🔍 ${path.basename(file)}`);
        console.log(`   Source: ${data.source_code}`);

        if (data.source_code) {
            const platforms = await originalScript.detectPlatforms(data.source_code);
            if (platforms) {
                console.log(`   ✅ Detected:`);
                if (platforms.desktop.linux || platforms.desktop.windows || platforms.desktop.macos) {
                    const desktop = [];
                    if (platforms.desktop.linux) desktop.push('Linux');
                    if (platforms.desktop.windows) desktop.push('Windows');
                    if (platforms.desktop.macos) desktop.push('macOS');
                    console.log(`      Desktop: ${desktop.join(', ')}`);
                }
                if (platforms.mobile.android || platforms.mobile.ios) {
                    const mobile = [];
                    if (platforms.mobile.android) mobile.push('Android');
                    if (platforms.mobile.ios) mobile.push('iOS');
                    console.log(`      Mobile: ${mobile.join(', ')}`);
                }
            } else {
                console.log(`   ℹ️  No releases found`);
            }
        } else {
            console.log(`   ⏭️  No source_code`);
        }
        console.log('');

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✨ Test complete!');
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
