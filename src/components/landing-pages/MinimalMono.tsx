"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Landing Page Design (1) - Minimal mono grid with animated model switcher

const exchanges = [
  {
    model: 'GPT-4',
    response: 'For your fintech SaaS, I\'d prioritize the real-time transaction API. Your B2B customers need reliability above all...',
  },
  {
    model: 'Claude',
    response: 'Given your runway and team size, focus on the webhook system first. It unblocks your enterprise clients waiting since Q3...',
  },
  {
    model: 'Gemini',
    response: 'Looking at your tech stack (React/Node/PostgreSQL), the API v2 migration should come first for scalability...',
  },
  {
    model: 'Llama',
    response: 'Based on your MRR growth pattern, prioritize features that reduce churn - so the notification system for your dashboard...',
  },
  {
    model: 'Mistral',
    response: 'Considering your competitor just launched similar features, differentiate with the AI-powered analytics you outlined...',
  },
];

function ModelSwitcher() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % exchanges.length);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative border border-gray-300 p-6 space-y-4">
        {/* ANUMA label on border */}
        <div className="absolute -top-3 left-6 bg-white px-2">
          <p className="text-xs tracking-wider text-gray-500 font-medium">POST /anuma</p>
        </div>

        {/* Stored context - visible */}
        <div className="bg-gray-100 border border-gray-300 p-3 space-y-2">
          <p className="text-xs text-gray-600 tracking-wider font-bold">PROJECT: FINTECH-SAAS-Q4</p>
          <div className="text-xs text-gray-700 space-y-0.5 font-medium">
            <p>• Product: B2B payment analytics platform</p>
            <p>• Tech stack: React, Node.js, PostgreSQL, Stripe API</p>
            <p>• Team: 4 engineers, 8 months runway, $50k MRR</p>
          </div>
        </div>

        {/* User prompt */}
        <div>
          <p className="text-xs text-gray-600 tracking-wider mb-2 font-bold">YOU</p>
          <p className="text-sm text-gray-800 font-semibold">
            &quot;Which feature should we build next?&quot;
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-300"></div>

        {/* Model response - changes */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative h-6 flex items-center min-w-[80px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="absolute text-xs tracking-wider text-black font-bold"
                >
                  {exchanges[currentIndex].model}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative min-h-[50px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute text-sm text-gray-900 font-medium leading-relaxed"
              >
                {exchanges[currentIndex].response}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {exchanges.map((_, index) => (
          <div
            key={index}
            className={`h-1 transition-all duration-500 rounded ${
              index === currentIndex ? 'w-10 bg-black' : 'w-6 bg-gray-400'
            }`}
          />
        ))}
      </div>

      <p className="text-center text-xs text-gray-600 tracking-wider font-medium">
        ALL MODELS USE YOUR CONTEXT. SWITCH FREELY.
      </p>
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
      <div className="text-center py-4">
        <p className="text-sm text-gray-700 font-medium">You&apos;re on the list!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-3 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:border-black text-sm"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-800 transition-colors font-medium"
        >
          JOIN WAITLIST
        </button>
      </div>
    </form>
  );
}

export default function MinimalMono() {
  return (
    <div className="relative min-h-screen bg-white text-black font-mono overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />

      <div className="relative min-h-screen flex flex-col justify-center px-6 py-12 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl tracking-tight font-bold">ANUMA</h1>
            <p className="text-gray-600 text-sm tracking-wider font-medium">
              ONE INTERFACE. EVERY MODEL.
            </p>
          </div>

          {/* What it's for */}
          <div className="space-y-8">
            <p className="text-sm text-gray-700 font-medium">
              Switch between AI models mid-conversation without losing context. All your project memory stays with you.
            </p>
            <ModelSwitcher />
          </div>

          {/* Waitlist */}
          <div>
            <WaitlistForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
