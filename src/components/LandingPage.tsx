"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyConfig } from '@/providers/PrivyProvider';
import PointsDashboard from './PointsDashboard';

// Inner component that uses Privy hooks
function LandingPageWithPrivy() {
  const [email, setEmail] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { login, authenticated, ready, user } = usePrivy();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    login({
      prefill: {
        type: 'email',
        value: email,
      },
    });
  };

  // Watch for authentication and trigger animation
  useEffect(() => {
    if (authenticated && !showAnimation && user) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [authenticated, user, showAnimation]);

  // Show loading while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show dashboard if authenticated and animation finished
  if (authenticated && !showAnimation && user) {
    return <PointsDashboard email={user.email?.address || email} />;
  }

  return (
    <LandingPageUI
      email={email}
      setEmail={setEmail}
      isHovered={isHovered}
      setIsHovered={setIsHovered}
      showAnimation={showAnimation}
      onSubmit={handleSubmit}
      onLoginClick={login}
    />
  );
}

// Fallback component when Privy is not configured
function LandingPageFallback() {
  const [email, setEmail] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Privy is not configured. Please set NEXT_PUBLIC_PRIVY_APP_ID environment variable.');
  };

  return (
    <LandingPageUI
      email={email}
      setEmail={setEmail}
      isHovered={isHovered}
      setIsHovered={setIsHovered}
      showAnimation={false}
      onSubmit={handleSubmit}
      onLoginClick={() => alert('Privy is not configured. Please set NEXT_PUBLIC_PRIVY_APP_ID environment variable.')}
    />
  );
}

// Main export - checks if Privy is configured
export default function LandingPage() {
  const { isConfigured } = usePrivyConfig();

  if (isConfigured) {
    return <LandingPageWithPrivy />;
  }

  return <LandingPageFallback />;
}

// Shared UI component
interface LandingPageUIProps {
  email: string;
  setEmail: (email: string) => void;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
  showAnimation: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onLoginClick: () => void;
}

function LandingPageUI({
  email,
  setEmail,
  isHovered,
  setIsHovered,
  showAnimation,
  onSubmit,
  onLoginClick,
}: LandingPageUIProps) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-['Space_Grotesk']">
      {/* Film Grain Texture */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Luxury Animation Overlay */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 4 }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-600/40 via-fuchsia-600/40 to-cyan-600/40 rounded-full blur-[150px]" />
            </motion.div>

            <motion.div className="relative z-10 text-center px-6">
              <motion.h2
                className="text-4xl md:text-6xl lg:text-7xl tracking-tight font-[500]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {['You', ' are', ' now', ' ready', ' for', ' the', ' '].map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.3 }}
                    className="text-white/90"
                  >
                    {word}
                  </motion.span>
                ))}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent"
                >
                  Future
                </motion.span>
              </motion.h2>

              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full"
                  style={{ left: '50%', top: '50%' }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i / 30) * Math.PI * 2) * 300,
                    y: Math.sin((i / 30) * Math.PI * 2) * 300,
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 2, delay: 1.5, ease: 'easeOut' }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-violet-600/30 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.3, 1], x: [-50, 50, -50], y: [-30, 30, -30], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-cyan-500/25 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], x: [30, -30, 30], y: [50, -50, 50], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[90px]"
          animate={{ scale: [1, 1.4, 1], x: [40, -40, 40], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border border-white/5" />
          <div className="absolute inset-8 rounded-full border border-white/5" />
          <div className="absolute inset-16 rounded-full border border-white/5" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]"
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
        </motion.div>

        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="hexagons" width="80" height="70" patternUnits="userSpaceOnUse">
                <path d="M20 0 L40 0 L50 17.5 L40 35 L20 35 L10 17.5 Z" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-[600px] origin-bottom"
            style={{
              background: 'linear-gradient(to top, transparent, rgba(139, 92, 246, 0.1), transparent)',
              transform: `rotate(${i * 45}deg)`,
            }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          />
        ))}

        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${Math.random() > 0.5 ? '139, 92, 246' : '6, 182, 212'}, ${Math.random() * 0.5 + 0.3})`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${Math.random() > 0.5 ? '139, 92, 246' : '6, 182, 212'}, 0.5)`,
            }}
            animate={{
              y: [0, -50 - Math.random() * 100, 0],
              x: [-20 + Math.random() * 40, 20 - Math.random() * 40, -20 + Math.random() * 40],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.div
              className="relative w-9 h-9"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-lg blur-sm" />
              <div className="absolute inset-[2px] bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </motion.div>
            <span className="text-xl text-white tracking-[0.02em] font-[500] uppercase">Pop AI</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            onClick={onLoginClick}
            className="px-5 py-2 text-xs text-white/50 hover:text-white transition-colors uppercase tracking-[0.15em] border border-white/10 rounded-full backdrop-blur-sm"
          >
            Access
          </motion.button>
        </nav>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 px-6 pt-12 pb-24">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-white/[0.03] to-white/[0.08] border border-white/20 backdrop-blur-md mb-8 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
          >
            <motion.div className="relative" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping" />
            </motion.div>
            <span className="text-xs text-white/80 uppercase tracking-[0.2em] font-[450]">Frontier Access Portal</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-7xl md:text-8xl lg:text-9xl tracking-[-0.02em] mb-4 font-[600] leading-[0.9]">
              <span className="block text-white/90 mb-2">Beyond</span>
              <span className="block relative inline-block">
                <span className="relative bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  Intelligence
                </span>
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20 blur-3xl -z-10"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
            </h1>
            <motion.div
              className="flex items-center justify-center gap-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-white/30 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-16 tracking-wide leading-relaxed font-[350]"
          >
            An unprecedented convergence of consciousness and computation.
            <br />
            <span className="text-white/60">Early initiates gain priority access and elevated standing.</span>
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            onSubmit={onSubmit}
            className="max-w-lg mx-auto mb-6"
          >
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-cyan-500/50 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
              <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-2 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all backdrop-blur-sm font-[350] tracking-wide"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <motion.button
                  type="submit"
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(139,92,246,0.6)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                  />
                  <motion.div
                    className="absolute inset-0 opacity-50"
                    animate={{
                      background: [
                        'linear-gradient(0deg, transparent, rgba(255,255,255,0.2), transparent)',
                        'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="relative flex items-center gap-2 text-white whitespace-nowrap uppercase tracking-[0.1em] text-sm font-[500]">
                    Initiate
                    <motion.div animate={{ x: isHovered ? 3 : 0 }} transition={{ duration: 0.2 }}>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xs text-white/30 uppercase tracking-[0.15em] mb-20 font-[350]"
          >
            Priority access • Elevated status • Founding member privileges
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center justify-center gap-16 text-sm flex-wrap"
          >
            <div className="flex flex-col gap-2 items-center">
              <div className="relative">
                <span className="block text-3xl text-white font-[450] tracking-tight">12,847</span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-white/30 uppercase tracking-[0.15em] text-[10px] font-[350]">Initiated</span>
            </div>

            <div className="hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            <div className="flex flex-col gap-2 items-center">
              <div className="relative">
                <span className="block text-3xl text-white font-[450] tracking-tight">∞</span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </div>
              <span className="text-white/30 uppercase tracking-[0.15em] text-[10px] font-[350]">Frontiers</span>
            </div>

            <div className="hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            <div className="flex flex-col gap-2 items-center">
              <div className="relative">
                <span className="block text-3xl text-white font-[450] tracking-tight">Genesis</span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
              </div>
              <span className="text-white/30 uppercase tracking-[0.15em] text-[10px] font-[350]">Phase Active</span>
            </div>
          </motion.div>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />
    </div>
  );
}
