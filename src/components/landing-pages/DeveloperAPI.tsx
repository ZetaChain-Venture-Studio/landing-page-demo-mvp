"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

// Design Landing Page (3) - Developer API dark

function CodeExample() {
  return (
    <div className="bg-[#111] border border-white/10 p-6 font-mono text-sm">
      <div className="text-white/40 mb-4"># Switch models with one parameter</div>
      <pre className="text-green-400">
{`const response = await anuma.chat({
  model: "gpt-4", // or "claude", "gemini"
  thread_id: "thread_abc123",
  message: "Continue our conversation..."
});`}
      </pre>
    </div>
  );
}

function ApiDemo() {
  const [activeModel, setActiveModel] = useState('gpt-4');
  const [response, setResponse] = useState('');

  const models = ['gpt-4', 'claude', 'gemini'];

  const handleRun = () => {
    setResponse(`Response from ${activeModel}: Your context from the previous model has been preserved. Continuing the conversation seamlessly...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {models.map((model) => (
          <button
            key={model}
            onClick={() => setActiveModel(model)}
            className={`px-4 py-2 text-sm font-mono border transition-colors ${
              activeModel === model
                ? 'bg-white text-black border-white'
                : 'border-white/20 text-white/60 hover:border-white/40'
            }`}
          >
            {model}
          </button>
        ))}
      </div>

      <div className="bg-[#111] border border-white/10 p-4 font-mono text-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white/40">Request</span>
          <button
            onClick={handleRun}
            className="px-3 py-1 bg-green-500 text-black text-xs hover:bg-green-400 transition-colors"
          >
            RUN
          </button>
        </div>
        <pre className="text-white/80">
{`{
  "model": "${activeModel}",
  "thread_id": "thread_demo",
  "message": "What were we discussing?"
}`}
        </pre>
      </div>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] border border-green-500/30 p-4 font-mono text-sm"
        >
          <div className="text-green-400/60 mb-2">Response</div>
          <p className="text-white/80">{response}</p>
        </motion.div>
      )}
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="developer@company.com"
        className="flex-1 px-4 py-3 bg-transparent border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
        disabled={submitted}
      />
      <button
        type="submit"
        className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50"
        disabled={submitted}
      >
        {submitted ? 'Requested!' : 'Request Access'}
      </button>
    </form>
  );
}

export default function DeveloperAPI() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-2 py-1 border border-white/20 text-xs mb-6 tracking-widest text-white/60">
                DEVELOPER API
              </div>

              <h1 className="text-5xl md:text-6xl mb-6 tracking-tight">
                One API for
                <br />
                every AI model
              </h1>

              <p className="text-xl text-white/50 mb-8 leading-relaxed">
                Switch between GPT-4, Claude, Gemini, and Llama with a single parameter. Context persists. No vendor lock-in.
              </p>

              <div className="flex gap-3">
                <button className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors">
                  Get API Key
                </button>
                <button className="px-6 py-3 border border-white/20 hover:border-white/40 transition-colors">
                  View Docs
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <CodeExample />
            </motion.div>
          </div>
        </div>
      </div>

      {/* API Demo */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-8">
            LIVE API CONSOLE
          </div>
          <ApiDemo />
        </div>
      </div>

      {/* Features */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="text-sm text-white/40 mb-4 font-mono">01</div>
              <h3 className="text-2xl mb-3 tracking-tight">Unified interface</h3>
              <p className="text-white/50 leading-relaxed">
                Same API endpoint. Switch models by changing one parameter. No need to learn different SDKs.
              </p>
              <div className="mt-4 p-3 bg-white/5 border border-white/10 font-mono text-xs text-white/60">
                model: &quot;gpt-4&quot; | &quot;claude&quot; | &quot;gemini&quot;
              </div>
            </div>

            <div>
              <div className="text-sm text-white/40 mb-4 font-mono">02</div>
              <h3 className="text-2xl mb-3 tracking-tight">Context persistence</h3>
              <p className="text-white/50 leading-relaxed">
                Conversation threads maintain full context across model switches. Automatic memory management.
              </p>
              <div className="mt-4 p-3 bg-white/5 border border-white/10 font-mono text-xs text-white/60">
                thread_id: &quot;thread_abc123&quot;
              </div>
            </div>

            <div>
              <div className="text-sm text-white/40 mb-4 font-mono">03</div>
              <h3 className="text-2xl mb-3 tracking-tight">Client-side storage</h3>
              <p className="text-white/50 leading-relaxed">
                Optional browser SDK stores conversations locally. Zero server-side data retention.
              </p>
              <div className="mt-4 p-3 bg-white/5 border border-white/10 font-mono text-xs text-white/60">
                storage: &quot;local&quot; | &quot;cloud&quot;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-xs uppercase tracking-widest text-white/40 mb-6">
              SIMPLE PRICING
            </div>
            <div className="text-7xl mb-4">$25</div>
            <p className="text-xl text-white/50 mb-8">
              per month · unlimited requests · all models included
            </p>
            <div className="text-sm text-white/30">
              No per-token charges. No overage fees. No surprises.
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl mb-6 tracking-tight">Join the private beta</h2>
          <p className="text-white/50 mb-8">Limited API keys available for early adopters</p>
          <WaitlistForm />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center text-sm text-white/20">
            <div>ANUMA</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white/40 transition-colors">Docs</a>
              <a href="#" className="hover:text-white/40 transition-colors">GitHub</a>
              <a href="#" className="hover:text-white/40 transition-colors">Status</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
