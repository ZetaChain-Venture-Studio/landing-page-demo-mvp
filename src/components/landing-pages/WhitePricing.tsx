"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

// Design Landing Page (2) - White centered with $25 pricing

function ModelSwitcher() {
  const [activeModel, setActiveModel] = useState('GPT-4');
  const models = ['GPT-4', 'Claude', 'Gemini', 'Llama'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {models.map((model) => (
          <button
            key={model}
            onClick={() => setActiveModel(model)}
            className={`px-5 py-2.5 text-sm border-2 transition-all ${
              activeModel === model
                ? 'bg-black text-white border-black'
                : 'border-black/10 text-black/40 hover:border-black/30'
            }`}
          >
            {model}
          </button>
        ))}
      </div>
      <div className="text-center text-sm text-black/40">
        Click to switch models. Context transfers instantly.
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-5 py-3 border-2 border-black/10 text-black placeholder:text-black/30 focus:outline-none focus:border-black/40 transition-colors text-center sm:text-left"
        disabled={submitted}
      />
      <button
        type="submit"
        className="px-8 py-3 bg-black text-white hover:bg-black/80 transition-colors disabled:opacity-50"
        disabled={submitted}
      >
        {submitted ? 'Done!' : 'Join'}
      </button>
    </form>
  );
}

export default function WhitePricing() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-32"
        >
          <div className="inline-block px-3 py-1 border border-black/20 text-xs mb-8 tracking-widest">
            ANUMA
          </div>

          <h1 className="text-5xl md:text-7xl mb-8 tracking-tight leading-[1.1]">
            One conversation
            <br />
            across every AI model
          </h1>

          <p className="text-xl text-black/40 mb-16 max-w-2xl mx-auto leading-relaxed">
            Switch between GPT-4, Claude, Gemini, and Llama mid-conversation. Your context and memories follow you. Stored locally, always private.
          </p>

          <WaitlistForm />
        </motion.div>

        {/* Model switcher demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <ModelSwitcher />
        </motion.div>

        {/* Value props */}
        <div className="mt-40 space-y-32">
          {/* Unified context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="text-5xl mb-6">∞</div>
            <h2 className="text-3xl mb-4 tracking-tight">Unified context</h2>
            <p className="text-lg text-black/40 leading-relaxed">
              Start a conversation with Claude, continue with GPT-4, finish with Gemini. Your full history and context transfers instantly between models.
            </p>
          </motion.div>

          {/* Local memories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="text-5xl mb-6">⊙</div>
            <h2 className="text-3xl mb-4 tracking-tight">Private by design</h2>
            <p className="text-lg text-black/40 leading-relaxed">
              All your conversations and memories are stored in your browser. Never uploaded, never synced. Complete control over your data.
            </p>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center pt-12 border-t border-black/10"
          >
            <div className="text-7xl mb-4">$25</div>
            <p className="text-lg text-black/40 leading-relaxed">
              One subscription. Every major AI model included.
              <br />
              (No more paying for ChatGPT Plus + Claude Pro + Gemini Advanced)
            </p>
          </motion.div>
        </div>

        {/* Footer CTA */}
        <div className="mt-40 pt-20 border-t border-black/10 text-center">
          <p className="text-xl mb-8 text-black/60">Ready for early access?</p>
          <WaitlistForm />
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 text-center text-sm text-black/20">© 2025 ANUMA</div>
      </div>
    </div>
  );
}
