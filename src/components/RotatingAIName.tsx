"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ColorPalette, lightSteel, isDarkPalette } from '@/lib/palettes';

const AI_MODELS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Llama',
  'Mistral',
  'Grok',
];

interface RotatingAINameProps {
  palette?: ColorPalette;
  paletteId?: string;
}

export default function RotatingAIName({ palette, paletteId = '3' }: RotatingAINameProps) {
  const colors = palette || lightSteel;
  const isDark = isDarkPalette(paletteId);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AI_MODELS.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="inline-block relative"
      style={{
        minWidth: '140px',
        height: '1.4em',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={AI_MODELS[currentIndex]}
          initial={{ y: 15, opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -15, opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center justify-center px-4 py-1 rounded-full font-medium whitespace-nowrap"
          style={{
            backgroundColor: colors.bgAlt,
            border: `1px solid ${colors.border}`,
            color: colors.accent,
          }}
        >
          {AI_MODELS[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
