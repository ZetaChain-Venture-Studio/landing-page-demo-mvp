"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';

// Design - ANUMA Landing Page Design (2) - Interactive demo with split layout

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

const MODELS = [
  { id: 'gpt-4', label: 'GPT-4', color: 'bg-green-600', textColor: 'text-green-700', bgLight: 'bg-green-50', border: 'border-green-300' },
  { id: 'claude', label: 'Claude', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-300' },
  { id: 'gemini', label: 'Gemini', color: 'bg-blue-600', textColor: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-300' },
];

const MODEL_API_IDS: Record<string, string> = {
  'gpt-4': 'openai/gpt-4o',
  'claude': 'anthropic/claude-3-5-sonnet-20241022',
  'gemini': 'google/gemini-1.5-pro',
};

function InteractiveDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getModel = (id: string) => MODELS.find(m => m.id === id) || MODELS[0];

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
      { role: 'system' as const, content: 'You are a helpful assistant. Keep responses concise (2-3 sentences max). You have access to the full conversation history.' },
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
          max_tokens: 200,
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
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <div className="relative">
      {/* Demo label */}
      <div className="mb-4 flex items-center gap-2">
        <div className="text-xs tracking-wider text-black/60 font-medium">TRY IT - INTERACTIVE DEMO</div>
        <div className="flex-1 h-px bg-black/10" />
        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
      </div>

      {/* Chat interface */}
      <div className="bg-white border-2 border-black/20 h-[500px] flex flex-col">
        {/* Model selector bar */}
        <div className="border-b border-black/10 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs tracking-wider text-black/60 font-medium">SELECT MODEL:</div>
            <div className="flex gap-2">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                    selectedModel === model.id
                      ? `${model.bgLight} ${model.border} ${model.textColor}`
                      : 'bg-gray-100 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-black/40">
                <p className="text-sm mb-1">Type a message to start</p>
                <p className="text-xs">Switch models anytime - context is preserved</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            const model = msg.model ? getModel(msg.model) : getModel(selectedModel);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.role === 'assistant' && msg.model && (
                    <div className={`text-[10px] font-bold tracking-wider mb-1 ${model.textColor}`}>
                      {model.label}
                    </div>
                  )}
                  <div className={`inline-block p-4 ${
                    msg.role === 'user'
                      ? 'bg-black text-white'
                      : `${model.bgLight} border ${model.border} text-black`
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {isLoading && streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%]">
                <div className={`text-[10px] font-bold tracking-wider mb-1 ${getModel(selectedModel).textColor}`}>
                  {getModel(selectedModel).label}
                </div>
                <div className={`inline-block p-4 ${getModel(selectedModel).bgLight} border ${getModel(selectedModel).border} text-black`}>
                  <p className="text-sm leading-relaxed">
                    {streamingContent}
                    <span className="inline-block w-2 h-4 bg-black/30 ml-1 animate-pulse" />
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isLoading && !streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className={`p-4 ${getModel(selectedModel).bgLight} border ${getModel(selectedModel).border}`}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={sendMessage} className="border-t border-black/10 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-black/20 bg-white text-black placeholder-black/40 focus:outline-none focus:border-black text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </form>

        {/* Context indicator */}
        {messages.length > 0 && (
          <div className="border-t border-black/10 px-4 py-2 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-black/60">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>{messages.length} messages · Context preserved across all models</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WaitlistButton() {
  const { login, authenticated } = usePrivy();

  return (
    <button
      onClick={login}
      className="px-6 py-2 bg-black text-white text-xs tracking-wider hover:bg-gray-800 transition-colors"
    >
      {authenticated ? 'JOINED' : 'JOIN WAITLIST'}
    </button>
  );
}

export default function InteractiveSplit() {

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating subtle text hints */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[15%] left-[10%] text-[8vw] opacity-[0.02] rotate-[-5deg]">
          CONTEXT
        </div>
        <div className="absolute bottom-[20%] right-[8%] text-[6vw] opacity-[0.02] rotate-[3deg]">
          PRIVACY
        </div>
        <div className="absolute top-[60%] left-[5%] text-[5vw] opacity-[0.02] rotate-[-2deg]">
          SEAMLESS
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 md:px-12 py-8 flex justify-between items-center">
          <div className="text-sm tracking-[0.2em] text-black font-medium">ANUMA</div>
          <WaitlistButton />
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-7xl w-full mx-auto">
            <div className="grid lg:grid-cols-[1fr,1.5fr] gap-16 lg:gap-24 items-center">
              {/* Left - Content */}
              <div className="space-y-8 max-w-xl">
                <div className="space-y-6">
                  <h1 className="text-[clamp(3rem,7vw,5.5rem)] leading-[0.9] tracking-tight">
                    <span className="block text-black">Any model.</span>
                    <span className="block text-black">Same context.</span>
                  </h1>
                </div>

                <div className="space-y-4 text-lg text-black/60 leading-relaxed max-w-md">
                  <p>
                    ANUMA preserves your conversation as you switch between AI models. No repeating yourself. No lost context.
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
                    <button
                      onClick={() => {
                        const demoSection = document.querySelector('.border-2.border-black\\/10');
                        demoSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-sm text-black border border-black/20 px-4 py-2 hover:bg-black hover:text-white transition-colors"
                    >
                      Try it now →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right - Interactive Demo */}
              <div className="relative">
                <InteractiveDemo />
              </div>
            </div>
          </div>
        </div>

        {/* Footer hints */}
        <footer className="px-6 md:px-12 py-8">
          <div className="flex justify-between items-center text-xs text-black/50 tracking-wider">
            <div>EARLY ACCESS</div>
            <div>2025</div>
          </div>
        </footer>
      </div>

    </div>
  );
}
