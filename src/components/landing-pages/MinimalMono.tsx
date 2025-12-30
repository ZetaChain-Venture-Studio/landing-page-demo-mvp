"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';

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
    <div className="space-y-12">
      <div className="relative border border-gray-200 p-8 space-y-6">
        {/* ANUMA label on border */}
        <div className="absolute -top-3 left-8 bg-white px-3">
          <p className="text-xs tracking-wider text-gray-400">POST /anuma</p>
        </div>

        {/* Stored context - visible */}
        <div className="bg-gray-50 border border-gray-200 p-4 space-y-2">
          <p className="text-xs text-gray-400 tracking-wider">PROJECT: FINTECH-SAAS-Q4</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Product: B2B payment analytics platform</p>
            <p>• Tech stack: React, Node.js, PostgreSQL, Stripe API</p>
            <p>• Team: 4 engineers, 8 months runway, $50k MRR</p>
            <p>• Context: Roadmap prioritization discussion</p>
          </div>
        </div>

        {/* User prompt */}
        <div>
          <p className="text-xs text-gray-400 tracking-wider mb-3">YOU</p>
          <p className="text-sm text-gray-500">
            &quot;Which feature should we build next?&quot;
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200"></div>

        {/* Model response - changes */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-6 flex items-center min-w-[80px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="absolute text-xs tracking-wider text-black"
                >
                  {exchanges[currentIndex].model}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative min-h-[60px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute text-sm"
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
            className={`h-px transition-all duration-500 ${
              index === currentIndex ? 'w-12 bg-black' : 'w-8 bg-gray-300'
            }`}
          />
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 tracking-wider">
        ALL MODELS USE YOUR CONTEXT. SWITCH FREELY.
      </p>
    </div>
  );
}

function WaitlistForm() {
  const { login, authenticated } = usePrivy();

  return (
    <div className="space-y-3">
      <button
        onClick={login}
        className="w-full px-4 py-3 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
      >
        {authenticated ? 'JOINED' : 'JOIN WAITLIST'}
      </button>
      {authenticated && (
        <p className="text-xs text-gray-500 text-center">You&apos;re on the list!</p>
      )}
    </div>
  );
}

export default function MinimalMono() {
  return (
    <div className="relative min-h-screen bg-white text-black font-mono overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />

      <div className="relative min-h-screen flex flex-col justify-center px-6 py-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-40"
        >
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-7xl md:text-9xl tracking-tight">ANUMA</h1>
            <p className="text-gray-400 text-xs tracking-wider">
              ONE INTERFACE. EVERY MODEL.
            </p>
          </div>

          {/* What it's for */}
          <div className="space-y-16">
            <p className="text-sm text-gray-500">
              Switch between AI models mid-conversation without losing context. All your project memory stays with you.
            </p>
            <ModelSwitcher />
          </div>

          {/* Waitlist */}
          <div className="space-y-8">
            <WaitlistForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
