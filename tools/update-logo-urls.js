#!/usr/bin/env node

/**
 * Script to update all logo URLs from jsdelivr CDN to GitHub raw URLs
 * This avoids the 50 MB package size limit on jsdelivr
 */

const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
    'frontend/public/json',
    'frontend/public/json-bakk',
    'frontend/public/json-rm'
];

function convertLogoUrl(url) {
    if (!url || typeof url !== 'string') {
        return url;
    }

    // Convert jsdelivr CDN URLs to GitHub raw URLs
    // From: https://cdn.jsdelivr.net/gh/selfhst/icons/webp/filerise.webp
    // To: https://raw.githubusercontent.com/selfhst/icons/master/webp/filerise.webp
    if (url.includes('cdn.jsdelivr.net/gh/selfhst/icons')) {
        return url
            .replace('cdn.jsdelivr.net/gh/selfhst/icons', 'raw.githubusercontent.com/selfhst/icons/master')
            .replace('//webp/', '/webp/');
    }

    return url;
}

function processJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        let modified = false;

        // Update logo URL if it exists
        if (data.logo) {
            const newUrl = convertLogoUrl(data.logo);
            if (newUrl !== data.logo) {
                console.log(`Updating ${path.basename(filePath)}: ${data.logo} -> ${newUrl}`);
                data.logo = newUrl;
                modified = true;
            }
        }

        // Save if modified
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
        if (file.endsWith('.json') && file !== 'index.json') {
            const filePath = path.join(dirPath, file);
            count += processJsonFile(filePath);
        }
    }

    return count;
}

// Main execution
console.log('Starting logo URL update...\n');

let totalUpdated = 0;

for (const dir of directories) {
    console.log(`Processing ${dir}...`);
    const updated = processDirectory(dir);
    totalUpdated += updated;
    console.log(`Updated ${updated} files in ${dir}\n`);
}

console.log(`\nTotal files updated: ${totalUpdated}`);
console.log('Done!');
