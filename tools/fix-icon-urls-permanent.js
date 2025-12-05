#!/usr/bin/env node

/**
 * Permanent fix for icon URLs
 * Uses jsDelivr with correct format that doesn't have package size limits
 */

const fs = require('fs');
const path = require('path');

const directories = [
    'frontend/public/json',
];

function convertToJsDelivrCombined(url) {
    if (!url || typeof url !== 'string') {
        return url;
    }

    // Convert any GitHub URL to jsDelivr combined format (no package limit)
    // From: https://raw.githubusercontent.com/selfhst/icons/master/webp/filerise.webp
    // To: https://cdn.jsdelivr.net/combine/gh/selfhst/icons@master/webp/filerise.webp

    if (url.includes('raw.githubusercontent.com/selfhst/icons')) {
        return url
            .replace('raw.githubusercontent.com/selfhst/icons/master', 'cdn.jsdelivr.net/gh/selfhst/icons@master');
    }

    if (url.includes('cdn.jsdelivr.net/gh/selfhst/icons/webp')) {
        return url.replace('cdn.jsdelivr.net/gh/selfhst/icons/webp', 'cdn.jsdelivr.net/gh/selfhst/icons@master/webp');
    }

    return url;
}

function processJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        let modified = false;

        if (data.logo) {
            const newUrl = convertToJsDelivrCombined(data.logo);
            if (newUrl !== data.logo) {
                console.log(`Updating ${path.basename(filePath)}: ${data.logo} -> ${newUrl}`);
                data.logo = newUrl;
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
            return 1;
        }

        return 0;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return 0;
    }
}

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        console.log(`Directory not found: ${dirPath}`);
        return 0;
    }

    const files = fs.readdirSync(dirPath);
    let count = 0;

    for (const file of files) {
        if (file.endsWith('.json') && file !== 'index.json' && file !== 'metadata.json' && file !== 'version.json') {
            const filePath = path.join(dirPath, file);
            count += processJsonFile(filePath);
        }
    }

    return count;
}

console.log('Converting all icon URLs to jsDelivr with @master format (no package limits)...\n');

let totalUpdated = 0;

for (const dir of directories) {
    console.log(`Processing ${dir}...`);
    const updated = processDirectory(dir);
    totalUpdated += updated;
    console.log(`Updated ${updated} files in ${dir}\n`);
}

console.log(`\nTotal files updated: ${totalUpdated}`);
console.log('\nNOTE: Using @master format bypasses jsDelivr package size limits!');
console.log('Done!');
