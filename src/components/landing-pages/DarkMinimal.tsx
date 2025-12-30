"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

// Design Landing Page (1) - Dark minimal

function ModelSwitcher() {
  const [activeModel, setActiveModel] = useState('GPT-4');
  const models = ['GPT-4', 'Claude', 'Gemini', 'Llama'];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        {models.map((model) => (
          <button
            key={model}
            onClick={() => setActiveModel(model)}
            className={`px-4 py-2 text-sm border transition-colors ${
              activeModel === model
                ? 'bg-white text-black border-white'
                : 'border-[#333] text-[#888] hover:border-[#555] hover:text-white'
            }`}
          >
            {model}
          </button>
        ))}
      </div>
      <div className="p-6 border border-[#222] bg-[#111]">
        <p className="text-xs text-[#666] mb-3">CURRENTLY USING</p>
        <p className="text-xl text-white mb-2">{activeModel}</p>
        <p className="text-sm text-[#808080]">
          Your conversation context persists when you switch models.
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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 px-4 py-3 bg-transparent border border-[#333] text-white placeholder:text-[#666] focus:outline-none focus:border-[#555] transition-colors"
        disabled={submitted}
      />
      <button
        type="submit"
        className="px-6 py-3 bg-white text-black hover:bg-[#eee] transition-colors disabled:opacity-50"
        disabled={submitted}
      >
        {submitted ? 'JOINED!' : 'Join Waitlist'}
      </button>
    </form>
  );
}

export default function DarkMinimal() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="border-b border-[#222222]">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <span className="text-sm">ANUMA</span>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl mb-8 leading-[1.1]">
            Stop paying for multiple AI subscriptions
          </h1>

          <p className="text-xl text-[#b3b3b3] mb-12 leading-relaxed max-w-2xl">
            ANUMA gives you access to GPT-4, Claude, Gemini, and Llama in one place. Switch between models instantly while keeping your conversation context. Everything stored locally in your browser.
          </p>

          <WaitlistForm />
        </motion.div>

        {/* Model Switcher Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 mb-16"
        >
          <ModelSwitcher />
        </motion.div>

        {/* Simple feature list */}
        <div className="border-t border-[#222222] pt-16 mt-32">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-lg mb-3">Switch freely</h3>
              <p className="text-[#808080] text-sm leading-relaxed">
                Change AI models mid-conversation without losing context or having to explain yourself again.
              </p>
            </div>
            <div>
              <h3 className="text-lg mb-3">Your data, your device</h3>
              <p className="text-[#808080] text-sm leading-relaxed">
                All conversations and history are stored locally in your browser. Nothing leaves your computer.
              </p>
            </div>
            <div>
              <h3 className="text-lg mb-3">One subscription</h3>
              <p className="text-[#808080] text-sm leading-relaxed">
                Access every major AI model through a single interface instead of managing multiple accounts.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222222] mt-32">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center text-sm text-[#808080]">
            <span>© 2025 ANUMA</span>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
