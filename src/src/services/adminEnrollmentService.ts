const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000';

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

export interface AdminEnrollment {
  id: number;
  student_id: number;
  subject_id: number;
  status: string;
  payment_status: string;
  attendance_percentage: number;
  grade: string;
  student?: {
    id: number;
    user_id: number;
    user: {
      full_name: string;
      email: string;
      username: string;
    };
  };
  subject?: {
    id: number;
    name: string;
    grade?: string;
    monthly_fee?: number;
  };
}

export const adminEnrollmentService = {
  listPendingEnrollments: async (token: string): Promise<AdminEnrollment[]> => {
    const response = await fetch(`${API_BASE}/admin/enrollments/pending`, {
      headers: getHeaders(token)
    });
    return parseResponse<AdminEnrollment[]>(response);
  },

  deleteEnrollmentRequest: async (token: string, enrollmentId: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin/enrollments/${enrollmentId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<{}>(response);
  }
};
