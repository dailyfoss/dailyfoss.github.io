#!/usr/bin/env node

/**
 * Migration script to restructure install_methods in JSON files
 * 
 * Changes:
 * - Move hosting from platform.hosting to install_methods[0].hosting
 * - Move ui from platform.ui to install_methods[0].ui
 * - Move top-level deployment to install_methods[0].deployment
 * - Keep only platform-related fields in platform
 */

const fs = require('fs');
const path = require('path');

const JSON_DIR = path.join(__dirname, '../frontend/public/json');

function migrateInstallMethods(data) {
    if (!data.install_methods || data.install_methods.length === 0) {
        console.warn(`  ⚠️  No install_methods found`);
        return data;
    }

    const method = data.install_methods[0];
    let modified = false;

    // Extract hosting from platform if it exists
    if (method.platform?.hosting) {
        method.hosting = method.platform.hosting;
        delete method.platform.hosting;
        modified = true;
    }

    // Extract ui from platform if it exists
    if (method.platform?.ui) {
        method.ui = method.platform.ui;
        delete method.platform.ui;
        modified = true;
    }

    // Move top-level deployment to method.deployment if it exists
    if (data.deployment) {
        // Extract only the boolean flags, not the paths
        method.deployment = {
            script: data.deployment.script || false,
            docker: data.deployment.docker || false,
            docker_compose: data.deployment.docker_compose || false,
            helm: data.deployment.helm || false,
            kubernetes: data.deployment.kubernetes || false,
            terraform: data.deployment.terraform || false,
        };
        modified = true;
    }

    // Move platform.deployment to method.deployment if it exists at wrong level
    if (method.platform?.deployment) {
        if (!method.deployment) {
            method.deployment = method.platform.deployment;
        }
        delete method.platform.deployment;
        modified = true;
    }

    // Add saas field to hosting if it doesn't exist
    if (method.hosting && !('saas' in method.hosting)) {
        method.hosting.saas = false;
        modified = true;
    }

    return { data, modified };
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        const { data: migratedData, modified } = migrateInstallMethods(data);

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(migratedData, null, 2) + '\n', 'utf8');
            console.log(`✅ Migrated: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`⏭️  Skipped: ${path.basename(filePath)} (no changes needed)`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

function main() {
    console.log('🚀 Starting migration of install_methods structure...\n');

    if (!fs.existsSync(JSON_DIR)) {
        console.error(`❌ Directory not found: ${JSON_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));
    console.log(`📁 Found ${files.length} JSON files\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
        const filePath = path.join(JSON_DIR, file);
        if (processFile(filePath)) {
            migratedCount++;
        } else {
            skippedCount++;
        }
    }

    console.log(`\n✨ Migration complete!`);
    console.log(`   Migrated: ${migratedCount} files`);
    console.log(`   Skipped: ${skippedCount} files`);
}

main();
