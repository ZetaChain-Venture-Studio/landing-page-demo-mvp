"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Check, ChevronRight } from 'lucide-react';

// AI Models options
const AI_MODELS = [
  { id: 'chatgpt', name: 'ChatGPT', icon: '🤖' },
  { id: 'claude', name: 'Claude', icon: '🧠' },
  { id: 'gemini', name: 'Gemini', icon: '✨' },
  { id: 'copilot', name: 'GitHub Copilot', icon: '💻' },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨' },
  { id: 'perplexity', name: 'Perplexity', icon: '🔍' },
  { id: 'other', name: 'Other AI Tools', icon: '🔧' },
];

// Exposure categories
const CATEGORIES = [
  { id: 'personal', name: 'Personal Information', description: 'Name, location, contacts, preferences' },
  { id: 'work', name: 'Work & Career', description: 'Job tasks, projects, company data' },
  { id: 'lifestyle', name: 'Lifestyle & Habits', description: 'Daily routines, interests, behaviors' },
  { id: 'financial', name: 'Financial Data', description: 'Spending patterns, financial decisions' },
  { id: 'health', name: 'Health & Wellness', description: 'Health queries, mental state indicators' },
  { id: 'relationships', name: 'Relationships', description: 'Social connections, communication patterns' },
];

// TypeWriter component
function TypeWriter({ text, onComplete, speed = 50 }: { text: string; onComplete?: () => void; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const hasCompleted = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (!hasCompleted.current && onCompleteRef.current) {
      hasCompleted.current = true;
      setTimeout(() => onCompleteRef.current?.(), 500);
    }
  }, [currentIndex, text, speed]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

// Computing animation
function ComputingAnimation() {
  const [dots, setDots] = useState('');
  const [phase, setPhase] = useState(0);
  const phases = [
    'Analyzing your AI usage patterns',
    'Calculating data exposure levels',
    'Mapping information categories',
    'Generating your privacy score',
  ];

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    const phaseInterval = setInterval(() => {
      setPhase(prev => (prev + 1) % phases.length);
    }, 2000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  return (
    <div className="text-center">
      <div className="mb-8">
        <motion.div
          className="w-24 h-24 mx-auto rounded-full border-4 border-[#8B7355] border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <p className="text-xl text-[#5C4A3A] font-light">
        {phases[phase]}{dots}
      </p>
    </div>
  );
}

// Score display component
function ScoreDisplay({ score, categories }: { score: number; categories: { id: string; name: string; level: number }[] }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return '#D64545';
    if (s >= 60) return '#E67E22';
    if (s >= 40) return '#F1C40F';
    return '#27AE60';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Critical Exposure';
    if (s >= 60) return 'High Exposure';
    if (s >= 40) return 'Moderate Exposure';
    return 'Low Exposure';
  };

  return (
    <div className="space-y-6">
      {/* Main Score */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="inline-block"
        >
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: `conic-gradient(${getScoreColor(score)} ${score}%, #E8E0D5 ${score}%)`,
              padding: '8px'
            }}
          >
            <div className="w-full h-full rounded-full bg-[#FAF8F5] flex items-center justify-center">
              <span className="text-5xl font-light" style={{ color: getScoreColor(score) }}>
                {score}
              </span>
            </div>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-medium"
          style={{ color: getScoreColor(score) }}
        >
          {getScoreLabel(score)}
        </motion.p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-widest text-[#8B7355] mb-4">Exposure by Category</p>
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm text-[#5C4A3A] w-32 truncate">{cat.name}</span>
            <div className="flex-1 h-2 bg-[#E8E0D5] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.level}%` }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: getScoreColor(cat.level) }}
              />
            </div>
            <span className="text-sm text-[#8B7355] w-10 text-right">{cat.level}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function SelfAssessmentPage() {
  const [stage, setStage] = useState<'typing' | 'form' | 'computing' | 'result'>('typing');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [score, setScore] = useState(0);
  const [categoryScores, setCategoryScores] = useState<{ id: string; name: string; level: number }[]>([]);
  const [showShare, setShowShare] = useState(false);

  const handleTypingComplete = () => {
    setTimeout(() => setStage('form'), 500);
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const calculateScore = () => {
    setStage('computing');

    // Calculate after animation
    setTimeout(() => {
      // Base score from number of models (more models = more exposure)
      const modelScore = Math.min(selectedModels.length * 12, 50);

      // Usage intensity score
      const usageScore = Math.min((hoursPerDay * daysPerWeek) / 35 * 50, 50);

      // Total score
      const total = Math.round(modelScore + usageScore);
      setScore(total);

      // Calculate category scores with some variation
      const cats = CATEGORIES.map(cat => {
        let base = total;
        // Add variation per category
        if (cat.id === 'work' && selectedModels.includes('copilot')) base += 15;
        if (cat.id === 'personal' && selectedModels.includes('chatgpt')) base += 10;
        if (cat.id === 'lifestyle' && hoursPerDay >= 4) base += 10;
        if (cat.id === 'financial') base -= 15;
        if (cat.id === 'health') base -= 10;
        if (cat.id === 'relationships') base -= 5;

        return {
          id: cat.id,
          name: cat.name,
          level: Math.min(Math.max(base + Math.floor(Math.random() * 20 - 10), 5), 95),
        };
      });

      setCategoryScores(cats);
      setStage('result');
    }, 6000);
  };

  const shareScore = async () => {
    const text = `My AI Data Exposure Score: ${score}%\n\nFind out how much AI knows about you 👉`;
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'AI Exposure Score', text, url });
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShowShare(true);
        setTimeout(() => setShowShare(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-['Inter',sans-serif]">
      {/* Header */}
      <header className="px-8 py-6 border-b border-[#E8E0D5]">
        <nav className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-medium text-[#5C4A3A]" style={{ letterSpacing: '0.08em' }}>
            ΛNUMΛ
          </a>
        </nav>
      </header>

      <main className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Stage 1: Typing Animation */}
            {stage === 'typing' && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <h1 className="text-4xl md:text-5xl font-light text-[#5C4A3A] leading-tight">
                  <TypeWriter
                    text="How much do your AI tools know about you?"
                    onComplete={handleTypingComplete}
                    speed={60}
                  />
                </h1>
              </motion.div>
            )}

            {/* Stage 2: Assessment Form */}
            {stage === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-[#E8E0D5] p-8">
                  <h2 className="text-2xl font-light text-[#5C4A3A] mb-2 text-center">
                    Let&apos;s assess your AI exposure
                  </h2>
                  <p className="text-[#8B7355] text-center mb-8">
                    Answer a few questions to discover how much data you&apos;ve shared
                  </p>

                  {/* AI Models Selection */}
                  <div className="mb-8">
                    <label className="block text-sm uppercase tracking-widest text-[#8B7355] mb-4">
                      Which AI tools do you use?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {AI_MODELS.map(model => (
                        <button
                          key={model.id}
                          onClick={() => toggleModel(model.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selectedModels.includes(model.id)
                              ? 'border-[#8B7355] bg-[#FAF8F5]'
                              : 'border-[#E8E0D5] hover:border-[#C4B8A8]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{model.icon}</span>
                            <span className="text-sm text-[#5C4A3A]">{model.name}</span>
                            {selectedModels.includes(model.id) && (
                              <Check className="w-4 h-4 text-[#8B7355] ml-auto" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hours per day */}
                  <div className="mb-8">
                    <label className="block text-sm uppercase tracking-widest text-[#8B7355] mb-4">
                      Hours per day with AI
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="12"
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(Number(e.target.value))}
                        className="flex-1 h-2 bg-[#E8E0D5] rounded-lg appearance-none cursor-pointer accent-[#8B7355]"
                      />
                      <span className="text-2xl font-light text-[#5C4A3A] w-16 text-right">
                        {hoursPerDay}h
                      </span>
                    </div>
                  </div>

                  {/* Days per week */}
                  <div className="mb-8">
                    <label className="block text-sm uppercase tracking-widest text-[#8B7355] mb-4">
                      Days per week
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(day => (
                        <button
                          key={day}
                          onClick={() => setDaysPerWeek(day)}
                          className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                            daysPerWeek >= day
                              ? 'bg-[#8B7355] text-white'
                              : 'bg-[#E8E0D5] text-[#8B7355] hover:bg-[#D4C8B8]'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={calculateScore}
                    disabled={selectedModels.length === 0}
                    className="w-full py-4 rounded-xl bg-[#8B7355] text-white font-medium text-lg transition-all hover:bg-[#6B5A45] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Calculate My Exposure
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Stage 3: Computing */}
            {stage === 'computing' && (
              <motion.div
                key="computing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20"
              >
                <ComputingAnimation />
              </motion.div>
            )}

            {/* Stage 4: Result - Split Screen */}
            {stage === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* Left: Score */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg border border-[#E8E0D5] p-8"
                >
                  <ScoreDisplay score={score} categories={categoryScores} />

                  {/* Share Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-8"
                  >
                    <button
                      onClick={shareScore}
                      className="w-full py-3 rounded-xl border-2 border-[#8B7355] text-[#8B7355] font-medium flex items-center justify-center gap-2 hover:bg-[#FAF8F5] transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                      {showShare ? 'Copied!' : 'Share Your Score'}
                    </button>
                  </motion.div>
                </motion.div>

                {/* Right: Message */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col justify-center"
                >
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h2 className="text-3xl font-light text-[#5C4A3A] mb-4">
                        Your data is the price of convenience
                      </h2>
                      <p className="text-[#8B7355] text-lg leading-relaxed">
                        Every prompt, every query, every conversation — it all feeds the machine.
                        Your thoughts, your work, your personal moments become training data for
                        corporations you&apos;ll never meet.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="pt-6 border-t border-[#E8E0D5]"
                    >
                      <h3 className="text-xl font-medium text-[#5C4A3A] mb-3">
                        There&apos;s another way
                      </h3>
                      <p className="text-[#8B7355] leading-relaxed mb-6">
                        <strong className="text-[#5C4A3A]">Anuma</strong> is building AI that puts
                        privacy first. Your data stays yours. Your thoughts remain private.
                        Intelligence without surveillance.
                      </p>

                      <a
                        href="/video"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8B7355] text-white font-medium hover:bg-[#6B5A45] transition-all"
                      >
                        Learn More About Anuma
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6 }}
                      className="text-sm text-[#A89880] italic"
                    >
                      &quot;Privacy is not about having something to hide. It&apos;s about having
                      something to protect.&quot;
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
