"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';

// Design - ANUMA Landing Page Design (2) - Interactive demo with split layout

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

const demoFlow = {
  prompts: [
    "Explain quantum computing in simple terms",
    "How does that relate to cryptography?",
    "Which is better for this: GPT or Claude?"
  ],
  responses: {
    GPT: [
      "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This allows quantum computers to process certain calculations exponentially faster.",
      "Quantum computers could potentially break current encryption methods because they can factor large numbers much faster than classical computers. This threatens RSA encryption, which relies on the difficulty of factoring.",
      "For cryptography explanations, I'd recommend Claude - it tends to provide more structured security analysis."
    ],
    Claude: [
      "Think of quantum computing like this: regular computers use bits like light switches (on/off). Quantum computers use qubits that can be both on AND off at the same time, like a coin spinning in the air before it lands.",
      "Building on what we discussed about quantum computing: Current encryption relies on math problems that take classical computers centuries to solve. Quantum computers could solve these in hours, which is why we're developing 'quantum-resistant' encryption.",
      "I appreciate the question! While GPT and I approach things differently, for understanding security implications, I focus more on practical risks and mitigation strategies."
    ],
    Gemini: [
      "Quantum computing harnesses quantum mechanics principles - superposition and entanglement. Qubits can represent 0, 1, or both simultaneously (superposition), enabling parallel processing at an unprecedented scale.",
      "The connection is critical: Shor's algorithm, running on a quantum computer, could break RSA-2048 encryption in days versus billions of years on classical systems. Post-quantum cryptography is now a priority.",
      "Each model has strengths. GPT excels at creative explanations, Claude at detailed analysis, and I integrate multi-modal understanding with real-time data."
    ]
  }
};

function InteractiveDemo({ onComplete }: { onComplete: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModel, setCurrentModel] = useState<'GPT' | 'Claude' | 'Gemini'>('GPT');
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showModelSwitch, setShowModelSwitch] = useState(false);

  const models = ['GPT', 'Claude', 'Gemini'] as const;

  const sendMessage = (prompt: string, model: typeof currentModel) => {
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const response = demoFlow.responses[model][step];
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        model: model
      }]);

      if (step === 0) {
        setTimeout(() => setShowModelSwitch(true), 1000);
      }

      if (step < demoFlow.prompts.length - 1) {
        setTimeout(() => setStep(step + 1), 2000);
      } else {
        setTimeout(() => onComplete(), 3000);
      }
    }, 1500);
  };

  useEffect(() => {
    if (step < demoFlow.prompts.length) {
      const timer = setTimeout(() => {
        sendMessage(demoFlow.prompts[step], currentModel);
      }, step === 0 ? 1000 : 1500);

      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentModel]);

  const switchModel = (model: typeof currentModel) => {
    setCurrentModel(model);
    setShowModelSwitch(false);
  };

  return (
    <div className="relative">
      {/* Demo label */}
      <div className="mb-4 flex items-center gap-2">
        <div className="text-xs tracking-wider text-black/40">LIVE DEMO</div>
        <div className="flex-1 h-px bg-black/10" />
        <motion.div
          className="w-2 h-2 bg-black rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Chat interface */}
      <div className="bg-white border-2 border-black/10 h-[500px] flex flex-col">
        {/* Model selector bar */}
        <div className="border-b border-black/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xs tracking-wider text-black/40">CURRENT MODEL:</div>
            <div className="text-sm tracking-wide">{currentModel}</div>
          </div>

          {showModelSwitch && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-3 py-1 border border-black/20 hover:bg-black hover:text-white transition-colors"
              onClick={() => {
                const nextModel = models[(models.indexOf(currentModel) + 1) % models.length];
                switchModel(nextModel);
              }}
            >
              SWITCH MODEL
            </motion.button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.role === 'assistant' && message.model && (
                    <div className="text-[10px] tracking-wider text-black/30 mb-1">
                      {message.model}
                    </div>
                  )}
                  <div className={`inline-block p-4 ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-black/5 text-black'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-black/5 p-4 rounded">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-black/40 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-black/40 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-black/40 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Context preservation indicator */}
        {messages.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-black/10 p-3 bg-black/5"
          >
            <div className="flex items-center gap-2 text-xs text-black/60">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Context preserved across {messages.filter(m => m.role === 'assistant').length} responses</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Hint text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-4 text-xs text-black/30 text-center"
      >
        Watch as the conversation flows across different AI models
      </motion.div>
    </div>
  );
}

function WaitlistModal({ onClose }: { onClose: () => void }) {
  const { login, authenticated } = usePrivy();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-12 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/40 hover:text-black text-2xl leading-none"
        >
          ×
        </button>

        {!authenticated ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl tracking-tight mb-2">Join the waitlist</h2>
              <p className="text-black/60">Be among the first to experience ANUMA.</p>
            </div>

            <button
              onClick={login}
              className="w-full group relative px-12 py-4 bg-black text-white overflow-hidden"
            >
              <span className="relative z-10">Join now</span>
              <div className="absolute inset-0 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-black/40">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-black/40 rounded-full" />
                <span>No subscriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-black/40 rounded-full" />
                <span>Privacy first</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-black/40 rounded-full" />
                <span>Early access</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto"
            >
              <span className="text-white text-2xl">✓</span>
            </motion.div>
            <div>
              <h3 className="text-2xl tracking-tight mb-2">You&apos;re in.</h3>
              <p className="text-black/60">We&apos;ll reach out soon.</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function InteractiveSplit() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const { login, authenticated } = usePrivy();

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
          <div className="text-xs tracking-[0.3em] text-black/30">ANUMA</div>
          <button
            onClick={authenticated ? undefined : login}
            className="px-6 py-2 border border-black/20 text-xs tracking-wider hover:bg-black hover:text-white transition-colors"
          >
            {authenticated ? 'JOINED' : 'JOIN WAITLIST'}
          </button>
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
                <InteractiveDemo onComplete={() => setShowWaitlist(true)} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer hints */}
        <footer className="px-6 md:px-12 py-8">
          <div className="flex justify-between items-center text-xs text-black/20 tracking-wider">
            <div>EARLY ACCESS</div>
            <div>2025</div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}
      </AnimatePresence>
    </div>
  );
}
