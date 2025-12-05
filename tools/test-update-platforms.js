#!/usr/bin/env node

/**
 * Test script for platform detection
 * Tests on a few sample files to verify functionality
 */

const fs = require('fs');
const path = require('path');
const { detectPlatforms, parseGitHubUrl } = require('./update-platforms.js');

const JSON_DIR = path.join(__dirname, '../frontend/public/json');

// Test files - apps known to have desktop/mobile releases
const TEST_FILES = [
    'immich.json',
    'nextcloud.json',
    'bitwarden.json',
    'jellyfin.json',
    'actual-budget.json'
];

async function testFile(filename) {
    const filePath = path.join(JSON_DIR, filename);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filename}`);
        return;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        if (!data.source_code) {
            console.log(`⚠️  ${filename}: No source_code field`);
            return;
        }

        console.log(`\n🔍 Testing: ${filename}`);
        console.log(`   Source: ${data.source_code}`);

        const repoInfo = parseGitHubUrl(data.source_code);
        if (repoInfo) {
            console.log(`   Repo: ${repoInfo.owner}/${repoInfo.repo}`);
        }

        const platforms = await detectPlatforms(data.source_code);

        if (platforms) {
            console.log(`   ✅ Detected platforms:`);
            console.log(`      Desktop: Linux=${platforms.desktop.linux}, Windows=${platforms.desktop.windows}, macOS=${platforms.desktop.macos}`);
            console.log(`      Mobile: Android=${platforms.mobile.android}, iOS=${platforms.mobile.ios}`);
        } else {
            console.log(`   ℹ️  No releases found or unable to detect platforms`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error(`❌ Error testing ${filename}:`, error.message);
    }
}

async function main() {
    console.log('🧪 Testing platform detection on sample files...\n');

    for (const file of TEST_FILES) {
        await testFile(file);
    }

    console.log('\n✨ Test complete!');
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
