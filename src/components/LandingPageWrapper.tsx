"use client";

import dynamic from "next/dynamic";

// Dynamically import MemoryLanding with no SSR to avoid Privy initialization issues
const MemoryLanding = dynamic(() => import("./landing-pages/MemoryLanding"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent"></div>
    </div>
  ),
});

export default function LandingPageWrapper() {
  return <MemoryLanding />;
}
