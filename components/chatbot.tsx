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
    if (sessionId && messages.length === 0) {
      const greeting: Message = {
        id: uuidv4(),
        role: 'agent',
        text: 'Halo! Saya Billing Agent yang siap membantu Anda. Silakan ketik pertanyaan Anda.'
      };
      setMessages([greeting]);
    }
  }, [sessionId]);

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
    <div className="min-h-screen bg-white text-gray-900 px-6 py-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-6 text-center tracking-tight">
          AI Billing Assistant
        </h1>

        <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl shadow max-h-[400px] overflow-y-auto mb-4 border">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-xl text-sm whitespace-pre-line shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-300 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-sm text-gray-500 italic animate-pulse">Agent is typing...</div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything about your billing..."
          />

          <button
            onClick={handleSend}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-white disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
