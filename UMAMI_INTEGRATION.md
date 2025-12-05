# Umami Analytics Integration

## Overview
Your Daily FOSS website is now fully integrated with Umami Analytics for comprehensive visitor tracking and trending analysis.

## Configuration

### Umami Instance Details
- **URL**: `umami.mvl.biz.id`
- **Website ID**: `8d221a30-297c-432b-9e4e-2df217132fd6`
- **Script**: `https://umami.mvl.biz.id/script.js`

### Files Updated
1. `src/config/site-config.tsx` - Updated analytics configuration
2. `src/app/layout.tsx` - Umami script already integrated
3. `src/lib/analytics.ts` - Enhanced with Umami event tracking
4. `src/app/scripts/page.tsx` - Added script view tracking

## Features

### 1. Automatic Page View Tracking
Umami automatically tracks all page views across your site.

### 2. Custom Event Tracking
We track custom events for script views:

```typescript
window.umami.track("script-view", {
  slug: "script-slug",
  name: "Script Name"
});
```

### 3. Trending Algorithm
The trending section uses a hybrid approach:
- **70%** based on user clicks/views (from localStorage)
- **30%** based on GitHub stars (normalized)
- Only considers scripts from the last 30 days

### 4. View Count Display
Trending scripts show a view count badge (👁️) indicating how many times they've been viewed.

## What You Can Track in Umami

### Default Metrics
- Page views
- Unique visitors
- Bounce rate
- Session duration
- Traffic sources
- Device types
- Browser types
- Operating systems
- Countries/regions

### Custom Events
- **script-view**: Tracks when users click on a script
  - Properties:
    - `slug`: The script's unique identifier
    - `name`: The script's display name

## Viewing Analytics

1. Go to your Umami dashboard: `https://umami.mvl.biz.id`
2. Select your website: Daily FOSS
3. View metrics:
   - **Overview**: General traffic statistics
   - **Realtime**: Live visitor activity
   - **Events**: Custom script-view events
   - **Pages**: Most visited pages
   - **Referrers**: Traffic sources

## Benefits

### For You (Site Owner)
- Real-time visitor analytics
- Understand which scripts are most popular
- Track user engagement
- Privacy-friendly (GDPR compliant)
- Self-hosted analytics (no data sent to third parties)

### For Users
- See trending scripts based on real user interest
- Discover popular tools in the community
- Better content recommendations

## Technical Implementation

### Dual Tracking System
We use a hybrid approach for reliability:

1. **localStorage** (Client-side)
   - Immediate tracking
   - Works offline
   - Used for trending calculations
   - Persists for 30 days

2. **Umami** (Server-side)
   - Comprehensive analytics
   - Cross-device tracking
   - Historical data
   - Advanced reporting

### Privacy
- No cookies required
- No personal data collected
- GDPR compliant
- Respects Do Not Track
- Anonymous visitor tracking

## Future Enhancements

Potential improvements you could add:

1. **Category Analytics**: Track which categories are most popular
2. **Search Analytics**: Track what users search for
3. **Deployment Method Tracking**: See which deployment methods are preferred
4. **Filter Usage**: Understand how users filter scripts
5. **Time on Script Page**: Measure engagement with individual scripts
6. **External Link Clicks**: Track clicks to GitHub, documentation, etc.

## Testing

To verify Umami is working:

1. Open your website
2. Open browser DevTools (F12)
3. Go to Network tab
4. Filter by "script.js"
5. You should see requests to `umami.mvl.biz.id`
6. Click on a script
7. Check for "script-view" events in Umami dashboard

## Troubleshooting

### Events Not Showing Up
- Check browser console for errors
- Verify Umami script is loaded: `window.umami`
- Check ad blockers aren't blocking Umami
- Verify website ID is correct

### View Counts Not Updating
- Clear localStorage: `localStorage.clear()`
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check browser console for errors

## Support

For Umami-specific issues:
- Documentation: https://umami.is/docs
- GitHub: https://github.com/umami-software/umami

For implementation issues:
- Check the code in `src/lib/analytics.ts`
- Review tracking in `src/app/scripts/page.tsx`
