#!/usr/bin/env node

/**
 * Check Community Integrations support for all apps
 * - Proxmox VE Community Scripts
 * - YunoHost Apps
 * - TrueNAS Apps
 * 
 * Usage: GITHUB_TOKEN=your_token node tools/check-community-integrations.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const JSON_DIR = path.join(__dirname, '../public/json');
const PROXMOX_API_URL = 'https://api.github.com/repos/community-scripts/ProxmoxVE/contents/ct';
const YUNOHOST_ORG_API = 'https://api.github.com/orgs/YunoHost-Apps/repos';
const TRUENAS_CATALOG_API = 'https://api.github.com/repos/truenas/apps/contents/trains/community';

if (!GITHUB_TOKEN) {
  console.error('ERROR: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

/**
 * Fetch Proxmox community scripts
 */
async function fetchProxmoxScripts() {
  try {
    const response = await fetch(PROXMOX_API_URL, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const files = await response.json();
    const scriptNames = files
      .filter(file => file.name.endsWith('.sh'))
      .map(file => file.name.replace('.sh', '').toLowerCase());

    return scriptNames;
  } catch (error) {
    console.error('ERROR: Failed to fetch Proxmox scripts:', error.message);
    return [];
  }
}

/**
 * Fetch TrueNAS community apps
 */
async function fetchTrueNASApps() {
  try {
    const response = await fetch(TRUENAS_CATALOG_API, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const items = await response.json();
    const appNames = items
      .filter(item => item.type === 'dir')
      .map(item => item.name.toLowerCase());

    return appNames;
  } catch (error) {
    console.error('ERROR: Failed to fetch TrueNAS apps:', error.message);
    return [];
  }
}

/**
 * Fetch YunoHost app repositories
 */
async function fetchYunoHostRepos() {
  const repos = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const response = await fetch(`${YUNOHOST_ORG_API}?per_page=${perPage}&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.length === 0) break;
      
      const appRepos = data
        .filter(repo => repo.name.endsWith('_ynh'))
        .map(repo => ({
          name: repo.name.replace('_ynh', ''),
          fullName: repo.name
        }));
      
      repos.push(...appRepos);
      if (data.length < perPage) break;
      page++;
    }

    return repos;
  } catch (error) {
    console.error('ERROR: Failed to fetch YunoHost repos:', error.message);
    return [];
  }
}

/**
 * Normalize app name for matching
 */
function normalizeAppName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Find matches for an app
 */
function findMatches(appSlug, appName, proxmoxScripts, yunohostRepos, truenasApps) {
  const normalizedSlug = normalizeAppName(appSlug);
  const normalizedName = normalizeAppName(appName);

  // Find Proxmox match
  let proxmoxMatch = proxmoxScripts.find(script => 
    normalizeAppName(script) === normalizedSlug ||
    normalizeAppName(script) === normalizedName
  );

  if (!proxmoxMatch) {
    proxmoxMatch = proxmoxScripts.find(script => {
      const normalized = normalizeAppName(script);
      return normalized.includes(normalizedSlug) || normalizedSlug.includes(normalized) ||
             normalized.includes(normalizedName) || normalizedName.includes(normalized);
    });
  }

  // Find YunoHost match
  let yunohostMatch = yunohostRepos.find(repo => 
    normalizeAppName(repo.name) === normalizedSlug ||
    normalizeAppName(repo.name) === normalizedName
  );

  if (!yunohostMatch) {
    yunohostMatch = yunohostRepos.find(repo => {
      const normalized = normalizeAppName(repo.name);
      return normalized.includes(normalizedSlug) || normalizedSlug.includes(normalized) ||
             normalized.includes(normalizedName) || normalizedName.includes(normalized);
    });
  }

  // Find TrueNAS match
  let truenasMatch = truenasApps.find(app => 
    normalizeAppName(app) === normalizedSlug ||
    normalizeAppName(app) === normalizedName
  );

  if (!truenasMatch) {
    truenasMatch = truenasApps.find(app => {
      const normalized = normalizeAppName(app);
      return normalized.includes(normalizedSlug) || normalizedSlug.includes(normalized) ||
             normalized.includes(normalizedName) || normalizedName.includes(normalized);
    });
  }

  return { proxmoxMatch, yunohostMatch, truenasMatch };
}

/**
 * Update JSON file with community integrations
 */
async function updateJsonFile(filePath, proxmoxMatch, yunohostMatch, truenasMatch) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(content);

    if (!json.community_integrations) {
      json.community_integrations = {};
    }

    // Update Proxmox - use script_id for URL
    if (proxmoxMatch) {
      json.community_integrations.proxmox_ve = {
        supported: true,
        script_id: proxmoxMatch,
        url: `https://community-scripts.github.io/ProxmoxVE/scripts?id=${proxmoxMatch}`
      };
    } else if (json.community_integrations.proxmox_ve) {
      delete json.community_integrations.proxmox_ve;
    }

    // Update YunoHost
    if (yunohostMatch) {
      json.community_integrations.yunohost = {
        supported: true,
        repo_name: yunohostMatch.fullName,
        url: `https://github.com/YunoHost-Apps/${yunohostMatch.fullName}`
      };
    } else if (json.community_integrations.yunohost) {
      delete json.community_integrations.yunohost;
    }

    // Update TrueNAS
    if (truenasMatch) {
      json.community_integrations.truenas = {
        supported: true,
        app_name: truenasMatch,
        url: `https://apps.truenas.com/catalog/${truenasMatch}`
      };
    } else if (json.community_integrations.truenas) {
      delete json.community_integrations.truenas;
    }

    // Remove community_integrations if empty
    if (Object.keys(json.community_integrations).length === 0) {
      delete json.community_integrations;
    }

    await fs.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
    return true;
  } catch (error) {
    console.error(`ERROR: Failed to update ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Print progress bar
 */
function printProgress(current, total) {
  const percentage = ((current / total) * 100).toFixed(0);
  const barLength = 40;
  const filled = Math.round((current / total) * barLength);
  const bar = '='.repeat(filled) + '.'.repeat(barLength - filled);
  
  process.stdout.write(`\r${current}/${total} [${bar}] ${percentage}%`);
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting Community Integrations check...\n');

  // Fetch data
  console.log('Fetching Proxmox VE Community Scripts...');
  const proxmoxScripts = await fetchProxmoxScripts();
  console.log(`Found ${proxmoxScripts.length} scripts\n`);

  console.log('Fetching YunoHost Apps...');
  const yunohostRepos = await fetchYunoHostRepos();
  console.log(`Found ${yunohostRepos.length} apps\n`);

  console.log('Fetching TrueNAS Apps...');
  const truenasApps = await fetchTrueNASApps();
  console.log(`Found ${truenasApps.length} apps\n`);

  if (proxmoxScripts.length === 0 && yunohostRepos.length === 0 && truenasApps.length === 0) {
    console.error('ERROR: No data fetched. Exiting.');
    process.exit(1);
  }

  // Read all JSON files
  const files = await fs.readdir(JSON_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json') && !f.match(/^(index|metadata|versions)\.json$/));

  console.log(`Processing ${jsonFiles.length} apps...\n`);

  const results = [];

  // Process each file
  for (let i = 0; i < jsonFiles.length; i++) {
    const file = jsonFiles[i];
    const filePath = path.join(JSON_DIR, file);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const json = JSON.parse(content);

      // Skip if missing required fields
      if (!json.slug || !json.name) {
        continue;
      }

      const { proxmoxMatch, yunohostMatch, truenasMatch } = findMatches(
        json.slug,
        json.name,
        proxmoxScripts,
        yunohostRepos,
        truenasApps
      );

      await updateJsonFile(filePath, proxmoxMatch, yunohostMatch, truenasMatch);

      results.push({
        name: json.name,
        slug: json.slug,
        proxmox: !!proxmoxMatch,
        yunohost: !!yunohostMatch,
        truenas: !!truenasMatch
      });

      printProgress(i + 1, jsonFiles.length);
    } catch (error) {
      console.error(`\nError processing ${file}:`, error.message);
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('COMMUNITY INTEGRATIONS SUMMARY');
  console.log('='.repeat(80) + '\n');

  // Statistics
  const totalApps = results.length;
  const proxmoxCount = results.filter(r => r.proxmox).length;
  const yunohostCount = results.filter(r => r.yunohost).length;
  const truenasCount = results.filter(r => r.truenas).length;
  const anyCount = results.filter(r => r.proxmox || r.yunohost || r.truenas).length;
  const noneCount = results.filter(r => !r.proxmox && !r.yunohost && !r.truenas).length;

  console.log(`Total apps:              ${totalApps}`);
  console.log(`Proxmox VE support:      ${proxmoxCount} (${((proxmoxCount/totalApps)*100).toFixed(1)}%)`);
  console.log(`YunoHost support:        ${yunohostCount} (${((yunohostCount/totalApps)*100).toFixed(1)}%)`);
  console.log(`TrueNAS support:         ${truenasCount} (${((truenasCount/totalApps)*100).toFixed(1)}%)`);
  console.log(`Any integration:         ${anyCount} (${((anyCount/totalApps)*100).toFixed(1)}%)`);
  console.log(`No integration:          ${noneCount} (${((noneCount/totalApps)*100).toFixed(1)}%)`);

  // Summary table
  console.log('\n' + '='.repeat(80));
  console.log('Community Integrations Support');
  console.log('='.repeat(80) + '\n');

  console.log('| App Name                          |  Proxmox VE  |   YunoHost   |   TrueNAS    |');
  console.log('|-----------------------------------|--------------|--------------|--------------|');

  // Show apps with at least one integration
  const appsWithIntegration = results.filter(r => r.proxmox || r.yunohost || r.truenas);
  
  for (const app of appsWithIntegration.slice(0, 50)) {
    const name = app.name.padEnd(33).substring(0, 33);
    const proxmox = app.proxmox ? '     ✅     ' : '            ';
    const yunohost = app.yunohost ? '     ✅     ' : '            ';
    const truenas = app.truenas ? '     ✅     ' : '            ';
    console.log(`| ${name} | ${proxmox} | ${yunohost} | ${truenas} |`);
  }

  if (appsWithIntegration.length > 50) {
    console.log(`| ... and ${appsWithIntegration.length - 50} more apps with integrations`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
  console.log('Community integrations check complete!\n');

  // Write summary to file for GitHub Actions
  const summaryPath = path.join(__dirname, '../COMMUNITY_INTEGRATIONS_SUMMARY.txt');
  const summaryContent = `Total apps: ${totalApps}
Proxmox VE support: ${proxmoxCount} (${((proxmoxCount/totalApps)*100).toFixed(1)}%)
YunoHost support: ${yunohostCount} (${((yunohostCount/totalApps)*100).toFixed(1)}%)
TrueNAS support: ${truenasCount} (${((truenasCount/totalApps)*100).toFixed(1)}%)
Any integration: ${anyCount} (${((anyCount/totalApps)*100).toFixed(1)}%)
No integration: ${noneCount} (${((noneCount/totalApps)*100).toFixed(1)}%)`;
  
  await fs.writeFile(summaryPath, summaryContent, 'utf-8');
  console.log(`Summary written to: ${path.basename(summaryPath)}\n`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
