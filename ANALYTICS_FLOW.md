# Analytics Data Flow

## How Trending Works with Umami API

### 1. User Interaction Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     User Clicks Script                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Track in localStorage       │
         │   (Immediate feedback)        │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Send to Umami Analytics     │
         │   window.umami.track()        │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Umami Server Stores Event   │
         │   (Server-side tracking)      │
         └───────────────────────────────┘
```

### 2. Trending Calculation Flow
```
┌─────────────────────────────────────────────────────────────┐
│              User Visits Scripts Page                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   TrendingScripts Component   │
         │   Loads on Page               │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Fetch /api/trending?days=30 │
         │   (Client-side API call)      │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   API Route Handler           │
         │   src/app/api/trending/       │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Call getMostViewedScripts() │
         │   from umami-api.ts           │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Fetch from Umami API        │
         │   GET /api/websites/.../      │
         │   metrics?type=url            │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Parse URL Parameters        │
         │   Extract script slugs        │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Sort by View Count          │
         │   Return Top Scripts          │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Cache Response (1 hour)     │
         │   Return JSON to Client       │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Display Trending Scripts    │
         │   with View Counts            │
         └───────────────────────────────┘
```

### 3. Data Sources Comparison

#### Before (localStorage only):
```
┌──────────────┐
│   Browser A  │ ──► localStorage ──► Trending (only Browser A data)
└──────────────┘

┌──────────────┐
│   Browser B  │ ──► localStorage ──► Trending (only Browser B data)
└──────────────┘

❌ Problem: Each user sees different trending based on their own data
❌ Problem: Data lost when cache cleared
❌ Problem: No cross-device tracking
```

#### After (Umami API):
```
┌──────────────┐
│   Browser A  │ ──┐
└──────────────┘   │
                   ├──► Umami Server ──► Aggregated Data ──► Trending
┌──────────────┐   │                      (All users)
│   Browser B  │ ──┤
└──────────────┘   │
                   │
┌──────────────┐   │
│   Browser C  │ ──┘
└──────────────┘

✅ All users see same trending data
✅ Data persists across sessions
✅ Cross-device tracking
✅ Real analytics insights
```

### 4. Fallback Mechanism
```
Try Umami API
     │
     ├─ Success? ──► Use Umami data ──► Display trending
     │
     └─ Failed? ──► Try localStorage ──┐
                                       │
                    Success? ──► Use local data ──► Display trending
                         │
                         └─ Failed? ──► Use GitHub stars ──► Display popular
```

## Data Structure

### Umami API Response
```json
{
  "success": true,
  "data": [
    {
      "slug": "docker",
      "views": 1523
    },
    {
      "slug": "homeassistant", 
      "views": 892
    },
    {
      "slug": "nextcloud",
      "views": 654
    }
  ],
  "period": "30 days",
  "timestamp": "2024-12-05T10:30:00.000Z"
}
```

### localStorage Structure (Fallback)
```json
{
  "docker": {
    "slug": "docker",
    "timestamp": 1701734400000,
    "count": 15
  },
  "homeassistant": {
    "slug": "homeassistant",
    "timestamp": 1701820800000,
    "count": 8
  }
}
```

## Performance Optimization

### Caching Strategy
```
Request 1 (10:00 AM)
     │
     ├──► Fetch from Umami ──► Cache for 1 hour ──► Return data
     │
Request 2 (10:30 AM)
     │
     └──► Return cached data (no Umami call)
     
Request 3 (11:01 AM)
     │
     └──► Cache expired ──► Fetch from Umami ──► Update cache
```

### Benefits:
- **Reduced API calls**: 24 calls/day instead of 1000s
- **Faster response**: Cached data returns instantly
- **Lower server load**: Less processing required
- **Cost effective**: Fewer API requests

## Security Considerations

### What's Public:
- Website ID (safe to expose)
- Umami URL (safe to expose)
- View counts (public data)

### What's Private:
- API credentials (if using auth)
- User personal data (Umami doesn't collect this)
- Admin access tokens

### Best Practices:
```typescript
// ✅ Good: Public data in client
const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

// ❌ Bad: Credentials in client
const password = "my-secret-password"; // Never do this!

// ✅ Good: Credentials in server-side only
const password = process.env.UMAMI_API_PASSWORD; // In API route
```

## Monitoring & Debugging

### Check if Umami is Working:
```javascript
// In browser console
console.log(window.umami); // Should show object with track function

// Test tracking
window.umami.track('test-event', { test: true });
```

### Check API Endpoint:
```bash
# Development
curl http://localhost:3000/api/trending?days=30

# Production
curl https://your-domain.com/api/trending?days=30
```

### Check Umami Dashboard:
1. Go to https://umami.mvl.biz.id
2. Login to your account
3. Select "Daily FOSS" website
4. Check:
   - Realtime visitors
   - Page views
   - Events (should see "script-view")

## Troubleshooting

### Issue: Trending shows no data
**Check:**
1. Is Umami script loaded? (`window.umami`)
2. Are events being tracked? (Check Umami dashboard)
3. Is API endpoint working? (Test with curl)
4. Check browser console for errors

### Issue: Old data showing
**Solution:**
- Clear Next.js cache: Delete `.next` folder
- Wait for cache to expire (1 hour)
- Force refresh: Add `?t=${Date.now()}` to API call

### Issue: Different data in Umami vs. site
**Reason:**
- Cache delay (up to 1 hour)
- Umami processes data in batches
- Time zone differences

## Future Enhancements

### 1. Real-time Trending
Use WebSocket or polling for live updates:
```typescript
// Update every 5 minutes
setInterval(() => {
  fetchTrending();
}, 300000);
```

### 2. Category-specific Trending
```typescript
GET /api/trending?days=30&category=media
GET /api/trending?days=30&category=productivity
```

### 3. Trending by Time Period
```typescript
GET /api/trending?period=today
GET /api/trending?period=week
GET /api/trending?period=month
```

### 4. Advanced Analytics Dashboard
- View trends over time
- Compare periods
- Export reports
- Set up alerts

## Summary

**Key Improvements:**
1. ✅ Real analytics data from Umami
2. ✅ Cross-device tracking
3. ✅ Persistent data storage
4. ✅ Fallback to localStorage
5. ✅ Cached for performance
6. ✅ Secure implementation

**Result:**
- More accurate trending calculations
- Better user experience
- Reliable data source
- Professional analytics setup
