#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_DIR = path.join(__dirname, '../public/json');
const CONCURRENT_REQUESTS = process.env.GITHUB_TOKEN ? 50 : 10;

// Extract owner and repo from various URL formats
function parseRepoUrl(url) {
    if (!url) return null;

    let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');

    const githubMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/\s]+)/i);
    if (githubMatch) {
        return {
            platform: 'github',
            owner: githubMatch[1],
            repo: githubMatch[2].replace(/\.git$/, '')
        };
    }

    const gitlabMatch = cleanUrl.match(/gitlab\.com\/([^\/]+)\/([^\/\s]+)/i);
    if (gitlabMatch) {
        return {
            platform: 'gitlab',
            owner: gitlabMatch[1],
            repo: gitlabMatch[2].replace(/\.git$/, '')
        };
    }

    return null;
}

// Fetch GitHub stars
async function fetchGitHubStars(owner, repo) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}`;
        const headers = {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'DailyFOSS-Stargazer-Updater'
        };

        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            if (response.status === 404) {
                console.log(`Repository not found: ${owner}/${repo}`);
                return null;
            }
            if (response.status === 403) {
                console.log(`Rate limit reached. Use a GitHub token for increased limits.`);
                return null;
            }
            console.log(`Error ${response.status} for ${owner}/${repo}`);
            return null;
        }

        const data = await response.json();
        return data.stargazers_count;
    } catch (error) {
        console.log(`Error fetching ${owner}/${repo}: ${error.message}`);
        return null;
    }
}

// Fetch GitLab stars
async function fetchGitLabStars(owner, repo) {
    try {
        const projectPath = encodeURIComponent(`${owner}/${repo}`);
        const url = `https://gitlab.com/api/v4/projects/${projectPath}`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });

        if (!response.ok) {
            if (response.status === 404) {
                console.log(`Repository not found: ${owner}/${repo}`);
                return null;
            }
            console.log(`Error ${response.status} for ${owner}/${repo}`);
            return null;
        }

        const data = await response.json();
        return data.star_count;
    } catch (error) {
        console.log(`Error fetching ${owner}/${repo}: ${error.message}`);
        return null;
    }
}

// Update a single JSON file
async function updateJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        if (!data.source_code) {
            return { updated: false, reason: 'no_source' };
        }

        const repoInfo = parseRepoUrl(data.source_code);
        if (!repoInfo) {
            return { updated: false, reason: 'invalid_url' };
        }

        let stars = null;
        if (repoInfo.platform === 'github') {
            stars = await fetchGitHubStars(repoInfo.owner, repoInfo.repo);
        } else if (repoInfo.platform === 'gitlab') {
            stars = await fetchGitLabStars(repoInfo.owner, repoInfo.repo);
        }

        if (stars === null) {
            return { updated: false, reason: 'fetch_failed' };
        }

        const oldStars = data.github_stars;
        data.github_stars = stars.toString();

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');

        return {
            updated: true,
            stars,
            oldStars,
            changed: oldStars !== stars.toString()
        };
    } catch (error) {
        console.log(`Error processing file: ${error.message}`);
        return { updated: false, reason: 'error' };
    }
}

// Process files in parallel with concurrency limit
async function processInParallel(files, concurrency, stats) {
    const results = [];
    let completed = 0;
    let lastProgressUpdate = Date.now();

    const queue = [...files];
    const inProgress = new Set();

    return new Promise((resolve) => {
        const processNext = () => {
            while (inProgress.size < concurrency && queue.length > 0) {
                const file = queue.shift();
                const fileName = path.basename(file);

                const promise = updateJsonFile(file)
                    .then(result => {
                        completed++;

                        if (result.updated) {
                            stats.updated++;
                            if (result.changed) stats.changed++;
                        } else {
                            if (result.reason === 'no_source') stats.noSource++;
                            else if (result.reason === 'invalid_url') stats.invalidUrl++;
                            else if (result.reason === 'fetch_failed') stats.fetchFailed++;
                            else stats.errors++;
                        }

                        const now = Date.now();
                        if (now - lastProgressUpdate > 1000) {
                            process.stdout.write(
                                `\rProgress: ${completed}/${files.length} files processed (${Math.round(completed / files.length * 100)}%)`
                            );
                            lastProgressUpdate = now;
                        }

                        return { file: fileName, result };
                    })
                    .finally(() => {
                        inProgress.delete(promise);
                        if (inProgress.size === 0 && queue.length === 0) {
                            process.stdout.write(`\rProgress: ${completed}/${files.length} files processed (100%)\n`);
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

// Main function
async function main() {
    console.log('Starting stargazers update (parallel mode)...\n');

    if (process.env.GITHUB_TOKEN) {
        console.log('GitHub token detected - using authenticated requests (5000/hour)\n');
    } else {
        console.log('No GitHub token - using unauthenticated requests (60/hour)');
        console.log('Set GITHUB_TOKEN environment variable for higher rate limits\n');
    }

    const files = fs.readdirSync(JSON_DIR)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(JSON_DIR, file));

    console.log(`Found ${files.length} JSON files`);
    console.log(`Processing with ${CONCURRENT_REQUESTS} parallel requests\n`);

    const stats = {
        total: files.length,
        updated: 0,
        changed: 0,
        noSource: 0,
        invalidUrl: 0,
        fetchFailed: 0,
        errors: 0
    };

    const startTime = Date.now();

    await processInParallel(files, CONCURRENT_REQUESTS, stats);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n------------------------------------------------------------');
    console.log('Final Summary:');
    console.log('------------------------------------------------------------');
    console.log(`Total files:           ${stats.total}`);
    console.log(`Updated:               ${stats.updated}`);
    console.log(`Changed:               ${stats.changed}`);
    console.log(`No source code:        ${stats.noSource}`);
    console.log(`Invalid URL:           ${stats.invalidUrl}`);
    console.log(`Fetch failed:          ${stats.fetchFailed}`);
    console.log(`Errors:                ${stats.errors}`);
    console.log(`Duration:              ${duration}s`);
    console.log('------------------------------------------------------------\n');

    // Write summary for GitHub Actions
    const summaryPath = process.env.GITHUB_STEP_SUMMARY || '.update-stargazers-summary.md';

    const total = stats.total || 0;
    const updated = stats.updated || 0;
    const changed = stats.changed || 0;
    const noSource = stats.noSource || 0;
    const invalidUrl = stats.invalidUrl || 0;
    const fetchFailed = stats.fetchFailed || 0;
    const errors = stats.errors || 0;
    const skippedTotal = noSource + invalidUrl;

    const successRate = total ? ((updated / total) * 100).toFixed(1) : '0.0';
    const changeRate = updated ? ((changed / updated) * 100).toFixed(1) : '0.0';
    const skippedRate = total ? ((skippedTotal / total) * 100).toFixed(1) : '0.0';
    const fetchFailedRate = total ? ((fetchFailed / total) * 100).toFixed(1) : '0.0';

    let summary = `# Stargazers Update Report\n\n`;

    if (changed > 0) {
        summary += `Updated ${updated} repositories. ${changed} had star count changes.\n\n`;
    } else if (updated > 0) {
        summary += `All ${updated} repositories checked. No star count changes detected.\n\n`;
    } else {
        summary += `No star counts were updated.\n\n`;
    }

    summary += `## Key Metrics\n\n`;
    summary += `| Metric | Count | Percent |\n`;
    summary += `|--------|------:|--------:|\n`;
    summary += `| Total files | ${total} | 100% |\n`;
    summary += `| Updated | ${updated} | ${successRate}% |\n`;
    summary += `| Star count changed | ${changed} | ${changeRate}% of updated |\n`;
    summary += `| Skipped (no source / invalid URL) | ${skippedTotal} | ${skippedRate}% |\n`;
    summary += `| Fetch failed | ${fetchFailed} | ${fetchFailedRate}% |\n`;
    summary += `| Errors | ${errors} | ${errors ? ((errors/total)*100).toFixed(1)+'%' : '0.0%'} |\n\n`;

    summary += `## Summary\n\n`;
    summary += `Processed ${total} files in ${duration}s.\n`;
    summary += `${updated} were updated, ${changed} had star changes.\n`;
    if (skippedTotal > 0) {
        summary += `${skippedTotal} skipped (${noSource} missing source URL, ${invalidUrl} invalid URLs).\n`;
    }
    if (fetchFailed > 0) {
        summary += `${fetchFailed} repositories could not be fetched.\n`;
    }
    if (errors > 0) {
        summary += `${errors} files had processing errors.\n`;
    }
    summary += `\n`;

    summary += `## Detailed Breakdown\n\n`;
    summary += '```\n';
    summary += `Total:        ${String(total).padStart(6)}\n`;
    summary += `Updated:      ${String(updated).padStart(6)}\n`;
    summary += `Changed:      ${String(changed).padStart(6)}\n`;
    summary += `No source:    ${String(noSource).padStart(6)}\n`;
    summary += `Invalid URL:  ${String(invalidUrl).padStart(6)}\n`;
    summary += `Fetch failed: ${String(fetchFailed).padStart(6)}\n`;
    summary += `Errors:       ${String(errors).padStart(6)}\n`;
    summary += `Duration:     ${String(duration + 's').padStart(6)}\n`;
    summary += '```\n\n';

    summary += `Report generated: ${new Date().toUTCString()}\n`;

    fs.writeFileSync(summaryPath, summary, 'utf8');
}

main().catch(console.error);
