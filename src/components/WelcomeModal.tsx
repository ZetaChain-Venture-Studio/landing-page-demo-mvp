"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Gift, PartyPopper, Check } from 'lucide-react';
import { ColorPalette, isDarkPalette } from '@/lib/palettes';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  ruleName?: string;
  palette: ColorPalette;
  paletteId: string;
}

export default function WelcomeModal({ 
  isOpen, 
  onClose, 
  points, 
  ruleName,
  palette, 
  paletteId 
}: WelcomeModalProps) {
  const isDark = isDarkPalette(paletteId);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countedPoints, setCountedPoints] = useState(0);

  // Animación de conteo de puntos
  useEffect(() => {
    if (isOpen && points > 0) {
      setShowConfetti(true);
      
      // Animar conteo de puntos
      const duration = 1500; // 1.5 segundos
      const steps = 30;
      const increment = points / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= points) {
          setCountedPoints(points);
          clearInterval(timer);
        } else {
          setCountedPoints(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isOpen, points]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setCountedPoints(0);
      setShowConfetti(false);
    }
  }, [isOpen]);

  const overlayBg = palette.overlay || (isDark ? 'rgba(12, 12, 12, 0.95)' : 'rgba(248, 249, 250, 0.95)');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: overlayBg }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              delay: 0.1 
            }}
            className="relative max-w-md w-full rounded-2xl overflow-hidden"
            style={{ 
              backgroundColor: palette.bg, 
              border: `1px solid ${palette.border}`,
              boxShadow: isDark 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti animado */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      y: -20, 
                      x: Math.random() * 100 - 50 + '%',
                      opacity: 1,
                      scale: Math.random() * 0.5 + 0.5,
                      rotate: 0
                    }}
                    animate={{ 
                      y: '120%',
                      opacity: 0,
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: Math.random() * 2 + 1.5,
                      delay: Math.random() * 0.5,
                      ease: 'linear'
                    }}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{ 
                      left: `${Math.random() * 100}%`,
                      backgroundColor: [
                        palette.accent,
                        palette.success,
                        '#FFD700',
                        '#FF6B6B',
                        '#4ECDC4'
                      ][Math.floor(Math.random() * 5)]
                    }}
                  />
                ))}
              </div>
            )}

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:opacity-70 z-10"
              style={{ color: palette.textLight }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header con gradiente */}
            <div 
              className="relative px-8 pt-12 pb-8 text-center"
              style={{
                background: isDark 
                  ? `linear-gradient(180deg, ${palette.accent}15 0%, transparent 100%)`
                  : `linear-gradient(180deg, ${palette.accent}10 0%, transparent 100%)`
              }}
            >
              {/* Icono animado */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  damping: 15, 
                  stiffness: 200,
                  delay: 0.2 
                }}
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: `${palette.accent}20`,
                  border: `2px solid ${palette.accent}40`
                }}
              >
                <Gift className="w-10 h-10" style={{ color: palette.accent }} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PartyPopper className="w-5 h-5" style={{ color: palette.accent }} />
                  <h2 
                    className="text-2xl font-semibold"
                    style={{ color: palette.text }}
                  >
                    Welcome to Anuma!
                  </h2>
                  <PartyPopper className="w-5 h-5" style={{ color: palette.accent }} />
                </div>

                <p 
                  className="text-sm"
                  style={{ color: palette.textMuted }}
                >
                  You&apos;ve joined the waitlist
                </p>
              </motion.div>
            </div>

            {/* Puntos */}
            <div className="px-8 pb-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-xl text-center mb-6"
                style={{ 
                  backgroundColor: palette.bgAlt,
                  border: `1px solid ${palette.border}`
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" style={{ color: palette.accent }} />
                  <span 
                    className="text-xs uppercase tracking-widest"
                    style={{ color: palette.textLight }}
                  >
                    Welcome Bonus
                  </span>
                  <Sparkles className="w-5 h-5" style={{ color: palette.accent }} />
                </div>

                <motion.div
                  className="text-5xl font-bold mb-2"
                  style={{ color: palette.accent }}
                >
                  +{countedPoints.toLocaleString()}
                </motion.div>

                <p 
                  className="text-sm"
                  style={{ color: palette.textMuted }}
                >
                  AI Credits earned
                </p>

                {ruleName && (
                  <div 
                    className="mt-3 pt-3 flex items-center justify-center gap-2"
                    style={{ borderTop: `1px solid ${palette.border}` }}
                  >
                    <Check className="w-4 h-4" style={{ color: palette.success }} />
                    <span className="text-xs" style={{ color: palette.textLight }}>
                      {ruleName}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Mensaje motivacional */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-sm mb-6"
                style={{ color: palette.textMuted }}
              >
                Complete more tasks to earn additional credits and get priority access!
              </motion.p>

              {/* Botón para continuar */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className="w-full py-4 rounded-xl font-medium text-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: palette.accent,
                  color: isDark ? palette.bg : '#ffffff'
                }}
              >
                Start Earning
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

