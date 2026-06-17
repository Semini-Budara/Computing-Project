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

export interface TimetableSubject {
  id: number;
  name: string;
  grade?: string;
  teacher_id?: number;
}

export interface AdminTimetable {
  id: number;
  subject_id: number;
  subject?: TimetableSubject;
  day: string;
  start_time: string;
  end_time: string;
  classroom?: string;
}

export interface AdminGrade {
  name: string;
  subjects: TimetableSubject[];
}

export interface AdminTeacher {
  id: number;
  user: {
    full_name: string;
  };
}

export interface AdminSubjectForTimetable {
  id: number;
  name: string;
  grade?: string;
  teacher_id?: number;
}

export interface TimetableCreatePayload {
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
  classroom?: string;
}

export interface TimetableUpdatePayload {
  subject_id?: number;
  day?: string;
  start_time?: string;
  end_time?: string;
  classroom?: string;
}

export const adminTimetableService = {
  listTimetables: async (token: string): Promise<AdminTimetable[]> => {
    const response = await fetch(`${API_BASE}/admin/timetable`, {
      headers: getHeaders(token)
    });
    return parseResponse<AdminTimetable[]>(response);
  },

  listSubjects: async (token: string): Promise<AdminSubjectForTimetable[]> => {
    const response = await fetch(`${API_BASE}/admin/subjects`, {
      headers: getHeaders(token)
    });
    return parseResponse<AdminSubjectForTimetable[]>(response);
  },

  listTeachers: async (token: string): Promise<AdminTeacher[]> => {
    const response = await fetch(`${API_BASE}/admin/teachers`, {
      headers: getHeaders(token)
    });
    return parseResponse<AdminTeacher[]>(response);
  },

  createTimetable: async (token: string, payload: TimetableCreatePayload): Promise<AdminTimetable> => {
    const response = await fetch(`${API_BASE}/admin/timetable`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminTimetable>(response);
  },

  updateTimetable: async (
    token: string,
    id: number,
    payload: TimetableUpdatePayload
  ): Promise<AdminTimetable> => {
    const response = await fetch(`${API_BASE}/admin/timetable/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return parseResponse<AdminTimetable>(response);
  },

  deleteTimetable: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin/timetable/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    await parseResponse<void>(response);
  }
};
