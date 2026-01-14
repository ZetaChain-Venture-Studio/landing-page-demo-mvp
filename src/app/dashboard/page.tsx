"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  const walletCreated = user?.wallet?.address;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

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
    <PointsDashboard email={getUserEmail(user)} palette={anumaSanctuary} paletteId="2" />
  );
}
