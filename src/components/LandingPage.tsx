"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyConfig } from '@/providers/PrivyProvider';
import { ColorPalette, anumaSanctuary, isDarkPalette } from '@/lib/palettes';
import PointsDashboard from './PointsDashboard';
import LiveSignupCounter from './LiveSignupCounter';

// Helper to get user's email from any login method
function getUserEmail(user: ReturnType<typeof usePrivy>['user']): string {
  if (!user) return '';
  // Email login
  if (user.email?.address) return user.email.address;
  // Google login
  if (user.google?.email) return user.google.email;
  // Apple login
  if (user.apple?.email) return user.apple.email;
  // Twitter/X - no email, use username
  if (user.twitter?.username) return `@${user.twitter.username}`;
  // TikTok - no email, use username
  if (user.tiktok?.username) return `@${user.tiktok.username}`;
  // Fallback to any linked account email
  for (const account of user.linkedAccounts || []) {
    if ('email' in account && account.email) return account.email as string;
  }
  return '';
}

interface LandingPageProps {
  paletteId?: string;
  palette?: ColorPalette;
}

// Inner component that uses Privy hooks
function LandingPageWithPrivy({ palette, paletteId }: { palette: ColorPalette; paletteId: string }) {
  const [email, setEmail] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const { login, authenticated, ready, user } = usePrivy();

  const walletCreated = user?.wallet?.address;

  const [isNewSignup, setIsNewSignup] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('anuma_new_signup') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (animationDone && typeof window !== 'undefined') {
      localStorage.removeItem('anuma_new_signup');
    }
  }, [animationDone]);

  useEffect(() => {
    console.log('[DEBUG] State:', { ready, authenticated, walletCreated, isNewSignup, showAnimation, animationDone });
  }, [ready, authenticated, walletCreated, isNewSignup, showAnimation, animationDone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsNewSignup(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('anuma_new_signup', 'true');
    }

    login({
      prefill: { type: 'email', value: email },
    });
  };

  // Save user to database when authenticated
  useEffect(() => {
    if (authenticated && walletCreated) {
      const userEmail = getUserEmail(user) || email;
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          walletAddress: walletCreated,
        }),
      })
        .then(res => res.json())
        .then(data => console.log('[LandingPage] User saved:', data))
        .catch(err => console.error('[LandingPage] Failed to save user:', err));
    }
  }, [authenticated, walletCreated, user, email]);

  useEffect(() => {
    if (authenticated && walletCreated && isNewSignup && !showAnimation && !animationDone) {
      const delayTimer = setTimeout(() => {
        setShowAnimation(true);
        const animationTimer = setTimeout(() => {
          setShowAnimation(false);
          setAnimationDone(true);
        }, 3500);
        return () => clearTimeout(animationTimer);
      }, 800);
      return () => clearTimeout(delayTimer);
    }
  }, [authenticated, walletCreated, isNewSignup, showAnimation, animationDone]);

  useEffect(() => {
    if (!ready) {
      const timer = setTimeout(() => setLoadingTimeout(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  if (!ready && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: palette.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: palette.accent, borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: palette.textLight }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (authenticated && walletCreated && !showAnimation && (animationDone || !isNewSignup)) {
    return <PointsDashboard email={getUserEmail(user) || email} palette={palette} paletteId={paletteId} />;
  }

  if (authenticated && !walletCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: palette.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: palette.accent, borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: palette.textLight }}>Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <LandingPageUI
      email={email}
      setEmail={setEmail}
      showAnimation={showAnimation}
      onSubmit={handleSubmit}
      onLoginClick={() => {
        setIsNewSignup(true);
        login();
      }}
      palette={palette}
      paletteId={paletteId}
    />
  );
}

// Fallback when Privy is not configured
function LandingPageFallback({ palette, paletteId }: { palette: ColorPalette; paletteId: string }) {
  const [email, setEmail] = useState('');

  return (
    <LandingPageUI
      email={email}
      setEmail={setEmail}
      showAnimation={false}
      onSubmit={(e) => {
        e.preventDefault();
        alert('Please configure Privy.');
      }}
      onLoginClick={() => alert('Please configure Privy.')}
      palette={palette}
      paletteId={paletteId}
    />
  );
}

export default function LandingPage({ paletteId = '2', palette }: LandingPageProps) {
  const { isConfigured } = usePrivyConfig();
  const colors = palette || anumaSanctuary;

  return isConfigured
    ? <LandingPageWithPrivy palette={colors} paletteId={paletteId} />
    : <LandingPageFallback palette={colors} paletteId={paletteId} />;
}

// UI Component
interface LandingPageUIProps {
  email: string;
  setEmail: (email: string) => void;
  showAnimation: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onLoginClick: () => void;
  palette: ColorPalette;
  paletteId: string;
}

function LandingPageUI({ email, setEmail, showAnimation, onSubmit, onLoginClick, palette, paletteId }: LandingPageUIProps) {
  const isDark = isDarkPalette(paletteId);

  return (
    <div className="relative min-h-screen overflow-hidden font-['Inter',sans-serif]" style={{ backgroundColor: palette.bg }}>

      {/* Welcome Animation Overlay */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: palette.bg }}
          >
            <motion.div className="text-center px-6">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-lg mb-4"
                style={{ color: palette.textMuted }}
              >
                Welcome to
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-5xl md:text-6xl font-light tracking-tight mb-6"
                style={{ color: palette.text }}
              >
                anuma.ai
              </motion.h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-16 h-px mx-auto mb-6"
                style={{ backgroundColor: palette.accent }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="text-base"
                style={{ color: palette.textLight }}
              >
                You're on the list
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-10 px-8 py-6">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
              style={{
                backgroundColor: palette.accent,
                color: isDark ? palette.bg : '#ffffff'
              }}
            >
              a
            </div>
            <span className="text-lg font-medium tracking-tight" style={{ color: palette.text }}>
              anuma.ai
            </span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            onClick={onLoginClick}
            className="px-4 py-2 text-sm transition-colors border rounded-lg"
            style={{
              color: palette.textMuted,
              borderColor: palette.border,
            }}
          >
            Sign in
          </motion.button>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 px-8 pt-20 md:pt-32 pb-24">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-10"
            style={{ borderColor: palette.border, backgroundColor: palette.bgAlt }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: palette.accent }}
            />
            <span className="text-xs uppercase tracking-widest" style={{ color: palette.textMuted }}>
              Limited Early Access
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] mb-6 italic"
            style={{ color: palette.text, fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Your mind finally has a home.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: palette.textMuted }}
          >
            Step out of digital exile and into the cognitive sanctuary. Reclaim your intelligence from fragmented silos and constant surveillance. Anuma is the unified memory layer where your data remains encrypted, sovereign, and entirely your own.
          </motion.p>

          {/* Email Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={onSubmit}
            className="max-w-md mx-auto mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-4 text-base rounded-xl border transition-all focus:outline-none"
                style={{
                  backgroundColor: palette.bgAlt,
                  borderColor: palette.border,
                  color: palette.text,
                }}
              />
              <button
                type="submit"
                className="px-8 py-4 text-sm font-medium rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: palette.accent,
                  color: isDark ? palette.bg : '#ffffff'
                }}
              >
                Begin Your Inauguration
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>

          {/* Live signup counter */}
          <div className="flex justify-center mb-6">
            <LiveSignupCounter palette={palette} paletteId={paletteId} />
          </div>

          {/* Features */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm mb-20"
            style={{ color: palette.textLight }}
          >
            Unlimited context · Works with any AI · 100% private
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-12 md:gap-20 flex-wrap"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-light mb-1" style={{ color: palette.text }}>
                12,847
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: palette.textLight }}>
                On Waitlist
              </div>
            </div>

            <div
              className="hidden sm:block w-px h-12"
              style={{ backgroundColor: palette.border }}
            />

            <div className="text-center">
              <div className="text-3xl md:text-4xl font-light mb-1" style={{ color: palette.text }}>
                ∞
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: palette.textLight }}>
                Context
              </div>
            </div>

            <div
              className="hidden sm:block w-px h-12"
              style={{ backgroundColor: palette.border }}
            />

            <div className="text-center">
              <div className="text-3xl md:text-4xl font-light mb-1" style={{ color: palette.text }}>
                100%
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: palette.textLight }}>
                Private
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-32 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-light text-center mb-4 italic" style={{ color: palette.text, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            One Memory. Every Model. Fully Private.
          </h2>
          <p className="text-center mb-12" style={{ color: palette.textMuted }}>
            Anuma is a private-first AI client with a unified memory layer you own and control.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.bgAlt }}>
                <svg className="w-6 h-6" style={{ color: palette.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <h3 className="font-medium mb-2" style={{ color: palette.text }}>Unified Memory</h3>
              <p className="text-sm" style={{ color: palette.textMuted }}>
                A structured, encrypted memory that travels across every model and every device for maximum personalization.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.bgAlt }}>
                <svg className="w-6 h-6" style={{ color: palette.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="font-medium mb-2" style={{ color: palette.text }}>Private by Design</h3>
              <p className="text-sm" style={{ color: palette.textMuted }}>
                Your memory is stored locally, encrypted end-to-end with your keys. Anuma never logs, stores, or trains on your data.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.bgAlt }}>
                <svg className="w-6 h-6" style={{ color: palette.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
              </div>
              <h3 className="font-medium mb-2" style={{ color: palette.text }}>User-Owned Data</h3>
              <p className="text-sm" style={{ color: palette.textMuted }}>
                Your memory is a digital asset secured by your wallet. Portable across apps. Verifiable using blockchain.
              </p>
            </div>
          </div>
        </motion.div>

        {/* The Foundation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-24 mb-16 max-w-2xl mx-auto text-center p-8 rounded-2xl"
          style={{ backgroundColor: palette.bgAlt, border: `1px solid ${palette.border}` }}
        >
          <h3 className="text-lg font-medium mb-4 italic" style={{ color: palette.text, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            The Foundation
          </h3>
          <p className="text-sm mb-4" style={{ color: palette.textMuted }}>
            Your memory is a digital asset secured by your own wallet. We never log, store, or train on your data. Your Foundation is end-to-end encrypted and portable across every model and app.
          </p>
          <p className="text-xs uppercase tracking-widest" style={{ color: palette.textLight }}>
            Powered by ZetaChain
          </p>
        </motion.div>
      </main>

      {/* Subtle decorative element */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ backgroundColor: palette.border }}
      />
    </div>
  );
}
