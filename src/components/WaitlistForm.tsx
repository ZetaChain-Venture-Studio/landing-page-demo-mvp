"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const { login, authenticated, ready, user } = usePrivy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Trigger Privy login with the email
    login({
      prefill: {
        type: "email",
        value: email,
      },
    });
  };

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show confirmation message if user is authenticated
  if (authenticated && user) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-8 text-center backdrop-blur-sm border border-violet-500/20">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-white">
          You&apos;re on the list!
        </h3>
        <p className="mb-4 text-zinc-400">
          Thanks for joining the Pop AI waitlist. We&apos;ll notify you when we launch.
        </p>
        <div className="rounded-lg bg-zinc-800/50 p-3">
          <p className="text-sm text-zinc-500">Signed up as</p>
          <p className="font-medium text-violet-400">{user.email?.address}</p>
        </div>
        <div className="mt-4 rounded-lg bg-zinc-800/50 p-3">
          <p className="text-sm text-zinc-500">Your wallet</p>
          <p className="font-mono text-sm text-violet-400 truncate">
            {user.wallet?.address}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 rounded-full border border-zinc-700 bg-zinc-800/50 px-6 py-4 text-white placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 font-semibold text-white transition-all hover:from-violet-500 hover:to-purple-500 hover:shadow-lg hover:shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        >
          Join Waitlist
        </button>
      </div>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Join 1,000+ others waiting for early access
      </p>
    </form>
  );
}
