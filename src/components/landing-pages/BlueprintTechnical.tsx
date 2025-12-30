"use client";

import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';

// Design - ANUMA Landing Page Design - Blueprint/technical beige style

function BlueprintBackground() {
  return (
    <div className="absolute inset-0 opacity-10">
      {/* Blueprint grid */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#3a3a3a"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
          <pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#grid)" />
            <path
              d="M 200 0 L 0 0 0 200"
              fill="none"
              stroke="#3a3a3a"
              strokeWidth="1"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-major)" />
      </svg>

      {/* Technical measurement lines */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-[#3a3a3a] opacity-20">
        <div className="absolute right-12 -top-3 text-xs font-mono">─────────</div>
      </div>
      <div className="absolute top-3/4 left-0 w-full h-px bg-[#3a3a3a] opacity-20">
        <div className="absolute left-12 -top-3 text-xs font-mono">─────────</div>
      </div>
      <div className="absolute top-0 left-1/4 h-full w-px bg-[#3a3a3a] opacity-20"></div>
      <div className="absolute top-0 right-1/4 h-full w-px bg-[#3a3a3a] opacity-20"></div>

      {/* Corner brackets */}
      <svg className="absolute top-8 left-8 w-12 h-12" viewBox="0 0 48 48">
        <path d="M 0 12 L 0 0 L 12 0" fill="none" stroke="#3a3a3a" strokeWidth="1" />
      </svg>
      <svg className="absolute top-8 right-8 w-12 h-12" viewBox="0 0 48 48">
        <path d="M 48 12 L 48 0 L 36 0" fill="none" stroke="#3a3a3a" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-8 left-8 w-12 h-12" viewBox="0 0 48 48">
        <path d="M 0 36 L 0 48 L 12 48" fill="none" stroke="#3a3a3a" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-8 right-8 w-12 h-12" viewBox="0 0 48 48">
        <path d="M 48 36 L 48 48 L 36 48" fill="none" stroke="#3a3a3a" strokeWidth="1" />
      </svg>
    </div>
  );
}

function TechnicalDiagram() {
  const flowCycle = 6;

  return (
    <div className="relative w-full max-w-2xl mx-auto h-48 flex items-center justify-center">
      {/* Central node - ANUMA */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Pulsing outer ring */}
        <motion.div
          className="absolute inset-0 w-24 h-24 border-2 border-[#3a3a3a]"
          animate={{
            scale: [1, 1.2, 1, 1, 1],
            opacity: [0, 0.8, 0, 0, 0],
          }}
          transition={{
            duration: flowCycle,
            repeat: Infinity,
            times: [0, 0.15, 0.2, 0.5, 1],
            ease: "easeOut",
          }}
        />

        {/* Main box */}
        <motion.div
          className="w-24 h-24 border-2 border-[#3a3a3a] bg-[#E5DDD5] flex items-center justify-center relative overflow-hidden"
          animate={{
            borderColor: ['#3a3a3a', '#3a3a3a', '#2a2a2a', '#3a3a3a'],
          }}
          transition={{
            duration: flowCycle,
            repeat: Infinity,
            times: [0, 0.2, 0.4, 1],
          }}
        >
          <span className="font-mono text-xs relative z-10">ANUMA</span>

          <motion.div
            className="absolute inset-0 bg-[#3a3a3a]"
            animate={{
              opacity: [0, 0, 0.15, 0, 0],
            }}
            transition={{
              duration: flowCycle,
              repeat: Infinity,
              times: [0, 0.15, 0.2, 0.25, 1],
            }}
          />
        </motion.div>

        {/* Rotating corner dots */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#3a3a3a]"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#3a3a3a]"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#3a3a3a]"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#3a3a3a]"></div>
        </motion.div>
      </motion.div>

      {/* Left node - User */}
      <motion.div
        className="absolute left-8 md:left-16"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="relative">
          <motion.div
            className="w-16 h-16 border border-[#3a3a3a] bg-transparent flex items-center justify-center"
            animate={{
              borderColor: ['#3a3a3a', '#2a2a2a', '#3a3a3a', '#3a3a3a'],
            }}
            transition={{
              duration: flowCycle,
              repeat: Infinity,
              times: [0, 0.05, 0.1, 1],
            }}
          >
            <span className="font-mono text-[10px]">YOU</span>
          </motion.div>

          <svg className="absolute left-16 top-8 w-20 md:w-32 h-px" viewBox="0 0 128 2">
            <motion.line
              x1="0"
              y1="1"
              x2="128"
              y2="1"
              stroke="#3a3a3a"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </svg>

          <motion.div
            className="absolute left-16 top-6 w-4 h-4 border-2 border-[#3a3a3a] bg-[#E5DDD5] flex items-center justify-center"
            animate={{
              x: [0, 128],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: flowCycle * 0.2,
              repeat: Infinity,
              repeatDelay: flowCycle * 0.8,
              ease: "easeInOut",
            }}
          >
            <div className="w-1 h-1 bg-[#3a3a3a]"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right nodes - AI Models */}
      <div className="absolute right-8 md:right-16 space-y-4">
        {['GPT', 'CLAUDE', 'GEMINI'].map((model, i) => (
          <motion.div
            key={model}
            className="relative"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
          >
            <motion.div
              className="w-16 h-12 border border-[#3a3a3a] bg-transparent flex items-center justify-center"
              animate={{
                borderColor: ['#3a3a3a', '#3a3a3a', '#2a2a2a', '#3a3a3a', '#3a3a3a'],
                backgroundColor: ['transparent', 'transparent', 'rgba(58, 58, 58, 0.05)', 'transparent', 'transparent'],
              }}
              transition={{
                duration: flowCycle,
                repeat: Infinity,
                times: [0, 0.3 + i * 0.05, 0.35 + i * 0.05, 0.4 + i * 0.05, 1],
              }}
            >
              <span className="font-mono text-[9px]">{model}</span>
            </motion.div>

            <svg className="absolute right-16 top-6 w-20 md:w-32 h-px" viewBox="0 0 128 2">
              <motion.line
                x1="128"
                y1="1"
                x2="0"
                y2="1"
                stroke="#3a3a3a"
                strokeWidth="1"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.7 + i * 0.1 }}
              />
            </svg>

            <motion.div
              className="absolute right-16 top-4 w-3 h-3 border border-[#3a3a3a] bg-[#E5DDD5]"
              animate={{
                x: [0, -128],
                opacity: [0, 0, 1, 1, 0],
              }}
              transition={{
                duration: flowCycle * 0.15,
                repeat: Infinity,
                delay: flowCycle * 0.2 + i * 0.05,
                repeatDelay: flowCycle * 0.85 - i * 0.05,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute right-16 top-4 w-2 h-2 bg-[#3a3a3a]"
              animate={{
                x: [-128, 0],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: flowCycle * 0.15,
                repeat: Infinity,
                delay: flowCycle * 0.4 + i * 0.05,
                repeatDelay: flowCycle * 0.85 - i * 0.05,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Data flow indicators */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#3a3a3a] opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        context preserved
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#3a3a3a] opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        privacy maintained
      </motion.div>
    </div>
  );
}

function WaitlistButton() {
  const { login, authenticated } = usePrivy();

  return (
    <button
      onClick={login}
      className="px-8 py-4 bg-[#2a2a2a] text-[#E5DDD5] font-mono text-sm hover:bg-[#1a1a1a] transition-colors"
    >
      {authenticated ? 'JOINED' : 'JOIN WAITLIST'}
    </button>
  );
}

export default function BlueprintTechnical() {
  return (
    <div className="relative min-h-screen bg-[#E5DDD5] overflow-hidden">
      <BlueprintBackground />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Technical annotations */}
        <div className="absolute top-8 right-8 text-right text-xs font-mono text-[#3a3a3a] opacity-40 hidden md:block">
          <div>privacy: local</div>
          <div>context: persistent</div>
          <div>models: multiple</div>
          <div>subscription: none</div>
        </div>

        <div className="absolute bottom-8 left-8 text-left text-xs font-mono text-[#3a3a3a] opacity-40 hidden md:block">
          <div>─── memory storage</div>
          <div>─── context bridge</div>
          <div>─── model selector</div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl tracking-tight text-[#2a2a2a]">
              ANUMA
            </h1>
            <div className="h-px w-32 bg-[#3a3a3a] mx-auto opacity-30"></div>
          </div>

          {/* Subheader */}
          <p className="text-xl md:text-2xl text-[#4a4a4a] max-w-2xl mx-auto leading-relaxed">
            Your intelligence layer.
            <br />
            One interface. Every model. Your data.
          </p>

          {/* Technical diagram */}
          <div className="py-8">
            <TechnicalDiagram />
          </div>

          {/* Waitlist button */}
          <div className="max-w-md mx-auto">
            <WaitlistButton />

            <p className="mt-4 text-xs font-mono text-[#6a6a6a] opacity-60">
              Early access • Limited spots
            </p>
          </div>
        </div>

        {/* Blueprint grid reference marks */}
        <div className="absolute top-4 left-4 text-xs font-mono text-[#3a3a3a] opacity-20">
          A1
        </div>
        <div className="absolute top-4 right-4 text-xs font-mono text-[#3a3a3a] opacity-20">
          K1
        </div>
        <div className="absolute bottom-4 left-4 text-xs font-mono text-[#3a3a3a] opacity-20">
          A24
        </div>
        <div className="absolute bottom-4 right-4 text-xs font-mono text-[#3a3a3a] opacity-20">
          K24
        </div>
      </div>
    </div>
  );
}
