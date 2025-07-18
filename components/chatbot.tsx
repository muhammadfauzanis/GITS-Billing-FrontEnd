'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
// import { useAuth } from "@/context/auth"
import { useAuth } from '@/lib/auth';
// import { useRouter } from 'next/router';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export default function ChatbotPage() {
  const [input, setInput] = useState('');
  const [service, setService] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedTool, setSelectedTool] = useState<'summarize' | 'recommend' | 'summary' | null>(null);
  const [messages, setMessages] = useState<{ from: 'user' | 'bot', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const { session, clearSession } = useAuth();
  const user: User | undefined = session?.user;
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!input.trim() || !selectedTool) return;
    if (!selectedTool) return;

    if (selectedTool === 'recommend') {
      if (!service.trim() || !projectId.trim()) return;
    } else {
      if (!input.trim()) return;
    }

    let userMessage = input;

    if (selectedTool === 'recommend') {
      userMessage = `Service: ${service}\nProject ID: ${projectId}`;
    }

    setMessages(prev => [...prev, { from: user ? 'user' : 'bot', text: userMessage }]);
    setLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      if (selectedTool === 'summarize') {
        endpoint = '/tools/summarize_billing';
        payload = { 
          month: input, 
          user_id: user.id 
        };
      } else if (selectedTool === 'recommend') {
        endpoint = '/tools/recommend_service_usage';
        payload = { 
          gcp_services: service,
          project_id: projectId,
          user_id: user.id
        };
      } else if (selectedTool === 'summary') {
        endpoint = '/tools/summary_detailed';
        payload = {
          month: input,
          user_id: user.id,
        };
      }

      const baseUrl = process.env.NEXT_PUBLIC_AGENT_API_URL!;
      const res = await axios.post(`${baseUrl}${endpoint}`, payload);
      const botResult = res.data?.result;

      let botReply = '';
      if (typeof botResult === 'string') {
        botReply = botResult;
      } else if (botResult?.report) {
        botReply = botResult.report;
      } else if (botResult?.recommendation) {
        if (Array.isArray(botResult.recommendation)) {
          botReply = botResult.recommendation.map((item: any) => (
            `- SKU ${item.sku_description} (${item.sku_id})\n  - Usage: ${item.rata_rata_sekarang} ${item.usage_unit}\n  - Batas: ${item.saran_batas_usage}\n  - Hemat: ${item.estimasi_penghematan}`
          )).join('\n\n');
        } else {
          botReply = JSON.stringify(botResult.recommendation);
        }
      } else if (botResult?.error) {
        console.error('Tool error:', botResult.error);
        botReply = `Error: ${botResult.error}`;
      } else {
        botReply = 'No valid response from agent';
      }

      setMessages(prev => [...prev, { from: 'bot', text: botReply }]);
    } catch (err: any) {
      console.error('Request error:', err);
      setMessages(prev => [...prev, { from: 'bot', text: 'Request Error: ' + err.message }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col bg-white text-blue-900 rounded-xl overflow-hidden w-full max-w-3xl h-[90vh] shadow-xl">

      {/* Title */}
      <div className="text-center px-4 pt-4">
        <h1 className="text-2xl font-bold text-blue-700">Billing AI Assistant</h1>
      </div>

      {/* Tool Selector */}
      <div className="flex justify-center gap-4 px-4 py-3">
        {['summarize', 'recommend', 'summary'].map((tool) => (
          <button
            key={tool}
            onClick={() => setSelectedTool(tool as typeof selectedTool)}
            className={`px-4 py-2 rounded-full border transition ${
              selectedTool === tool
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-600 border-blue-400 hover:bg-blue-100'
            }`}
          >
            {{
              summarize: 'Summarize Billing',
              recommend: 'Cost Recommendation',
              summary: 'Summary Per Service',
            }[tool]}
          </button>
        ))}
      </div>

      {/* Chat Content */}
      <div className="flex-1 px-4 pb-2 overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-2xl flex-1 bg-blue-50 rounded-lg shadow p-4 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div 
            key={idx} 
            className={`mb-3 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] ${
                  msg.from === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-800 border border-blue-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <p className="italic text-blue-500">AI is thinking...</p>}
        </div>
      </div>

      {/* Form Input */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto px-4 py-3 bg-white border-t border-blue-200"
      >
        <div className="flex flex-col gap-2">
          {(selectedTool === 'summarize' || selectedTool === 'summary') && (
            <input
              type="text"
              className="p-2 border border-blue-300 rounded"
              placeholder="Enter month (e.g. 2025-06)"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
          )}

          {selectedTool === 'recommend' && (
            <>
              <input
                type="text"
                className="p-2 border border-blue-300 rounded"
                placeholder="Enter GCP Service Name (e.g. Compute Engine)"
                value={service}
                onChange={e => setService(e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                className="p-2 border border-blue-300 rounded"
                placeholder="Enter Project ID (e.g. bahanalink)"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                disabled={loading}
              />
            </>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading || !selectedTool}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
