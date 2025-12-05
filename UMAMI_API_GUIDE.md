# Umami API Integration Guide

## Overview
This guide explains how to use Umami's API to fetch real analytics data instead of relying on localStorage for trending calculations.

## Why Use Umami API?

### Benefits over localStorage:
1. **Cross-device tracking** - Views from all devices are counted
2. **Persistent data** - Data doesn't get lost when users clear browser cache
3. **Server-side accuracy** - Real analytics data, not client-side estimates
4. **Historical data** - Access to long-term trends and patterns
5. **Advanced filtering** - Filter by date range, device, location, etc.
6. **No privacy concerns** - Data stored on your server, not user's browser

## Current Implementation

### Architecture
```
User clicks script
    ↓
1. Track in localStorage (immediate feedback)
    ↓
2. Send event to Umami (server-side tracking)
    ↓
3. Fetch trending data from Umami API
    ↓
4. Display trending scripts based on real analytics
```

### Files Structure
```
src/
├── lib/
│   ├── umami-api.ts          # Umami API client functions
│   └── analytics.ts           # Client-side tracking helpers
├── app/
│   ├── api/
│   │   └── trending/
│   │       └── route.ts       # API endpoint for trending data
│   └── scripts/
│       └── _components/
│           └── script-info-blocks.tsx  # Uses trending data
```

## API Endpoints

### 1. Get Most Viewed Scripts
**Endpoint**: `GET /api/trending?days=30`

**Response**:
```json
{
  "success": true,
  "data": [
    { "slug": "docker", "views": 1523 },
    { "slug": "homeassistant", "views": 892 },
    { "slug": "nextcloud", "views": 654 }
  ],
  "period": "30 days",
  "timestamp": "2024-12-05T10:30:00.000Z"
}
```

### 2. Umami Direct API Endpoints

#### Get Website Stats
```typescript
GET https://umami.mvl.biz.id/api/websites/{websiteId}/stats
  ?startAt={timestamp}
  &endAt={timestamp}
```

**Returns**: Overall metrics (pageviews, visitors, visits, bounces, totaltime)

#### Get Page Views
```typescript
GET https://umami.mvl.biz.id/api/websites/{websiteId}/metrics
  ?startAt={timestamp}
  &endAt={timestamp}
  &type=url
```

**Returns**: Array of pages with view counts

#### Get Events
```typescript
GET https://umami.mvl.biz.id/api/websites/{websiteId}/events
  ?startAt={timestamp}
  &endAt={timestamp}
```

**Returns**: Custom events (like our "script-view" events)

## Usage Examples

### Fetch Trending Scripts (Client-side)
```typescript
import { useEffect, useState } from "react";

function TrendingSection() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    async function fetchTrending() {
      const response = await fetch("/api/trending?days=30");
      const data = await response.json();
      if (data.success) {
        setTrending(data.data);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div>
      {trending.map(item => (
        <div key={item.slug}>
          {item.slug}: {item.views} views
        </div>
      ))}
    </div>
  );
}
```

### Fetch Trending Scripts (Server-side)
```typescript
import { getMostViewedScripts } from "@/lib/umami-api";

export async function getServerSideProps() {
  const trending = await getMostViewedScripts(30);
  
  return {
    props: { trending },
    revalidate: 3600, // Cache for 1 hour
  };
}
```

### Get Custom Event Data
```typescript
import { getTrendingScriptsFromEvents } from "@/lib/umami-api";

const trending = await getTrendingScriptsFromEvents(30);
// Returns scripts sorted by "script-view" event count
```

## Authentication

### Public Endpoints (No Auth Required)
Some Umami endpoints are public if configured:
- Website stats
- Page views
- Events

### Authenticated Endpoints
For sensitive data, you need authentication:

```typescript
import { getAuthToken } from "@/lib/umami-api";

const token = await getAuthToken("username", "password");

// Use token in subsequent requests
const stats = await getWebsiteStats(startAt, endAt, token);
```

**⚠️ Security Note**: Never expose credentials in client-side code. Use environment variables and server-side API routes.

## Environment Variables

Create a `.env.local` file:

```env
# Umami Configuration
NEXT_PUBLIC_UMAMI_URL=umami.mvl.biz.id
NEXT_PUBLIC_UMAMI_WEBSITE_ID=8d221a30-297c-432b-9e4e-2df217132fd6

# Optional: For authenticated endpoints
UMAMI_API_USERNAME=your_username
UMAMI_API_PASSWORD=your_password
```

## Caching Strategy

### Current Implementation
- API responses cached for 1 hour (`revalidate: 3600`)
- Reduces load on Umami server
- Balances freshness with performance

### Adjust Cache Duration
```typescript
// In src/app/api/trending/route.ts
export const revalidate = 1800; // 30 minutes
// or
export const revalidate = 7200; // 2 hours
```

## Fallback Strategy

The implementation includes a fallback mechanism:

1. **Primary**: Fetch from Umami API
2. **Fallback**: Use localStorage data if API fails
3. **Default**: Show scripts sorted by GitHub stars

This ensures the site always works, even if:
- Umami server is down
- API rate limits are hit
- Network issues occur

## Testing

### Test Umami API Connection
```bash
# Test website stats
curl "https://umami.mvl.biz.id/api/websites/8d221a30-297c-432b-9e4e-2df217132fd6/stats?startAt=1701734400000&endAt=1704326400000"

# Test page views
curl "https://umami.mvl.biz.id/api/websites/8d221a30-297c-432b-9e4e-2df217132fd6/metrics?startAt=1701734400000&endAt=1704326400000&type=url"
```

### Test Your API Endpoint
```bash
# Test trending endpoint
curl "http://localhost:3000/api/trending?days=30"
```

### Browser Console Testing
```javascript
// Fetch trending data
fetch('/api/trending?days=30')
  .then(r => r.json())
  .then(data => console.log(data));

// Check if Umami is loaded
console.log(window.umami);

// Manually track an event
window.umami.track('script-view', { slug: 'test', name: 'Test Script' });
```

## Monitoring

### Check Umami Dashboard
1. Go to `https://umami.mvl.biz.id`
2. Select your website
3. View:
   - **Realtime**: Live visitor activity
   - **Pages**: Most visited pages
   - **Events**: Custom event tracking
   - **Stats**: Overall metrics

### Check API Performance
Monitor your `/api/trending` endpoint:
- Response time
- Cache hit rate
- Error rate
- Data freshness

## Advanced Features

### 1. Time-based Trending
Show different trending periods:

```typescript
// Last 24 hours
const todayTrending = await fetch('/api/trending?days=1');

// Last week
const weekTrending = await fetch('/api/trending?days=7');

// Last month
const monthTrending = await fetch('/api/trending?days=30');
```

### 2. Category-specific Trending
Filter trending by category:

```typescript
// In your API route
const allTrending = await getMostViewedScripts(30);
const categoryTrending = allTrending.filter(item => 
  categoryScripts.includes(item.slug)
);
```

### 3. Real-time Updates
Use polling or WebSockets for live updates:

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('/api/trending?days=1');
    const data = await response.json();
    setTrending(data.data);
  }, 60000); // Update every minute

  return () => clearInterval(interval);
}, []);
```

## Troubleshooting

### Issue: API returns empty data
**Solution**: 
- Check if Umami is tracking events correctly
- Verify website ID is correct
- Check date range (startAt/endAt timestamps)
- Look for CORS issues in browser console

### Issue: Slow API responses
**Solution**:
- Increase cache duration
- Reduce date range
- Use pagination for large datasets
- Consider caching in Redis/Memcached

### Issue: Authentication errors
**Solution**:
- Verify credentials in environment variables
- Check token expiration
- Ensure API user has correct permissions

## Best Practices

1. **Cache aggressively** - Analytics data doesn't need to be real-time
2. **Use fallbacks** - Always have a backup data source
3. **Monitor API usage** - Track rate limits and quotas
4. **Secure credentials** - Never expose API keys in client code
5. **Handle errors gracefully** - Don't break the UI if analytics fail
6. **Test thoroughly** - Verify data accuracy against Umami dashboard

## Next Steps

Potential enhancements:
1. Add more API endpoints (category trending, search analytics)
2. Implement real-time dashboard
3. Add A/B testing capabilities
4. Create analytics admin panel
5. Export reports to CSV/PDF
6. Set up automated alerts for traffic spikes

## Resources

- [Umami API Documentation](https://umami.is/docs/api)
- [Umami GitHub](https://github.com/umami-software/umami)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
