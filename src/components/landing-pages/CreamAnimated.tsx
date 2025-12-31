"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Send, Loader2 } from 'lucide-react';
import { usePrivy, useIdentityToken } from '@privy-io/react-auth';

// Design Landing Page - Light cream with REAL AI Demo

const API_BASE_URL = "https://ai-portal-dev.zetachain.com";

const AI_MODELS = [
  { name: 'GPT-4', abbr: 'GPT', id: 'openai/gpt-4o', color: '#10a37f' },
  { name: 'Claude', abbr: 'CLA', id: 'anthropic/claude-3-5-sonnet-20241022', color: '#cc785c' },
  { name: 'Gemini', abbr: 'GEM', id: 'google/gemini-1.5-pro', color: '#4285f4' },
  { name: 'Llama', abbr: 'LLA', id: 'meta/llama-3.1-70b-instruct', color: '#7c3aed' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  modelIndex?: number;
  timestamp: number;
}

interface ContextItem {
  id: string;
  summary: string;
  model: string;
  timestamp: number;
}

function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf9]/80 backdrop-blur-md border-b border-[#e7e5e4]/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-[#1c1917] tracking-tight text-lg">ANUMA</div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#78716c] hover:text-[#1c1917] transition-colors">Features</a>
            <a href="#demo" className="text-sm text-[#78716c] hover:text-[#1c1917] transition-colors">Try Demo</a>
            <a href="#waitlist" className="text-sm text-[#1c1917] hover:text-[#57534e] transition-colors">Join waitlist</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Here you would send to your backend
      console.log('Waitlist signup:', email);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto" id="waitlist">
      <div className="relative">
        <div className="flex items-center gap-3 border border-[#d6d3d1] rounded-full px-6 py-4 bg-white/50 backdrop-blur-sm hover:border-[#78716c] transition-all focus-within:border-[#1c1917] focus-within:shadow-[0_0_0_3px_rgba(28,25,23,0.1)]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 bg-transparent text-[#1c1917] placeholder-[#a8a29e] outline-none"
            required
            disabled={submitted}
          />
          <button
            type="submit"
            disabled={submitted}
            className="bg-[#1c1917] text-white px-6 py-2.5 rounded-full hover:bg-[#292524] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            {submitted ? (
              <>
                <Check className="size-4" />
                <span>Joined</span>
              </>
            ) : (
              <>
                <span>Join Waitlist</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
      {submitted && (
        <p className="text-[#57534e] text-sm mt-4 text-center">Welcome! We&apos;ll be in touch soon.</p>
      )}
      <p className="text-xs text-[#a8a29e] mt-3 text-center">No spam. Early access only.</p>
    </form>
  );
}

function InteractiveDemo() {
  const { login, authenticated, ready } = usePrivy();
  const { identityToken } = useIdentityToken();

  const [messages, setMessages] = useState<Message[]>([]);
  const [context, setContext] = useState<ContextItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [demoStarted, setDemoStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start demo with AI asking first question
  const startDemo = useCallback(async () => {
    if (!identityToken) return;

    setDemoStarted(true);
    setIsLoading(true);

    const model = AI_MODELS[0];
    const systemPrompt = `You are ${model.name}, an AI assistant. Start by asking the user a simple, engaging question to get the conversation started. Keep it brief and friendly. Examples: ask about their day, what they're working on, or what brings them here. Just one question, no more than 2 sentences.`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${identityToken}`,
        },
        body: JSON.stringify({
          model: model.id,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Start the conversation.' },
          ],
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || "Hello! What brings you here today?";

      const aiMessage: Message = {
        id: `msg-${++messageIdRef.current}`,
        role: 'assistant',
        content,
        model: model.name,
        modelIndex: 0,
        timestamp: Date.now(),
      };

      setMessages([aiMessage]);
      setContext([{
        id: `ctx-${Date.now()}`,
        summary: `${model.name} started the conversation`,
        model: model.name,
        timestamp: Date.now(),
      }]);
    } catch (error) {
      console.error('[Demo] Error starting:', error);
      // Fallback greeting
      const aiMessage: Message = {
        id: `msg-${++messageIdRef.current}`,
        role: 'assistant',
        content: "Hello! What brings you here today? I'd love to chat with you.",
        model: model.name,
        modelIndex: 0,
        timestamp: Date.now(),
      };
      setMessages([aiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [identityToken]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    setInput('');

    // Add user message
    const userMessage: Message = {
      id: `msg-${++messageIdRef.current}`,
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Switch to next model for response
    const nextModelIndex = (activeModelIndex + 1) % AI_MODELS.length;
    setActiveModelIndex(nextModelIndex);
    const model = AI_MODELS[nextModelIndex];

    setIsLoading(true);

    // Build context summary for the new model
    const contextSummary = context.map(c => `[${c.model}]: ${c.summary}`).join('\n');

    const systemPrompt = `You are ${model.name}, taking over a conversation from another AI model.

CONTEXT FROM PREVIOUS MODELS:
${contextSummary}

Your role:
- Acknowledge you're a different model (briefly, naturally)
- Continue the conversation seamlessly using the shared context
- Ask a follow-up question or provide a thoughtful response
- Keep responses concise (2-3 sentences max)
- Be friendly and helpful

Remember: The user is testing how well AI models can share context with ANUMA.`;

    // Build messages for API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: userContent },
    ];

    try {
      if (!identityToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${identityToken}`,
        },
        body: JSON.stringify({
          model: model.id,
          messages: apiMessages,
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || "I'm having trouble responding right now.";

      const aiMessage: Message = {
        id: `msg-${++messageIdRef.current}`,
        role: 'assistant',
        content,
        model: model.name,
        modelIndex: nextModelIndex,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Add to context
      const contextEntry: ContextItem = {
        id: `ctx-${Date.now()}`,
        summary: `User: "${userContent.substring(0, 50)}${userContent.length > 50 ? '...' : ''}"`,
        model: model.name,
        timestamp: Date.now(),
      };
      setContext(prev => [...prev, contextEntry]);

    } catch (error) {
      console.error('[Demo] Error:', error);
      // Fallback response
      const fallbackResponses = [
        `Hey, this is ${model.name} picking up the conversation! I can see what we were discussing. How can I help you further?`,
        `${model.name} here! I've got all the context from before. Let me help you with that.`,
        `Switching to ${model.name}! I can see our chat history. What would you like to explore next?`,
      ];
      const fallback = fallbackResponses[nextModelIndex % fallbackResponses.length];

      const aiMessage: Message = {
        id: `msg-${++messageIdRef.current}`,
        role: 'assistant',
        content: fallback,
        model: model.name,
        modelIndex: nextModelIndex,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, identityToken, messages, activeModelIndex, context]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Not authenticated view
  if (!authenticated || !ready) {
    return (
      <div className="bg-white/40 backdrop-blur-sm border border-[#e7e5e4] rounded-3xl p-8 md:p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-xl text-[#1c1917] mb-3">Try the Live Demo</h3>
          <p className="text-[#78716c] text-sm mb-6">
            Connect your wallet to chat with multiple AI models and see how ANUMA preserves context across them.
          </p>
          <button
            onClick={login}
            className="bg-[#1c1917] text-white px-8 py-3 rounded-full hover:bg-[#292524] transition-all text-sm inline-flex items-center gap-2"
          >
            Connect Wallet
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  // Demo not started
  if (!demoStarted) {
    return (
      <div className="bg-white/40 backdrop-blur-sm border border-[#e7e5e4] rounded-3xl p-8 md:p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl text-[#1c1917] mb-3">Ready to Chat?</h3>
          <p className="text-[#78716c] text-sm mb-6">
            Start a conversation that seamlessly moves between GPT-4, Claude, Gemini, and Llama while preserving full context.
          </p>
          <button
            onClick={startDemo}
            className="bg-[#1c1917] text-white px-8 py-3 rounded-full hover:bg-[#292524] transition-all text-sm inline-flex items-center gap-2"
          >
            Start Conversation
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-sm border border-[#e7e5e4] rounded-3xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
        {/* Chat area */}
        <div className="flex flex-col h-[500px] border-r border-[#e7e5e4]">
          {/* Model indicator */}
          <div className="flex items-center gap-3 p-4 border-b border-[#e7e5e4] bg-white/60">
            <div className="flex items-center gap-2">
              {AI_MODELS.map((model, i) => (
                <div
                  key={model.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-medium transition-all ${
                    i === activeModelIndex
                      ? 'bg-[#1c1917] text-white scale-110'
                      : 'bg-[#f5f5f4] text-[#a8a29e]'
                  }`}
                >
                  {model.abbr}
                </div>
              ))}
            </div>
            <div className="text-sm text-[#78716c]">
              Currently: <span className="text-[#1c1917] font-medium">{AI_MODELS[activeModelIndex].name}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    {msg.role === 'assistant' && msg.model && (
                      <div className="text-[10px] text-[#a8a29e] mb-1 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: AI_MODELS[msg.modelIndex || 0].color }}
                        />
                        {msg.model}
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-[#1c1917] text-white'
                        : 'bg-white border border-[#e7e5e4] text-[#1c1917]'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-[#e7e5e4] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-[#78716c]" />
                    <span className="text-sm text-[#78716c]">{AI_MODELS[activeModelIndex].name} is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#e7e5e4] bg-white/60">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-white border border-[#e7e5e4] rounded-full px-4 py-2.5 text-sm text-[#1c1917] placeholder-[#a8a29e] outline-none focus:border-[#1c1917] transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-[#1c1917] text-white rounded-full flex items-center justify-center hover:bg-[#292524] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="size-4" />
              </button>
            </div>
            <p className="text-[10px] text-[#a8a29e] mt-2 text-center">
              Each response automatically switches to a different AI model
            </p>
          </div>
        </div>

        {/* Context panel */}
        <div className="p-4 bg-[#fafaf9]/50 hidden lg:block">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#78716c]">Shared Context</p>
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {context.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg p-3 border border-[#e7e5e4] relative overflow-hidden"
                >
                  {/* Flicker effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3 + (i * 0.5),
                      ease: 'easeInOut'
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] text-[#78716c] uppercase tracking-wider">{item.model}</span>
                    </div>
                    <p className="text-[11px] text-[#44403c] leading-relaxed">{item.summary}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {context.length === 0 && (
              <p className="text-[11px] text-[#a8a29e] text-center py-8">
                Context will appear here as you chat
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-[#e7e5e4] mt-4">
            <p className="text-[9px] text-[#a8a29e] uppercase tracking-wider flex items-center gap-1.5">
              <span>🔒</span>
              <span>Stored in Browser</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreamAnimated() {
  return (
    <div className="min-h-screen bg-[#fafaf9] relative overflow-hidden">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>

      <Navigation />

      <div className="relative z-10">
        {/* Hero section */}
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Small label */}
            <div className="mb-6">
              <span className="text-[#78716c] tracking-[0.3em] text-[10px] uppercase">Coming Soon</span>
            </div>

            {/* Main headline */}
            <h1 className="text-[4.5rem] md:text-[8rem] lg:text-[11rem] text-[#1c1917] tracking-[-0.05em] leading-[0.9] mb-8">
              ANUMA
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-[#44403c] max-w-2xl mx-auto leading-[1.6] mb-3">
              Stop paying for multiple AI subscriptions.
            </p>

            <p className="text-base md:text-lg text-[#78716c] max-w-xl mx-auto leading-relaxed mb-12">
              One interface to access every AI model. Your conversations stay with you, stored locally in your browser.
            </p>

            {/* Feature hints */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">↔</div>
                <p className="text-sm text-[#57534e] uppercase tracking-wider">Switch Models</p>
                <p className="text-xs text-[#a8a29e] mt-1">Instantly</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⊙</div>
                <p className="text-sm text-[#57534e] uppercase tracking-wider">Keep Context</p>
                <p className="text-xs text-[#a8a29e] mt-1">Never repeat yourself</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⌗</div>
                <p className="text-sm text-[#57534e] uppercase tracking-wider">Your Data</p>
                <p className="text-xs text-[#a8a29e] mt-1">Stored locally</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo section */}
        <div className="border-t border-[#e7e5e4]" id="demo">
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-[#78716c] mb-4">Live Demo</p>
              <h2 className="text-3xl md:text-4xl text-[#1c1917] tracking-tight">Chat across AI models</h2>
              <p className="text-[#78716c] mt-3 max-w-lg mx-auto">
                Start a conversation and watch as context seamlessly transfers between GPT-4, Claude, Gemini, and Llama.
              </p>
            </div>
            <InteractiveDemo />
          </div>
        </div>

        {/* Waitlist section */}
        <div className="border-t border-[#e7e5e4]">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-[#78716c] mb-4">Get Early Access</p>
              <h2 className="text-3xl md:text-4xl text-[#1c1917] tracking-tight mb-4">Join the Waitlist</h2>
              <p className="text-[#78716c] max-w-md mx-auto">
                Be among the first to access ANUMA when we launch. No spam, just updates.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e7e5e4]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-[#a8a29e]">© 2025 ANUMA. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-xs text-[#78716c] hover:text-[#1c1917] transition-colors uppercase tracking-wider">Privacy</a>
                <a href="#" className="text-xs text-[#78716c] hover:text-[#1c1917] transition-colors uppercase tracking-wider">Terms</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
