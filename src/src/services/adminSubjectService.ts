const API_BASE = (import.meta as any).env.VITE_API_BASE ?? 'http://127.0.0.1:8000';

function buildUrl(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  );
  return `${API_BASE}${path}${query.toString() ? `?${query.toString()}` : ''}`;
}

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

export interface AdminTeacherInfo {
  id: number;
  user: {
    full_name: string;
  };
}

export interface AdminSubject {
  id: number;
  name: string;
  description?: string;
  grade?: string;
  teacher_id?: number;
  monthly_fee?: number;
  schedule_time?: string;
}

export interface AdminSubjectCreatePayload {
  name: string;
  description?: string;
  grade?: string;
  teacher_id?: number;
  monthly_fee?: number;
  schedule_time?: string;
}

export interface AdminSubjectUpdatePayload {
  name?: string;
  description?: string;
  grade?: string;
  teacher_id?: number;
  monthly_fee?: number;
  schedule_time?: string;
}

export const adminSubjectService = {
  listSubjects: async (token: string): Promise<AdminSubject[]> => {
    const response = await fetch(`${API_BASE}/admin/subjects`, {
      headers: getHeaders(token)
    });
    return parseResponse<AdminSubject[]>(response);
  },

  listTeachers: async (token: string): Promise<AdminTeacherInfo[]> => {
    const response = await fetch(`${API_BASE}/admin/teachers`, {
      headers: getHeaders(token)
    });
    return parseResponse<AdminTeacherInfo[]>(response);
  },

  createSubject: async (token: string, payload: AdminSubjectCreatePayload): Promise<AdminSubject> => {
    const response = await fetch(`${API_BASE}/admin/subjects`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminSubject>(response);
  },

  updateSubject: async (
    token: string,
    id: number,
    payload: AdminSubjectUpdatePayload
  ): Promise<AdminSubject> => {
    const response = await fetch(`${API_BASE}/admin/subjects/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminSubject>(response);
  },

  deleteSubject: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin/subjects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<void>(response);
  }
};
