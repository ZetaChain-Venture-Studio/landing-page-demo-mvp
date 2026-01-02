"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';

// Landing Page Design - Brutalist stone boxes

const MODELS = [
  { id: 'gpt-4', label: 'GPT-4', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
  { id: 'claude', label: 'Claude', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
  { id: 'gemini', label: 'Gemini', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
];

const MODEL_API_IDS: Record<string, string> = {
  'gpt-4': 'openai/gpt-4o',
  'claude': 'anthropic/claude-3-5-sonnet-20241022',
  'gemini': 'google/gemini-1.5-pro',
};

const SHARED_CONTEXT = "Building a mobile fitness app for busy professionals. Budget: $30k. Launch: Q2 2025.";
const DEMO_QUESTION = "What tech stack would you recommend?";

interface DemoResponse {
  model: string;
  content: string;
}

function AutoDemo() {
  const [phase, setPhase] = useState<'context' | 'question' | 'responses' | 'cycling'>('context');
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [responses, setResponses] = useState<DemoResponse[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typedContent, setTypedContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const getModel = (id: string) => MODELS.find(m => m.id === id) || MODELS[0];

  const fetchResponse = useCallback(async (modelId: string): Promise<string> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('https://ai-portal-dev.zetachain.com/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL_API_IDS[modelId],
          messages: [
            { role: 'system', content: `You are a helpful assistant. Context: ${SHARED_CONTEXT}. Keep responses to 1-2 sentences max.` },
            { role: 'user', content: DEMO_QUESTION }
          ],
          max_tokens: 100,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response';
    } catch {
      return "I'd recommend React Native with Firebase for quick development within your timeline and budget.";
    }
  }, []);

  // Type out content character by character
  const typeContent = useCallback((content: string, onComplete: () => void) => {
    setTypedContent('');
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setTypedContent(content.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        onComplete();
      }
    }, 25);
    return () => clearInterval(interval);
  }, []);

  // Demo flow
  useEffect(() => {
    const runDemo = async () => {
      // Phase 1: Show context
      await new Promise(r => setTimeout(r, 2000));
      setPhase('question');

      // Phase 2: Show question
      await new Promise(r => setTimeout(r, 2000));
      setPhase('responses');

      // Phase 3: Get and show responses from each model
      for (let i = 0; i < MODELS.length; i++) {
        setCurrentModelIndex(i);
        const response = await fetchResponse(MODELS[i].id);

        await new Promise<void>((resolve) => {
          typeContent(response, () => {
            setResponses(prev => [...prev, { model: MODELS[i].id, content: response }]);
            resolve();
          });
        });

        if (i < MODELS.length - 1) {
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      // Phase 4: Cycle through responses
      await new Promise(r => setTimeout(r, 2000));
      setPhase('cycling');
    };

    runDemo();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchResponse, typeContent]);

  // Cycle through models when in cycling phase
  useEffect(() => {
    if (phase !== 'cycling') return;
    const interval = setInterval(() => {
      setCurrentModelIndex(prev => (prev + 1) % MODELS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="space-y-4">
      {/* Shared Context Panel */}
      <div className="border-2 border-black/20 bg-stone-50 p-4">
        <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-2">
          SHARED CONTEXT
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-black font-medium"
        >
          {SHARED_CONTEXT}
        </motion.div>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-green-700 font-mono">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
          Context active for all models
        </div>
      </div>

      {/* Question */}
      <AnimatePresence>
        {(phase === 'question' || phase === 'responses' || phase === 'cycling') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="text-xs shrink-0 font-mono font-bold text-neutral-600">YOU</div>
            <div className="text-sm text-black font-medium">{DEMO_QUESTION}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Area */}
      <div className="min-h-[100px] space-y-3">
        {phase === 'responses' && (
          <motion.div
            key={currentModelIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className={`text-xs shrink-0 font-mono font-bold ${getModel(MODELS[currentModelIndex].id).color}`}>
              {getModel(MODELS[currentModelIndex].id).label}
            </div>
            <div className="text-sm text-neutral-800">
              {typedContent}
              {isTyping && <span className="inline-block w-1.5 h-3 bg-black/50 ml-0.5 animate-pulse" />}
            </div>
          </motion.div>
        )}

        {phase === 'cycling' && responses.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentModelIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-4 ${getModel(MODELS[currentModelIndex].id).bgColor} border ${getModel(MODELS[currentModelIndex].id).borderColor}`}
            >
              <div className={`text-xs font-mono font-bold mb-2 ${getModel(MODELS[currentModelIndex].id).color}`}>
                {getModel(MODELS[currentModelIndex].id).label}
              </div>
              <div className="text-sm text-neutral-800">
                {responses.find(r => r.model === MODELS[currentModelIndex].id)?.content}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {phase === 'context' && (
          <div className="text-center py-4 text-neutral-400 text-xs font-mono">
            Loading demo...
          </div>
        )}
      </div>

      {/* Model indicator */}
      <div className="flex items-center justify-between border-t border-black/10 pt-4">
        <div className="flex gap-2">
          {MODELS.map((model, idx) => (
            <div
              key={model.id}
              className={`px-2 py-1 text-[10px] font-mono border transition-all ${
                currentModelIndex === idx && (phase === 'responses' || phase === 'cycling')
                  ? `${model.bgColor} ${model.borderColor} ${model.color}`
                  : 'bg-neutral-100 border-black/10 text-neutral-400'
              }`}
            >
              {model.label}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-neutral-500 font-mono">
          Same context · Different perspectives
        </div>
      </div>
    </div>
  );
}

function WaitlistButton() {
  const { login, authenticated } = usePrivy();

  return (
    <button
      onClick={login}
      className="px-8 py-4 bg-black text-white font-mono text-sm hover:bg-neutral-800 transition-colors uppercase tracking-wider whitespace-nowrap"
    >
      {authenticated ? 'Joined' : 'Join Waitlist'}
    </button>
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
                  style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}
                >
                  Every model,
                  <br />
                  shared
                  <br />
                  context.
                </h1>

                <p className="text-neutral-800 text-xl max-w-md leading-relaxed">
                  Switch between any base model. Keep context across them, buy only 1 subscription.
                </p>

                <div id="waitlist">
                  <WaitlistButton />
                </div>
              </motion.div>

              {/* Right - Interactive Mini Demo */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="border border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.08)]"
              >
                <AutoDemo />
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
