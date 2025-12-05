# How to Update Trending Based on Umami Data

## Quick Guide (2 Minutes)

### Step 1: Check Umami Dashboard

1. **Login to Umami**
   - Go to: https://umami.mvl.biz.id
   - Login with your credentials

2. **View Most Visited Pages**
   - Click on "Pages" tab
   - Sort by "Views" (descending)
   - Look for URLs like: `/scripts?id=docker`

3. **Note the Top Scripts**
   Example from your dashboard:
   ```
   /scripts?id=docker              → 1,523 views
   /scripts?id=homeassistant       → 892 views
   /scripts?id=nextcloud           → 654 views
   /scripts?id=plex                → 543 views
   /scripts?id=jellyfin            → 432 views
   /scripts?id=nginx-proxy-manager → 321 views
   ```

### Step 2: Update Configuration

1. **Open the config file**
   - File: `src/config/site-config.tsx`

2. **Find this line:**
   ```typescript
   export const mostPopularScripts = ["post-pve-install", "docker", "homeassistant"];
   ```

3. **Update with your top scripts:**
   ```typescript
   export const mostPopularScripts = [
     "docker",              // 1,523 views
     "homeassistant",       // 892 views
     "nextcloud",           // 654 views
     "plex",                // 543 views
     "jellyfin",            // 432 views
     "nginx-proxy-manager", // 321 views
   ];
   ```

4. **Save the file**

### Step 3: Deploy

```bash
git add src/config/site-config.tsx
git commit -m "Update trending scripts based on Umami analytics"
git push
```

GitHub Actions will automatically deploy! 🚀

## How It Works

### Current Trending Algorithm

```typescript
// In PopularScripts component
const popularScripts = allScripts.sort((a, b) => {
  // Boost scripts in mostPopularScripts list
  const boostA = mostPopularScripts.includes(a.slug) ? 5000 : 0;
  const boostB = mostPopularScripts.includes(b.slug) ? 5000 : 0;

  // Calculate score: GitHub stars + deployment methods + boost
  const scoreA = (starsA * 0.8) + (deploymentCountA * 200) + boostA;
  const scoreB = (starsB * 0.8) + (deploymentCountB * 200) + boostB;

  return scoreB - scoreA;
});
```

**What this means:**
- Scripts in `mostPopularScripts` get +5000 boost
- This ensures they appear at the top
- Combined with GitHub stars for quality
- Result: Most visited + most popular = best trending!

## Visual Example

### Before Update
```typescript
mostPopularScripts = ["post-pve-install", "docker", "homeassistant"];
```

**Trending shows:**
1. post-pve-install (in list)
2. docker (in list)
3. homeassistant (in list)
4. nextcloud (high stars)
5. plex (high stars)

### After Update (Based on Umami)
```typescript
mostPopularScripts = [
  "docker",
  "homeassistant", 
  "nextcloud",
  "plex",
  "jellyfin",
  "nginx-proxy-manager"
];
```

**Trending shows:**
1. docker (in list + high stars)
2. homeassistant (in list + high stars)
3. nextcloud (in list + high stars)
4. plex (in list + high stars)
5. jellyfin (in list + high stars)
6. nginx-proxy-manager (in list)

## Recommended Update Schedule

### Weekly (Recommended)
- Check Umami every Monday
- Update if top 3 changed
- Takes 2 minutes

### Monthly (Minimum)
- Check Umami first Monday of month
- Update top 6 scripts
- Takes 5 minutes

### Real-time (Optional)
- Check after major traffic spikes
- Update immediately
- Keeps trending very current

## Alternative: Check Events

Instead of Pages, you can check Events:

1. **Go to Umami Dashboard**
2. **Click "Events" tab**
3. **Filter by "script-view"**
4. **See event data with slugs**

This shows the custom events we're tracking!

## Pro Tips

### Tip 1: Keep Top 6
```typescript
// Good: Top 6 most visited
mostPopularScripts = ["docker", "homeassistant", "nextcloud", "plex", "jellyfin", "nginx-proxy-manager"];
```

### Tip 2: Add Comments
```typescript
// Updated: 2024-12-05 based on Umami analytics
mostPopularScripts = [
  "docker",        // 1,523 views
  "homeassistant", // 892 views
  "nextcloud",     // 654 views
];
```

### Tip 3: Mix Visits + Quality
Don't just use most visited - consider:
- View count (from Umami)
- GitHub stars (quality indicator)
- Recency (newer scripts)
- Your editorial choice

### Tip 4: Seasonal Updates
Some scripts trend seasonally:
- Home automation (winter)
- Media servers (holidays)
- Productivity tools (new year)

## Automation Ideas (Future)

If you want to automate this:

### Option 1: GitHub Action
```yaml
# .github/workflows/update-trending.yml
name: Update Trending
on:
  schedule:
    - cron: '0 0 * * 1' # Every Monday
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Fetch Umami data
        run: |
          # Fetch from Umami API
          # Parse top scripts
          # Update config file
      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add src/config/site-config.tsx
          git commit -m "Auto-update trending scripts"
          git push
```

### Option 2: Manual Script
```bash
#!/bin/bash
# update-trending.sh

echo "Fetching Umami data..."
# Add your Umami API calls here

echo "Update src/config/site-config.tsx manually"
echo "Then run: git commit -am 'Update trending' && git push"
```

## Summary

**Question:** How do we know which apps are most visited?

**Answer:**
1. ✅ Login to Umami dashboard
2. ✅ Check "Pages" tab
3. ✅ Note top scripts
4. ✅ Update `mostPopularScripts` in config
5. ✅ Commit and push

**Time required:** 2 minutes

**Frequency:** Weekly or monthly

**Result:** Trending reflects real visitor data! 🎉

## Current Configuration

Your current config:
```typescript
export const mostPopularScripts = ["post-pve-install", "docker", "homeassistant"];
```

**To update:**
1. Check your Umami dashboard now
2. See which scripts have most views
3. Update this array
4. Push to GitHub

That's it! Simple and effective. 👍
