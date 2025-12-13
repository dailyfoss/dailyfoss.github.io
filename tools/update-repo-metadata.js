#!/usr/bin/env node

/**
 * Update repository metadata for all apps in public/json/*.json
 * Fetches data from GitHub API in parallel using source_code URL
 * 
 * Usage: GITHUB_TOKEN=your_token node tools/update-repo-metadata.js [limit]
 * Example: GITHUB_TOKEN=xxx node tools/update-repo-metadata.js 50
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const JSON_DIR = path.join(__dirname, '../public/json');
const BATCH_SIZE = 10; // Process 10 at a time for better progress visibility
const LIMIT = parseInt(process.argv[2]) || null; // Optional limit for testing

if (!GITHUB_TOKEN) {
  console.error('ERROR: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

// Track changes for reporting
const changeLog = [];

/**
 * Extract owner and repo from GitHub URL
 */
function parseGitHubUrl(url) {
  if (!url) return null;
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

/**
 * Fetch repository data from GitHub API
 */
async function fetchRepoData(owner, repo) {
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  try {
    // Fetch repo info
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    
    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        console.warn(`WARNING: Repository not found: ${owner}/${repo}`);
        return null;
      }
      throw new Error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();

    // Fetch latest release
    let latestRelease = null;
    try {
      const releaseResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers });
      if (releaseResponse.ok) {
        latestRelease = await releaseResponse.json();
      }
    } catch (e) {
      // No releases available
    }

    return {
      license: repoData.license?.spdx_id || null,
      version: latestRelease?.tag_name || null,
      date_last_released: latestRelease?.published_at?.split('T')[0] || null,
      date_last_commit: repoData.pushed_at?.split('T')[0] || null,
      github_stars: repoData.stargazers_count || 0,
      website: repoData.homepage || null,
      documentation: repoData.homepage || null,
      issues: `https://github.com/${owner}/${repo}/issues`,
      releases: latestRelease ? `https://github.com/${owner}/${repo}/releases` : null
    };
  } catch (error) {
    console.error(`ERROR: Failed to fetch ${owner}/${repo}:`, error.message);
    return null;
  }
}

/**
 * Update a single JSON file with fetched data
 */
async function updateJsonFile(filePath, repoData, repoUrl) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(content);

    // Store old values for comparison
    const oldStars = json.metadata.github_stars;
    const oldVersion = json.metadata.version;
    const oldLicense = json.metadata.license;

    // Update metadata
    json.metadata.license = repoData.license;
    json.metadata.version = repoData.version;
    json.metadata.date_last_released = repoData.date_last_released;
    json.metadata.date_last_commit = repoData.date_last_commit;
    json.metadata.github_stars = repoData.github_stars;

    // Update resources
    if (repoData.website && !json.resources.website) {
      json.resources.website = repoData.website;
    }
    if (repoData.documentation && !json.resources.documentation) {
      json.resources.documentation = repoData.documentation;
    }
    json.resources.issues = repoData.issues;
    json.resources.releases = repoData.releases;

    await fs.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');

    // Track changes
    const changes = {
      repository: json.name,
      oldStars: oldStars || 0,
      newStars: repoData.github_stars || 0,
      starDiff: (repoData.github_stars || 0) - (oldStars || 0),
      oldVersion: oldVersion || 'N/A',
      newVersion: repoData.version || 'N/A',
      versionChanged: oldVersion !== repoData.version,
      licenseChanged: oldLicense !== repoData.license,
      link: repoUrl
    };

    changeLog.push(changes);
    return true;
  } catch (error) {
    console.error(`ERROR: Failed to update ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Process files in parallel batches
 */
async function processBatch(files, currentIndex, totalFiles) {
  const promises = files.map(async ({ filePath, sourceUrl }, idx) => {
    const parsed = parseGitHubUrl(sourceUrl);
    if (!parsed) {
      return { success: false, file: filePath, skipped: true, reason: 'invalid_url' };
    }

    const repoData = await fetchRepoData(parsed.owner, parsed.repo);
    
    if (!repoData) {
      return { success: false, file: filePath, skipped: false, reason: 'fetch_failed' };
    }

    const updated = await updateJsonFile(filePath, repoData, sourceUrl);
    
    return { success: updated, file: filePath, skipped: false };
  });

  return Promise.all(promises);
}

/**
 * Print progress bar
 */
function printProgress(current, total, updated) {
  const percentage = ((current / total) * 100).toFixed(1);
  const barLength = 40;
  const filled = Math.round((current / total) * barLength);
  const bar = '='.repeat(filled) + '-'.repeat(barLength - filled);
  
  process.stdout.write(`\rUpdating metadata repos... ${current}/${total} (${percentage}%) [${bar}] | ${updated} updated`);
}

/**
 * Generate summary report content
 */
function generateSummaryContent(results) {
  let output = '';
  
  output += '# Repository Metadata Update Report\n\n';
  output += `**Generated:** ${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0]}\n\n`;

  // Statistics
  const totalFiles = results.length;
  const updated = results.filter(r => r.success).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success && !r.skipped).length;
  const starChanges = changeLog.filter(c => c.starDiff !== 0).length;
  const versionChanges = changeLog.filter(c => c.versionChanged).length;

  output += `Updated **${updated}** repositories. **${starChanges}** had star count changes.\n\n`;

  // Key Metrics Table
  output += '## Key Metrics\n\n';
  output += '| Metric | Count | Percent |\n';
  output += '|--------|-------|--------|\n';
  output += `| Total files | ${totalFiles} | 100% |\n`;
  output += `| Updated | ${updated} | ${((updated/totalFiles)*100).toFixed(1)}% |\n`;
  output += `| Star count changed | ${starChanges} | ${((starChanges/updated)*100).toFixed(1)}% of updated |\n`;
  output += `| Version changed | ${versionChanges} | ${((versionChanges/updated)*100).toFixed(1)}% of updated |\n`;
  output += `| Skipped (no source / invalid URL) | ${skipped} | ${((skipped/totalFiles)*100).toFixed(1)}% |\n`;
  output += `| Fetch failed | ${failed} | ${((failed/totalFiles)*100).toFixed(1)}% |\n\n`;

  // Detailed Changes Table
  if (changeLog.length > 0) {
    output += '## Detailed Changes\n\n';
    
    // Sort by star difference (descending)
    const sortedChanges = [...changeLog].sort((a, b) => Math.abs(b.starDiff) - Math.abs(a.starDiff));

    output += '| Repository | Old Stars | New Stars | Difference | Old Version | New Version | Link |\n';
    output += '|------------|-----------|-----------|------------|-------------|-------------|------|\n';
    
    for (const change of sortedChanges) {
      const diffStr = change.starDiff > 0 ? `+${change.starDiff}` : change.starDiff.toString();
      output += `| ${change.repository} | ${change.oldStars} | ${change.newStars} | ${diffStr} | ${change.oldVersion} | ${change.newVersion} | [Link](${change.link}) |\n`;
    }
  }

  return output;
}

/**
 * Generate and display summary table
 */
function generateSummaryTable(results) {
  console.log('\n\n' + '='.repeat(120));
  console.log('METADATA UPDATE REPORT');
  console.log('='.repeat(120));

  // Statistics
  const totalFiles = results.length;
  const updated = results.filter(r => r.success).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success && !r.skipped).length;
  const starChanges = changeLog.filter(c => c.starDiff !== 0).length;
  const versionChanges = changeLog.filter(c => c.versionChanged).length;

  console.log(`\nUpdated ${updated} repositories. ${starChanges} had star count changes.\n`);

  // Key Metrics Table
  console.log('Key Metrics');
  console.log('-'.repeat(120));
  console.log(`${'Metric'.padEnd(40)} | ${'Count'.padStart(10)} | ${'Percent'.padStart(10)}`);
  console.log('-'.repeat(120));
  console.log(`${'Total files'.padEnd(40)} | ${totalFiles.toString().padStart(10)} | ${'100%'.padStart(10)}`);
  console.log(`${'Updated'.padEnd(40)} | ${updated.toString().padStart(10)} | ${((updated/totalFiles)*100).toFixed(1).padStart(9)}%`);
  console.log(`${'Star count changed'.padEnd(40)} | ${starChanges.toString().padStart(10)} | ${((starChanges/updated)*100).toFixed(1).padStart(9)}% of updated`);
  console.log(`${'Version changed'.padEnd(40)} | ${versionChanges.toString().padStart(10)} | ${((versionChanges/updated)*100).toFixed(1).padStart(9)}% of updated`);
  console.log(`${'Skipped (no source / invalid URL)'.padEnd(40)} | ${skipped.toString().padStart(10)} | ${((skipped/totalFiles)*100).toFixed(1).padStart(9)}%`);
  console.log(`${'Fetch failed'.padEnd(40)} | ${failed.toString().padStart(10)} | ${((failed/totalFiles)*100).toFixed(1).padStart(9)}%`);
  console.log('-'.repeat(120));

  // Detailed Changes Table
  if (changeLog.length > 0) {
    console.log('\n\nDetailed Changes');
    console.log('-'.repeat(120));
    console.log(`${'Repository'.padEnd(25)} | ${'Old Stars'.padStart(10)} | ${'New Stars'.padStart(10)} | ${'Diff'.padStart(10)} | ${'Old Version'.padEnd(15)} | ${'New Version'.padEnd(15)}`);
    console.log('-'.repeat(120));

    // Sort by star difference (descending)
    const sortedChanges = [...changeLog].sort((a, b) => Math.abs(b.starDiff) - Math.abs(a.starDiff));

    for (const change of sortedChanges) {
      const diffStr = change.starDiff > 0 ? `+${change.starDiff}` : change.starDiff.toString();
      
      console.log(
        `${change.repository.padEnd(25)} | ${change.oldStars.toString().padStart(10)} | ${change.newStars.toString().padStart(10)} | ${diffStr.padStart(10)} | ${change.oldVersion.padEnd(15)} | ${change.newVersion.padEnd(15)}`
      );
    }
    console.log('-'.repeat(120));

    // Expandable section with links
    console.log('\n\n<details>');
    console.log('<summary>Repository Links (Click to expand)</summary>\n');
    console.log('| Repository | Old Stars | New Stars | Difference | Old Version | New Version | Link |');
    console.log('|------------|-----------|-----------|------------|-------------|-------------|------|');
    
    for (const change of sortedChanges) {
      const diffStr = change.starDiff > 0 ? `+${change.starDiff}` : change.starDiff.toString();
      console.log(
        `| ${change.repository} | ${change.oldStars} | ${change.newStars} | ${diffStr} | ${change.oldVersion} | ${change.newVersion} | [Link](${change.link}) |`
      );
    }
    
    console.log('\n</details>');
  }

  console.log('\n' + '='.repeat(120) + '\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting repository metadata update...\n');

  // Read all JSON files
  const files = await fs.readdir(JSON_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  console.log(`Found ${jsonFiles.length} JSON files\n`);

  // Parse all files and extract source_code URLs
  const filesToProcess = [];
  
  for (const file of jsonFiles) {
    const filePath = path.join(JSON_DIR, file);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const json = JSON.parse(content);
      
      if (json.resources?.source_code && json.resources.source_code.includes('github.com')) {
        filesToProcess.push({
          filePath,
          sourceUrl: json.resources.source_code
        });
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }

  // Apply limit if specified
  const totalToProcess = LIMIT ? Math.min(LIMIT, filesToProcess.length) : filesToProcess.length;
  const limitedFiles = filesToProcess.slice(0, totalToProcess);

  console.log(`Processing ${totalToProcess} repositories${LIMIT ? ` (limited to ${LIMIT})` : ''}\n`);

  // Process in batches
  const results = [];
  let updatedCount = 0;

  for (let i = 0; i < limitedFiles.length; i += BATCH_SIZE) {
    const batch = limitedFiles.slice(i, i + BATCH_SIZE);
    
    const batchResults = await processBatch(batch, i, limitedFiles.length);
    results.push(...batchResults);
    
    updatedCount += batchResults.filter(r => r.success).length;
    printProgress(Math.min(i + BATCH_SIZE, limitedFiles.length), limitedFiles.length, updatedCount);

    // Rate limit delay between batches
    if (i + BATCH_SIZE < limitedFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Final progress
  printProgress(limitedFiles.length, limitedFiles.length, updatedCount);
  console.log('\n');

  // Generate summary
  generateSummaryTable(results);

  // Save summary to file
  const summaryFile = path.join(__dirname, '../METADATA_UPDATE_SUMMARY.md');
  const summaryContent = generateSummaryContent(results);
  
  await fs.writeFile(summaryFile, summaryContent, 'utf-8');
  console.log(`\nSummary saved to: ${path.basename(summaryFile)}\n`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
