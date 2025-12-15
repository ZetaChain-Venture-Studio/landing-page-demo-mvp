"use client";

import dynamic from "next/dynamic";

// Dynamically import LandingPage with no SSR to avoid Privy initialization issues
const LandingPage = dynamic(() => import("./LandingPage"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
    </div>
  ),
});

export default function LandingPageWrapper() {
  return <LandingPage />;
}
