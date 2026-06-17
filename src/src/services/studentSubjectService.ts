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

export interface StudentSubject {
  id: number;
  name: string;
  description?: string;
  grade?: string;
  teacher_id?: number;
  monthly_fee?: number;
}

export interface StudentTeacherProfile {
  user: {
    id: number;
    email: string;
    username: string;
    full_name?: string;
    role: string;
  };
  teacher: {
    id: number;
    user_id: number;
    department?: string;
    grade_assigned?: string;
    profile_image?: string;
    qualifications?: string;
    experience?: string;
    subjects_taught?: string;
  };
}

export const studentSubjectService = {
  listEnrolledSubjects: async (token: string): Promise<StudentSubject[]> => {
    const response = await fetch(`${API_BASE}/students/me/subjects`, {
      headers: getHeaders(token)
    });
    return parseResponse<StudentSubject[]>(response);
  },

  listAvailableSubjects: async (token: string): Promise<StudentSubject[]> => {
    const response = await fetch(`${API_BASE}/students/subjects`, {
      headers: getHeaders(token)
    });
    return parseResponse<StudentSubject[]>(response);
  },

  getSubject: async (token: string, subjectId: number): Promise<StudentSubject> => {
    const response = await fetch(`${API_BASE}/students/subjects/${subjectId}`, {
      headers: getHeaders(token)
    });
    return parseResponse<StudentSubject>(response);
  },

  requestEnrollment: async (token: string, subjectId: number, amount: number, currency = 'USD') => {
    const response = await fetch(`${API_BASE}/students/enroll`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ subject_id: subjectId, amount, currency })
    });
    return parseResponse(response);
  },

  listAllTeachers: async (): Promise<StudentTeacherProfile[]> => {
    const response = await fetch(`${API_BASE}/students/teachers`);
    return parseResponse<StudentTeacherProfile[]>(response);
  },

  getTeacherProfile: async (token: string, teacherId: number): Promise<StudentTeacherProfile> => {
    const response = await fetch(`${API_BASE}/students/me/teachers/${teacherId}`, {
      headers: getHeaders(token)
    });
    return parseResponse<StudentTeacherProfile>(response);
  }
};
