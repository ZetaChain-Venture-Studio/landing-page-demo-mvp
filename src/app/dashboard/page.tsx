"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import PointsDashboard from '@/components/PointsDashboard';
import { anumaSanctuary } from '@/lib/palettes';

// Helper to get user's email from any login method
function getUserEmail(user: ReturnType<typeof usePrivy>['user']): string {
  if (!user) return '';
  if (user.email?.address) return user.email.address;
  if (user.google?.email) return user.google.email;
  if (user.apple?.email) return user.apple.email;
  if (user.twitter?.username) return `@${user.twitter.username}`;
  if (user.tiktok?.username) return `@${user.tiktok.username}`;
  return user.wallet?.address?.slice(0, 8) || '';
}

export default function Dashboard() {
  const router = useRouter();
  const { authenticated, ready, user } = usePrivy();
  const [showWelcome, setShowWelcome] = useState(false);

  const walletCreated = user?.wallet?.address;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  // Show welcome animation for new signups
  useEffect(() => {
    if (authenticated && walletCreated) {
      const isNew = typeof window !== 'undefined' && localStorage.getItem('anuma_new_signup') === 'true';
      if (isNew) {
        setShowWelcome(true);
        localStorage.removeItem('anuma_new_signup');
        const timer = setTimeout(() => setShowWelcome(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [authenticated, walletCreated]);

  // Show loading while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1c1917] border-t-transparent"></div>
      </div>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1c1917] border-t-transparent"></div>
      </div>
    );
  }

  // Show loading state while wallet is being created
  if (!walletCreated) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1c1917] border-t-transparent"></div>
          <p className="text-[#78716c]">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome popup for new signups */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-xl"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-medium text-[#1c1917] mb-2">Welcome to Anuma!</h2>
              <p className="text-[#78716c] mb-4">You&apos;ve earned <span className="font-bold text-[#D4AF37]">400 AI Credits</span> for joining the waitlist!</p>
              <p className="text-sm text-[#a8a29e]">Complete more tasks to earn more credits.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <PointsDashboard email={getUserEmail(user)} palette={anumaSanctuary} paletteId="2" />
    </>
  );
}
