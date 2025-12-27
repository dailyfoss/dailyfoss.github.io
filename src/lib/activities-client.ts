/**
 * Client-side API for activity feed
 * Connects to Cloudflare Worker backend
 */

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API!;

export type ActivityType = 'like' | 'unlike' | 'feature_add' | 'alternative_add' | 'app_add' | 'comment';

export type Activity = {
  id: string;
  type: ActivityType;
  userId: string;
  username: string;
  avatar: string;
  targetSlug: string;
  targetName: string;
  metadata: Record<string, any>;
  timestamp: number;
};

export type ActivityFeedResponse = {
  activities: Activity[];
  limit: number;
  offset: number;
};

/**
 * Get global activity feed
 */
export async function getActivities(limit = 50, offset = 0): Promise<Activity[]> {
  try {
    const response = await fetch(`${API_URL}/activities?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.status}`);
    }
    
    const data: ActivityFeedResponse = await response.json();
    return data.activities;
  } catch (error) {
    console.error('Failed to get activities:', error);
    return [];
  }
}

/**
 * Get user's activity feed
 */
export async function getUserActivities(userId: string, limit = 50, offset = 0): Promise<Activity[]> {
  try {
    const response = await fetch(`${API_URL}/activities/user/${userId}?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user activities: ${response.status}`);
    }
    
    const data: ActivityFeedResponse = await response.json();
    return data.activities;
  } catch (error) {
    console.error('Failed to get user activities:', error);
    return [];
  }
}

/**
 * Get app's activity feed
 */
export async function getAppActivities(slug: string, limit = 50, offset = 0): Promise<Activity[]> {
  try {
    const response = await fetch(`${API_URL}/activities/app/${slug}?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch app activities: ${response.status}`);
    }
    
    const data: ActivityFeedResponse = await response.json();
    return data.activities;
  } catch (error) {
    console.error('Failed to get app activities:', error);
    return [];
  }
}

/**
 * Format activity for display
 */
export function formatActivity(activity: Activity): string {
  const timeAgo = getTimeAgo(activity.timestamp);
  
  switch (activity.type) {
    case 'like':
      return `${activity.username} liked ${activity.targetName} • ${timeAgo}`;
    case 'unlike':
      return `${activity.username} unliked ${activity.targetName} • ${timeAgo}`;
    case 'feature_add':
      return `${activity.username} added ${activity.metadata.feature} as a feature to ${activity.targetName} • ${timeAgo}`;
    case 'alternative_add':
      return `${activity.username} added ${activity.targetName} as alternative to ${activity.metadata.alternatives?.join(', ')} • ${timeAgo}`;
    case 'app_add':
      return `${activity.username} added ${activity.targetName} • ${timeAgo}`;
    case 'comment':
      return `${activity.username} commented on ${activity.targetName} • ${timeAgo}`;
    default:
      return `${activity.username} performed an action on ${activity.targetName} • ${timeAgo}`;
  }
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
}

/**
 * Get activity icon based on type
 */
export function getActivityIcon(type: ActivityType): string {
  switch (type) {
    case 'like':
      return '❤️';
    case 'unlike':
      return '💔';
    case 'feature_add':
      return '🏷️';
    case 'alternative_add':
      return '🔄';
    case 'app_add':
      return '📦';
    case 'comment':
      return '💬';
    default:
      return '📌';
  }
}
