"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

// Design Landing Page (3) - Developer SDK dark

function CodeExample() {
  return (
    <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden font-mono text-sm">
      <div className="border-b border-white/10 px-4 py-2 text-xs text-white/40 flex items-center justify-between">
        <span>example.js</span>
        <span className="text-[10px]">JavaScript</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-white/80">
{`import { ANUMA } from '@anuma/sdk';

const anuma = new ANUMA({
  apiKey: process.env.ANUMA_API_KEY
});

// Start with `}<span className="text-orange-400">Claude</span>{` for creative writing
const thread = await anuma.chat({
  model: '`}<span className="text-orange-400">claude</span>{`',
  message: 'Write a product tagline'
});

// Switch to `}<span className="text-green-400">GPT-4</span>{` for technical analysis
await anuma.chat({
  threadId: thread.id,
  model: '`}<span className="text-green-400">gpt-4</span>{`',
  message: 'Now analyze conversion metrics'
});

// Context preserved across models ✓`}</pre>
      </div>
    </div>
  );
}

const MODELS = [
  { id: 'gpt-4', color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/30' },
  { id: 'claude', color: 'text-orange-400', bgColor: 'bg-orange-400/10', borderColor: 'border-orange-400/30' },
  { id: 'gemini', color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30' },
  { id: 'llama', color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/30' },
];

const MODEL_API_IDS: Record<string, string> = {
  'gpt-4': 'openai/gpt-4o',
  'claude': 'anthropic/claude-3-5-sonnet-20241022',
  'gemini': 'google/gemini-1.5-pro',
  'llama': 'meta-llama/llama-3.1-70b-instruct',
};

const SAMPLE_REQUEST = {
  threadId: 'thread_a7f3d9c2',
  model: 'gpt-4',
  message: 'Explain quantum computing simply',
};

const FALLBACK_RESPONSES: Record<string, string> = {
  'gpt-4': 'Quantum computing uses quantum mechanics principles like superposition and entanglement to process information. Unlike classical bits that are 0 or 1, quantum bits (qubits) can be both simultaneously...',
  'claude': 'Think of quantum computing like this: regular computers are like a person checking one path through a maze at a time. Quantum computers can check multiple paths simultaneously, making them exponentially faster for certain problems...',
  'gemini': 'Quantum computers leverage quantum mechanical phenomena to perform computations. They use qubits which can exist in multiple states at once (superposition), allowing parallel processing of information...',
  'llama': 'Quantum computing is a fundamentally different approach to computation that exploits quantum mechanical properties. Instead of binary bits, it uses qubits that can represent multiple states simultaneously through superposition...',
};

function ApiDemo() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(FALLBACK_RESPONSES['gpt-4']);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRealResponse = async (model: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('https://ai-portal-dev.zetachain.com/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL_API_IDS[model],
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Keep responses concise (2-3 sentences max).' },
            { role: 'user', content: SAMPLE_REQUEST.message }
          ],
          max_tokens: 150,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setResponse(fullText);
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setResponse(FALLBACK_RESPONSES[model]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    fetchRealResponse(model);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Request */}
      <div>
        <div className="text-xs text-white/40 mb-3 font-mono">REQUEST</div>
        <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden font-mono text-xs">
          <div className="border-b border-white/10 px-4 py-2 text-[10px] text-white/40">
            POST /v1/chat
          </div>
          <div className="p-4">
            <pre className="text-white/70">
{`{
  "threadId": "${SAMPLE_REQUEST.threadId}",
  "model": "`}<span className="text-green-400">{selectedModel}</span>{`",
  "message": "${SAMPLE_REQUEST.message}"
}`}
            </pre>
          </div>
        </div>

        {/* Model selector */}
        <div className="mt-4">
          <div className="text-xs text-white/40 mb-2 font-mono">SWITCH MODEL</div>
          <div className="grid grid-cols-2 gap-2">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelChange(model.id)}
                className={`px-4 py-2 text-xs font-mono border transition-colors ${
                  selectedModel === model.id
                    ? `${model.bgColor} ${model.borderColor} ${model.color}`
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                }`}
              >
                {model.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response */}
      <div>
        <div className="text-xs text-white/40 mb-3 font-mono">RESPONSE</div>
        <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden font-mono text-xs">
          <div className="border-b border-white/10 px-4 py-2 text-[10px] text-white/40 flex items-center justify-between">
            <span>200 OK</span>
            {isLoading && (
              <span className="text-green-400">● Streaming...</span>
            )}
          </div>
          <div className="p-4 min-h-[200px]">
            <pre className="text-white/70 whitespace-pre-wrap">
{`{
  "id": "msg_k9d8fj2l",
  "model": "${selectedModel}",
  "threadId": "${SAMPLE_REQUEST.threadId}",
  "content": "${isLoading ? 'Loading...' : response}",
  "contextPreserved": true
}`}
            </pre>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-400/10 border border-green-400/20 text-xs text-green-400">
          ✓ Context from previous messages maintained across model switch
        </div>
      </div>
    </div>
  );
}

function WaitlistForm({ buttonText = 'Enter Waitlist' }: { buttonText?: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      console.log('Waitlist signup:', email);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">✓</span>
        </div>
        <span className="text-white">You&apos;re on the list!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors whitespace-nowrap"
      >
        {buttonText}
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
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 text-xs mb-6 tracking-widest text-white/60">
                <span>DEVELOPER SDK</span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded">COMING SOON</span>
              </div>

              <h1 className="text-5xl md:text-6xl mb-6 tracking-tight">
                One SDK for
                <br />
                every AI model
              </h1>

              <p className="text-xl text-white/50 mb-8 leading-relaxed">
                Switch between <span className="text-green-400">GPT-4</span>, <span className="text-orange-400">Claude</span>, <span className="text-blue-400">Gemini</span>, and <span className="text-purple-400">Llama</span> with a single parameter. <span className="text-white font-medium">Context persists</span>. No vendor lock-in.
              </p>

              <WaitlistForm buttonText="Get SDK Access" />
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
            LIVE SDK CONSOLE
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
                Same SDK method. Switch models by changing one parameter. No need to integrate different providers.
              </p>
              <div className="mt-4 p-3 bg-white/5 border border-white/10 font-mono text-xs text-white/60">
                model: &quot;gpt-4&quot; | &quot;claude&quot; | &quot;gemini&quot;
              </div>
            </div>

            <div>
              <div className="text-sm text-white/40 mb-4 font-mono">02</div>
              <h3 className="text-2xl mb-3 tracking-tight"><span className="text-white">Context</span> persistence</h3>
              <p className="text-white/50 leading-relaxed">
                <span className="text-white font-medium">ANUMA</span> threads maintain full context across model switches. Automatic memory management.
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

      {/* Pricing Comparison */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-8 text-center">
            PRICING COMPARISON
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Individual Subscriptions */}
            <div className="border border-white/10 bg-white/5 p-8">
              <div className="text-sm text-white/40 mb-6 uppercase tracking-wider">Individual Subscriptions</div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-green-400">ChatGPT Plus</span>
                  <span className="text-white/80">$20/mo</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-orange-400">Claude Pro</span>
                  <span className="text-white/80">$20/mo</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-blue-400">Gemini Advanced</span>
                  <span className="text-white/80">$20/mo</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-purple-400">Llama (API)</span>
                  <span className="text-white/80">$15/mo</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-white/20">
                <span className="text-white font-medium">Total</span>
                <span className="text-2xl text-red-400 line-through">$75/mo</span>
              </div>
              <div className="mt-4 text-xs text-white/40">
                + Multiple accounts to manage
                <br />+ No shared context between models
              </div>
            </div>

            {/* ANUMA */}
            <div className="border-2 border-green-400/50 bg-green-400/5 p-8 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-green-400 text-black text-xs font-medium">
                RECOMMENDED
              </div>
              <div className="text-sm text-white/40 mb-6 uppercase tracking-wider">ANUMA SDK</div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-green-400">GPT-4</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-orange-400">Claude</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-blue-400">Gemini</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-purple-400">Llama</span>
                  <span className="text-green-400">✓</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-white/20">
                <span className="text-white font-medium">Total</span>
                <span className="text-4xl text-white">$25<span className="text-lg text-white/50">/mo</span></span>
              </div>
              <div className="mt-4 text-xs text-green-400/80">
                ✓ Single interface for all models
                <br />✓ Unified context across models
                <br />✓ Unlimited requests
              </div>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-white/30">
            No per-token charges. No overage fees. No surprises.
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl mb-6 tracking-tight">Join the private beta</h2>
          <p className="text-white/50 mb-8">Limited SDK access available for early adopters</p>
          <div className="flex justify-center">
            <WaitlistForm buttonText="Enter Waitlist" />
          </div>
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
