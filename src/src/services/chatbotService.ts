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

export interface ChatbotMessage {
  id: number;
  conversation_id: number;
  sender: 'student' | 'bot';
  message: string;
  created_at: string;
}

export interface ChatbotConversation {
  id: number;
  student_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatbotConversationWithMessages extends ChatbotConversation {
  messages: ChatbotMessage[];
}

export interface ChatbotMessageCreate {
  message: string;
}

export const chatbotService = {
  /**
   * Create a new chatbot conversation
   */
  createConversation: async (token: string | null): Promise<ChatbotConversationWithMessages> => {
    const response = await fetch(`${API_BASE}/students/chatbot/conversations`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return parseResponse<ChatbotConversationWithMessages>(response);
  },

  /**
   * Get all conversations for the current student
   */
  listConversations: async (
    token: string | null,
    skip: number = 0,
    limit: number = 100
  ): Promise<ChatbotConversation[]> => {
    const query = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    const response = await fetch(
      `${API_BASE}/students/chatbot/conversations?${query}`,
      {
        headers: getHeaders(token),
      }
    );
    return parseResponse<ChatbotConversation[]>(response);
  },

  /**
   * Get a specific conversation with all messages
   */
  getConversation: async (
    token: string | null,
    conversationId: number
  ): Promise<ChatbotConversationWithMessages> => {
    const response = await fetch(
      `${API_BASE}/students/chatbot/conversations/${conversationId}`,
      {
        headers: getHeaders(token),
      }
    );
    return parseResponse<ChatbotConversationWithMessages>(response);
  },

  /**
   * Send a message to an existing conversation
   */
  sendMessage: async (
    token: string | null,
    conversationId: number,
    message: string
  ): Promise<ChatbotConversationWithMessages> => {
    const payload: ChatbotMessageCreate = { message };
    const response = await fetch(
      `${API_BASE}/students/chatbot/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }
    );
    return parseResponse<ChatbotConversationWithMessages>(response);
  },

  /**
   * Send a message to a new conversation
   */
  sendMessageNewConversation: async (
    token: string | null,
    message: string
  ): Promise<ChatbotConversationWithMessages> => {
    const payload: ChatbotMessageCreate = { message };
    const response = await fetch(
      `${API_BASE}/students/chatbot/conversations/messages/new`,
      {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }
    );
    return parseResponse<ChatbotConversationWithMessages>(response);
  },

  /**
   * Update conversation title
   */
  updateConversationTitle: async (
    token: string,
    conversationId: number,
    title: string
  ): Promise<ChatbotConversation> => {
    const response = await fetch(
      `${API_BASE}/students/chatbot/conversations/${conversationId}?title=${encodeURIComponent(title)}`,
      {
        method: 'PUT',
        headers: getHeaders(token),
      }
    );
    return parseResponse<ChatbotConversation>(response);
  },

  /**
   * Delete a conversation
   */
  deleteConversation: async (
    token: string | null,
    conversationId: number
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE}/students/chatbot/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: getHeaders(token),
      }
    );
    return parseResponse<void>(response);
  },
};
