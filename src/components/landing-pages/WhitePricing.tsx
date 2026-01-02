"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';

// Design Landing Page (2) - White centered with conversation flow and $25 pricing

const MODELS = [
  { name: 'GPT-4', symbol: '◆' },
  { name: 'Claude', symbol: '●' },
  { name: 'Gemini', symbol: '■' },
  { name: 'Llama', symbol: '▲' },
];

const CONVERSATION = [
  { role: 'user', text: 'Help me plan a marketing campaign for sustainable fashion', context: [] },
  { role: 'ai', text: 'I can help with that. What\'s your target audience and budget range?', context: ['sustainable fashion', 'marketing campaign'] },
  { role: 'user', text: 'Gen Z, $50k budget, launching in 3 months', context: [] },
  { role: 'ai', text: 'Perfect. With your timeline and budget, I\'d recommend focusing on TikTok and Instagram Reels...', context: ['Gen Z', '$50k budget', '3 month timeline', 'sustainable fashion'] },
];

function ModelSwitcher() {
  const [activeModel, setActiveModel] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (messageIndex < CONVERSATION.length - 1) {
        setMessageIndex(prev => prev + 1);
      } else {
        setActiveModel(prev => (prev + 1) % MODELS.length);
        setTimeout(() => {
          setMessageIndex(0);
        }, 2000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [messageIndex]);

  const displayedMessages = CONVERSATION.slice(0, messageIndex + 1);
  const lastMessage = CONVERSATION[messageIndex];
  const contextItems = lastMessage.role === 'ai' ? lastMessage.context : [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Model selector */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {MODELS.map((model, index) => (
          <button
            key={model.name}
            onClick={() => setActiveModel(index)}
            className={`px-4 py-2 text-sm transition-all ${
              activeModel === index
                ? 'bg-black text-white'
                : 'bg-white border border-black/20 text-black hover:border-black/40'
            }`}
          >
            <span className="mr-2">{model.symbol}</span>
            {model.name}
          </button>
        ))}
      </div>

      {/* Conversation */}
      <div className="border border-black/10 bg-white">
        <div className="border-b border-black/10 p-4 text-sm text-black/40">
          Currently using: <span className="text-black">{MODELS[activeModel].name}</span>
        </div>

        <div className="p-6 space-y-4 min-h-[300px]">
          {displayedMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`${msg.role === 'user' ? 'text-black/60' : 'text-black'}`}
            >
              <div className="text-xs text-black/40 mb-1">
                {msg.role === 'user' ? 'You' : MODELS[activeModel].name}
              </div>
              <div className="text-sm leading-relaxed">
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Context bar - always visible */}
        <div className="border-t border-black/10 p-4 bg-gray-100">
          <div className="text-xs text-black/60 mb-2 font-medium">Shared context</div>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {contextItems.length > 0 ? (
              contextItems.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-black text-white border border-black text-xs"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="px-2 py-1 bg-gray-200 border border-gray-300 text-xs text-black/50 italic">
                Waiting for context...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-black/30 mt-4">
        Context flows seamlessly as you switch models
      </div>
    </div>
  );
}

function WaitlistButton() {
  const { login, authenticated } = usePrivy();

  return (
    <div className="flex justify-center">
      <button
        onClick={login}
        className="px-8 py-4 bg-black text-white hover:bg-black/80 transition-colors whitespace-nowrap"
      >
        {authenticated ? 'Joined' : 'Join Waitlist'}
      </button>
    </div>
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
          <div className="inline-block px-3 py-1 border border-black/20 text-xs mb-8 tracking-widest text-black">
            ANUMA
          </div>

          <h1 className="text-5xl md:text-7xl mb-8 tracking-tight leading-[1.1] text-black">
            One conversation
            <br />
            across every AI model
          </h1>

          <p className="text-xl text-black/80 mb-16 max-w-2xl mx-auto leading-relaxed">
            Switch between GPT-4, Claude, Gemini, and Llama mid-conversation. Your context and memories follow you. Stored locally, always private.
          </p>

          <WaitlistButton />
        </motion.div>

        {/* Model switcher demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <ModelSwitcher />
        </motion.div>

        {/* Value props - grouped together */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-40 max-w-4xl mx-auto"
        >
          <div className="border border-black/10 bg-black/[0.01] p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {/* Unified context */}
              <div>
                <div className="text-4xl mb-4 text-black">∞</div>
                <h2 className="text-xl mb-3 tracking-tight text-black font-medium">Unified Context</h2>
                <p className="text-sm text-black/60 leading-relaxed">
                  Switch between AI models mid-conversation. Your full history transfers instantly.
                </p>
              </div>

              {/* Private by design */}
              <div className="md:border-x md:border-black/10 md:px-8">
                <div className="text-4xl mb-4 text-black">⊙</div>
                <h2 className="text-xl mb-3 tracking-tight text-black font-medium">Private by Design</h2>
                <p className="text-sm text-black/60 leading-relaxed">
                  All conversations stored locally in your browser. Never uploaded, never synced.
                </p>
              </div>

              {/* Pricing */}
              <div>
                <div className="text-4xl mb-4 text-black font-bold">$25</div>
                <h2 className="text-xl mb-3 tracking-tight text-black font-medium">Per Month</h2>
                <p className="text-sm text-black/60 leading-relaxed">
                  One subscription for every AI model. No per-token fees.
                </p>
              </div>
            </div>

            {/* Savings callout */}
            <div className="mt-10 pt-8 border-t border-black/10 text-center">
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-black text-white">
                <span className="text-white/60 line-through text-sm">$130/mo separately</span>
                <span className="font-medium">Save $105/month with ANUMA</span>
              </div>
              <p className="mt-4 text-xs text-black/50">
                Includes GPT-4, Claude, Gemini, Llama, Perplexity, Mistral & more
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer CTA */}
        <div className="mt-40 pt-20 border-t border-black/10 text-center">
          <p className="text-xl mb-8 text-black/60">Ready for early access?</p>
          <WaitlistButton />
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 text-center text-sm text-black/20">© 2025 ANUMA</div>
      </div>
    </div>
  );
}
