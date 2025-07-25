'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

type Message = {
  id: string;
  role: 'user' | 'agent';
  text: string;
};

const baseUrl = process.env.NEXT_PUBLIC_AGENT_API_URL!;

export default function ChatbotPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { session, clearSession } = useAuth();
  const user: User | undefined = session?.user;
  const userId = user?.id || '';
  const router = useRouter();

  useEffect(() => {

    const existing = localStorage.getItem('session_id');
    const generated = existing || uuidv4();
    if (!existing) localStorage.setItem('session_id', generated);
    setSessionId(generated);
  }, []);

  useEffect(() => {
    const createSession = async () => {
      if (!userId || !sessionId) return;
      if (localStorage.getItem('session_created') === sessionId) return;

      try {
        await axios.post(
          `${baseUrl}/apps/billing_agent/users/${userId}/sessions/${sessionId}`,
          {},
          { headers: { 'Content-Type': 'application/json' } }
        );
        console.log("Session created:", sessionId);
        localStorage.setItem('session_created', sessionId);
      } catch (error: any) {
        if (error.response?.status === 409) {
          console.log("Session already exists");
        } else {
          console.error("Failed to create session:", error.message);
        }
      }
    };
    createSession();
  }, [userId, sessionId]);

  const handleSend = async () => {
    if (!input.trim() || !userId || !sessionId) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: input
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
        const payload = {
        appName: "billing_agent",
        sessionId,
        userId,
        newMessage: {
          role: "user",
          parts: [{ text: input }]
        },
        streaming: false
      };

      const res = await axios.post(`${baseUrl}/run`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = res.data;
      let replyText = "(no response)";

      for (let i = data.length - 1; i >= 0; i--) {
        const entry = data[i];
        const parts = entry?.content?.parts || [];
        for (const part of parts) {
          if (part.text) {
            replyText = part.text;
            break;
          }
        }
        if (replyText !== "(no response)") break;
      }

      const agentMessage: Message = {
        id: uuidv4(),
        role: "agent",
        text: replyText
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "agent",
          text: "Error processing your request."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chat with Billing AI</h1>
      <div className="mb-4 space-y-2 max-h-96 overflow-y-auto border p-4 rounded">
        {messages.map((msg) => (
          <div key={msg.id} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className="block px-2 py-1 rounded bg-gray-100 inline-block">
              <strong>{msg.role === 'user' ? 'You' : 'Agent'}:</strong> {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow border px-3 py-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
