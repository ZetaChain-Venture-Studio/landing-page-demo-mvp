"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

// Landing Page Design (1) - Minimal mono grid

function ModelSwitcher() {
  const [activeModel, setActiveModel] = useState('GPT-4');
  const models = ['GPT-4', 'Claude', 'Gemini', 'Llama'];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {models.map((model) => (
          <button
            key={model}
            onClick={() => setActiveModel(model)}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              activeModel === model
                ? 'bg-black text-white border-black'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {model}
          </button>
        ))}
      </div>
      <div className="p-4 border border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 mb-2">Active: {activeModel}</p>
        <p className="text-sm text-gray-700">
          Switch models mid-conversation. Your context follows.
        </p>
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
        disabled={submitted}
      />
      <button
        type="submit"
        className="w-full px-4 py-3 bg-black text-white text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
        disabled={submitted}
      >
        {submitted ? 'JOINED' : 'JOIN WAITLIST'}
      </button>
      {submitted && (
        <p className="text-xs text-gray-500 text-center">You&apos;re on the list!</p>
      )}
    </form>
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
