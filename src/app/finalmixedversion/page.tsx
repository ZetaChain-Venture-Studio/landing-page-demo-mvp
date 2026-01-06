"use client";

import dynamic from "next/dynamic";

const FinalMixedVersion = dynamic(() => import("@/components/landing-pages/FinalMixedVersion"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1a1a1a] border-t-transparent"></div>
    </div>
  ),
});

export default function FinalMixedVersionPage() {
  return <FinalMixedVersion />;
}
