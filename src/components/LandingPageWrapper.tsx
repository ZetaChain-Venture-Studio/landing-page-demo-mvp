"use client";

import dynamic from "next/dynamic";

// Dynamically import LandingPage with no SSR to avoid Privy initialization issues
const LandingPage = dynamic(() => import("./LandingPage"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3EE' }}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: '#93653D', borderTopColor: 'transparent' }}></div>
    </div>
  ),
});

export default function LandingPageWrapper() {
  return <LandingPage />;
}
