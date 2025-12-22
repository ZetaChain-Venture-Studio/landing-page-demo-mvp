"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { ColorPalette, lightSteel, isDarkPalette } from '@/lib/palettes';

interface LiveSignupCounterProps {
  palette?: ColorPalette;
  paletteId?: string;
}

export default function LiveSignupCounter({ palette, paletteId = '3' }: LiveSignupCounterProps) {
  const colors = palette || lightSteel;
  const isDark = isDarkPalette(paletteId);

  // Start with a random number between 40-80
  const [count, setCount] = useState(() => Math.floor(Math.random() * 40) + 40);
  const [isAnimating, setIsAnimating] = useState(false);
  const [increment, setIncrement] = useState(0);

  useEffect(() => {
    // Increment randomly every 3-8 seconds
    const interval = setInterval(() => {
      const newIncrement = Math.floor(Math.random() * 3) + 1; // 1-3 new signups
      setIncrement(newIncrement);
      setIsAnimating(true);

      setCount(prev => {
        // Keep it between 40-150 for realism
        const newCount = prev + newIncrement;
        return newCount > 150 ? Math.floor(Math.random() * 40) + 60 : newCount;
      });

      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 2000);
    }, Math.random() * 5000 + 3000); // Random interval 3-8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
      style={{
        backgroundColor: isDark ? colors.bgAlt : colors.bgAlt,
        border: `1px solid ${colors.border}`
      }}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: colors.success }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: colors.success }}
        />
      </span>

      {/* Counter */}
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" style={{ color: colors.textMuted }} />
        <motion.span
          key={count}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-sm font-medium tabular-nums"
          style={{ color: colors.text }}
        >
          {count}
        </motion.span>
        <span className="text-sm" style={{ color: colors.textMuted }}>
          joined today
        </span>
      </div>

      {/* +N indicator when incrementing */}
      <AnimatePresence>
        {isAnimating && (
          <motion.span
            initial={{ opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.8 }}
            className="text-xs font-medium"
            style={{ color: colors.success }}
          >
            +{increment}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
