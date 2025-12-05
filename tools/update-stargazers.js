#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_DIR = path.join(__dirname, '../frontend/public/json');
const CONCURRENT_REQUESTS = process.env.GITHUB_TOKEN ? 50 : 10; // Parallel requests (50 with token, 10 without)



// Extract owner and repo from various URL formats
function parseRepoUrl(url) {
    if (!url) return null;

    // Remove protocol and www
    let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');

    // GitHub patterns
    const githubMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/\s]+)/i);
    if (githubMatch) {
        return {
            platform: 'github',
            owner: githubMatch[1],
            repo: githubMatch[2].replace(/\.git$/, '')
        };
    }

    // GitLab patterns
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
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ProxmoxVE-Scripts-Stargazer-Updater'
        };

        // Add GitHub token if available (increases rate limit from 60 to 5000/hour)
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            if (response.status === 404) {
                console.log(`  ⚠️  Repository not found: ${owner}/${repo}`);
                return null;
            }
            if (response.status === 403) {
                console.log(`  ⚠️  Rate limit hit. Please wait or use GitHub token.`);
                return null;
            }
            console.log(`  ⚠️  Error ${response.status} for ${owner}/${repo}`);
            return null;
        }

        const data = await response.json();
        return data.stargazers_count;
    } catch (error) {
        console.log(`  ❌ Error fetching ${owner}/${repo}:`, error.message);
        return null;
    }
}

// Fetch GitLab stars
async function fetchGitLabStars(owner, repo) {
    try {
        const projectPath = encodeURIComponent(`${owner}/${repo}`);
        const url = `https://gitlab.com/api/v4/projects/${projectPath}`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.log(`  ⚠️  Repository not found: ${owner}/${repo}`);
                return null;
            }
            console.log(`  ⚠️  Error ${response.status} for ${owner}/${repo}`);
            return null;
        }

        const data = await response.json();
        return data.star_count;
    } catch (error) {
        console.log(`  ❌ Error fetching ${owner}/${repo}:`, error.message);
        return null;
    }
}

// Update a single JSON file
async function updateJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        // Skip if no source_code
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

        // Update the file
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
        console.log(`  ❌ Error processing file:`, error.message);
        return { updated: false, reason: 'error' };
    }
}

// Process files in parallel with concurrency limit
async function processInParallel(files, concurrency, stats) {
    const results = [];
    let completed = 0;
    let lastProgressUpdate = Date.now();

    // Create a queue of promises
    const queue = [...files];
    const inProgress = new Set();

    return new Promise((resolve) => {
        const processNext = () => {
            // Start new tasks up to concurrency limit
            while (inProgress.size < concurrency && queue.length > 0) {
                const file = queue.shift();
                const fileName = path.basename(file);

                const promise = updateJsonFile(file)
                    .then(result => {
                        completed++;

                        // Update stats
                        if (result.updated) {
                            stats.updated++;
                            if (result.changed) {
                                stats.changed++;
                            }
                        } else {
                            switch (result.reason) {
                                case 'no_source': stats.noSource++; break;
                                case 'invalid_url': stats.invalidUrl++; break;
                                case 'fetch_failed': stats.fetchFailed++; break;
                                default: stats.errors++;
                            }
                        }

                        // Show progress every second
                        const now = Date.now();
                        if (now - lastProgressUpdate > 1000) {
                            process.stdout.write(`\r📊 Progress: ${completed}/${files.length} files processed (${Math.round(completed / files.length * 100)}%)`);
                            lastProgressUpdate = now;
                        }

                        return { file: fileName, result };
                    })
                    .finally(() => {
                        inProgress.delete(promise);
                        if (inProgress.size === 0 && queue.length === 0) {
                            process.stdout.write(`\r📊 Progress: ${completed}/${files.length} files processed (100%)\n`);
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
    console.log('🌟 Starting stargazers update (parallel mode)...\n');

    // Check for GitHub token
    if (process.env.GITHUB_TOKEN) {
        console.log('✅ GitHub token detected - using authenticated requests (5000/hour)\n');
    } else {
        console.log('⚠️  No GitHub token - using unauthenticated requests (60/hour)');
        console.log('   Set GITHUB_TOKEN env variable for higher rate limits\n');
    }

    // Get all JSON files
    const files = fs.readdirSync(JSON_DIR)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(JSON_DIR, file));

    console.log(`� Fiound ${files.length} JSON files`);
    console.log(`🚀 Processing with ${CONCURRENT_REQUESTS} parallel requests\n`);

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

    // Process files in parallel
    await processInParallel(files, CONCURRENT_REQUESTS, stats);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Final Summary:');
    console.log('='.repeat(60));
    console.log(`Total files:           ${stats.total}`);
    console.log(`✅ Updated:            ${stats.updated}`);
    console.log(`🔄 Changed:            ${stats.changed}`);
    console.log(`⊘  No source code:     ${stats.noSource}`);
    console.log(`⊘  Invalid URL:        ${stats.invalidUrl}`);
    console.log(`⚠️  Fetch failed:       ${stats.fetchFailed}`);
    console.log(`❌ Errors:             ${stats.errors}`);
    console.log(`⏱️  Duration:           ${duration}s`);
    console.log('='.repeat(60));
    console.log('\n✨ Done!\n');
}

main().catch(console.error);
