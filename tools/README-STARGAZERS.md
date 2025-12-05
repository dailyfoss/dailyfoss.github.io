# Stargazers Updater

This script updates the `github_stars` field in all JSON files by fetching the latest star count from GitHub and GitLab repositories.

## Usage

```bash
cd frontend
npm run update-stargazers
```

## Features

- ✅ Supports both GitHub and GitLab repositories
- ⏱️ Built-in throttling (1 second delay) to avoid rate limits
- 📊 Progress tracking with batch updates
- 🔄 Shows which repos had star count changes
- ⚠️ Handles errors gracefully (404s, rate limits, etc.)

## Rate Limits

### GitHub (Unauthenticated)
- **60 requests per hour** per IP address
- For ~1146 scripts, this will take approximately **19 hours**

### GitHub (Authenticated)
To increase the rate limit to **5,000 requests per hour**, set a GitHub token:

```bash
# Set environment variable
export GITHUB_TOKEN="your_github_personal_access_token"

# Or modify the script to use the token
```

To create a token:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `public_repo` scope
4. Copy the token

### GitLab
- **Unauthenticated**: No strict rate limit for public API
- Much more lenient than GitHub

## Output

The script shows:
- ✅ Updated repos with star counts
- ⊘ Skipped repos (no source code, invalid URL)
- ⚠️ Failed fetches (404, rate limits)
- 📊 Progress every 50 files
- 📊 Final summary with statistics

## Example Output

```
🌟 Starting stargazers update...

📦 Found 1146 JSON files

[1/1146] [Batch 1/23] 2fauth.json... ✅ 3500 → 3663 ⭐
[2/1146] [Batch 1/23] actualbudget.json... ✓ 1234 ⭐ (unchanged)
[3/1146] [Batch 1/23] adguard.json... ⊘ No source_code
...

📊 Progress: 50/1146 files processed

...

============================================================
📊 Final Summary:
============================================================
Total files:           1146
✅ Updated:            980
🔄 Changed:            245
⊘  No source code:     120
⊘  Invalid URL:        30
⚠️  Fetch failed:       16
❌ Errors:             0
============================================================

✨ Done!
```

## Customization

Edit `tools/update-stargazers.js` to adjust:
- `DELAY_MS`: Delay between requests (default: 1000ms)
- `BATCH_SIZE`: Progress update frequency (default: 50)

## Notes

- The script updates files in place
- Original star counts are preserved if fetch fails
- Star counts are stored as strings in JSON files
- The script is safe to run multiple times
