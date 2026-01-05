"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

// Design - ANUMA Landing Page Design - Blueprint/technical beige style with memory-focused copy

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

• Memory belongs to the user. You can inspect, edit, export, and delete it.
• Models do not own your memory. They receive only the minimum context required.
• No model switching tax. Changing models won't reset your identity or preferences.

Storage is local-first: encrypted at rest, keys generated on-device. Anuma cannot decrypt without your keys.`
  },
  {
    question: 'What makes this different from ChatGPT memory?',
    answer: `ChatGPT memory is owned by OpenAI, locked to their platform, and can be used for training. Anuma memory is owned by you, works across any model, and is never used for training. You can inspect, edit, export, and delete everything.`
  },
  {
    question: 'Is my data really private?',
    answer: `Yes. Memory is stored locally on your device by default. If you enable sync, data is encrypted end-to-end with keys you control. Anuma cannot read your memory. We will never train on your conversations.`
  },
  {
    question: 'What models do you support?',
    answer: `GPT-4, Claude, Gemini, Llama, Mistral, and more. Switch between them freely. Your memory and context persist across all of them. One subscription, every model.`
  },
  {
    question: 'How do AI credits work?',
    answer: `Early members earn AI credits by joining the waitlist and referring friends. Credits can be used for premium model access and priority features.`
  }
];

function BlueprintBackground() {
  return (
    <div className="absolute inset-0 opacity-10">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3a3a3a" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          <pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#grid)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#3a3a3a" strokeWidth="1" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-major)" />
      </svg>

      {/* Corner brackets */}
      <svg className="absolute top-8 left-8 w-12 h-12" viewBox="0 0 48 48">
        <path d="M 0 12 L 0 0 L 12 0" fill="none" stroke="#3a3a3a" strokeWidth="1" />
      </svg>
      <svg className="absolute top-8 right-8 w-12 h-12" viewBox="0 0 48 48">
        <path d="M 48 12 L 48 0 L 36 0" fill="none" stroke="#3a3a3a" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-8 left-8 w-12 h-12" viewBox="0 0 48 48">
        <path d="M 0 36 L 0 48 L 12 48" fill="none" stroke="#3a3a3a" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-8 right-8 w-12 h-12" viewBox="0 0 48 48">
        <path d="M 48 36 L 48 48 L 36 48" fill="none" stroke="#3a3a3a" strokeWidth="1" />
      </svg>
    </div>
  );
}

function MemoryDiagram() {
  return (
    <div className="flex flex-col items-center space-y-3 font-mono text-sm">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-8 py-3 border border-[#3a3a3a] bg-[#E5DDD5]"
      >
        You
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[#3a3a3a]"
      >
        ↓
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="px-8 py-3 border-2 border-[#2a2a2a] bg-[#2a2a2a] text-[#E5DDD5]"
      >
        Your Memory (Anuma)
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-[#3a3a3a]"
      >
        ↓
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="px-8 py-3 border border-[#3a3a3a] bg-[#E5DDD5]"
      >
        Any Model
      </motion.div>
    </div>
  );
}

function FAQItem({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#3a3a3a]/20">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-[#3a3a3a]/5 transition-colors px-2"
      >
        <span className="text-sm font-mono text-[#2a2a2a]">{item.question}</span>
        <ChevronDown className={`w-4 h-4 text-[#3a3a3a] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
            <div className="pb-4 px-2 text-sm text-[#4a4a4a] leading-relaxed whitespace-pre-line font-mono">
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
      className={`px-8 py-4 bg-[#2a2a2a] text-[#E5DDD5] font-mono text-sm hover:bg-[#1a1a1a] transition-colors ${className}`}
    >
      {authenticated ? 'YOU\'RE IN' : 'REQUEST ACCESS'}
    </button>
  );
}

export default function BlueprintTechnical() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const { login } = usePrivy();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ prefill: { type: 'email', value: email } });
  };

  return (
    <div className="relative min-h-screen bg-[#E5DDD5] overflow-hidden">
      <BlueprintBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex items-center justify-between max-w-6xl mx-auto">
          <span className="font-mono text-lg tracking-tight text-[#2a2a2a]">anuma</span>
          <button
            onClick={() => login()}
            className="font-mono text-xs text-[#4a4a4a] hover:text-[#2a2a2a] transition-colors"
          >
            Sign in
          </button>
        </header>

        {/* Hero */}
        <main className="px-6 md:px-12 pt-12 md:pt-20 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-[#2a2a2a] mb-4">
                Your AI forgets you.
                <br />
                <span className="text-[#6a6a6a]">We don't.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#4a4a4a] font-mono mt-6">
                One AI. One memory. Everywhere.
              </p>
            </motion.div>

            {/* Signup Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="max-w-md mx-auto mb-8"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#6a6a6a] mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full px-4 py-3 border border-[#3a3a3a]/30 bg-[#E5DDD5] text-[#2a2a2a] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#3a3a3a] transition-colors font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#6a6a6a] mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border border-[#3a3a3a]/30 bg-[#E5DDD5] text-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a] transition-colors font-mono text-sm"
                  >
                    <option value="">What describes you? (optional)</option>
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <RequestAccessButton className="w-full" />
                </div>
              </div>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs font-mono text-[#6a6a6a] mb-8"
            >
              We're onboarding carefully to protect memory integrity.
            </motion.p>

            {/* AI Credits Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#3a3a3a]/30 font-mono text-xs text-[#4a4a4a]">
                <span className="w-2 h-2 bg-[#3a3a3a] animate-pulse" />
                Early members earn AI credits
              </div>
            </motion.div>

            {/* Divider */}
            <div className="h-px w-full bg-[#3a3a3a]/20 mb-16" />

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-16"
            >
              <div className="flex items-center gap-4 mb-8 justify-center">
                <span className="font-mono text-sm text-[#4a4a4a]">No model switching. One subscription.</span>
              </div>

              <div className="flex items-center gap-4 mb-12 justify-center">
                <span className="font-mono text-xs text-[#6a6a6a]">How it works</span>
                <span className="text-[#6a6a6a]">•</span>
                <Link href="/how-memory-works" className="font-mono text-xs text-[#2a2a2a] hover:underline">
                  /how-memory-works
                </Link>
              </div>

              <h2 className="text-2xl text-[#2a2a2a] text-center mb-8">
                The missing layer is memory.
              </h2>

              <MemoryDiagram />

              <p className="text-center font-mono text-sm text-[#4a4a4a] mt-8">
                Switch models. Keep your mind.
              </p>
              <p className="text-center font-mono text-xs text-[#6a6a6a] mt-2">
                Your memory lives with you — not with the model.
              </p>
            </motion.div>

            {/* What Anuma will never do */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-16 p-8 border border-[#3a3a3a]/20"
            >
              <h2 className="font-mono text-sm text-[#2a2a2a] mb-6">
                What Anuma will never do
              </h2>
              <ul className="space-y-3 font-mono text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[#8a4a4a]">✕</span>
                  <span className="text-[#4a4a4a]">Train on your conversations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#8a4a4a]">✕</span>
                  <span className="text-[#4a4a4a]">Lock you to one provider</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#8a4a4a]">✕</span>
                  <span className="text-[#4a4a4a]">Sell or analyze your memory</span>
                </li>
              </ul>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-16"
            >
              <p className="font-mono text-xs text-[#6a6a6a] mb-6 text-center">
                People want one place their AI "lives."
              </p>
              <div className="space-y-4 max-w-lg mx-auto">
                <blockquote className="font-mono text-sm text-[#4a4a4a] italic border-l-2 border-[#3a3a3a]/30 pl-4">
                  "I'm tired of re-explaining myself."
                </blockquote>
                <blockquote className="font-mono text-sm text-[#4a4a4a] italic border-l-2 border-[#3a3a3a]/30 pl-4">
                  "The models change. I want my memory to stay."
                </blockquote>
                <blockquote className="font-mono text-sm text-[#4a4a4a] italic border-l-2 border-[#3a3a3a]/30 pl-4">
                  "This feels like the thing that should have existed first."
                </blockquote>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-16"
            >
              <h2 className="font-mono text-sm text-[#2a2a2a] mb-6">
                Questions
              </h2>
              <div className="border-t border-[#3a3a3a]/20">
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
              transition={{ delay: 1 }}
              className="text-center py-12 border-t border-[#3a3a3a]/20"
            >
              <p className="font-mono text-sm text-[#4a4a4a] mb-6">
                If you care where your memory lives, you already understand this product.
              </p>
              <RequestAccessButton />
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-8 border-t border-[#3a3a3a]/20">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-mono text-xs text-[#6a6a6a]">Built in San Francisco.</p>
            <div className="flex gap-6 font-mono text-xs text-[#6a6a6a]">
              <Link href="/how-memory-works" className="hover:text-[#2a2a2a] transition-colors">
                How memory works
              </Link>
              <a href="#" className="hover:text-[#2a2a2a] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#2a2a2a] transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
