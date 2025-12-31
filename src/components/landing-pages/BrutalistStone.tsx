"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

// Landing Page Design - Brutalist stone boxes

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

              {/* Right - Mini Demo */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="border border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.08)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <span className="font-mono text-xs text-neutral-500">LIVE DEMO</span>
                    <div className="flex gap-2">
                      {['GPT', 'Claude', 'Gemini'].map((model) => (
                        <span key={model} className="px-2 py-1 text-[10px] font-mono bg-neutral-100 border border-black/10">
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 min-h-[180px]">
                    <div className="flex gap-3">
                      <div className="text-neutral-600 text-xs shrink-0 font-mono font-bold">YOU</div>
                      <div className="text-sm text-black font-medium">Help me plan my project roadmap</div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-neutral-600 text-xs shrink-0 font-mono font-bold">GPT</div>
                      <div className="text-sm text-neutral-800">I&apos;d recommend starting with milestones...</div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-neutral-600 text-xs shrink-0 font-mono font-bold">Claude</div>
                      <div className="text-sm text-neutral-800">Building on that roadmap, let me add...</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-neutral-700 font-mono pt-2 border-t border-black/10">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                    Context preserved across models
                  </div>
                </div>
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
