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

export interface TeacherUser {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: string;
}

export interface TeacherData {
  id: number;
  user_id: number;
  user: TeacherUser;
  department?: string;
  grade_assigned?: string;
  class_fee?: string;
  contact_number?: string;
  profile_image?: string;
  qualifications?: string;
  experience?: string;
  subjects_taught?: string;
}

export interface TeacherProfileData {
  user: TeacherUser;
  teacher: TeacherData;
}

export interface TeacherClass {
  id: number;
  name: string;
  description?: string;
  grade?: string;
  teacher_id?: number;
  monthly_fee?: number;
}

export interface TeacherStudent {
  id: number;
  user_id?: number;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  grade?: string;
  school?: string;
  guardian_name?: string;
  guardian_contact?: string;
}

export const teacherProfileService = {
  getProfile: async (token: string): Promise<TeacherProfileData> => {
    const response = await fetch(`${API_BASE}/teachers/me/profile`, {
      headers: getHeaders(token)
    });
    return parseResponse<TeacherProfileData>(response);
  },

  getClasses: async (token: string): Promise<TeacherClass[]> => {
    const response = await fetch(`${API_BASE}/teachers/me/classes`, {
      headers: getHeaders(token)
    });
    return parseResponse<TeacherClass[]>(response);
  },

  getStudents: async (token: string): Promise<TeacherStudent[]> => {
    const response = await fetch(`${API_BASE}/teachers/me/students`, {
      headers: getHeaders(token)
    });
    return parseResponse<TeacherStudent[]>(response);
  },

  getStudentsResults: async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/teachers/me/students/results`, {
      headers: getHeaders(token)
    });
    return parseResponse<any[]>(response);
  },

  saveStudentResults: async (token: string, studentId: number, results: { term1?: string; term2?: string; term3?: string }): Promise<void> => {
    const response = await fetch(`${API_BASE}/teachers/me/students/${studentId}/results`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(results)
    });
    return parseResponse<void>(response);
  }
};
