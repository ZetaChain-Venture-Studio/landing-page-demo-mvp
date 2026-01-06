"use client";

import dynamic from "next/dynamic";

// Dynamically import FinalMixedVersion with no SSR to avoid Privy initialization issues
const FinalMixedVersion = dynamic(() => import("./landing-pages/FinalMixedVersion"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1c1917] border-t-transparent"></div>
    </div>
  ),
});

export default function LandingPageWrapper() {
  return <FinalMixedVersion />;
}
