"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { ColorPalette, lightSteel, isDarkPalette } from '@/lib/palettes';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralLink: string;
  palette?: ColorPalette;
  paletteId?: string;
}

// Share message variants for variety
const SHARE_MESSAGES = [
  "One memory layer that works across ANY AI model. Switch between GPT, Claude, Gemini - your context follows you:",
  "Why start fresh every time you switch AI models? Cloister.AI keeps your context portable across all of them:",
  "Finally - use any AI model you want and your history follows you. No more context lock-in:",
  "Your AI context shouldn't be trapped in one model. Cloister.AI makes it portable. Join early:",
  "Switching from ChatGPT to Claude? Your conversations and context come with you. This changes everything:",
  "One unified memory across every AI. No more repeating yourself when you switch models:",
];

const SHARE_TITLE = "Cloister.AI - Early Access";

// Get a random share message
const getRandomShareMessage = () => {
  return SHARE_MESSAGES[Math.floor(Math.random() * SHARE_MESSAGES.length)];
};

export default function ShareModal({ isOpen, onClose, referralLink, palette, paletteId = '3' }: ShareModalProps) {
  const colors = palette || lightSteel;
  const isDark = isDarkPalette(paletteId);
  const [copied, setCopied] = useState(false);

  const overlayBg = colors.overlay || (isDark ? 'rgba(12, 12, 12, 0.95)' : 'rgba(248, 249, 250, 0.95)');

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralLink]);

  const shareToX = useCallback(() => {
    const message = getRandomShareMessage();
    const text = encodeURIComponent(`${message}\n\n${referralLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=550,height=420');
  }, [referralLink]);

  const shareToTelegram = useCallback(() => {
    const message = getRandomShareMessage();
    const text = encodeURIComponent(message);
    const url = encodeURIComponent(referralLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  }, [referralLink]);

  const shareToWhatsApp = useCallback(() => {
    const message = getRandomShareMessage();
    const text = encodeURIComponent(`${message}\n\n${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [referralLink]);

  const shareToEmail = useCallback(() => {
    const message = getRandomShareMessage();
    const subject = encodeURIComponent(SHARE_TITLE);
    const body = encodeURIComponent(`${message}\n\n${referralLink}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [referralLink]);

  const shareOptions = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: shareToX,
      color: '#000000',
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      action: shareToTelegram,
      color: '#0088cc',
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      action: shareToWhatsApp,
      color: '#25D366',
    },
    {
      name: 'Email',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      action: shareToEmail,
      color: '#EA4335',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: overlayBg }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 pb-8"
            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar for mobile */}
            <div className="sm:hidden w-10 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: colors.border }} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors"
              style={{ color: colors.textLight }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: colors.bgAlt }}
              >
                <Share2 className="w-6 h-6" style={{ color: colors.accent }} />
              </div>
              <h2 className="text-xl font-medium mb-1" style={{ color: colors.text }}>
                Share & Earn
              </h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Invite friends and earn 200 points per signup
              </p>
            </div>

            {/* Link preview */}
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-6"
              style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
            >
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-transparent text-sm outline-none truncate"
                style={{ color: colors.textMuted }}
              />
              <button
                onClick={copyLink}
                className="p-2 rounded-lg transition-colors flex-shrink-0"
                style={{
                  backgroundColor: colors.accent,
                  color: isDark ? colors.bg : '#ffffff'
                }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Share options grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105"
                  style={{ backgroundColor: colors.bgAlt }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: option.color }}
                  >
                    {option.icon}
                  </div>
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    {option.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
