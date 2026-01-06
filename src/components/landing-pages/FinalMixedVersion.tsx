"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import posthog from 'posthog-js';

export default function FinalMixedVersion() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = usePrivy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: role || null }),
      });

      posthog.capture('waitlist_signup', {
        page: 'finalmixedversion',
        email_domain: email.split('@')[1],
        role: role || null,
      });

      login({ prefill: { type: 'email', value: email } });
    } catch (error) {
      console.error('Error saving user:', error);
      login({ prefill: { type: 'email', value: email } });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ROLES = [
    'Developer',
    'Designer',
    'Founder',
    'Researcher',
    'Writer',
    'Student',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] relative overflow-hidden">
      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 md:px-12 py-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="font-serif text-2xl tracking-tight text-[#1a1a1a]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              anuma
            </span>
            <button
              onClick={() => login()}
              className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              Sign in
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
          <div className="max-w-2xl mx-auto text-center">
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                className="text-5xl md:text-7xl lg:text-8xl text-[#1a1a1a] leading-[1.1] mb-6"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
              >
                AI finally has a home.
              </h1>

              <p
                className="text-lg md:text-xl text-[#555] mb-4 max-w-xl mx-auto leading-relaxed"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                One place for all your AI conversations. Every model, one memory, completely yours.
              </p>
            </motion.div>

            {/* Powerful. Private. Personal. Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="my-12"
            >
              <h2
                className="text-2xl md:text-3xl text-[#1a1a1a] mb-8"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 }}
              >
                Powerful. Private. Personal.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full border border-[#ddd] flex items-center justify-center">
                    <span className="text-lg">◎</span>
                  </div>
                  <h3
                    className="text-base text-[#1a1a1a] mb-1"
                    style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 }}
                  >
                    Unified Memory
                  </h3>
                  <p className="text-sm text-[#777]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                    One context across all models
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full border border-[#ddd] flex items-center justify-center">
                    <span className="text-lg">◈</span>
                  </div>
                  <h3
                    className="text-base text-[#1a1a1a] mb-1"
                    style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 }}
                  >
                    Private by Design
                  </h3>
                  <p className="text-sm text-[#777]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                    Your data never leaves your device
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full border border-[#ddd] flex items-center justify-center">
                    <span className="text-lg">◉</span>
                  </div>
                  <h3
                    className="text-base text-[#1a1a1a] mb-1"
                    style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 }}
                  >
                    User-Owned Data
                  </h3>
                  <p className="text-sm text-[#777]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                    Export, delete, control everything
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              onSubmit={handleSubmit}
              className="max-w-md mx-auto mb-8"
            >
              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-5 py-4 border border-[#ddd] bg-white text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#1a1a1a] transition-colors text-center"
                    style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                  />
                </div>
                <div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-5 py-4 border border-[#ddd] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors text-center appearance-none"
                    style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                  >
                    <option value="">What describes you? (optional)</option>
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-5 py-4 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors disabled:opacity-50"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  {isSubmitting ? 'Joining...' : 'Request Access'}
                </button>
              </div>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-[#888]"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              No spam. Early access only.
            </motion.p>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-8 border-t border-[#eee]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="text-sm text-[#888]"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              Built in San Francisco. Quiet by design.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-[#888] hover:text-[#1a1a1a] transition-colors"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-[#888] hover:text-[#1a1a1a] transition-colors"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
