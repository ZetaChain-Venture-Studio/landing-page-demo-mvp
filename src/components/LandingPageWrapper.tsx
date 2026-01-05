"use client";

import dynamic from "next/dynamic";

// Dynamically import BlueprintTechnical with no SSR to avoid Privy initialization issues
const BlueprintTechnical = dynamic(() => import("./landing-pages/BlueprintTechnical"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#E5DDD5]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3a3a3a] border-t-transparent"></div>
    </div>
  ),
});

export default function LandingPageWrapper() {
  return <BlueprintTechnical />;
}
