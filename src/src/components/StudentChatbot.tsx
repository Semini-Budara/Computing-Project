import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, Loader } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ChatMessage {
  id: string;
  sender: 'student' | 'bot';
  message: string;
  created_at: string;
}

const cannedResponses: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ['schedule', 'timetable', 'class', 'classes'],
    response:
      'Your next class is Math at 09:00 AM tomorrow. You can check the Timetable page for the full week.',
  },
  {
    keywords: ['subject', 'subjects', 'course'],
    response:
      'You are currently enrolled in Math, English, and Science. Visit the Subjects page to see more details.',
  },
  {
    keywords: ['result', 'grade', 'exam'],
    response:
      'Results are available in the Results section. If you want, I can help you understand your latest scores.',
  },
  {
    keywords: ['payment', 'fee', 'invoice'],
    response:
      'Payments are managed in the Payments page. Let me know if you need help with fee details.',
  },
  {
    keywords: ['teacher', 'mentor', 'instructor'],
    response:
      'Your assigned teachers are listed in the Teachers page. Feel free to ask about contacting them.',
  },
];

function generateMockReply(message: string) {
  const normalized = message.toLowerCase();
  for (const rule of cannedResponses) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.response;
    }
  }
  return 'Thanks for your question! I am here to help with anything related to your classes, schedule, payments, and results.';
}

export function StudentChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const studentMessage: ChatMessage = {
      id: `student-${Date.now()}`,
      sender: 'student',
      message: userMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, studentMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        message: generateMockReply(userMessage),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 700);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-scarlet text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-scarlet to-scarlet/90 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition"
                title="Close chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 && !isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
                    <p className="font-medium">Start a conversation</p>
                    <p className="text-xs mt-1">Ask me anything about your studies!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            msg.sender === 'student'
                              ? 'bg-scarlet text-white rounded-br-none'
                              : 'bg-gray-200 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <p className="break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 opacity-70 ${msg.sender === 'student' ? 'text-white' : 'text-gray-600'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-600 text-xs p-2 bg-red-50 rounded">
                        {error}
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <form onSubmit={sendMessage} className="border-t p-3 bg-white flex gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="hover:bg-scarlet/90">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
