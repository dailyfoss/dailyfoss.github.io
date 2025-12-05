# Solution: Use Umami API Token for Trending

## The Problem

The shareable URL is not enough to programmatically fetch most visited apps. We need API access.

## The Solution: API Token

### Step 1: Create API Token in Umami

1. **Login to Umami**
   - Go to: https://umami.mvl.biz.id
   - Login with your credentials

2. **Navigate to Settings**
   - Click on your profile/settings
   - Look for "API" or "API Keys" section

3. **Create New Token**
   - Click "Create API Key" or similar
   - Give it a name: "Daily FOSS Trending"
   - Copy the generated token
   - **Save it securely!**

### Step 2: Store Token Securely

Create `.env.local` file (this file is gitignored):

```env
# Umami API Token (keep this secret!)
UMAMI_API_TOKEN=your_api_token_here
```

### Step 3: Create Server-Side Function

Since you're using static export, we need a different approach. Let me create a client-side solution that uses the API token:

**Important**: For static sites, we have two options:

#### Option A: Client-Side with Token (Less Secure)
Store token in public config (anyone can see it, but it's read-only)

#### Option B: Use Netlify/Vercel Functions (Recommended)
Deploy with Netlify or Vercel and use serverless functions to hide the token

## Recommended Approach for Static Sites

Since you're using GitHub Pages (static export), the best approach is:

### Use Umami's Public Stats Feature

1. **Enable Public Stats in Umami**
   - Go to Umami Settings
   - Find your website settings
   - Look for "Enable share URL" or "Public stats"
   - Enable it
   - This makes the stats API publicly accessible

2. **Test Public Access**
   ```bash
   # Test if public access works
   curl "https://umami.mvl.biz.id/api/websites/8d221a30-297c-432b-9e4e-2df217132fd6/stats?startAt=1701734400000&endAt=1764940250571"
   ```

   If this returns data (not 401), public access is enabled!

### Alternative: Manual Curation

If API access is too complex, you can:

1. **Check Umami Dashboard Weekly**
   - Login to Umami
   - Check most visited pages
   - Note the top scripts

2. **Update Config Manually**
   ```typescript
   // In site-config.tsx
   export const mostPopularScripts = [
     "docker",        // 1,523 views
     "homeassistant", // 892 views
     "nextcloud",     // 654 views
     // Update this list weekly based on Umami data
   ];
   ```

3. **Trending Uses This List**
   - Scripts in this list get priority
   - Combined with GitHub stars
   - Updated manually when you check analytics

## What I Recommend

### For Now (Simplest)
1. **Keep current implementation** (sorts by GitHub stars)
2. **Check Umami dashboard** to see actual most visited
3. **Manually update `mostPopularScripts`** in config weekly/monthly
4. **Trending will boost those scripts**

### For Future (Automated)
1. **Enable public stats in Umami** (if possible)
2. **Fetch data client-side** (no token needed)
3. **Automatic trending** based on real views

## Current Status

Right now, your trending section:
- ✅ Tracks all views in Umami (you can see them in dashboard)
- ✅ Sorts by GitHub stars + date
- ✅ Boosts scripts in `mostPopularScripts` array
- ❌ Doesn't automatically fetch view counts from Umami

## How to See Most Visited Apps

### Method 1: Umami Dashboard (Manual)
1. Login to https://umami.mvl.biz.id
2. Select "Daily FOSS" website
3. Click on "Pages" tab
4. Sort by views
5. Look for `/scripts?id=...` URLs
6. The script slug is after `id=`

Example:
```
/scripts?id=docker          → 1,523 views
/scripts?id=homeassistant   → 892 views
/scripts?id=nextcloud       → 654 views
```

### Method 2: Umami Events (Manual)
1. Login to Umami dashboard
2. Click on "Events" tab
3. Filter by "script-view" event
4. See which slugs appear most

### Method 3: Export Data (Manual)
1. Umami may have export feature
2. Export to CSV
3. Analyze in spreadsheet
4. Update config manually

## Recommendation

**For a static site on GitHub Pages, I recommend:**

1. **Keep tracking in Umami** ✅ (already working)
2. **Check dashboard weekly** 📊 (manual but simple)
3. **Update `mostPopularScripts` manually** ✏️ (takes 2 minutes)
4. **Trending will reflect real data** 🎯 (with your input)

This is:
- ✅ Simple to maintain
- ✅ No complex API setup
- ✅ Works with static export
- ✅ Secure (no tokens exposed)
- ✅ Accurate (based on real Umami data)

## Example Workflow

**Every Monday:**
1. Login to Umami (2 minutes)
2. Check top 10 most visited scripts
3. Update `mostPopularScripts` in `site-config.tsx`:
   ```typescript
   export const mostPopularScripts = [
     "docker",
     "homeassistant", 
     "nextcloud",
     "plex",
     "jellyfin",
     "nginx-proxy-manager",
   ];
   ```
4. Commit and push
5. GitHub Actions deploys automatically

**Result:** Trending reflects real visitor data! 🎉

## Future: Automated Solution

If you want fully automated trending, you'd need to:

1. **Deploy to Vercel/Netlify** (instead of GitHub Pages)
2. **Use serverless functions** (to hide API token)
3. **Fetch Umami data server-side** (secure)
4. **Cache results** (for performance)

But for now, **manual update is the simplest and most practical solution** for a static site.

## Summary

**Question:** How do we know which apps are most visited?

**Answer:** 
- ✅ **View in Umami dashboard** (login required)
- ✅ **Update config manually** (simple, secure)
- ❌ **Automatic API fetch** (not possible with static export + no public API)

**Best approach for your setup:**
- Check Umami weekly
- Update `mostPopularScripts` manually
- Takes 2 minutes, works perfectly!
