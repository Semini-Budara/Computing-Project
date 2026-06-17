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

export interface AdminTeacherUser {
  id: number;
  username: string;
  email: string;
  role: 'teacher';
  full_name: string;
}

export interface AdminTeacher {
  id: number;
  user_id: number;
  user: AdminTeacherUser;
  department?: string;
  grade_assigned?: string;
  class_fee?: string;
  contact_number?: string;
  profile_image?: string;
  qualifications?: string;
  experience?: string;
  subjects_taught?: string;
}

export interface AdminTeacherCreatePayload {
  full_name: string;
  username: string;
  email: string;
  password: string;
  department?: string;
  grade_assigned?: string;
  class_fee?: string;
  contact_number?: string;
  profile_image?: string;
  qualifications?: string;
  experience?: string;
  subjects_taught?: string;
}

export interface AdminTeacherUpdatePayload {
  full_name?: string;
  username?: string;
  email?: string;
  password?: string;
  department?: string;
  grade_assigned?: string;
  class_fee?: string;
  contact_number?: string;
  profile_image?: string;
  qualifications?: string;
  experience?: string;
  subjects_taught?: string;
}

export const adminTeacherService = {
  listTeachers: async (
    token: string,
    page = 1,
    pageSize = 10,
    name?: string,
    grade?: string,
    department?: string
  ): Promise<AdminTeacher[]> => {
    const url = buildUrl('/admin/teachers', {
      page,
      page_size: pageSize,
      search: name,
      grade,
      department
    });
    const response = await fetch(url, {
      headers: getHeaders(token)
    });
    return parseResponse<AdminTeacher[]>(response);
  },

  createTeacher: async (token: string, payload: AdminTeacherCreatePayload): Promise<AdminTeacher> => {
    const response = await fetch(`${API_BASE}/admin/teachers`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminTeacher>(response);
  },

  updateTeacher: async (
    token: string,
    id: number,
    payload: AdminTeacherUpdatePayload
  ): Promise<AdminTeacher> => {
    const response = await fetch(`${API_BASE}/admin/teachers/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminTeacher>(response);
  },

  deleteTeacher: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin/teachers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<void>(response);
  }
};
