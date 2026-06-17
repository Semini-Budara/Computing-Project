import type { AdminTeacher } from './adminTeacherService';

const rawApiBase = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000';
const API_BASE = rawApiBase.startsWith('http')
  ? rawApiBase.replace(/\/$/, '')
  : `http://${rawApiBase.replace(/\/$/, '')}`;

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

function fetchJson(input: RequestInfo, init: RequestInit) {
  return fetch(input, {
    mode: 'cors',
    ...init,
  });
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

export interface AdminStudentUser {
  id: number;
  username: string;
  email: string;
  role: 'student';
  full_name: string;
}

export interface AdminStudent {
  id: number;
  user_id: number;
  user: AdminStudentUser;
  age?: number;
  grade?: string;
  school?: string;
  guardian_name?: string;
  guardian_contact?: string;
  profile_image?: string;
  teacher_id?: number;
  teacher?: AdminTeacher;
  teachers?: AdminTeacher[];
  created_at: string;
}

export interface AdminStudentListResponse {
  total: number;
  students: AdminStudent[];
}

export interface AdminStudentCreatePayload {
  full_name: string;
  username: string;
  email: string;
  password: string;
  grade: string;
  age?: number;
  school?: string;
  guardian_name?: string;
  guardian_contact?: string;
  profile_image?: string;
  teacher_id?: number;
  teacher_ids?: number[];
}

export interface AdminStudentUpdatePayload {
  full_name?: string;
  username?: string;
  email?: string;
  password?: string;
  age?: number;
  grade?: string;
  school?: string;
  guardian_name?: string;
  guardian_contact?: string;
  profile_image?: string;
  teacher_id?: number;
  teacher_ids?: number[];
}

export const adminStudentService = {
  listStudents: async (
    token: string,
    page = 1,
    pageSize = 10,
    name?: string,
    grade?: string,
    school?: string
  ): Promise<AdminStudentListResponse> => {
    const url = buildUrl('/admin/students', {
      page,
      page_size: pageSize,
      search: name,
      grade,
      school
    });
    const response = await fetchJson(url, {
      headers: getHeaders(token)
    });
    return parseResponse<AdminStudentListResponse>(response);
  },

  createStudent: async (
    token: string,
    payload: AdminStudentCreatePayload
  ): Promise<AdminStudent> => {
    const response = await fetchJson(`${API_BASE}/admin/students`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminStudent>(response);
  },

  updateStudent: async (
    token: string,
    id: number,
    payload: AdminStudentUpdatePayload
  ): Promise<AdminStudent> => {
    const response = await fetchJson(`${API_BASE}/admin/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminStudent>(response);
  },

  deleteStudent: async (token: string, id: number): Promise<void> => {
    const response = await fetchJson(`${API_BASE}/admin/students/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<void>(response);
  },

  enrollStudentInSubject: async (token: string, studentId: number, subjectId: number): Promise<any> => {
    const response = await fetchJson(`${API_BASE}/admin/students/${studentId}/enrollments?subject_id=${subjectId}`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return parseResponse<any>(response);
  }
};
