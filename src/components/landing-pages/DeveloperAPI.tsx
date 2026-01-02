"use client";

import { useState, useRef } from 'react';
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

function InteractiveSDKDemo() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [sharedContext, setSharedContext] = useState('');
  const [contextSet, setContextSet] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSetContext = (e: React.FormEvent) => {
    e.preventDefault();
    if (sharedContext.trim()) {
      setContextSet(true);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setStreamingContent('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Build conversation history with shared context
    const systemContent = sharedContext
      ? `You are a helpful assistant. The user has provided this context: "${sharedContext}". Keep this context in mind for all responses. Keep responses concise but helpful.`
      : 'You are a helpful assistant. Keep responses concise but helpful.';

    const conversationHistory = [
      { role: 'system' as const, content: systemContent },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userMessage }
    ];

    try {
      const res = await fetch('https://ai-portal-dev.zetachain.com/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL_API_IDS[selectedModel],
          messages: conversationHistory,
          max_tokens: 500,
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
                setStreamingContent(fullText);
              }
            } catch {}
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullText, model: selectedModel }]);
      setStreamingContent('');
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.', model: selectedModel }]);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const getModelColor = (modelId: string) => {
    const model = MODELS.find(m => m.id === modelId);
    return model?.color || 'text-white';
  };

  return (
    <div className="grid lg:grid-cols-[300px,1fr] gap-6">
      {/* Left side - Shared Context Panel */}
      <div className="bg-[#111] border border-white/10 rounded-lg p-4">
        <div className="text-xs uppercase tracking-widest text-white/40 mb-4">
          SHARED CONTEXT
        </div>
        {!contextSet ? (
          <form onSubmit={handleSetContext} className="space-y-4">
            <textarea
              value={sharedContext}
              onChange={(e) => setSharedContext(e.target.value)}
              placeholder="e.g., I'm building an e-commerce app for vintage watches with a $15k budget..."
              className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-sm resize-none"
            />
            <button
              type="submit"
              disabled={!sharedContext.trim()}
              className="w-full px-4 py-2 bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Set Context
            </button>
            <p className="text-[10px] text-white/30">
              This context will be shared across all AI models
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-white/5 border border-green-400/30 rounded text-sm text-white/80">
              {sharedContext}
            </div>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Context active
            </div>
            <button
              onClick={() => {
                setContextSet(false);
                setMessages([]);
              }}
              className="text-xs text-white/40 hover:text-white/60 underline"
            >
              Change context
            </button>
          </div>
        )}
      </div>

      {/* Right side - Chat Interface */}
      <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
        {/* Header with model selector */}
        <div className="border-b border-white/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 font-mono">MODEL:</span>
              <div className="flex gap-2">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
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
            <div className="text-xs text-white/30 font-mono">
              {messages.length > 0 && `${messages.length} messages in context`}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="h-[300px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex items-center justify-center text-white/30 text-sm">
              <div className="text-center">
                {contextSet ? (
                  <>
                    <p className="mb-2">Context is set. Ask any question!</p>
                    <p className="text-xs text-white/20">Switch models anytime - your context is preserved.</p>
                  </>
                ) : (
                  <>
                    <p className="mb-2">Set your shared context first</p>
                    <p className="text-xs text-white/20">Or just start chatting without context</p>
                  </>
                )}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                {msg.role === 'assistant' && msg.model && (
                  <div className={`text-[10px] font-mono mb-1 ${getModelColor(msg.model)}`}>
                    {msg.model}
                  </div>
                )}
                <div className={`px-4 py-3 rounded text-sm ${
                  msg.role === 'user'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/90'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && streamingContent && (
            <div className="flex gap-3 justify-start">
              <div className="max-w-[80%]">
                <div className={`text-[10px] font-mono mb-1 ${getModelColor(selectedModel)}`}>
                  {selectedModel}
                </div>
                <div className="px-4 py-3 rounded text-sm bg-white/10 text-white/90">
                  {streamingContent}
                  <span className="inline-block w-2 h-4 bg-white/50 ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingContent && (
            <div className="flex gap-3 justify-start">
              <div className="px-4 py-3 rounded bg-white/10">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={sendMessage} className="border-t border-white/10 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={contextSet ? "Ask a question about your context..." : "Type a message..."}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-white text-black font-medium text-sm hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-white/30">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Switch models mid-conversation - context is always preserved!</span>
          </div>
        </form>
      </div>
    </div>
  );
}

function WaitlistButton({ buttonText = 'Enter Waitlist' }: { buttonText?: string }) {
  const { login, authenticated } = usePrivy();

  return (
    <button
      onClick={login}
      className="px-8 py-4 bg-white text-black hover:bg-white/90 transition-colors whitespace-nowrap"
    >
      {authenticated ? 'Joined' : buttonText}
    </button>
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
              <h1 className="text-5xl md:text-6xl mb-6 tracking-tight">
                One SDK for
                <br />
                every AI model
              </h1>

              <p className="text-xl text-white/50 mb-8 leading-relaxed">
                Switch between <span className="text-green-400">GPT-4</span>, <span className="text-orange-400">Claude</span>, <span className="text-blue-400">Gemini</span>, and <span className="text-purple-400">Llama</span> with a single parameter. <span className="text-white font-medium">Context persists</span>. No vendor lock-in.
              </p>

              <div className="space-y-4">
                <WaitlistButton buttonText="Get SDK Access" />
                <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 text-xs tracking-widest text-white/60">
                  <span>DEVELOPER SDK</span>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded">COMING SOON</span>
                </div>
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

      {/* Interactive SDK Demo */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-4">
            TRY IT NOW - INTERACTIVE SDK DEMO
          </div>
          <p className="text-white/50 text-sm mb-8 max-w-2xl">
            Type your own messages and switch between AI models mid-conversation. Your context is preserved across all models.
          </p>
          <InteractiveSDKDemo />
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
            <WaitlistButton buttonText="Enter Waitlist" />
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
