"use client";

import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

function RequestAccessButton() {
  const { login, authenticated } = usePrivy();

  return (
    <button
      onClick={() => login()}
      className="px-8 py-4 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
    >
      {authenticated ? 'You\'re in' : 'Request access'}
    </button>
  );
}

export default function HowMemoryWorks() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="text-lg font-semibold tracking-tight text-neutral-900">
          anuma
        </Link>
        <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
          ← Back
        </Link>
      </header>

      {/* Content */}
      <main className="px-6 md:px-12 pt-12 pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <p className="text-sm text-neutral-500 mb-4 font-mono">/how-memory-works</p>
            <p className="text-sm text-neutral-500 mb-12">
              HN-proof: architecture, invariants, threat model, and constraints. No fluff.
            </p>

            {/* What Anuma is */}
            <section className="mb-16">
              <h1 className="text-3xl font-medium text-neutral-900 mb-6">What Anuma is</h1>
              <p className="text-neutral-700 leading-relaxed mb-8">
                Anuma is a memory layer that sits between you and any model. Models are interchangeable. Your memory is not.
              </p>

              {/* Diagram */}
              <div className="bg-neutral-50 rounded-xl p-8 mb-8">
                <div className="space-y-4 font-mono text-sm max-w-xs">
                  <div className="px-6 py-3 bg-white border border-neutral-200 rounded-lg text-neutral-700 text-center">
                    You
                  </div>
                  <div className="text-center text-neutral-400">↓</div>
                  <div className="px-6 py-3 bg-neutral-900 text-white rounded-lg text-center">
                    Your Memory (Anuma)
                  </div>
                  <div className="text-center text-neutral-400">↓</div>
                  <div className="px-6 py-3 bg-white border border-neutral-200 rounded-lg text-neutral-700 text-center">
                    Any Model
                  </div>
                </div>
              </div>
            </section>

            {/* Core invariant */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-neutral-900 mb-6">Core invariant</h2>
              <ul className="space-y-4 text-neutral-700">
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Memory belongs to the user.</strong> You can inspect, edit, export, and delete it.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Models do not own your memory.</strong> They receive only the minimum context required for the current task.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>No model switching tax.</strong> Changing models must not reset identity, preferences, or long-term context.</span>
                </li>
              </ul>
            </section>

            {/* Storage model */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-neutral-900 mb-6">Storage model (local-first)</h2>
              <p className="text-neutral-700 mb-6">
                By default, Anuma stores memory locally on the user's device. "Local" means: your machine is the source of truth. The model provider is not.
              </p>
              <ul className="space-y-3 text-neutral-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Local database:</strong> encrypted at rest.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Keys:</strong> generated on-device. Anuma cannot decrypt without your keys.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Sync (optional):</strong> if enabled, Anuma syncs encrypted blobs that remain unreadable without your key material.</span>
                </li>
              </ul>
              <p className="text-sm text-neutral-500 bg-neutral-50 p-4 rounded-lg">
                If you want maximum privacy, disable sync. You still get portable memory across models on that device.
              </p>
            </section>

            {/* What "memory" includes */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-neutral-900 mb-6">What "memory" includes</h2>
              <p className="text-neutral-700 mb-6">
                Anuma separates memory into explicit types so you can control it.
              </p>
              <ul className="space-y-3 text-neutral-700">
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Preferences:</strong> writing style, verbosity, formatting, tone.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Profile facts:</strong> durable facts you choose to store (e.g., "I'm building X").</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Projects:</strong> structured artifacts like docs, plans, specs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Context rules:</strong> what Anuma should never store and never send.</span>
                </li>
              </ul>
            </section>

            {/* What models receive */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-neutral-900 mb-6">What models receive (context minimization)</h2>
              <p className="text-neutral-700 mb-6">
                Models do not receive your entire history. They receive a constructed context for the current request:
              </p>
              <ul className="space-y-3 text-neutral-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Short-term:</strong> the current thread (recent turns).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Relevant long-term:</strong> only the specific memory items retrieved for this request.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Redaction rules:</strong> anything marked "never share" is excluded.</span>
                </li>
              </ul>
              <p className="text-sm text-neutral-500 bg-neutral-50 p-4 rounded-lg">
                This is the opposite of "dump the whole chat log into the prompt." It reduces exposure and improves quality (less noise).
              </p>
            </section>

            {/* Threat model */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-neutral-900 mb-6">Threat model (what we assume)</h2>
              <ul className="space-y-3 text-neutral-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span>Model providers may log prompts/responses.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span>Browsers/devices can be compromised if the user installs malware.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span>Network observers exist (public Wi-Fi, corporate proxies).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span>"Accidental leakage" is common (copy/paste, screenshots, prompt dumps).</span>
                </li>
              </ul>
              <p className="text-neutral-700">
                Anuma reduces risk by minimizing what leaves the device and keeping long-term memory outside provider control. If your device is fully compromised, nothing saves you. That's true for all software.
              </p>
            </section>

            {/* What Anuma will never do */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-neutral-900 mb-6">What Anuma will never do</h2>
              <ul className="space-y-3 text-neutral-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✕</span>
                  <span>Train foundation models on your conversations.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✕</span>
                  <span>Sell, analyze, or broker your memory.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✕</span>
                  <span>Make your memory required for a specific model provider.</span>
                </li>
              </ul>
            </section>

            {/* Portability */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-neutral-900 mb-6">Portability</h2>
              <p className="text-neutral-700 mb-6">
                Portability means your memory can move with you, across:
              </p>
              <ul className="space-y-3 text-neutral-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Models:</strong> GPT, Claude, open models, etc.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Apps:</strong> chat, research, writing, coding, agent workflows.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Devices (if sync enabled):</strong> encrypted transport, same keys.</span>
                </li>
              </ul>
              <p className="text-sm text-neutral-500 bg-neutral-50 p-4 rounded-lg">
                If you export your memory, it should be usable without Anuma. That's the point.
              </p>
            </section>

            {/* Constraints */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-neutral-900 mb-6">Constraints (what we won't optimize for)</h2>
              <ul className="space-y-3 text-neutral-700">
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Not maximizing engagement.</strong> No streaks, no gamification.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Not maximizing data capture.</strong> Less stored by default, more user control.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Not chasing novelty.</strong> The product goal is stability over time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-400 mt-1">•</span>
                  <span><strong>Not hiding tradeoffs.</strong> Local-first means device responsibility matters.</span>
                </li>
              </ul>
            </section>

            {/* Quick eval */}
            <section className="mb-16 bg-neutral-50 rounded-xl p-8">
              <h2 className="text-xl font-medium text-neutral-900 mb-6">If you want to evaluate this quickly</h2>
              <p className="text-neutral-700 mb-4">Ask three questions:</p>
              <ol className="space-y-3 text-neutral-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-neutral-500 font-mono">1.</span>
                  <span>Can I see and delete what it remembers?</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-500 font-mono">2.</span>
                  <span>Can I switch models without re-explaining myself?</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral-500 font-mono">3.</span>
                  <span>Does my memory live outside the model provider?</span>
                </li>
              </ol>
              <p className="text-neutral-700 font-medium">
                If the answer is "yes" to all three, you understand Anuma.
              </p>
            </section>

            {/* CTA */}
            <section className="text-center py-12 border-t border-neutral-100">
              <p className="text-sm text-neutral-500 mb-8">
                Built in San Francisco. Quiet by design.
              </p>
              <RequestAccessButton />
            </section>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-neutral-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Back to home
          </Link>
          <div className="flex gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
