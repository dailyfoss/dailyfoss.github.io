# Platform Detection Tools

Complete toolkit for detecting and managing platform support across all repositories.

## 🚀 Quick Start

```bash
cd frontend

# Check current statistics
npm run check-platform-stats

# Update all platforms (standard speed)
npm run update-platforms

# Update all platforms (fast mode with GitHub token)
GITHUB_TOKEN=your_token npm run update-platforms:fast
```

## 📦 Available Tools

### 1. `update-platforms.js` - Main Platform Detector

Automatically detects platform support by analyzing GitHub release assets.

**Usage:**
```bash
# Standard (10 parallel)
npm run update-platforms

# Fast mode (50 parallel)
npm run update-platforms:fast

# Custom parallelism
PARALLEL_LIMIT=20 npm run update-platforms

# With GitHub token
GITHUB_TOKEN=your_token npm run update-platforms
```

**What it detects:**
- 🖥️ **Desktop**: Linux, Windows, macOS
- 📱 **Mobile**: Android, iOS

**How it works:**
1. Reads all JSON files from `frontend/public/json/`
2. Fetches up to 5 recent releases from GitHub API (in parallel)
3. Analyzes release asset names for platform patterns
4. Updates `install_methods[0].platform` fields

### 2. `check-platform-stats.js` - Statistics Viewer

Shows current platform support statistics across all apps.

**Usage:**
```bash
npm run check-platform-stats
```

**Output:**
```
📊 Platform Support Statistics

Total apps: 1166

🖥️  Desktop Support:
   Linux:      5 (0.4%)
   Windows:    5 (0.4%)
   macOS:      5 (0.4%)
   
📱 Mobile Support:
   Android:    1 (0.1%)
   iOS:        1 (0.1%)
```

### 3. `test-update-platforms-quick.js` - Quick Test

Tests platform detection on 5 sample files for verification.

**Usage:**
```bash
node tools/test-update-platforms-quick.js
```

## ⚙️ Configuration

### Parallel Processing

Control how many repositories are processed simultaneously:

```bash
# Default: 10 parallel
npm run update-platforms

# Faster: 20 parallel
PARALLEL_LIMIT=20 npm run update-platforms

# Maximum speed: 50 parallel (requires GitHub token)
PARALLEL_LIMIT=50 GITHUB_TOKEN=your_token npm run update-platforms

# Conservative: 3 parallel (without token to avoid rate limits)
PARALLEL_LIMIT=3 npm run update-platforms
```

### GitHub Token

For higher API rate limits (5000 req/hour vs 60 req/hour):

1. Create a token at: https://github.com/settings/tokens
2. No special permissions needed (public repo access only)
3. Use it:
   ```bash
   export GITHUB_TOKEN=your_token_here
   npm run update-platforms
   ```

## 🎯 Platform Detection Patterns

The tool detects platforms by matching release asset names:

### Desktop Platforms

| Platform | Patterns |
|----------|----------|
| **Linux** | `linux`, `.AppImage`, `.deb`, `.rpm`, `.tar.gz`, `x86_64-linux`, `arm-linux`, etc. |
| **Windows** | `windows`, `.exe`, `.msi`, `win32`, `win64`, `x86_64-windows`, etc. |
| **macOS** | `macos`, `darwin`, `.dmg`, `.pkg`, `arm64-darwin`, `x86_64-darwin`, etc. |

### Mobile Platforms

| Platform | Patterns |
|----------|----------|
| **Android** | `android`, `.apk`, `.aab` |
| **iOS** | `ios`, `.ipa`, `iphone`, `ipad` |

### Example Detection

For **AdGuard Home** releases:
```
AdGuardHome_darwin_amd64.zip     → macOS ✅
AdGuardHome_linux_amd64.tar.gz   → Linux ✅
AdGuardHome_windows_amd64.zip    → Windows ✅
```

Result in JSON:
```json
{
  "install_methods": [{
    "platform": {
      "desktop": {
        "linux": true,
        "windows": true,
        "macos": true
      }
    }
  }]
}
```

## 📊 Performance

| Configuration | Time for 1200 files | Rate Limit |
|--------------|---------------------|------------|
| Sequential (1 at a time) | ~20 minutes | Safe |
| Parallel 3 (no token) | ~5 minutes | Safe |
| Parallel 10 (default) | ~60 seconds | Needs token |
| Parallel 50 (fast mode) | ~25 seconds | Needs token |

**Recommendations:**
- ✅ **With GitHub token**: Use `PARALLEL_LIMIT=20-50`
- ✅ **Without token**: Use `PARALLEL_LIMIT=3-5`
- ✅ **First run**: Use default settings to test

## 🔍 Example Output

```bash
$ npm run update-platforms

🚀 Starting parallel platform detection...

📁 Found 1166 JSON files
⚡ Processing 10 files at a time

[1/1166 0%] ✅ actual-budget.json: linux, windows, macos
[2/1166 0%] ✅ adguard-home.json: linux, windows, macos
[3/1166 0%] ℹ️  nextcloud.json: no releases
[4/1166 0%] ⏭️  some-app.json: no source_code
[5/1166 0%] ✅ immich.json: android
...
[1166/1166 100%] ⏭️  zulip.json: no changes

✨ Platform detection complete in 45.2s!
   Updated: 450 files
   Unchanged: 650 files
   No releases: 50 files
   Skipped: 16 files
   Errors: 0 files
```

## 🛠️ Troubleshooting

### Rate Limit Errors

**Problem:** `API rate limit exceeded`

**Solution:**
1. Add GitHub token: `export GITHUB_TOKEN=your_token`
2. Or reduce parallelism: `PARALLEL_LIMIT=3 npm run update-platforms`

### No Platforms Detected

**Problem:** Tool reports "no releases" for apps that have releases

**Possible causes:**
1. Releases don't have downloadable assets
2. Asset names don't match detection patterns
3. Repo uses a different release strategy

**Solution:** Check the repo's releases page manually

### Slow Performance

**Problem:** Tool is taking too long

**Solution:**
1. Add GitHub token for higher rate limits
2. Increase parallelism: `PARALLEL_LIMIT=50 npm run update-platforms:fast`

## 📝 Notes

- Only modifies files where platform information has changed
- Gracefully handles repos without releases or API errors
- Checks up to 5 most recent releases per repository
- Files without `source_code` field are skipped
- Progress is shown in real-time with percentage

## 🧪 Testing

Before running on all files, test on a small subset:

```bash
# Test on 5 sample files
node tools/test-update-platforms-quick.js

# Check current stats
npm run check-platform-stats

# Run full update
npm run update-platforms

# Verify changes
npm run check-platform-stats
```
