#!/usr/bin/env node

/**
 * Revert JSON files back to CDN URLs
 */

const fs = require('fs');
const path = require('path');

const directories = [
    'frontend/public/json',
    'frontend/public/json-bakk',
    'frontend/public/json-rm'
];

function revertToCdnUrl(localPath) {
    if (!localPath || typeof localPath !== 'string') {
        return localPath;
    }

    // Convert local path back to CDN URL
    // From: /ProxmoxVE/icons/listmonk.webp
    // To: https://cdn.jsdelivr.net/gh/selfhst/icons@master/webp/listmonk.webp

    if (localPath.startsWith('/ProxmoxVE/icons/')) {
        const filename = localPath.replace('/ProxmoxVE/icons/', '');
        return `https://cdn.jsdelivr.net/gh/selfhst/icons@master/webp/${filename}`;
    }

    return localPath;
}

function processJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        let modified = false;

        if (data.logo) {
            const newUrl = revertToCdnUrl(data.logo);
            if (newUrl !== data.logo) {
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

console.log('Reverting JSON files back to CDN URLs...\n');

let totalUpdated = 0;

for (const dir of directories) {
    const updated = processDirectory(dir);
    totalUpdated += updated;
    console.log(`Updated ${updated} files in ${dir}`);
}

console.log(`\nTotal files updated: ${totalUpdated}`);
console.log('Done!');
