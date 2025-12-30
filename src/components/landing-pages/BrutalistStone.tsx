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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com"
        className="flex-1 px-6 py-4 bg-white border border-black text-black placeholder:text-neutral-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
        disabled={submitted}
      />
      <button
        type="submit"
        className="px-8 py-4 bg-black text-white font-mono text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 uppercase tracking-wider"
        disabled={submitted}
      >
        {submitted ? 'Added!' : 'Join Waitlist'}
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
        <header className="px-8 py-8 border-b border-black/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 bg-black" />
              <span className="font-mono tracking-tighter text-xs uppercase">Anuma</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-8 py-20 md:py-32">
          <div className="max-w-7xl mx-auto space-y-32 md:space-y-48">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-16 md:space-y-24"
            >
              <div className="space-y-12">
                <div className="space-y-6">
                  <h1
                    className="text-black leading-[0.85] tracking-tighter"
                    style={{ fontSize: 'clamp(4rem, 15vw, 11rem)' }}
                  >
                    One
                    <br />
                    interface.
                    <br />
                    Every AI.
                  </h1>
                </div>

                <p className="text-neutral-600 text-xl md:text-2xl max-w-xl leading-relaxed font-light">
                  Switch between models. Keep context. Your data stays local.
                </p>
              </div>

              <WaitlistForm />
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="md:col-span-5 border border-black bg-white p-10 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,0.12)] transition-all duration-300 md:translate-y-12"
              >
                <div className="h-full flex flex-col justify-between min-h-[280px]">
                  <div>
                    <h3 className="text-2xl mb-4 tracking-tight">Multi-Model</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      GPT, Claude, Gemini—use them all without losing your thread.
                    </p>
                  </div>
                  <div className="w-12 h-12 border border-black mt-8" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="md:col-span-7 border border-black bg-white p-10 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,0.12)] transition-all duration-300"
              >
                <div className="h-full flex flex-col justify-between min-h-[280px]">
                  <div>
                    <h3 className="text-2xl mb-4 tracking-tight">Local First</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Your conversations stored in your browser. Not our servers. Not theirs. Export anytime.
                    </p>
                  </div>
                  <div className="w-12 h-12 border border-black mt-8" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="md:col-span-12 border border-black bg-black text-white p-10 md:p-16 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,0.12)] transition-all duration-300"
              >
                <div className="max-w-4xl">
                  <h3 className="text-2xl mb-4 tracking-tight">Save Money</h3>
                  <p className="text-neutral-300 leading-relaxed text-lg">
                    Stop paying for multiple subscriptions. Connect your own API keys. Use what you need, when you need it.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="border border-black bg-white p-10 md:p-20 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.06)]"
            >
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-5xl mb-16 tracking-tight">How it works</h2>

                <div className="space-y-10 font-mono text-sm md:text-base">
                  <div className="flex gap-8 items-start group">
                    <span className="text-neutral-300 text-lg shrink-0">01</span>
                    <p className="text-neutral-700 leading-relaxed group-hover:translate-x-2 transition-transform">
                      Connect your own API keys or subscriptions
                    </p>
                  </div>
                  <div className="flex gap-8 items-start group">
                    <span className="text-neutral-300 text-lg shrink-0">02</span>
                    <p className="text-neutral-700 leading-relaxed group-hover:translate-x-2 transition-transform">
                      Chat with any model through one interface
                    </p>
                  </div>
                  <div className="flex gap-8 items-start group">
                    <span className="text-neutral-300 text-lg shrink-0">03</span>
                    <p className="text-neutral-700 leading-relaxed group-hover:translate-x-2 transition-transform">
                      Switch models mid-conversation—context travels with you
                    </p>
                  </div>
                  <div className="flex gap-8 items-start group">
                    <span className="text-neutral-300 text-lg shrink-0">04</span>
                    <p className="text-neutral-700 leading-relaxed group-hover:translate-x-2 transition-transform">
                      Everything stored locally. Export anytime
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-12 border-t border-black/20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <p className="text-xs text-neutral-400 font-mono uppercase tracking-wide">© 2025 Anuma</p>
            <div className="flex gap-8 text-xs font-mono text-neutral-500 uppercase tracking-wide">
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
