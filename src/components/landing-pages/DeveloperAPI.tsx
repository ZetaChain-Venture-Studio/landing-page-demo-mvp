"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';

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

// Start with Claude for creative writing
const thread = await anuma.chat({
  model: 'claude',
  message: 'Write a product tagline'
});

// Switch to GPT-4 for technical analysis
await anuma.chat({
  threadId: thread.id,
  model: 'gpt-4',
  message: 'Now analyze conversion metrics'
});

// Context preserved across models ✓`}</pre>
      </div>
    </div>
  );
}

const MODELS = ['gpt-4', 'claude', 'gemini', 'llama'];

const SAMPLE_REQUEST = {
  threadId: 'thread_a7f3d9c2',
  model: 'gpt-4',
  message: 'Explain quantum computing simply',
};

const RESPONSES: Record<string, string> = {
  'gpt-4': 'Quantum computing uses quantum mechanics principles like superposition and entanglement to process information. Unlike classical bits that are 0 or 1, quantum bits (qubits) can be both simultaneously...',
  'claude': 'Think of quantum computing like this: regular computers are like a person checking one path through a maze at a time. Quantum computers can check multiple paths simultaneously, making them exponentially faster for certain problems...',
  'gemini': 'Quantum computers leverage quantum mechanical phenomena to perform computations. They use qubits which can exist in multiple states at once (superposition), allowing parallel processing of information...',
  'llama': 'Quantum computing is a fundamentally different approach to computation that exploits quantum mechanical properties. Instead of binary bits, it uses qubits that can represent multiple states simultaneously through superposition...',
};

function ApiDemo() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(RESPONSES['gpt-4']);

  const handleModelChange = (model: string) => {
    setIsLoading(true);
    setSelectedModel(model);

    setTimeout(() => {
      setResponse(RESPONSES[model]);
      setIsLoading(false);
    }, 600);
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
                key={model}
                onClick={() => handleModelChange(model)}
                className={`px-4 py-2 text-xs font-mono border transition-colors ${
                  selectedModel === model
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                }`}
              >
                {model}
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

function WaitlistButton({ children = 'Request Access' }: { children?: React.ReactNode }) {
  const { login, authenticated } = usePrivy();

  return (
    <button
      onClick={login}
      className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors"
    >
      {authenticated ? 'Joined!' : children}
    </button>
  );
}

export default function DeveloperAPI() {
  const { login, authenticated } = usePrivy();

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
                DEVELOPER SDK
              </div>

              <h1 className="text-5xl md:text-6xl mb-6 tracking-tight">
                One SDK for
                <br />
                every AI model
              </h1>

              <p className="text-xl text-white/50 mb-8 leading-relaxed">
                Switch between <span className="text-green-400">GPT-4</span>, <span className="text-orange-400">Claude</span>, <span className="text-blue-400">Gemini</span>, and <span className="text-purple-400">Llama</span> with a single parameter. <span className="text-white font-medium">Context persists</span>. No vendor lock-in.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={login}
                  className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors"
                >
                  {authenticated ? 'Joined!' : 'Get SDK Access'}
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

      {/* Pricing */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-xs uppercase tracking-widest text-white/40 mb-6">
              SDK PRICING
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
          <p className="text-white/50 mb-8">Limited SDK access available for early adopters</p>
          <WaitlistButton />
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
