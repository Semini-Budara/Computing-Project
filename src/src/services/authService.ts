import { Role, User } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000';

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
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export const authService = {
  login: async (username: string, password: string, role: Role) => {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const response = await fetch(`${API_BASE}/auth/${role}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await parseResponse<{ access_token: string; user: User }>(response);
    return {
      token: data.access_token,
      user: data.user
    };
  }
};