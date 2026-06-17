const API_BASE = (import.meta as any).env.VITE_API_BASE ?? 'http://127.0.0.1:8000';

function normalizeToken(token?: string | null) {
  if (!token || token === 'null' || token === 'undefined') {
    return undefined;
  }
  return token;
}

function getHeaders(token?: string | null) {
  const cleanToken = normalizeToken(token);
  return {
    'Content-Type': 'application/json',
    ...(cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {})
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = JSON.parse(text);
      message = body.detail || body.message || JSON.stringify(body);
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  category?: string;
  target_role?: 'all' | 'students' | 'teachers';
  created_at: string;
}

export interface AdminNotificationCreatePayload {
  title: string;
  message: string;
  category?: string;
  target_role?: 'all' | 'students' | 'teachers';
}

export interface AdminNotificationUpdatePayload {
  title?: string;
  message?: string;
  category?: string;
  target_role?: 'all' | 'students' | 'teachers';
}

export const adminNotificationService = {
  listNotifications: async (token: string): Promise<AdminNotification[]> => {
    const response = await fetch(`${API_BASE}/admin/notifications`, {
      headers: getHeaders(token)
    });
    return parseResponse<AdminNotification[]>(response);
  },

  createNotification: async (
    token: string,
    payload: AdminNotificationCreatePayload
  ): Promise<AdminNotification> => {
    const response = await fetch(`${API_BASE}/admin/notifications`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminNotification>(response);
  },

  updateNotification: async (
    token: string,
    id: number,
    payload: AdminNotificationUpdatePayload
  ): Promise<AdminNotification> => {
    const response = await fetch(`${API_BASE}/admin/notifications/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminNotification>(response);
  },

  deleteNotification: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<void>(response);
  }
};
