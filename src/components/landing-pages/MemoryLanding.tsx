"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

const ROLES = [
  'Developer',
  'Designer',
  'Founder',
  'Researcher',
  'Writer',
  'Student',
  'Other'
];

const FAQ_ITEMS = [
  {
    question: 'How does memory work?',
    answer: `Anuma is a memory layer that sits between you and any model. Models are interchangeable. Your memory is not.

**Core invariant:**
• Memory belongs to the user. You can inspect, edit, export, and delete it.
• Models do not own your memory. They receive only the minimum context required.
• No model switching tax. Changing models won't reset your identity or preferences.

**Storage (local-first):**
• By default, Anuma stores memory locally on your device
• Encrypted at rest with keys generated on-device
• Anuma cannot decrypt without your keys
• Optional sync uses encrypted blobs that remain unreadable without your key material

**What "memory" includes:**
• Preferences: writing style, verbosity, formatting, tone
• Profile facts: durable facts you choose to store
• Projects: structured artifacts like docs, plans, specs
• Context rules: what to never store or send`,
    isExpanded: false
  },
  {
    question: 'What makes this different from ChatGPT memory?',
    answer: `ChatGPT memory is owned by OpenAI, locked to their platform, and can be used for training. Anuma memory is owned by you, works across any model, and is never used for training. You can inspect, edit, export, and delete everything. If you switch to Claude or Gemini tomorrow, your memory comes with you.`
  },
  {
    question: 'Is my data really private?',
    answer: `Yes. Memory is stored locally on your device by default. If you enable sync, data is encrypted end-to-end with keys you control. Anuma cannot read your memory. We will never train on your conversations, sell your data, or analyze your memory for any purpose.`
  },
  {
    question: 'What models do you support?',
    answer: `We support GPT-4, Claude, Gemini, Llama, Mistral, and more. You can switch between them freely. Your memory and context persist across all of them. One subscription, every model.`
  },
  {
    question: 'How do AI credits work?',
    answer: `Early members earn AI credits by joining the waitlist and referring friends. Credits can be used for premium model access, increased context limits, and priority features. The earlier you join, the more credits you earn.`
  },
  {
    question: 'When will Anuma launch?',
    answer: `We're onboarding carefully to protect memory integrity. Join the waitlist for early access. We'll notify you when your spot is ready.`
  }
];

function FAQItem({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors px-1"
      >
        <span className="text-base font-medium text-neutral-900">{item.question}</span>
        <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-5 px-1 text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RequestAccessButton({ className = '' }: { className?: string }) {
  const { login, authenticated } = usePrivy();

  return (
    <button
      onClick={login}
      className={`px-8 py-4 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors ${className}`}
    >
      {authenticated ? 'You\'re in' : 'Request access'}
    </button>
  );
}

export default function MemoryLanding() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0); // First FAQ open by default
  const { login, authenticated } = usePrivy();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ prefill: { type: 'email', value: email } });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">anuma</span>
        <button
          onClick={() => login()}
          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          {authenticated ? 'Dashboard' : 'Sign in'}
        </button>
      </header>

      {/* Hero */}
      <main className="px-6 md:px-12 pt-16 md:pt-24 pb-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] tracking-tight text-neutral-900 mb-4">
              Your AI forgets you.
              <br />
              <span className="text-neutral-400">We don't.</span>
            </h1>

            <p className="text-xl text-neutral-600 mb-12">
              One AI. One memory. Everywhere.
            </p>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-neutral-500 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  className="w-full max-w-md px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-500 mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full max-w-md px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors bg-white"
                >
                  <option value="">What describes you? (optional)</option>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <RequestAccessButton />
              </div>
            </form>

            <p className="text-sm text-neutral-500 mb-16">
              We're onboarding carefully to protect memory integrity.
            </p>

            {/* Credit Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-16">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm text-amber-800">Early members earn AI credits</span>
            </div>
          </motion.div>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 pt-20 border-t border-neutral-100"
          >
            <p className="text-lg text-neutral-900 font-medium mb-4">
              No model switching. One subscription.
            </p>

            <div className="flex items-center gap-4 mb-16">
              <span className="text-sm text-neutral-500">How it works</span>
              <span className="text-neutral-300">•</span>
              <Link href="/how-memory-works" className="text-sm text-neutral-900 hover:underline">
                /how-memory-works
              </Link>
            </div>
          </motion.div>

          {/* Memory Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-lg mb-20"
          >
            <h2 className="text-2xl font-medium text-neutral-900 mb-8">
              The missing layer is memory.
            </h2>

            <div className="space-y-4 font-mono text-sm">
              <div className="flex items-center gap-4">
                <div className="px-6 py-3 bg-neutral-100 rounded-lg text-neutral-700">You</div>
              </div>
              <div className="pl-8 text-neutral-400">↓</div>
              <div className="flex items-center gap-4">
                <div className="px-6 py-3 bg-neutral-900 text-white rounded-lg">Your Memory (Anuma)</div>
              </div>
              <div className="pl-8 text-neutral-400">↓</div>
              <div className="flex items-center gap-4">
                <div className="px-6 py-3 bg-neutral-100 rounded-lg text-neutral-700">Any Model</div>
              </div>
            </div>

            <p className="mt-8 text-neutral-600">
              Switch models. Keep your mind.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Your memory lives with you — not with the model.
            </p>
          </motion.div>

          {/* What Anuma will never do */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-20 py-12 px-8 bg-neutral-50 rounded-xl"
          >
            <h2 className="text-xl font-medium text-neutral-900 mb-6">
              What Anuma will never do
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-0.5">✕</span>
                <span className="text-neutral-700">Train on your conversations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-0.5">✕</span>
                <span className="text-neutral-700">Lock you to one provider</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-0.5">✕</span>
                <span className="text-neutral-700">Sell or analyze your memory</span>
              </li>
            </ul>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-20"
          >
            <p className="text-sm text-neutral-500 uppercase tracking-wider mb-8">
              People want one place their AI "lives."
            </p>
            <div className="space-y-6">
              <blockquote className="text-lg text-neutral-700 italic border-l-2 border-neutral-200 pl-6">
                "I'm tired of re-explaining myself."
              </blockquote>
              <blockquote className="text-lg text-neutral-700 italic border-l-2 border-neutral-200 pl-6">
                "The models change. I want my memory to stay."
              </blockquote>
              <blockquote className="text-lg text-neutral-700 italic border-l-2 border-neutral-200 pl-6">
                "This feels like the thing that should have existed first."
              </blockquote>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-medium text-neutral-900 mb-8">
              Questions
            </h2>
            <div className="max-w-2xl">
              {FAQ_ITEMS.map((item, idx) => (
                <FAQItem
                  key={idx}
                  item={item}
                  isOpen={openFAQ === idx}
                  onToggle={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                />
              ))}
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="py-16 text-center border-t border-neutral-100"
          >
            <p className="text-neutral-600 mb-6">
              If you care where your memory lives, you already understand this product.
            </p>
            <RequestAccessButton />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">Built in San Francisco.</p>
          <div className="flex gap-6 text-sm text-neutral-500">
            <Link href="/how-memory-works" className="hover:text-neutral-900 transition-colors">
              How memory works
            </Link>
            <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
