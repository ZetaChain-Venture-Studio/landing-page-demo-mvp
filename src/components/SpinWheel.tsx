"use client";

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift } from 'lucide-react';

// Wheel segments with points and probabilities
// Probabilities should add up to 100
const WHEEL_SEGMENTS = [
  { points: 10, color: '#8B5CF6', probability: 25, label: '10' },      // Violet - 25%
  { points: 25, color: '#EC4899', probability: 20, label: '25' },      // Pink - 20%
  { points: 50, color: '#06B6D4', probability: 20, label: '50' },      // Cyan - 20%
  { points: 100, color: '#10B981', probability: 15, label: '100' },    // Emerald - 15%
  { points: 200, color: '#F59E0B', probability: 10, label: '200' },    // Amber - 10%
  { points: 500, color: '#EF4444', probability: 7, label: '500' },     // Red - 7%
  { points: 1000, color: '#8B5CF6', probability: 3, label: '1K' },     // Violet - 3%
];

interface SpinWheelProps {
  onSpinComplete?: (points: number) => void;
  disabled?: boolean;
  spinsRemaining?: number;
}

export default function SpinWheel({ onSpinComplete, disabled = false, spinsRemaining = 1 }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPoints, setWonPoints] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Get winning segment based on probabilities
  const getWinningSegment = useCallback(() => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
      cumulative += WHEEL_SEGMENTS[i].probability;
      if (random <= cumulative) {
        return i;
      }
    }
    return 0; // Fallback
  }, []);

  // Calculate angle for each segment
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  // Spin the wheel
  const spinWheel = useCallback(() => {
    if (isSpinning || disabled || spinsRemaining <= 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setWonPoints(null);

    // Determine winning segment
    const winningIndex = getWinningSegment();
    const winningSegment = WHEEL_SEGMENTS[winningIndex];

    // Calculate target rotation
    // We want the pointer (at top) to land on the winning segment
    // Add multiple full rotations for dramatic effect
    const fullRotations = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const segmentCenter = winningIndex * segmentAngle + segmentAngle / 2;
    // Pointer is at top (0°), so we need to rotate to bring segment to top
    // Subtract from 360 and add small random offset within segment
    const offset = (Math.random() - 0.5) * (segmentAngle * 0.6); // Random offset within segment
    const targetAngle = 360 - segmentCenter + offset;
    const totalRotation = rotation + (fullRotations * 360) + targetAngle;

    setRotation(totalRotation);

    // Wait for spin to complete then show result
    setTimeout(() => {
      setIsSpinning(false);
      setWonPoints(winningSegment.points);
      setShowResult(true);

      // Callback with points
      if (onSpinComplete) {
        onSpinComplete(winningSegment.points);
      }
    }, 5000); // Match animation duration
  }, [isSpinning, disabled, spinsRemaining, rotation, getWinningSegment, segmentAngle, onSpinComplete]);

  // Create wheel SVG path for each segment
  const createSegmentPath = (index: number) => {
    const startAngle = index * segmentAngle - 90; // Start from top
    const endAngle = startAngle + segmentAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const radius = 140;
    const centerX = 150;
    const centerY = 150;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = segmentAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Calculate text position for each segment
  const getTextPosition = (index: number) => {
    const angle = index * segmentAngle + segmentAngle / 2 - 90;
    const rad = (angle * Math.PI) / 180;
    const radius = 90;
    return {
      x: 150 + radius * Math.cos(rad),
      y: 150 + radius * Math.sin(rad),
      rotation: angle + 90,
    };
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-cyan-500/30 rounded-full blur-2xl scale-110" />

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-white drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="relative w-[300px] h-[300px]"
          animate={{ rotate: rotation }}
          transition={{
            duration: 5,
            ease: [0.2, 0.8, 0.2, 1], // Custom easing for realistic spin
          }}
        >
          <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl">
            {/* Outer ring */}
            <circle cx="150" cy="150" r="148" fill="none" stroke="white" strokeWidth="4" opacity="0.3" />

            {/* Segments */}
            {WHEEL_SEGMENTS.map((segment, index) => (
              <g key={index}>
                <path
                  d={createSegmentPath(index)}
                  fill={segment.color}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
                {/* Segment text */}
                <text
                  x={getTextPosition(index).x}
                  y={getTextPosition(index).y}
                  fill="white"
                  fontSize="20"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${getTextPosition(index).rotation}, ${getTextPosition(index).x}, ${getTextPosition(index).y})`}
                  className="font-['Space_Grotesk']"
                >
                  {segment.label}
                </text>
              </g>
            ))}

            {/* Center circle */}
            <circle cx="150" cy="150" r="30" fill="#1a1a2e" stroke="white" strokeWidth="3" />
            <circle cx="150" cy="150" r="20" fill="url(#centerGradient)" />

            {/* Center gradient */}
            <defs>
              <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Decorative lights around wheel */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-white"
            style={{
              top: `${50 + 48 * Math.sin((i * Math.PI * 2) / 12)}%`,
              left: `${50 + 48 * Math.cos((i * Math.PI * 2) / 12)}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              opacity: isSpinning ? [0.3, 1, 0.3] : 0.5,
              scale: isSpinning ? [1, 1.3, 1] : 1,
            }}
            transition={{
              duration: 0.3,
              repeat: isSpinning ? Infinity : 0,
              delay: i * 0.05,
            }}
          />
        ))}
      </div>

      {/* Spin Button */}
      <motion.button
        onClick={spinWheel}
        disabled={isSpinning || disabled || spinsRemaining <= 0}
        className={`mt-8 px-8 py-4 rounded-2xl text-white font-[600] uppercase tracking-wider text-lg flex items-center gap-3 transition-all ${
          isSpinning || disabled || spinsRemaining <= 0
            ? 'bg-gray-600 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]'
        }`}
        whileHover={!isSpinning && !disabled && spinsRemaining > 0 ? { scale: 1.05 } : {}}
        whileTap={!isSpinning && !disabled && spinsRemaining > 0 ? { scale: 0.95 } : {}}
      >
        {isSpinning ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Spinning...</span>
          </>
        ) : (
          <>
            <Gift className="w-5 h-5" />
            <span>Spin to Win!</span>
          </>
        )}
      </motion.button>

      {spinsRemaining > 0 && !isSpinning && (
        <p className="mt-3 text-white/40 text-sm">
          {spinsRemaining} spin{spinsRemaining !== 1 ? 's' : ''} remaining
        </p>
      )}

      {/* Result Popup */}
      <AnimatePresence>
        {showResult && wonPoints !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-30"
          >
            <motion.div
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-[600] text-white mb-2">Congratulations!</h3>
              <p className="text-white/60 mb-4">You won</p>
              <motion.div
                className="text-5xl font-[700] bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3, repeat: 2 }}
              >
                +{wonPoints}
              </motion.div>
              <p className="text-white/40 mt-2">points</p>

              <motion.button
                onClick={() => setShowResult(false)}
                className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
