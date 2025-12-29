/**
 * Client-side API for feedback/report system
 */

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API!;

export type FeedbackType = 'bug' | 'incorrect_information' | 'broken_link' | 'license_issue' | 'wrong_category' | 'outdated' | 'other' ;

export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export type Feedback = {
  id: string;
  email: string;
  type: FeedbackType;
  message: string;
  appSlug: string;
  appName: string;
  status: FeedbackStatus;
  timestamp: number;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  adminNote?: string;
};

export type SubmitFeedbackData = {
  email: string;
  type: FeedbackType;
  message?: string;
  appSlug: string;
  appName?: string;
};

// Submit feedback (public - no auth required)
export async function submitFeedback(data: SubmitFeedbackData): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to submit feedback' };
    }
    
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    return { success: false, error: 'Network error' };
  }
}

// Get session token from localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const sessionData = localStorage.getItem('session');
  if (!sessionData) return null;
  try {
    const session = JSON.parse(sessionData);
    return session.token;
  } catch {
    return null;
  }
}

// Check if current user is admin
export async function checkAdminStatus(): Promise<{ isAdmin: boolean; email?: string }> {
  const token = getToken();
  if (!token) return { isAdmin: false };
  
  try {
    const response = await fetch(`${API_URL}/admin/check`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  } catch {
    return { isAdmin: false };
  }
}

// Get feedback list (admin only)
export async function getFeedbackList(options?: {
  limit?: number;
  offset?: number;
  status?: FeedbackStatus;
}): Promise<{ feedbacks: Feedback[]; total: number; error?: string }> {
  const token = getToken();
  if (!token) return { feedbacks: [], total: 0, error: 'Not authenticated' };
  
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.offset) params.set('offset', options.offset.toString());
  if (options?.status) params.set('status', options.status);
  
  try {
    const response = await fetch(`${API_URL}/feedback?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { feedbacks: [], total: 0, error: result.error };
    }
    
    return { feedbacks: result.feedbacks, total: result.total };
  } catch (error) {
    console.error('Failed to get feedback list:', error);
    return { feedbacks: [], total: 0, error: 'Network error' };
  }
}

// Update feedback status (admin only)
export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
  adminNote?: string
): Promise<{ success: boolean; error?: string }> {
  const token = getToken();
  if (!token) return { success: false, error: 'Not authenticated' };
  
  try {
    const response = await fetch(`${API_URL}/feedback/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status, adminNote }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update feedback status:', error);
    return { success: false, error: 'Network error' };
  }
}

// Delete feedback (admin only)
export async function deleteFeedback(id: string): Promise<{ success: boolean; error?: string }> {
  const token = getToken();
  if (!token) return { success: false, error: 'Not authenticated' };
  
  try {
    const response = await fetch(`${API_URL}/feedback/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete feedback:', error);
    return { success: false, error: 'Network error' };
  }
}
