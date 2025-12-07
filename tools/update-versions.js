#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_DIR = path.join(__dirname, '../public/json');
const VERSIONS_FILE = path.join(JSON_DIR, 'versions.json');
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
            repo: githubMatch[2].replace(/\.git$/, ''),
            fullName: `${githubMatch[1]}/${githubMatch[2].replace(/\.git$/, '')}`
        };
    }

    const gitlabMatch = cleanUrl.match(/gitlab\.com\/([^\/]+)\/([^\/\s]+)/i);
    if (gitlabMatch) {
        return {
            platform: 'gitlab',
            owner: gitlabMatch[1],
            repo: gitlabMatch[2].replace(/\.git$/, ''),
            fullName: `${gitlabMatch[1]}/${gitlabMatch[2].replace(/\.git$/, '')}`
        };
    }

    return null;
}

// Fetch latest GitHub release
async function fetchGitHubLatestRelease(owner, repo) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'DailyFOSS-Version-Updater'
        };

        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            if (response.status === 404) {
                return await fetchGitHubLatestTag(owner, repo);
            }
            return null;
        }

        const data = await response.json();
        return {
            version: data.tag_name,
            date: data.published_at
        };
    } catch (error) {
        return null;
    }
}

// Fetch latest GitHub tag (fallback)
async function fetchGitHubLatestTag(owner, repo) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/tags`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'DailyFOSS-Version-Updater'
        };

        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (data.length === 0) {
            return null;
        }

        const latestTag = data[0];
        const commitResponse = await fetch(latestTag.commit.url, { headers });
        if (!commitResponse.ok) {
            return {
                version: latestTag.name,
                date: new Date().toISOString()
            };
        }

        const commitData = await commitResponse.json();
        return {
            version: latestTag.name,
            date: commitData.commit.committer.date
        };
    } catch (error) {
        return null;
    }
}

// Fetch latest GitLab release
async function fetchGitLabLatestRelease(owner, repo) {
    try {
        const projectPath = encodeURIComponent(`${owner}/${repo}`);
        const url = `https://gitlab.com/api/v4/projects/${projectPath}/releases`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (data.length === 0) {
            return null;
        }

        return {
            version: data[0].tag_name,
            date: data[0].released_at
        };
    } catch (error) {
        return null;
    }
}

// Update a single repo version
async function updateRepoVersion(repoInfo, existingEntry) {
    try {
        const { platform, owner, repo, fullName } = repoInfo;

        let result = null;

        if (platform === 'github') {
            result = await fetchGitHubLatestRelease(owner, repo);
        } else if (platform === 'gitlab') {
            result = await fetchGitLabLatestRelease(owner, repo);
        }

        if (!result) {
            return {
                name: fullName,
                version: existingEntry?.version || 'unknown',
                date: existingEntry?.date || new Date().toISOString(),
                updated: false,
                reason: 'fetch_failed'
            };
        }

        const oldVersion = existingEntry?.version;
        const changed = oldVersion && oldVersion !== result.version;

        return {
            name: fullName,
            version: result.version,
            date: result.date,
            updated: true,
            changed,
            oldVersion
        };
    } catch (error) {
        return {
            name: repoInfo.fullName,
            version: existingEntry?.version || 'unknown',
            date: existingEntry?.date || new Date().toISOString(),
            updated: false,
            reason: 'error'
        };
    }
}

// Process repos in parallel with concurrency limit
async function processInParallel(repoList, existingVersions, concurrency, stats) {
    const results = [];
    let completed = 0;
    let lastProgressUpdate = Date.now();

    const queue = [...repoList];
    const inProgress = new Set();

    return new Promise((resolve) => {
        const processNext = () => {
            while (inProgress.size < concurrency && queue.length > 0) {
                const repoInfo = queue.shift();
                const existingEntry = existingVersions.find(v => v.name === repoInfo.fullName);

                const promise = updateRepoVersion(repoInfo, existingEntry)
                    .then(result => {
                        completed++;

                        if (result.updated) {
                            stats.updated++;
                            if (result.changed) {
                                stats.changed++;
                            }
                            if (!existingEntry) {
                                stats.added++;
                            }
                        } else {
                            switch (result.reason) {
                                case 'fetch_failed': stats.fetchFailed++; break;
                                default: stats.errors++;
                            }
                        }

                        const now = Date.now();
                        if (now - lastProgressUpdate > 1000) {
                            process.stdout.write(`\rProgress: ${completed}/${repoList.length} repos processed (${Math.round(completed / repoList.length * 100)}%)`);
                            lastProgressUpdate = now;
                        }

                        return result;
                    })
                    .finally(() => {
                        inProgress.delete(promise);
                        if (inProgress.size === 0 && queue.length === 0) {
                            process.stdout.write(`\rProgress: ${completed}/${repoList.length} repos processed (100%)\n`);
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
    console.log('Starting versions update (parallel mode)...\n');

    if (process.env.GITHUB_TOKEN) {
        console.log('GitHub token detected - using authenticated requests (5000/hour)\n');
    } else {
        console.log('No GitHub token - using unauthenticated requests (60/hour)');
        console.log('Set GITHUB_TOKEN env variable for higher rate limits\n');
    }

    // Read all JSON files from the json directory
    const files = fs.readdirSync(JSON_DIR)
        .filter(file => file.endsWith('.json') && file !== 'versions.json')
        .map(file => path.join(JSON_DIR, file));

    console.log(`Found ${files.length} JSON files to scan\n`);

    // Extract unique repos from all JSON files
    const repoMap = new Map();
    let filesWithRepos = 0;

    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const data = JSON.parse(content);

            if (data.source_code) {
                const repoInfo = parseRepoUrl(data.source_code);
                if (repoInfo) {
                    repoMap.set(repoInfo.fullName, repoInfo);
                    filesWithRepos++;
                }
            }
        } catch (error) {
            // Skip invalid JSON files
        }
    }

    const uniqueRepos = Array.from(repoMap.values());
    console.log(`Found ${uniqueRepos.length} unique repositories from ${filesWithRepos} apps`);
    console.log(`Processing with ${CONCURRENT_REQUESTS} parallel requests\n`);

    // Read existing versions file if it exists
    let existingVersions = [];
    if (fs.existsSync(VERSIONS_FILE)) {
        try {
            existingVersions = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));
        } catch (error) {
            console.log('Could not read existing versions.json, starting fresh\n');
        }
    }

    const stats = {
        total: uniqueRepos.length,
        updated: 0,
        changed: 0,
        added: 0,
        fetchFailed: 0,
        errors: 0
    };

    const startTime = Date.now();

    // Process repos in parallel
    const results = await processInParallel(uniqueRepos, existingVersions, CONCURRENT_REQUESTS, stats);
    const updatedRepos = await Promise.all(results);

    // Sort by date (newest first)
    updatedRepos.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Write back to file
    fs.writeFileSync(
        VERSIONS_FILE,
        JSON.stringify(updatedRepos.map(r => ({
            name: r.name,
            version: r.version,
            date: r.date
        })), null, 2) + '\n',
        'utf8'
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Show changed versions
    if (stats.changed > 0) {
        console.log('\nChanged versions:');
        console.log('='.repeat(60));
        updatedRepos
            .filter(r => r.changed)
            .slice(0, 20)
            .forEach(r => {
                console.log(`  ${r.name}: ${r.oldVersion} -> ${r.version}`);
            });
        if (stats.changed > 20) {
            console.log(`  ... and ${stats.changed - 20} more`);
        }
    }

    // Show new repos
    if (stats.added > 0) {
        console.log('\nNew repositories added:');
        console.log('='.repeat(60));
        updatedRepos
            .filter(r => !existingVersions.find(v => v.name === r.name))
            .slice(0, 10)
            .forEach(r => {
                console.log(`  ${r.name}: ${r.version}`);
            });
        if (stats.added > 10) {
            console.log(`  ... and ${stats.added - 10} more`);
        }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('Final Summary:');
    console.log('='.repeat(60));
    console.log(`Total repos:           ${stats.total}`);
    console.log(`Updated:               ${stats.updated}`);
    console.log(`Changed:               ${stats.changed}`);
    console.log(`Added:                 ${stats.added}`);
    console.log(`Fetch failed:          ${stats.fetchFailed}`);
    console.log(`Errors:                ${stats.errors}`);
    console.log(`Duration:              ${duration}s`);
    console.log('='.repeat(60));
    console.log('\nDone!\n');

    // Write summary for GitHub Actions
    const summaryPath = process.env.GITHUB_STEP_SUMMARY || '.update-versions-summary.md';
    const changedVersions = updatedRepos.filter(r => r.changed);
    const newRepos = updatedRepos.filter(r => !existingVersions.find(v => v.name === r.name));
    
    const successRate = stats.total ? ((stats.updated / stats.total) * 100).toFixed(1) : '0.0';
    const changeRate = stats.updated > 0 ? ((stats.changed / stats.updated) * 100).toFixed(1) : '0.0';
    
    let summary = `## Version Update Report\n\n`;
    
    // Status
    if (stats.changed > 0) {
        summary += `> ${stats.changed} version${stats.changed > 1 ? 's' : ''} updated successfully\n\n`;
    } else if (stats.updated > 0) {
        summary += `> All versions are up to date\n\n`;
    } else {
        summary += `> No versions could be updated\n\n`;
    }

    // Key metrics
    summary += `### Statistics\n\n`;
    summary += `| Metric | Count | Percentage |\n`;
    summary += `|--------|------:|----------:|\n`;
    summary += `| Total Repositories | ${stats.total} | 100% |\n`;
    summary += `| Successfully Updated | ${stats.updated} | ${successRate}% |\n`;
    summary += `| Version Changed | ${stats.changed} | ${changeRate}% |\n`;
    summary += `| New Repositories | ${stats.added} | - |\n`;
    summary += `| Failed to Fetch | ${stats.fetchFailed} | ${stats.total ? ((stats.fetchFailed / stats.total) * 100).toFixed(1) : '0.0'}% |\n`;
    summary += `\n`;
    summary += `Processing Time: ${duration}s\n\n`;

    if (stats.changed > 0) {
        summary += `---\n\n`;
        summary += `### Version Changes (${stats.changed} total)\n\n`;
        summary += `<details>\n`;
        summary += `<summary>Click to expand version changes</summary>\n\n`;
        summary += `| Repository | Old Version | New Version | Link |\n`;
        summary += `|------------|-------------|-------------|------|\n`;
        changedVersions.slice(0, 100).forEach(r => {
            const repoUrl = `https://github.com/${r.name}`;
            summary += `| \`${r.name}\` | \`${r.oldVersion}\` | \`${r.version}\` | [View](${repoUrl}/releases) |\n`;
        });
        if (stats.changed > 100) {
            summary += `\n*... and ${stats.changed - 100} more changes*\n`;
        }
        summary += `\n</details>\n\n`;
    }

    if (stats.added > 0) {
        summary += `---\n\n`;
        summary += `### New Repositories Added (${stats.added} total)\n\n`;
        summary += `<details>\n`;
        summary += `<summary>Click to expand new repositories</summary>\n\n`;
        summary += `| Repository | Initial Version | Link |\n`;
        summary += `|------------|----------------|------|\n`;
        newRepos.slice(0, 50).forEach(r => {
            const repoUrl = `https://github.com/${r.name}`;
            summary += `| \`${r.name}\` | \`${r.version}\` | [View](${repoUrl}) |\n`;
        });
        if (stats.added > 50) {
            summary += `\n*... and ${stats.added - 50} more*\n`;
        }
        summary += `\n</details>\n\n`;
    }

    if (stats.fetchFailed > 0) {
        summary += `---\n\n`;
        summary += `### Failed Fetches\n\n`;
        summary += `${stats.fetchFailed} repositories could not be fetched. Common reasons:\n`;
        summary += `- Repository moved, renamed, or deleted\n`;
        summary += `- No releases or tags available\n`;
        summary += `- API rate limits exceeded\n`;
        summary += `- Network connectivity issues\n\n`;
    }

    summary += `---\n\n`;
    summary += `Report generated: ${new Date().toUTCString()}\n`;

    fs.writeFileSync(summaryPath, summary, 'utf8');
}

main().catch(console.error);
