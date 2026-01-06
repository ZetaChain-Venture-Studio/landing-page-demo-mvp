"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import posthog from 'posthog-js';

// Typing animation component
function TypeWriter({
  text,
  onComplete,
  speed = 40,
  className = ""
}: {
  text: string;
  onComplete?: () => void;
  speed?: number;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      const completeTimeout = setTimeout(onComplete, 800);
      return () => clearTimeout(completeTimeout);
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

// Flow states
type FlowState =
  | 'welcome'
  | 'intro'
  | 'question1'
  | 'question1_response'
  | 'question2'
  | 'question2_response'
  | 'question3'
  | 'question3_response'
  | 'rejected'
  | 'email_request'
  | 'email_input'
  | 'post_email'
  | 'tasks_response'
  | 'goodbye'
  | 'redirect_dashboard';

// Content for each state
const CONTENT = {
  welcome: "Hello. We're glad you're here.",
  intro: "We've been working on something we'd like to share with you.",
  question1: "We believe privacy is a fundamental human right. No corporation or government should profit from your personal data without your consent.",
  question2: "We believe AI tools have the power to help us reach our highest potential. They should be accessible to everyone, not just the privileged few.",
  question3: "We believe AI should understand you deeply—remember your thoughts, adapt to your needs, and grow alongside you over time.",
  rejected: "It seems what we're building might not align with your values. Thank you for your time. We wish you well.",
  email_request: "We're creating something that could be a perfect fit for you. We're rolling this out exclusively to early adopters who share our vision.",
  email_prompt: "Would you like to be among the first to experience it?",
  post_email: "Thank you. We'll reach out when it's ready. Right now, we're looking for our most aligned early supporters—people who can help us spread the word.",
  tasks_question: "Would you like to complete a few simple tasks to increase your chances of early access?",
  goodbye: "No problem at all. Thank you for joining us. We'll be in touch soon.",
};

export default function VideoIntro() {
  const router = useRouter();
  const { login, authenticated, ready, user } = usePrivy();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [flowState, setFlowState] = useState<FlowState>('welcome');
  const [showButtons, setShowButtons] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(2847);
  const [musicStarted, setMusicStarted] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);

  const walletCreated = user?.wallet?.address;

  // Animate waitlist counter
  useEffect(() => {
    const interval = setInterval(() => {
      setWaitlistCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Start music on first interaction
  const startMusic = useCallback(() => {
    if (!musicStarted && audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        // Autoplay blocked, will play on next interaction
      });
      setMusicStarted(true);
    }
  }, [musicStarted]);

  // Handle state transitions
  const handleTypingComplete = useCallback(() => {
    setTypingComplete(true);

    switch (flowState) {
      case 'welcome':
        setTimeout(() => {
          setTypingComplete(false);
          setFlowState('intro');
        }, 1500);
        break;
      case 'intro':
        setTimeout(() => {
          setTypingComplete(false);
          setFlowState('question1');
        }, 1500);
        break;
      case 'question1':
      case 'question2':
      case 'question3':
        setTimeout(() => setShowButtons(true), 1000);
        break;
      case 'rejected':
      case 'goodbye':
        // End states - do nothing
        break;
      case 'email_request':
        setTimeout(() => {
          setTypingComplete(false);
          setFlowState('email_input');
        }, 1500);
        break;
      case 'post_email':
        setTimeout(() => setShowButtons(true), 1000);
        break;
    }
  }, [flowState]);

  // Handle yes/no responses
  const handleResponse = useCallback((answer: 'yes' | 'no') => {
    startMusic();
    setShowButtons(false);
    setTypingComplete(false);

    if (answer === 'no') {
      setFlowState('rejected');
      return;
    }

    // Progress through questions
    switch (flowState) {
      case 'question1':
        setFlowState('question1_response');
        setTimeout(() => {
          setFlowState('question2');
        }, 500);
        break;
      case 'question2':
        setFlowState('question2_response');
        setTimeout(() => {
          setFlowState('question3');
        }, 500);
        break;
      case 'question3':
        setFlowState('question3_response');
        setTimeout(() => {
          setFlowState('email_request');
        }, 500);
        break;
      case 'post_email':
        setFlowState('tasks_response');
        setTimeout(() => {
          setFlowState('redirect_dashboard');
        }, 500);
        break;
    }
  }, [flowState, startMusic]);

  // Handle tasks response
  const handleTasksResponse = useCallback((answer: 'yes' | 'no') => {
    setShowButtons(false);
    setTypingComplete(false);

    if (answer === 'no') {
      setFlowState('goodbye');
    } else {
      // Mark as new signup and redirect to dashboard
      if (typeof window !== 'undefined') {
        localStorage.setItem('anuma_new_signup', 'true');
      }
      router.push('/dashboard');
    }
  }, [router]);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    startMusic();
    setIsSubmitting(true);

    // Mark as new signup for welcome popup
    if (typeof window !== 'undefined') {
      localStorage.setItem('anuma_new_signup', 'true');
    }

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      posthog.capture('waitlist_signup', {
        page: 'video_intro',
        email_domain: email.split('@')[1],
      });

      // Trigger Privy login
      login({ prefill: { type: 'email', value: email } });
    } catch (error) {
      console.error('Error saving user:', error);
      login({ prefill: { type: 'email', value: email } });
    }
  };

  // After Privy auth, move to post-email state
  useEffect(() => {
    if (authenticated && walletCreated && flowState === 'email_input') {
      setFlowState('post_email');
      setTypingComplete(false);
    }
  }, [authenticated, walletCreated, flowState]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (ready && authenticated && walletCreated && flowState === 'redirect_dashboard') {
      router.push('/dashboard');
    }
  }, [ready, authenticated, walletCreated, flowState, router]);

  // Get current content based on state
  const getCurrentContent = () => {
    switch (flowState) {
      case 'welcome':
        return CONTENT.welcome;
      case 'intro':
        return CONTENT.intro;
      case 'question1':
        return CONTENT.question1;
      case 'question2':
        return CONTENT.question2;
      case 'question3':
        return CONTENT.question3;
      case 'rejected':
        return CONTENT.rejected;
      case 'email_request':
        return CONTENT.email_request;
      case 'email_input':
        return CONTENT.email_prompt;
      case 'post_email':
        return CONTENT.post_email + " " + CONTENT.tasks_question;
      case 'goodbye':
        return CONTENT.goodbye;
      default:
        return '';
    }
  };

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1c1917] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fafaf9] relative overflow-hidden"
      onClick={startMusic}
    >
      {/* Background ambient music */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3"
      />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="mb-16"
          >
            <span className="text-sm tracking-[0.3em] text-[#a8a29e] uppercase">Anuma</span>
          </motion.div>

          {/* Main text area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="min-h-[200px] flex flex-col items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={flowState}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="text-xl md:text-2xl lg:text-3xl text-[#1c1917] leading-relaxed font-light"
              >
                {flowState !== 'email_input' && flowState !== 'redirect_dashboard' && (
                  <TypeWriter
                    text={getCurrentContent()}
                    onComplete={handleTypingComplete}
                    speed={45}
                  />
                )}

                {/* Email input form */}
                {flowState === 'email_input' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-8"
                  >
                    <p className="text-xl md:text-2xl text-[#1c1917] font-light">
                      {CONTENT.email_prompt}
                    </p>

                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        autoFocus
                        className="w-full max-w-md mx-auto block px-6 py-4 bg-transparent border-b-2 border-[#d6d3d1] text-[#1c1917] text-center text-lg placeholder:text-[#a8a29e] focus:outline-none focus:border-[#1c1917] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="px-12 py-4 bg-[#1c1917] text-white text-sm tracking-wider uppercase hover:bg-[#292524] transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Joining...' : 'Join the waitlist'}
                      </button>
                    </form>

                    {/* Waitlist counter */}
                    <p className="text-sm text-[#a8a29e]">
                      {waitlistCount.toLocaleString()} people are already waiting
                    </p>
                  </motion.div>
                )}

                {/* Redirect loading */}
                {flowState === 'redirect_dashboard' && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1c1917] border-t-transparent"></div>
                    <p className="text-[#78716c]">Preparing your experience...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Yes/No buttons */}
          <AnimatePresence>
            {showButtons && (flowState === 'question1' || flowState === 'question2' || flowState === 'question3') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="mt-16 space-y-4"
              >
                <p className="text-sm text-[#78716c] mb-6">Do you agree?</p>
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={() => handleResponse('yes')}
                    className="px-10 py-3 border border-[#1c1917] text-[#1c1917] text-sm tracking-wider uppercase hover:bg-[#1c1917] hover:text-white transition-all duration-300"
                  >
                    Yes, I do
                  </button>
                  <button
                    onClick={() => handleResponse('no')}
                    className="px-10 py-3 border border-[#d6d3d1] text-[#78716c] text-sm tracking-wider uppercase hover:border-[#78716c] transition-all duration-300"
                  >
                    No, sorry
                  </button>
                </div>
              </motion.div>
            )}

            {/* Tasks yes/no buttons */}
            {showButtons && flowState === 'post_email' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="mt-16 space-y-4"
              >
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={() => handleTasksResponse('yes')}
                    className="px-10 py-3 border border-[#1c1917] text-[#1c1917] text-sm tracking-wider uppercase hover:bg-[#1c1917] hover:text-white transition-all duration-300"
                  >
                    Yes, I&apos;d like that
                  </button>
                  <button
                    onClick={() => handleTasksResponse('no')}
                    className="px-10 py-3 border border-[#d6d3d1] text-[#78716c] text-sm tracking-wider uppercase hover:border-[#78716c] transition-all duration-300"
                  >
                    No, thank you
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-[#a8a29e]">
          Quiet by design
        </p>
      </div>
    </div>
  );
}
