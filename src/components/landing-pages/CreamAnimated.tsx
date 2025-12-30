"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

// Design Landing Page - Light cream with AnimatedDemo

const AI_MODELS = [
  { name: 'GPT-4', abbr: 'GPT' },
  { name: 'Claude', abbr: 'CLA' },
  { name: 'Gemini', abbr: 'GEM' },
  { name: 'Llama', abbr: 'LLA' },
];

function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf9]/80 backdrop-blur-md border-b border-[#e7e5e4]/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-[#1c1917] tracking-tight text-lg">ANUMA</div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#78716c] hover:text-[#1c1917] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-[#78716c] hover:text-[#1c1917] transition-colors">How it works</a>
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
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
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

function AnimatedDemo() {
  const [activeModel, setActiveModel] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModel((prev) => (prev + 1) % AI_MODELS.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Clean, structured visualization */}
      <div className="bg-white/40 backdrop-blur-sm border border-[#e7e5e4] rounded-3xl p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-8 md:gap-12 items-center">
          {/* Model selector */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#78716c] mb-4">Select Model</p>
            {AI_MODELS.map((model, index) => (
              <motion.div
                key={model.name}
                animate={{
                  opacity: activeModel === index ? 1 : 0.3,
                }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="flex items-center gap-3 py-2">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] tracking-wider transition-all ${
                    activeModel === index
                      ? 'border-[#1c1917] text-[#1c1917] bg-white'
                      : 'border-[#e7e5e4] text-[#a8a29e]'
                  }`}>
                    {model.abbr}
                  </div>
                  <div>
                    <span className={`text-sm transition-colors block ${
                      activeModel === index ? 'text-[#1c1917]' : 'text-[#a8a29e]'
                    }`}>
                      {model.name}
                    </span>
                    {activeModel === index && (
                      <motion.div
                        className="h-0.5 bg-[#1c1917] rounded-full mt-1"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3.5, ease: 'linear' }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center visualization */}
          <div className="relative py-8">
            <div className="relative flex items-center justify-center">
              {/* Connection flow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-[#e7e5e4] relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 right-0 bg-[#1c1917]"
                    initial={{ scaleX: 0, transformOrigin: 'left' }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    key={`line-${activeModel}`}
                  />
                </div>
              </div>

              {/* Central circle */}
              <div className="relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-[#1c1917] bg-white flex items-center justify-center shadow-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModel}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl mb-1 tracking-wide">{AI_MODELS[activeModel].abbr}</div>
                    <div className="text-[#78716c] text-[9px] uppercase tracking-[0.2em]">Processing</div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Context storage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#78716c]">Context Saved</p>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {AI_MODELS.map((model, index) => {
                  const isPast = index <= activeModel;
                  return (
                    <motion.div
                      key={model.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{
                        opacity: isPast ? 1 : 0.2,
                        x: 0
                      }}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-6 h-6 rounded border flex items-center justify-center text-[8px] ${
                        isPast ? 'border-[#1c1917] bg-[#1c1917] text-white' : 'border-[#e7e5e4] text-[#d6d3d1]'
                      }`}>
                        {model.abbr[0]}
                      </div>
                      <div className="flex-1 h-1 bg-[#f5f5f4] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#1c1917]"
                          initial={{ width: '0%' }}
                          animate={{ width: isPast ? '100%' : '0%' }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="pt-3 border-t border-[#e7e5e4] mt-4">
              <p className="text-[9px] text-[#a8a29e] uppercase tracking-wider flex items-center gap-1.5">
                <span>🔒</span>
                <span>Browser Storage</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom explanation */}
      <div className="text-center mt-8">
        <p className="text-sm text-[#78716c] leading-relaxed max-w-2xl mx-auto">
          Your conversation history flows seamlessly between AI models, stored securely in your browser. No servers. No data collection.
        </p>
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
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32">
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

            <p className="text-base md:text-lg text-[#78716c] max-w-xl mx-auto leading-relaxed mb-16">
              One interface to access every AI model. Your conversations stay with you, stored locally in your browser.
            </p>

            {/* Waitlist form */}
            <div className="mb-20">
              <WaitlistForm />
            </div>

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

        {/* Demo section */}
        <div className="border-t border-[#e7e5e4]">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-[#78716c] mb-4">How It Works</p>
              <h2 className="text-3xl md:text-4xl text-[#1c1917] tracking-tight">Seamless model switching</h2>
            </div>
            <AnimatedDemo />
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
