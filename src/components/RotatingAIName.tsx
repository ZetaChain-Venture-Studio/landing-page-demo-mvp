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
    }, 1800); // 10% faster - 1.8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        width: '220px', // Fixed width to prevent layout shift
        height: '1.2em',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={AI_MODELS[currentIndex]}
          initial={{ y: 15, opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -15, opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="inline-flex items-center justify-center px-4 py-1 rounded-lg font-medium"
          style={{
            backgroundColor: colors.accent,
            color: isDark ? colors.bg : '#ffffff',
          }}
        >
          {AI_MODELS[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
