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

export interface StudentUser {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: string;
}

export interface StudentData {
  id: number;
  user_id: number;
  user: StudentUser;
  age?: number;
  grade?: string;
  school?: string;
  guardian_name?: string;
  guardian_contact?: string;
  profile_image?: string;
}

export interface StudentProfileData {
  user: StudentUser;
  student: StudentData;
}

export interface StudentResult {
  subject_id: number;
  subject_name: string;
  grade: string;
  term1_result?: string;
  term2_result?: string;
  term3_result?: string;
}

export interface StudentAttendance {
  subject_id: number;
  subject_name: string;
  attendance_percentage: number;
}

export interface EnrolledSubject {
  id: number;
  name: string;
  description?: string;
  grade?: string;
  teacher_id?: number;
  monthly_fee?: number;
}

export interface StudentPayment {
  id: number;
  student_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  enrollment_id?: number;
  payment_date?: string;
  subject_name?: string;
  teacher_name?: string;
}

export const studentProfileService = {
  getProfile: async (token: string): Promise<StudentProfileData> => {
    const response = await fetch(`${API_BASE}/students/me/profile`, {
      headers: getHeaders(token)
    });
    return parseResponse<StudentProfileData>(response);
  },

  getEnrolledSubjects: async (token: string): Promise<EnrolledSubject[]> => {
    const response = await fetch(`${API_BASE}/students/me/subjects`, {
      headers: getHeaders(token)
    });
    return parseResponse<EnrolledSubject[]>(response);
  },

  getResults: async (token: string): Promise<StudentResult[]> => {
    const response = await fetch(`${API_BASE}/students/me/results`, {
      headers: getHeaders(token)
    });
    return parseResponse<StudentResult[]>(response);
  },

  getAttendance: async (token: string): Promise<StudentAttendance[]> => {
    const response = await fetch(`${API_BASE}/students/me/attendance`, {
      headers: getHeaders(token)
    });
    return parseResponse<StudentAttendance[]>(response);
  },

  getPayments: async (token: string): Promise<StudentPayment[]> => {
    const response = await fetch(`${API_BASE}/students/payments`, {
      headers: getHeaders(token)
    });
    return parseResponse<StudentPayment[]>(response);
  },

  completePayment: async (token: string, paymentId: number): Promise<StudentPayment> => {
    const response = await fetch(`${API_BASE}/students/payments/${paymentId}/complete`, {
      method: 'PUT',
      headers: getHeaders(token),
    });
    return parseResponse<StudentPayment>(response);
  }
};
