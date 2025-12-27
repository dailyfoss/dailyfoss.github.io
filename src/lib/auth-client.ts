/**
 * Client-side API for authentication and user features
 * Connects to Cloudflare Worker backend
 */

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API!;

// Debug: Log the API URL
if (typeof window !== 'undefined') {
  console.log('Backend API URL:', API_URL);
}

export type User = {
  id: string;
  username: string;
  avatar: string;
  name: string;
};

export type Session = {
  user: User;
  token: string;
};

// Get session from localStorage
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  
  const sessionData = localStorage.getItem('session');
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

// Save session to localStorage
export function saveSession(session: Session) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('session', JSON.stringify(session));
}

// Clear session
export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('session');
}

// Start GitHub OAuth flow
export async function signIn() {
  try {
    // Pass current origin so worker knows where to redirect back
    const redirectTo = window.location.origin;
    const response = await fetch(`${API_URL}/auth/start?redirect_to=${encodeURIComponent(redirectTo)}`);
    const data = await response.json();
    
    // Redirect to GitHub
    window.location.href = data.authUrl;
  } catch (error) {
    console.error('Failed to start auth:', error);
    throw error;
  }
}

// Start Google OAuth flow
export async function signInWithGoogle() {
  try {
    // Pass current origin so worker knows where to redirect back
    const redirectTo = window.location.origin;
    const response = await fetch(`${API_URL}/auth/google/start?redirect_to=${encodeURIComponent(redirectTo)}`);
    const data = await response.json();
    
    // Redirect to Google
    window.location.href = data.authUrl;
  } catch (error) {
    console.error('Failed to start Google auth:', error);
    throw error;
  }
}

// Handle OAuth callback (legacy - not used with new flow)
export async function handleCallback(code: string, state: string): Promise<Session> {
  const callbackUrl = `${API_URL}/auth/callback?code=${code}&state=${state}`;
  console.log('Calling backend API:', callbackUrl);
  
  try {
    const response = await fetch(callbackUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Authentication failed');
    }
    
    const session: Session = {
      user: data.user,
      token: data.sessionToken,
    };
    
    saveSession(session);
    
    return session;
  } catch (error) {
    console.error('handleCallback error:', error);
    throw error;
  }
}

// Sign out
export function signOut() {
  clearSession();
  window.location.href = '/';
}

// Get favorites
export async function getFavorites(): Promise<string[]> {
  const session = getSession();
  if (!session) return [];
  
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
      },
    });
    
    const data = await response.json();
    return data.favorites || [];
  } catch (error) {
    console.error('Failed to get favorites:', error);
    return [];
  }
}

// Toggle favorite
export async function toggleFavorite(slug: string, action: 'add' | 'remove', appName?: string): Promise<boolean> {
  const session = getSession();
  if (!session) {
    signIn();
    return false;
  }
  
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`,
      },
      body: JSON.stringify({ slug, action, appName }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return false;
  }
}

// Get favorite counts
export async function getFavoriteCounts(slugs: string[]): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${API_URL}/favorites/counts?slugs=${slugs.join(',')}`);
    const data = await response.json();
    return data.counts || {};
  } catch (error) {
    console.error('Failed to get counts:', error);
    return {};
  }
}
