"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

// Design Landing Page (1) - Dark minimal with typing animation

const FAQ_ITEMS = [
  { q: "What is ANUMA?", a: "ANUMA is a unified interface to access GPT-4, Claude, Gemini, and Llama - all in one place." },
  { q: "How does context work?", a: "Your conversation history is preserved when you switch between AI models. No need to repeat yourself." },
  { q: "Where is my data stored?", a: "Everything is stored locally in your browser. We don't have access to your conversations." },
  { q: "How much does it cost?", a: "$25/month for unlimited access to all AI models. No per-token fees." },
  { q: "When is launch?", a: "We're launching in early 2025. Join the waitlist for early access." },
];

const MODELS = [
  { id: 'gpt4', name: 'GPT-4', company: 'OpenAI' },
  { id: 'claude', name: 'Claude', company: 'Anthropic' },
  { id: 'gemini', name: 'Gemini', company: 'Google' },
  { id: 'llama', name: 'Llama', company: 'Meta' },
];

const CONVERSATION = [
  {
    role: 'user',
    text: "I'm building an e-commerce app for selling vintage watches. Budget is $15k and launch date is March 2025.",
    isContext: true,
  },
  {
    role: 'user',
    text: "Should I use Next.js or plain React?",
  },
];

const MODEL_RESPONSES = [
  "Given your March 2025 deadline and $15k budget, I'd recommend Next.js. The built-in SSR will help with SEO for your vintage watch listings, and the API routes can handle your backend needs without additional infrastructure costs.",
  "For your vintage watch e-commerce project, Next.js would be ideal. With your timeline, you'll benefit from its built-in features. The $15k budget is sufficient, and you'll have better SEO out of the box for your product pages.",
  "Considering your e-commerce requirements and budget constraints, Next.js is the better choice. You'll launch faster with its integrated features, and vintage watches benefit from the SEO advantages it provides.",
  "Next.js aligns well with your vintage watch marketplace goals. The framework's features will help you stay within the $15k budget and meet your March deadline while providing good performance for product listings.",
];

const MODEL_API_IDS: Record<string, string> = {
  'GPT-4': 'openai/gpt-4o',
  'Claude': 'anthropic/claude-3-5-sonnet-20241022',
  'Gemini': 'google/gemini-1.5-pro',
  'Llama': 'meta-llama/llama-3.1-70b-instruct',
};

function ModelSwitcher() {
  const [activeModel, setActiveModel] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRealResponse = async (modelIndex: number) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const modelName = MODELS[modelIndex].name;
    const modelId = MODEL_API_IDS[modelName];

    setIsLoading(true);
    setDisplayedText('');
    setIsTyping(true);

    try {
      const response = await fetch('https://ai-portal-dev.zetachain.com/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Keep responses concise (2-3 sentences max). Remember the context: the user is building an e-commerce app for selling vintage watches with a $15k budget and March 2025 launch date.' },
            { role: 'user', content: CONVERSATION[0].text },
            { role: 'user', content: CONVERSATION[1].text }
          ],
          max_tokens: 150,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
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
                setDisplayedText(fullText);
              }
            } catch {}
          }
        }
      }

      setIsTyping(false);
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      // Fallback to static response
      setDisplayedText(MODEL_RESPONSES[modelIndex]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch response when model changes
  useEffect(() => {
    fetchRealResponse(activeModel);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModel]);

  return (
    <div className="border border-[#222222] rounded-lg overflow-hidden bg-[#0a0a0a]">
      {/* Model selector header */}
      <div className="flex items-center justify-between p-6 border-b border-[#222222]">
        <span className="text-sm text-[#808080]">Select model</span>
        <div className="flex gap-2">
          {MODELS.map((model, index) => (
            <button
              key={model.id}
              onClick={() => setActiveModel(index)}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                activeModel === index
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] text-[#808080] hover:text-white hover:bg-[#252525]'
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="p-6 space-y-6">
        {/* Context message */}
        <div className="p-4 bg-[#0d0d0d] border border-white/20 rounded-lg">
          <div className="flex gap-3 mb-3">
            <div className="text-white text-sm shrink-0">You</div>
            <div className="flex-1 text-white text-sm leading-relaxed">
              {CONVERSATION[0].text}
            </div>
          </div>
          <div className="ml-14 inline-block px-2 py-1 bg-[#1a1a1a] border border-white/30 rounded text-xs text-white animate-pulse">
            Context stored
          </div>
        </div>

        {/* Follow-up question */}
        <div className="flex gap-3">
          <div className="text-[#808080] text-sm shrink-0">You</div>
          <div className="flex-1 text-[#b3b3b3] text-sm">
            {CONVERSATION[1].text}
          </div>
        </div>

        {/* Model response using context */}
        <div className="flex gap-3">
          <div className="text-[#808080] text-sm shrink-0">{MODELS[activeModel].name}</div>
          <div className="flex-1">
            <div className="text-white text-sm leading-relaxed mb-3">
              {displayedText}
              {isTyping && <span className="inline-block w-1 h-4 bg-white ml-1 animate-pulse"></span>}
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              <span className="px-2 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-[#808080]">
                Referenced: e-commerce app
              </span>
              <span className="px-2 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-[#808080]">
                Referenced: $15k budget
              </span>
              <span className="px-2 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-[#808080]">
                Referenced: March 2025
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer showing context preservation */}
      <div className="px-6 py-4 bg-[#0d0d0d] border-t border-[#222222]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-[#888888]">{isLoading ? 'Fetching live response...' : 'Live AI response'}</span>
          </div>
          <span className="text-[#666666]">2 messages in context</span>
        </div>
      </div>
    </div>
  );
}

function FAQModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#111] border border-[#333] rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-[#333]">
            <h2 className="text-xl font-medium">About ANUMA</h2>
            <button onClick={onClose} className="text-[#808080] hover:text-white transition-colors">
              <X className="size-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <h3 className="text-white font-medium mb-2">{item.q}</h3>
                <p className="text-[#a0a0a0] text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function WaitlistButton() {
  const { login, authenticated } = usePrivy();

  return (
    <button
      onClick={login}
      className="px-8 py-4 bg-white text-black hover:bg-[#eee] transition-colors whitespace-nowrap"
    >
      {authenticated ? 'Joined' : 'Join Waitlist'}
    </button>
  );
}

export default function DarkMinimal() {
  const [showFAQ, setShowFAQ] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />

      {/* Header */}
      <header className="border-b border-[#222222]">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium">ANUMA</span>
            <button
              onClick={() => setShowFAQ(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-full text-xs text-[#b3b3b3] hover:bg-[#252525] hover:text-white transition-all"
            >
              <span className="text-sm">ⓘ</span>
              <span>FAQ</span>
            </button>
          </div>
          <a href="#waitlist" className="text-sm text-[#808080] hover:text-white transition-colors">
            Join Waitlist
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-6xl md:text-8xl mb-8 leading-[1.1]">
            Stop paying for multiple AI subscriptions
          </h1>

          <p className="text-2xl text-[#b3b3b3] mb-12 leading-relaxed max-w-2xl">
            ANUMA gives you access to GPT-4, Claude, Gemini, and Llama in one place. Switch between models instantly while keeping your conversation context. Everything stored locally in your browser.
          </p>
        </motion.div>

        {/* Model Switcher Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 mb-12"
        >
          <ModelSwitcher />
        </motion.div>

        {/* Waitlist below demo */}
        <div id="waitlist" className="flex justify-center mb-16">
          <WaitlistButton />
        </div>

        {/* Simple feature list */}
        <div className="border-t border-[#222222] pt-16 mt-32">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-lg mb-3">Switch freely</h3>
              <p className="text-[#808080] text-sm leading-relaxed">
                Change AI models mid-conversation without losing context or having to explain yourself again.
              </p>
            </div>
            <div>
              <h3 className="text-lg mb-3">Your data, your device</h3>
              <p className="text-[#808080] text-sm leading-relaxed">
                All conversations and history are stored locally in your browser. Nothing leaves your computer.
              </p>
            </div>
            <div>
              <h3 className="text-lg mb-3">One subscription</h3>
              <p className="text-[#808080] text-sm leading-relaxed">
                Access every major AI model through a single interface instead of managing multiple accounts.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222222] mt-32">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center text-sm text-[#808080]">
            <span>© 2025 ANUMA</span>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
