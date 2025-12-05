# Update Platforms Tool

This tool automatically detects and updates platform support information for each repository by checking their GitHub releases. It processes files in parallel for maximum speed.

## Usage

```bash
# From the frontend directory
npm run update-platforms

# Or directly
node tools/update-platforms.js

# With custom parallelism (default is 10)
PARALLEL_LIMIT=20 npm run update-platforms

# With GitHub token and custom parallelism
GITHUB_TOKEN=your_token PARALLEL_LIMIT=50 npm run update-platforms
```

## What it does

1. Reads all JSON files from `frontend/public/json/`
2. Extracts the GitHub repository from the `source_code` field
3. Fetches up to 5 recent releases from GitHub API (in parallel, 10 repos at a time)
4. Analyzes release assets to detect platform support:
   - **Desktop**: Linux (.AppImage, .deb, .rpm, .tar.gz), Windows (.exe, .msi), macOS (.dmg, .pkg)
   - **Mobile**: Android (.apk, .aab), iOS (.ipa)
5. Updates the `install_methods[0].platform` fields accordingly

## Platform Detection

The tool looks for specific patterns in release asset names:

### Desktop Platforms
- **Linux**: `linux`, `.AppImage`, `.deb`, `.rpm`, `.tar.gz`, `x86_64-linux`, etc.
- **Windows**: `windows`, `.exe`, `.msi`, `win32`, `win64`, etc.
- **macOS**: `macos`, `darwin`, `.dmg`, `.pkg`, `arm64-darwin`, etc.

### Mobile Platforms
- **Android**: `android`, `.apk`, `.aab`
- **iOS**: `ios`, `.ipa`, `iphone`, `ipad`

## GitHub API Rate Limits

- **Without token**: 60 requests/hour
- **With token**: 5000 requests/hour

To use a GitHub token for higher rate limits:

```bash
export GITHUB_TOKEN=your_github_token_here
npm run update-platforms
```

## Example Output

```
🚀 Starting parallel platform detection...

📁 Found 1234 JSON files
⚡ Processing 10 files at a time

[1/1234 0%] ✅ actual-budget.json: linux, windows, macos
[2/1234 0%] ✅ adguard-home.json: linux, windows, macos
[3/1234 0%] ℹ️  nextcloud.json: no releases
[4/1234 0%] ⏭️  some-app.json: no source_code
[5/1234 0%] ✅ immich.json: linux, windows, macos, android, ios
...
[1234/1234 100%] ⏭️  zulip.json: no changes

✨ Platform detection complete in 45.2s!
   Updated: 450 files
   Unchanged: 650 files
   No releases: 100 files
   Skipped: 34 files
   Errors: 0 files
```

## Performance

- **Parallel Processing**: Default 10 repos at a time (configurable via `PARALLEL_LIMIT`)
- **Release Checking**: Up to 5 most recent releases per repository
- **Typical Run Time**: 
  - With GitHub token (5000 req/hr): ~30-60 seconds for 1200 files
  - Without token (60 req/hr): Will hit rate limit, use lower `PARALLEL_LIMIT=3`
- **Recommended Settings**:
  - With token: `PARALLEL_LIMIT=20-50` for maximum speed
  - Without token: `PARALLEL_LIMIT=3-5` to avoid rate limits

## Notes

- Files without a `source_code` field are skipped
- Repositories without releases are handled gracefully
- Only modifies files where platform information has changed
- Parallel processing significantly reduces total execution time
