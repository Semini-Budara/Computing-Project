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

export interface NotificationPayload {
  id: number;
  title: string;
  message: string;
  category?: string;
  target_role?: 'all' | 'students' | 'teachers';
  created_at: string;
}

export const notificationsService = {
  listStudentNotifications: async (token: string): Promise<NotificationPayload[]> => {
    const response = await fetch(`${API_BASE}/students/me/notifications`, {
      headers: getHeaders(token)
    });
    return parseResponse<NotificationPayload[]>(response);
  },

  dismissStudentNotification: async (token: string, notificationId: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/students/me/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<void>(response);
  },

  clearStudentNotifications: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/students/me/notifications`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<void>(response);
  },

  listTeacherNotifications: async (token: string): Promise<NotificationPayload[]> => {
    const response = await fetch(`${API_BASE}/teachers/me/notifications`, {
      headers: getHeaders(token)
    });
    return parseResponse<NotificationPayload[]>(response);
  },

  dismissTeacherNotification: async (token: string, notificationId: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/teachers/me/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<void>(response);
  },

  clearTeacherNotifications: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/teachers/me/notifications`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<void>(response);
  }
};
