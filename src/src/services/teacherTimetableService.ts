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

export interface TeacherTimetableSubject {
  id: number;
  name: string;
  grade?: string;
  teacher_id?: number;
}

export interface TeacherTimetableEntry {
  id: number;
  subject_id: number;
  subject?: TeacherTimetableSubject;
  day: string;
  start_time: string;
  end_time: string;
  classroom?: string;
}

export const teacherTimetableService = {
  listTimetable: async (token: string): Promise<TeacherTimetableEntry[]> => {
    const response = await fetch(`${API_BASE}/teachers/me/timetable`, {
      headers: getHeaders(token)
    });
    return parseResponse<TeacherTimetableEntry[]>(response);
  }
};
