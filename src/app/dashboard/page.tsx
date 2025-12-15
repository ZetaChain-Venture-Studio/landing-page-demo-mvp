"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PointsDashboard from '@/components/PointsDashboard';

function DashboardContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'test@popai.com';
  const wallet = searchParams.get('wallet') || '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00';

  return <PointsDashboard email={email} testWallet={wallet} />;
}

export default function TestDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
