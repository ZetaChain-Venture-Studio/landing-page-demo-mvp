"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

// Landing Page Design - Brutalist stone boxes

const MODELS = [
  { id: 'gpt-4', label: 'GPT', color: 'bg-green-100 border-green-300 text-green-800' },
  { id: 'claude', label: 'Claude', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { id: 'gemini', label: 'Gemini', color: 'bg-blue-100 border-blue-300 text-blue-800' },
];

const MODEL_API_IDS: Record<string, string> = {
  'gpt-4': 'openai/gpt-4o',
  'claude': 'anthropic/claude-3-5-sonnet-20241022',
  'gemini': 'google/gemini-1.5-pro',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

function MiniDemo() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const getModelLabel = (id: string) => MODELS.find(m => m.id === id)?.label || id;
  const getModelColor = (id: string) => MODELS.find(m => m.id === id)?.color || '';

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setStreamingContent('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const conversationHistory = [
      { role: 'system' as const, content: 'You are a helpful assistant. Keep responses very concise (1-2 sentences max).' },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userMessage }
    ];

    try {
      const res = await fetch('https://ai-portal-dev.zetachain.com/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL_API_IDS[selectedModel],
          messages: conversationHistory,
          max_tokens: 100,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setStreamingContent(fullText);
              }
            } catch {}
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullText, model: selectedModel }]);
      setStreamingContent('');
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error - please try again.', model: selectedModel }]);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with model selector */}
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <span className="font-mono text-xs text-neutral-500">TRY IT</span>
        <div className="flex gap-1">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`px-2 py-1 text-[10px] font-mono border transition-all ${
                selectedModel === model.id
                  ? model.color
                  : 'bg-neutral-100 border-black/10 text-neutral-500 hover:border-black/20'
              }`}
            >
              {model.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="space-y-3 min-h-[140px] max-h-[180px] overflow-y-auto">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8 text-neutral-400 text-xs font-mono">
            Type a message to try ANUMA
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="flex gap-3">
            <div className={`text-xs shrink-0 font-mono font-bold ${
              msg.role === 'user' ? 'text-neutral-600' : getModelColor(msg.model || selectedModel).replace('bg-', 'text-').replace('-100', '-700').split(' ')[0]
            }`}>
              {msg.role === 'user' ? 'YOU' : getModelLabel(msg.model || selectedModel)}
            </div>
            <div className={`text-sm ${msg.role === 'user' ? 'text-black font-medium' : 'text-neutral-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && streamingContent && (
          <div className="flex gap-3">
            <div className={`text-xs shrink-0 font-mono font-bold ${getModelColor(selectedModel).replace('bg-', 'text-').replace('-100', '-700').split(' ')[0]}`}>
              {getModelLabel(selectedModel)}
            </div>
            <div className="text-sm text-neutral-800">
              {streamingContent}
              <span className="inline-block w-1.5 h-3 bg-black/50 ml-0.5 animate-pulse" />
            </div>
          </div>
        )}

        {isLoading && !streamingContent && (
          <div className="flex gap-3">
            <div className={`text-xs shrink-0 font-mono font-bold ${getModelColor(selectedModel).replace('bg-', 'text-').replace('-100', '-700').split(' ')[0]}`}>
              {getModelLabel(selectedModel)}
            </div>
            <div className="flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-black/10 pt-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask anything..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-sm border border-black/20 bg-white text-black placeholder-neutral-400 focus:outline-none focus:border-black font-mono"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-4 py-2 bg-black text-white text-xs font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
        >
          Send
        </button>
      </form>

      {/* Context indicator */}
      <div className="flex items-center gap-2 text-[10px] text-neutral-700 font-mono">
        <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-600'}`} />
        {messages.length > 0 ? `${messages.length} messages · Context preserved` : 'Context preserved across models'}
      </div>
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      console.log('Waitlist signup:', email);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <span className="text-white text-sm">✓</span>
        </div>
        <span className="font-mono text-sm text-black">You&apos;re on the list!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 px-4 py-4 border-2 border-black bg-white text-black placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
      />
      <button
        type="submit"
        className="px-8 py-4 bg-black text-white font-mono text-sm hover:bg-neutral-800 transition-colors uppercase tracking-wider whitespace-nowrap"
      >
        Join Waitlist
      </button>
    </form>
  );
}

export default function BrutalistStone() {
  return (
    <div className="min-h-screen bg-stone-100 relative overflow-hidden">
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-8 py-6 border-b border-black/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="font-mono tracking-tight text-xl uppercase font-bold text-black">ANUMA</span>
            <a href="#waitlist" className="font-mono text-xs uppercase tracking-wider text-black/70 hover:text-black transition-colors">
              Join Waitlist
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-8 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            {/* Hero - Grid layout with demo on right */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
              {/* Left - Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <h1
                  className="text-black leading-[0.85] tracking-tighter"
                  style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
                >
                  One
                  <br />
                  interface.
                  <br />
                  Every AI.
                </h1>

                <p className="text-neutral-800 text-xl max-w-md leading-relaxed">
                  Switch between models. Keep context. Your data stays local.
                </p>

                <div id="waitlist">
                  <WaitlistForm />
                </div>
              </motion.div>

              {/* Right - Interactive Mini Demo */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="border border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.08)]"
              >
                <MiniDemo />
              </motion.div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-8 border-t border-black/20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <p className="text-xs text-neutral-700 font-mono uppercase tracking-wide">© 2025 Anuma</p>
            <div className="flex gap-8 text-xs font-mono text-neutral-700 uppercase tracking-wide">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
              <a href="#" className="hover:text-black transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
