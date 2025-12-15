"use client";

import dynamic from "next/dynamic";

// Dynamically import WaitlistForm with no SSR to avoid Privy initialization issues
const WaitlistForm = dynamic(() => import("./WaitlistForm"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
    </div>
  ),
});

export default function WaitlistFormWrapper() {
  return <WaitlistForm />;
}
