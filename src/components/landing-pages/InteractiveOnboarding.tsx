"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';

// Design - ANUMA Landing Page Design (3) - Interactive onboarding with context panel
// Integrated with Evermind SDK for real AI responses

const API_BASE_URL = "https://ai-portal-dev.zetachain.com";

// Model mapping for the API
const MODEL_IDS: Record<string, string> = {
  'GPT-4': 'openai/gpt-4o',
  'Claude': 'anthropic/claude-3-5-sonnet-20241022',
  'Gemini': 'google/gemini-1.5-pro',
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  model?: string;
  id: number;
  highlightName?: boolean;
}

interface ContextData {
  name?: string;
  workingOn?: string;
  needsHelp?: string;
}

function TypedMessage({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return <p className="text-sm">{displayedText}</p>;
}

function ContextPanel({ context, flash }: { context: ContextData; flash: boolean }) {
  // Constant flicker effect for context items to show they're actively being used
  const [flickerIndex, setFlickerIndex] = useState(0);

  useEffect(() => {
    if (Object.keys(context).length > 0) {
      const interval = setInterval(() => {
        setFlickerIndex(prev => (prev + 1) % 3);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [context]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      className="sticky top-6"
    >
      <motion.div
        animate={{
          borderColor: flash ? 'rgb(0, 0, 0)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: flash ? '3px' : '2px',
        }}
        transition={{ duration: 0.3 }}
        className="border-2 border-black/10 p-6 bg-white"
      >
        <div className="text-[10px] tracking-[0.3em] text-black/40 mb-4">
          SHARED CONTEXT
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {context.name && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden"
              >
                <div className="text-xs text-black/50 mb-1 tracking-wide">NAME</div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{
                    x: flickerIndex === 0 ? [0, 1, -1, 0] : 0,
                    opacity: 1,
                    fontWeight: flickerIndex === 0 || flash ? 700 : 400,
                  }}
                  transition={{ delay: 0.2, duration: 0.15 }}
                  className="text-lg text-black px-2 py-1 -mx-2"
                >
                  {context.name}
                </motion.div>
              </motion.div>
            )}

            {context.workingOn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden pt-2 border-t border-black/5"
              >
                <div className="text-xs text-black/50 mb-1 tracking-wide">WORKING ON</div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{
                    x: flickerIndex === 1 ? [0, 1, -1, 0] : 0,
                    opacity: 1,
                    fontWeight: flickerIndex === 1 || flash ? 700 : 400,
                  }}
                  transition={{ delay: 0.2, duration: 0.15 }}
                  className="text-lg text-black px-2 py-1 -mx-2"
                >
                  {context.workingOn}
                </motion.div>
              </motion.div>
            )}

            {context.needsHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden pt-2 border-t border-black/5"
              >
                <div className="text-xs text-black/50 mb-1 tracking-wide">NEEDS HELP WITH</div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{
                    x: flickerIndex === 2 ? [0, 1, -1, 0] : 0,
                    opacity: 1,
                    fontWeight: flickerIndex === 2 || flash ? 700 : 400,
                  }}
                  transition={{ delay: 0.2, duration: 0.15 }}
                  className="text-lg text-black px-2 py-1 -mx-2"
                >
                  {context.needsHelp}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Connection indicator with constant pulse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-black/5"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                backgroundColor: flash ? 'rgb(34, 197, 94)' : 'rgba(34, 197, 94, 0.5)',
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-xs text-black/40">Context preserved</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function InteractiveOnboarding() {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [context, setContext] = useState<ContextData>({});
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const [flashContext, setFlashContext] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [endingPhase, setEndingPhase] = useState<'response' | 'insight' | 'waitlist' | null>(null);
  const { login, authenticated } = usePrivy();

  // Function to call the Evermind API for real AI responses
  const callEvermindAPI = useCallback(async (
    model: string,
    contextData: ContextData
  ): Promise<string> => {
    const modelId = MODEL_IDS[model] || 'openai/gpt-4o';

    // Build the system prompt with context
    const systemPrompt = `You are a helpful AI assistant. You are responding to a user named ${contextData.name} who is working on ${contextData.workingOn} and needs help with ${contextData.needsHelp}.

Keep your response concise (2-3 sentences max), friendly, and directly address their needs. Reference their name and project to show you understand the context.`;

    const userPrompt = `Hi, I'm ${contextData.name}. I'm working on ${contextData.workingOn} and I need help with ${contextData.needsHelp}. Can you give me some quick advice?`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (content) {
        return content;
      }
      throw new Error('No content in response');
    } catch (error) {
      console.error('[ANUMA] API call failed:', error);
      setApiError('demo');
    }

    // Fallback responses when API is not available
    const fallbackResponses: Record<string, string> = {
      'GPT-4': `Great to meet you, ${contextData.name}! For ${contextData.workingOn}, I'd recommend starting with ${contextData.needsHelp} by breaking it down into smaller, manageable milestones. Focus on your core value proposition first.`,
      'Claude': `Hi ${contextData.name}! Working on ${contextData.workingOn} sounds exciting. For ${contextData.needsHelp}, I'd suggest a structured approach: define clear objectives, identify potential blockers early, and iterate quickly. Would you like me to elaborate on any of these?`,
      'Gemini': `Hello ${contextData.name}! ${contextData.workingOn} is a great project. Regarding ${contextData.needsHelp}, I can help you analyze different approaches and find the most efficient path forward. What aspect would you like to explore first?`
    };

    return fallbackResponses[model] || fallbackResponses['GPT-4'];
  }, []);

  useEffect(() => {
    setMessages([{
      role: 'system',
      content: 'Initializing ANUMA...',
      id: 0
    }]);
    setMessageIdCounter(1);

    const timer = setTimeout(() => {
      setMessages([{
        role: 'system',
        content: 'Connection established. Context engine ready.',
        id: 1
      }]);
      setMessageIdCounter(2);

      setTimeout(() => {
        setStep(1);
        setMessages([{
          role: 'assistant',
          content: "Let's start simple. What's your name?",
          model: 'ANUMA',
          id: 2
        }]);
        setMessageIdCounter(3);
      }, 4000);  // Increased from 2000 to give users time to read
    }, 2000);  // Increased from 1500

    return () => clearTimeout(timer);
  }, []);

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput;
    const currentId = messageIdCounter;
    setMessages([{ role: 'user', content: userMessage, id: currentId }]);
    setMessageIdCounter(prev => prev + 1);
    setUserInput('');

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const nextId = messageIdCounter + 1;
      setMessageIdCounter(prev => prev + 1);

      if (step === 1) {
        setContext({ name: userMessage });
        setShowContextPanel(true);

        setTimeout(() => {
          setFlashContext(true);
          setMessages([{
            role: 'assistant',
            content: `Nice to meet you, ${userMessage}. What's something you're working on right now?`,
            model: 'GPT-4',
            id: nextId,
            highlightName: true
          }]);

          setTimeout(() => setFlashContext(false), 2000);
          setStep(2);
        }, 800);

      } else if (step === 2) {
        setContext(prev => ({ ...prev, workingOn: userMessage }));

        setTimeout(() => {
          setFlashContext(true);
          setMessages([{
            role: 'assistant',
            content: `Interesting! What do you need help with for ${userMessage}?`,
            model: 'Claude',
            id: nextId,
            highlightName: true
          }]);

          setTimeout(() => setFlashContext(false), 2000);
          setStep(3);
        }, 800);

      } else if (step === 3 && !showModelPicker) {
        setContext(prev => ({ ...prev, needsHelp: userMessage }));

        setTimeout(() => {
          setShowModelPicker(true);
        }, 800);
      }
    }, 1200 + Math.random() * 800);
  };

  const handleModelSelect = async (model: string) => {
    setSelectedModel(model);
    setShowModelPicker(false);

    const currentId = messageIdCounter;
    setMessages([{
      role: 'user',
      content: `Let me ask ${model}`,
      id: currentId
    }]);
    setMessageIdCounter(prev => prev + 1);

    setIsTyping(true);
    setFlashContext(true);
    setEndingPhase('response');

    try {
      // Get real AI response from the API
      const aiResponse = await callEvermindAPI(model, context);

      setIsTyping(false);
      const nextId = messageIdCounter + 1;
      setMessageIdCounter(prev => prev + 1);

      setMessages([{
        role: 'assistant',
        content: aiResponse,
        model: model,
        id: nextId,
        highlightName: true
      }]);

      // Phase 1: Show response for 3 seconds
      setTimeout(() => {
        setFlashContext(false);
        // Phase 2: Fade out and show insight message
        setEndingPhase('insight');
        setMessages([]);
        setShowContextPanel(false);
      }, 3000);

      // Phase 3: After insight shows for 3 seconds, show waitlist
      setTimeout(() => {
        setEndingPhase('waitlist');
        setStep(4);
      }, 6500);

    } catch (error) {
      console.error('[ANUMA] Error getting AI response:', error);
      setIsTyping(false);
      setFlashContext(false);
      setEndingPhase('waitlist');
      setStep(4);
    }
  };

  const handleJoinWaitlist = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* ANUMA branding */}
        <div className="absolute -top-12 left-0 text-xs tracking-[0.3em] text-black/30">
          ANUMA
        </div>

        <div className="grid lg:grid-cols-[1fr,300px] gap-12 items-start">
          {/* Main conversation area */}
          <div>
            {/* Messages container */}
            <div className="space-y-6 mb-8 min-h-[300px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`${
                      message.role === 'user' ? 'flex justify-end' :
                      message.role === 'system' ? 'flex justify-center' :
                      'flex justify-start'
                    }`}
                  >
                    <div className={`max-w-[85%] ${
                      message.role === 'user' ? 'text-right' :
                      message.role === 'system' ? 'text-center' :
                      'text-left'
                    }`}>
                      {message.model && message.role === 'assistant' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-[10px] tracking-widest text-black/40 mb-2 uppercase"
                        >
                          {message.model}
                        </motion.div>
                      )}
                      <div className={`inline-block ${
                        message.role === 'user'
                          ? 'bg-black text-white px-6 py-4'
                          : message.role === 'system'
                          ? 'text-black/50 text-sm px-4 py-2 border border-black/10'
                          : 'text-black/80 px-6 py-4 bg-black/[0.02]'
                      }`}>
                        {message.role === 'system' && step === 0 ? (
                          <TypedMessage text={message.content} speed={50} />
                        ) : (
                          <p className={message.role === 'system' ? 'text-sm' : 'text-lg'}>
                            {message.highlightName && context.name ? (
                              <>
                                {message.content.split(context.name).map((part, i, arr) => (
                                  <span key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                      <motion.span
                                        animate={{
                                          fontWeight: flashContext ? 700 : 400,
                                        }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        {context.name}
                                      </motion.span>
                                    )}
                                  </span>
                                ))}
                              </>
                            ) : (
                              message.content
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-1.5 px-6 py-4">
                    <motion.div
                      className="w-2 h-2 bg-black/40 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-black/40 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-black/40 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Insight message after response fades */}
              {endingPhase === 'insight' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center items-center h-full"
                >
                  <div className="text-center max-w-lg">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl md:text-3xl leading-relaxed text-black/80"
                    >
                      See how <span className="font-semibold">{selectedModel}</span> understood your context without you repeating it?
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-3xl md:text-4xl font-bold mt-4 text-black"
                    >
                      That&apos;s ANUMA.
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Model picker */}
            {showModelPicker && step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <div className="text-center mb-6">
                  <p className="text-black/60 text-sm">Choose which AI model should help you:</p>
                  <p className="text-black/40 text-xs mt-2 italic">(Context is preserved no matter which one you choose)</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {['GPT-4', 'Claude', 'Gemini'].map((model) => (
                    <motion.button
                      key={model}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleModelSelect(model)}
                      className="p-6 border-2 border-black/10 hover:border-black/40 hover:bg-black/[0.02] transition-all"
                    >
                      <div className="text-lg tracking-wide">{model}</div>
                      <div className="text-xs text-black/40 mt-1">
                        {model === 'GPT-4' && 'OpenAI'}
                        {model === 'Claude' && 'Anthropic'}
                        {model === 'Gemini' && 'Google'}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input area */}
            {step >= 1 && step <= 3 && !showModelPicker && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmitAnswer}
                className="relative"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your answer..."
                  autoFocus
                  className="w-full bg-transparent border-b-2 border-black/10 text-black text-xl py-4 px-0 placeholder:text-black/30 focus:outline-none focus:border-black/60 transition-colors"
                />
                <motion.button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.button>
              </motion.form>
            )}

            {/* Waitlist signup with Privy */}
            {step === 4 && endingPhase === 'waitlist' && !authenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 text-center space-y-6"
              >
                <div>
                  <h2 className="text-4xl mb-3 tracking-tight">Experience this yourself.</h2>
                  <p className="text-black/60">Join the waitlist for early access.</p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <motion.button
                    onClick={handleJoinWaitlist}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-black text-white py-4 text-lg tracking-wide hover:bg-black/90 transition-colors"
                  >
                    Join waitlist
                  </motion.button>

                  <div className="flex justify-center gap-6 text-xs text-black/40 pt-2">
                    <span>No subscriptions</span>
                    <span>•</span>
                    <span>Privacy first</span>
                    <span>•</span>
                    <span>Local storage</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Authenticated state */}
            {step === 4 && endingPhase === 'waitlist' && authenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <span className="text-white text-3xl">✓</span>
                </motion.div>
                <h3 className="text-3xl mb-3 tracking-tight">You&apos;re in, {context.name}.</h3>
                <p className="text-black/60">We&apos;ll be in touch soon.</p>
              </motion.div>
            )}

          </div>

          {/* Context Panel - Right side */}
          {showContextPanel && step < 4 && (
            <ContextPanel context={context} flash={flashContext} />
          )}
        </div>
      </div>
    </div>
  );
}
