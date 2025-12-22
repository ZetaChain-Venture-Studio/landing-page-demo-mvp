"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AI_MODELS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Llama',
  'Mistral',
  'Grok',
];

interface RotatingAINameProps {
  color: string;
}

export default function RotatingAIName({ color }: RotatingAINameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AI_MODELS.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative" style={{ minWidth: '200px' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={AI_MODELS[currentIndex]}
          initial={{ y: 20, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -20, opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-block"
          style={{ color }}
        >
          {AI_MODELS[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
