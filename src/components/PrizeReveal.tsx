"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Aman-inspired uber-luxury palette
const colors = {
  bg: '#F7F5F0',           // Warm Linen
  bgAlt: '#EDE9E1',        // Soft Sand
  text: '#2C2926',         // Charcoal Teak
  textMuted: '#5C534A',    // Warm Stone
  textLight: '#8A7F72',    // Desert Sand
  accent: '#6B5344',       // Burnished Bronze
  accentLight: '#C4B8A8',  // River Stone
  border: '#D8D0C4',       // Sandstone
};

// Prize tiers with probabilities (should add up to 100)
const PRIZE_TIERS = [
  { points: 10, probability: 25, label: '10', tier: 'common' },
  { points: 25, probability: 20, label: '25', tier: 'common' },
  { points: 50, probability: 20, label: '50', tier: 'uncommon' },
  { points: 100, probability: 15, label: '100', tier: 'uncommon' },
  { points: 200, probability: 10, label: '200', tier: 'rare' },
  { points: 500, probability: 7, label: '500', tier: 'rare' },
  { points: 1000, probability: 3, label: '1,000', tier: 'legendary' },
];

interface PrizeRevealProps {
  onRevealComplete?: (points: number) => void;
  disabled?: boolean;
  revealsRemaining?: number;
}

export default function PrizeReveal({ onRevealComplete, disabled = false, revealsRemaining = 1 }: PrizeRevealProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealPhase, setRevealPhase] = useState<'idle' | 'opening' | 'revealed'>('idle');
  const [wonPrize, setWonPrize] = useState<typeof PRIZE_TIERS[0] | null>(null);

  // Get winning prize based on probabilities
  const getWinningPrize = useCallback(() => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const prize of PRIZE_TIERS) {
      cumulative += prize.probability;
      if (random <= cumulative) {
        return prize;
      }
    }
    return PRIZE_TIERS[0];
  }, []);

  const startReveal = useCallback(() => {
    if (isRevealing || disabled || revealsRemaining <= 0) return;

    setIsRevealing(true);
    setRevealPhase('opening');

    // Determine prize
    const prize = getWinningPrize();

    // Opening animation duration
    setTimeout(() => {
      setWonPrize(prize);
      setRevealPhase('revealed');

      // Callback with points
      if (onRevealComplete) {
        onRevealComplete(prize.points);
      }

      // Reset after viewing
      setTimeout(() => {
        setIsRevealing(false);
      }, 100);
    }, 2500);
  }, [isRevealing, disabled, revealsRemaining, getWinningPrize, onRevealComplete]);

  const closeReveal = () => {
    setRevealPhase('idle');
    setWonPrize(null);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Reveal Button */}
      <motion.button
        onClick={startReveal}
        disabled={isRevealing || disabled || revealsRemaining <= 0}
        className="relative group"
        whileHover={!isRevealing && !disabled && revealsRemaining > 0 ? { scale: 1.02 } : {}}
        whileTap={!isRevealing && !disabled && revealsRemaining > 0 ? { scale: 0.98 } : {}}
      >
        {/* The "mind" container */}
        <div
          className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
            isRevealing ? 'scale-110' : ''
          }`}
          style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{ border: `1px solid ${colors.border}` }}
            animate={isRevealing ? { scale: [1, 1.1, 1], opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 1, repeat: isRevealing ? Infinity : 0 }}
          />

          {/* Inner content */}
          <div className="relative z-10 text-center">
            {!isRevealing ? (
              <>
                <motion.div
                  className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.accent }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </motion.div>
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  Reveal
                </span>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                {/* Pulsing orb during reveal */}
                <motion.div
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: colors.accent }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            )}
          </div>

          {/* Particles during reveal */}
          <AnimatePresence>
            {isRevealing && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: i % 2 === 0 ? colors.accent : colors.accentLight,
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 0.5],
                      x: Math.cos((i / 12) * Math.PI * 2) * 80,
                      y: Math.sin((i / 12) * Math.PI * 2) * 80,
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Status text */}
      <p className="mt-4 text-sm" style={{ color: colors.textLight }}>
        {revealsRemaining > 0 && !isRevealing
          ? `${revealsRemaining} reveal${revealsRemaining !== 1 ? 's' : ''} available`
          : revealsRemaining <= 0
          ? 'No reveals remaining'
          : 'Opening...'}
      </p>

      {/* Prize Reveal Modal */}
      <AnimatePresence>
        {revealPhase === 'revealed' && wonPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(250, 249, 246, 0.95)' }}
            onClick={closeReveal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-sm w-full p-8 rounded-2xl text-center"
              style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-12 h-px mx-auto mb-6"
                style={{ backgroundColor: colors.accent }}
              />

              {/* Prize amount */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm uppercase tracking-widest mb-2" style={{ color: colors.textLight }}>
                  You received
                </p>
                <motion.h2
                  className="text-6xl font-light tracking-tight mb-2"
                  style={{ color: colors.text }}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', damping: 15 }}
                >
                  +{wonPrize.label}
                </motion.h2>
                <p className="text-lg" style={{ color: colors.textMuted }}>
                  points
                </p>
              </motion.div>

              {/* Tier indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      wonPrize.tier === 'legendary'
                        ? '#D4AF37'
                        : wonPrize.tier === 'rare'
                        ? colors.accent
                        : colors.textLight,
                  }}
                />
                <span className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
                  {wonPrize.tier}
                </span>
              </motion.div>

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={closeReveal}
                className="mt-8 px-6 py-3 text-sm font-medium rounded-xl transition-all"
                style={{
                  backgroundColor: colors.accent,
                  color: 'white',
                }}
              >
                Continue
              </motion.button>

              {/* Subtle particles in background */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: colors.accent,
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    opacity: [0, 0.5, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
