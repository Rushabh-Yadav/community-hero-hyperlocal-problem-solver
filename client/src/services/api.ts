import { auth } from './firebaseClient.js';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper to prepare HTTP headers with Firebase JWT
const getHeaders = async (isMultipart = false): Promise<HeadersInit> => {
  const headers: HeadersInit = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth && typeof auth.currentUser?.getIdToken === 'function') {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('Failed to retrieve authentication token.', e);
    }
  } else if (auth && auth.currentUser) {
    // If using local MockAuthClient
    const token = await auth.currentUser.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const api = {
  // Sync authenticated user with database
  syncUser: async () => {
    const res = await fetch(`${API_BASE_URL}/users/sync`, {
      method: 'POST',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('User synchronization failed.');
    return res.json();
  },

  // Get user profile by UID
  getUserProfile: async (uid: string) => {
    const res = await fetch(`${API_BASE_URL}/users/profile/${uid}`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user profile.');
    return res.json();
  },

  // Get gamification leaderboard
  getLeaderboard: async () => {
    const res = await fetch(`${API_BASE_URL}/users/leaderboard`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve leaderboard.');
    return res.json();
  },

  // Submit issue report (multimodal upload)
  reportIssue: async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to submit issue report.');
    return res.json();
  },

  // Get list of issues with query filters
  getIssues: async (filters: {
    category?: string;
    status?: string;
    priority?: string;
    department?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val.toString());
      }
    });

    const res = await fetch(`${API_BASE_URL}/issues?${params.toString()}`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch issue reports.');
    return res.json();
  },

  // Fetch issue details by ID
  getIssueById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve issue details.');
    return res.json();
  },

  // Vote on an issue
  voteIssue: async (id: string, voteType: 'up' | 'down') => {
    const res = await fetch(`${API_BASE_URL}/issues/${id}/vote`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ voteType }),
    });
    if (!res.ok) throw new Error('Failed to register vote.');
    return res.json();
  },

  // Comment on an issue with optional file upload proof
  addComment: async (id: string, formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/issues/${id}/comment`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to add comment.');
    return res.json();
  },

  // Update status, checklist, or department allocations
  updateIssueStatus: async (id: string, data: {
    status?: string;
    resolutionChecklist?: any[];
    officerReport?: string;
    department?: string;
    assignedTo?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/issues/${id}/status`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update issue status.');
    return res.json();
  },

  // Fetch aggregated dashboard metrics
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboards/stats`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load dashboard metrics.');
    return res.json();
  },

  // Chat with AI civic assistant
  chatWithAi: async (message: string, chatHistory: any[] = []) => {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ message, chatHistory }),
    });
    if (!res.ok) throw new Error('AI assistant did not respond.');
    return res.json();
  },

  // Fetch AI infrastructure predictions
  getAiPredictions: async () => {
    const res = await fetch(`${API_BASE_URL}/ai/predictions`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch predictive hotspots.');
    return res.json();
  },

  // Admin User List management
  getAdminUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboards/users`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch administrative user database.');
    return res.json();
  }
};
