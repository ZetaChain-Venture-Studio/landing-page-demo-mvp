"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { ChevronDown } from 'lucide-react';
import posthog from 'posthog-js';

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
    answer: `GPT-4, GPT-4o, Claude 3.5, Gemini Pro, Llama, Mistral, and more. Switch between them freely. Your memory and context persist across all of them. One subscription, every model.`
  },
  {
    question: 'How do AI credits work?',
    answer: `Early members earn AI credits by joining the waitlist and referring friends. Credits can be used for premium model access and priority features.`
  }
];

function FAQItem({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#e7e5e4]">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left hover:bg-[#f5f5f4] transition-colors px-2"
      >
        <span className="text-base text-[#1c1917]">{item.question}</span>
        <ChevronDown className={`w-5 h-5 text-[#78716c] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
            <div className="pb-5 px-2 text-sm text-[#57534e] leading-relaxed whitespace-pre-line">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PricingComparison() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Individual Subscriptions */}
      <div className="border border-[#e7e5e4] bg-white p-8">
        <div className="text-xs text-[#78716c] mb-6 uppercase tracking-wider">Individual Subscriptions</div>
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-[#f5f5f4]">
            <span className="text-[#1c1917]">ChatGPT Plus</span>
            <span className="text-[#78716c]">$20/mo</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f5f5f4]">
            <span className="text-[#1c1917]">Claude Pro</span>
            <span className="text-[#78716c]">$20/mo</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f5f5f4]">
            <span className="text-[#1c1917]">Gemini Advanced</span>
            <span className="text-[#78716c]">$20/mo</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f5f5f4]">
            <span className="text-[#1c1917]">Perplexity Pro</span>
            <span className="text-[#78716c]">$20/mo</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f5f5f4]">
            <span className="text-[#1c1917]">Mistral</span>
            <span className="text-[#78716c]">$15/mo</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f5f5f4]">
            <span className="text-[#1c1917]">Llama API</span>
            <span className="text-[#78716c]">$15/mo</span>
          </div>
        </div>
        <div className="flex justify-between items-center py-3 border-t border-[#e7e5e4]">
          <span className="text-[#1c1917] font-medium">Total</span>
          <span className="text-xl text-[#dc2626] line-through">$110/mo</span>
        </div>
        <div className="mt-4 text-xs text-[#a8a29e]">
          + 6 accounts to manage<br />
          + No shared context<br />
          + Re-explain yourself everywhere
        </div>
      </div>

      {/* ANUMA */}
      <div className="border-2 border-[#D4AF37] bg-[#FFFBEB] p-8 relative">
        <div className="absolute -top-3 left-6 px-3 py-1 bg-[#D4AF37] text-white text-xs uppercase tracking-wider">
          Recommended
        </div>
        <div className="text-xs text-[#78716c] mb-6 uppercase tracking-wider">Anuma - All Models</div>
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-[#FEF3C7]">
            <span className="text-[#1c1917]">All ChatGPT models</span>
            <span className="text-[#D4AF37]">✓</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#FEF3C7]">
            <span className="text-[#1c1917]">All Claude models</span>
            <span className="text-[#D4AF37]">✓</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#FEF3C7]">
            <span className="text-[#1c1917]">All Gemini models</span>
            <span className="text-[#D4AF37]">✓</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#FEF3C7]">
            <span className="text-[#1c1917]">All Perplexity models</span>
            <span className="text-[#D4AF37]">✓</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#FEF3C7]">
            <span className="text-[#1c1917]">All Mistral models</span>
            <span className="text-[#D4AF37]">✓</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#FEF3C7]">
            <span className="text-[#1c1917]">All Llama models</span>
            <span className="text-[#D4AF37]">✓</span>
          </div>
        </div>
        <div className="flex justify-between items-center py-3 border-t border-[#D4AF37]/30">
          <span className="text-[#1c1917] font-medium">Total</span>
          <span className="text-3xl text-[#1c1917]">$25<span className="text-sm text-[#78716c]">/mo</span></span>
        </div>
        <div className="mt-4 text-xs text-[#92400E]">
          ✓ All models, one interface<br />
          ✓ Your context follows you<br />
          ✓ 100% private, local storage
        </div>
      </div>
    </div>
  );
}

export default function FinalMixedVersion() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const { login } = usePrivy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      posthog.capture('waitlist_signup', {
        page: 'finalmixedversion',
        email_domain: email.split('@')[1],
      });

      login({ prefill: { type: 'email', value: email } });
    } catch (error) {
      console.error('Error saving user:', error);
      login({ prefill: { type: 'email', value: email } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] relative overflow-hidden">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 md:px-12 py-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="text-lg tracking-tight text-[#1c1917]">ANUMA</span>
            <button
              onClick={() => login()}
              className="text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
            >
              Sign in
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 md:px-12 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl text-[#1c1917] leading-[1.1] mb-6 tracking-tight">
                AI finally has a home.
              </h1>

              <p className="text-xl md:text-2xl text-[#57534e] mb-4 max-w-xl mx-auto leading-relaxed">
                One place for all your AI conversations. Every model, one memory, completely yours.
              </p>
            </motion.div>

            {/* Powerful. Private. Personal. Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-2xl md:text-3xl text-[#1c1917] mb-10 text-center tracking-tight">
                Powerful. Private. Personal.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-[#FFFBEB]">
                    <span className="text-xl text-[#D4AF37]">◎</span>
                  </div>
                  <h3 className="text-lg text-[#1c1917] mb-2">Unified Memory</h3>
                  <p className="text-sm text-[#78716c]">
                    One context across all models
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-[#FFFBEB]">
                    <span className="text-xl text-[#D4AF37]">◈</span>
                  </div>
                  <h3 className="text-lg text-[#1c1917] mb-2">Private by Design</h3>
                  <p className="text-sm text-[#78716c]">
                    Your data never leaves your device
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-[#FFFBEB]">
                    <span className="text-xl text-[#D4AF37]">◉</span>
                  </div>
                  <h3 className="text-lg text-[#1c1917] mb-2">User-Owned Data</h3>
                  <p className="text-sm text-[#78716c]">
                    Export, delete, control everything
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              onSubmit={handleSubmit}
              className="max-w-lg mx-auto mb-6"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-5 py-4 border border-[#d6d3d1] bg-white text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#1c1917] transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-[#1c1917] text-white hover:bg-[#292524] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-[#a8a29e] text-center mb-20"
            >
              No spam. Early access only.
            </motion.p>

            {/* Pricing Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-20"
            >
              <h2 className="text-2xl text-[#1c1917] mb-10 text-center tracking-tight">
                One subscription, access any model.
              </h2>
              <PricingComparison />
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-20 max-w-2xl mx-auto"
            >
              <h2 className="text-2xl text-[#1c1917] mb-8 text-center tracking-tight">
                Questions
              </h2>
              <div className="border-t border-[#e7e5e4]">
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
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-8 border-t border-[#e7e5e4]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#a8a29e]">
              Built in San Francisco. Quiet by design.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-[#78716c] hover:text-[#1c1917] transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-[#78716c] hover:text-[#1c1917] transition-colors">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
