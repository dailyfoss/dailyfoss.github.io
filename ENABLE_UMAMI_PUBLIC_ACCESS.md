# How to Enable Public Access for Umami Analytics

## Current Situation
The Umami API endpoint returns `401 Unauthorized` because the metrics endpoint requires authentication by default.

## Solution: Enable Public Access

You have two options to make analytics data accessible:

### Option 1: Enable Public Website Stats (Recommended)

This makes your website's statistics publicly viewable without authentication.

#### Steps:
1. **Login to Umami Dashboard**
   - Go to: https://umami.mvl.biz.id
   - Login with your credentials

2. **Navigate to Website Settings**
   - Click on "Settings" in the sidebar
   - Select "Websites"
   - Find "Daily FOSS" website
   - Click on the settings icon (⚙️)

3. **Enable Public Access**
   - Look for "Enable share URL" or "Public access" option
   - Toggle it ON
   - Save changes

4. **Get Share Token (if available)**
   - Some Umami versions provide a share token
   - Copy the share token if provided
   - We'll use this in the code

#### After Enabling:
The API endpoint will work without authentication:
```
https://umami.mvl.biz.id/api/websites/8d221a30-297c-432b-9e4e-2df217132fd6/metrics?startAt=...&endAt=...&type=url
```

### Option 2: Use Share URL Feature

Umami provides a public share URL that doesn't require authentication.

#### Steps:
1. **Login to Umami Dashboard**
   - Go to: https://umami.mvl.biz.id

2. **Create Share URL**
   - Go to your website settings
   - Look for "Share" or "Public URL" option
   - Generate a share URL
   - Copy the share URL

3. **Use Share URL**
   - The share URL will look like:
   ```
   https://umami.mvl.biz.id/share/XXXXXXXX/dailyfoss
   ```
   - This URL is publicly accessible

### Option 3: Keep Using localStorage (Current)

If you prefer not to make stats public, we can continue using localStorage:

#### Pros:
- ✅ No authentication needed
- ✅ Works immediately
- ✅ Privacy-friendly
- ✅ No server configuration needed

#### Cons:
- ❌ Only tracks local browser data
- ❌ Doesn't sync across devices
- ❌ Clears with browser cache

## Implementation After Enabling Public Access

Once you enable public access in Umami, update the code:

### Update script-info-blocks.tsx

```typescript
// Load view counts from Umami API
useEffect(() => {
  async function fetchTrendingData() {
    try {
      const endAt = Date.now();
      const startAt = endAt - (30 * 24 * 60 * 60 * 1000);

      // Option 1: Direct API (if public access enabled)
      const umamiUrl = `https://umami.mvl.biz.id/api/websites/8d221a30-297c-432b-9e4e-2df217132fd6/metrics?startAt=${startAt}&endAt=${endAt}&type=url`;

      const response = await fetch(umamiUrl);
      if (response.ok) {
        const data = await response.json();
        
        const counts: Record<string, number> = {};
        data.forEach((page: { x: string; y: number }) => {
          const match = page.x.match(/id=([^&]+)/);
          if (match) {
            counts[match[1]] = (counts[match[1]] || 0) + page.y;
          }
        });

        if (Object.keys(counts).length > 0) {
          setViewCounts(counts);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load Umami data:", error);
    }

    // Fallback to localStorage
    const views = localStorage.getItem("script_views");
    if (views) {
      const parsed = JSON.parse(views);
      const counts: Record<string, number> = {};
      Object.keys(parsed).forEach((slug) => {
        counts[slug] = parsed[slug].count || 0;
      });
      setViewCounts(counts);
    }
  }

  fetchTrendingData();
}, []);
```

## Testing After Enabling

### Test API Access
```bash
# Test if public access is enabled
curl "https://umami.mvl.biz.id/api/websites/8d221a30-297c-432b-9e4e-2df217132fd6/metrics?startAt=1701734400000&endAt=1704326400000&type=url"

# Should return data instead of 401 error
```

### Test in Browser Console
```javascript
// Test Umami API
fetch('https://umami.mvl.biz.id/api/websites/8d221a30-297c-432b-9e4e-2df217132fd6/metrics?startAt=1701734400000&endAt=1704326400000&type=url')
  .then(r => r.json())
  .then(data => console.log('Success!', data))
  .catch(err => console.error('Failed:', err));
```

## Alternative: Use Umami Cloud API

If you're using Umami Cloud (not self-hosted), you might need to:

1. **Generate API Key**
   - Go to Settings → API Keys
   - Create a new API key
   - Copy the key

2. **Use API Key in Requests**
   ```typescript
   const response = await fetch(umamiUrl, {
     headers: {
       'Authorization': `Bearer YOUR_API_KEY`
     }
   });
   ```

3. **Store API Key Securely**
   ```env
   # .env.local
   NEXT_PUBLIC_UMAMI_API_KEY=your_api_key_here
   ```

## Current Status

**For now, the site uses localStorage** for trending calculations because:
1. Umami API requires authentication
2. Static export doesn't support server-side API routes
3. localStorage works immediately without configuration

**Benefits of current approach:**
- ✅ Works out of the box
- ✅ No configuration needed
- ✅ Privacy-friendly
- ✅ Fast and reliable

**To upgrade to Umami API:**
1. Enable public access in Umami settings
2. Test the API endpoint
3. Update the code (I can help with this)
4. Deploy and verify

## Recommendation

### For Public Sites (Recommended)
Enable public access in Umami - this gives you:
- Real analytics from all visitors
- Cross-device tracking
- Historical data
- Professional insights

### For Private Sites
Keep using localStorage - this gives you:
- Privacy (no external tracking)
- Simplicity (no configuration)
- Reliability (always works)

## Need Help?

If you need help enabling public access:
1. Check Umami documentation: https://umami.is/docs
2. Look for "Share URL" or "Public access" in settings
3. Contact Umami support if needed
4. Let me know once enabled, and I'll update the code!

## Summary

**Current Implementation:**
- ✅ Uses localStorage for trending
- ✅ Tracks views in Umami (for your dashboard)
- ✅ Works without configuration
- ✅ Privacy-friendly

**After Enabling Public Access:**
- ✅ Uses real Umami analytics data
- ✅ Cross-device tracking
- ✅ More accurate trending
- ✅ Professional analytics

Both approaches work well - choose based on your needs! 🚀
