"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useSnag } from '@/hooks/useSnag';
import { ColorPalette, lightSteel, isDarkPalette } from '@/lib/palettes';
import PrizeReveal from './PrizeReveal';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  action: string;
  ruleId?: string;
  type?: string;
  claimType?: 'manual' | 'auto';
  ctaUrl?: string;
}

interface PointsDashboardProps {
  email: string;
  testWallet?: string;
  palette?: ColorPalette;
  paletteId?: string;
}

// Inner component that uses Privy
function PointsDashboardWithPrivy({ email, palette, paletteId }: { email: string; palette: ColorPalette; paletteId: string }) {
  const { logout, user } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const userId = user?.id;

  return (
    <PointsDashboardContent
      email={email}
      walletAddress={walletAddress}
      userId={userId}
      onLogout={logout}
      palette={palette}
      paletteId={paletteId}
    />
  );
}

// Test mode wrapper
function PointsDashboardTestMode({ email, testWallet, palette, paletteId }: { email: string; testWallet: string; palette: ColorPalette; paletteId: string }) {
  return (
    <PointsDashboardContent
      email={email}
      walletAddress={testWallet}
      userId="test-user"
      onLogout={() => window.location.href = '/'}
      isTestMode
      palette={palette}
      paletteId={paletteId}
    />
  );
}

export default function PointsDashboard({ email, testWallet, palette, paletteId = '3' }: PointsDashboardProps) {
  const colors = palette || lightSteel;

  if (testWallet) {
    return <PointsDashboardTestMode email={email} testWallet={testWallet} palette={colors} paletteId={paletteId} />;
  }
  return <PointsDashboardWithPrivy email={email} palette={colors} paletteId={paletteId} />;
}

interface PointsDashboardContentProps {
  email: string;
  walletAddress?: string;
  userId?: string;
  onLogout: () => void;
  isTestMode?: boolean;
  palette: ColorPalette;
  paletteId: string;
}

function PointsDashboardContent({ email, walletAddress, userId, onLogout, isTestMode, palette, paletteId }: PointsDashboardContentProps) {
  const isDark = isDarkPalette(paletteId);

  const {
    account: snagAccount,
    rank: snagRank,
    rules: snagRules,
    ruleStatuses,
    initializeAccount,
    completeRule,
    refreshData,
  } = useSnag(walletAddress);

  const [copiedReferral, setCopiedReferral] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [showPrizeReveal, setShowPrizeReveal] = useState(false);
  const [revealsRemaining, setRevealsRemaining] = useState(1);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [waitlistCompleted, setWaitlistCompleted] = useState(false);

  const referralLink = useMemo(() => {
    if (typeof window !== 'undefined' && walletAddress) {
      return `${window.location.origin}?ref=${walletAddress.slice(0, 8)}`;
    }
    return '';
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress && !snagAccount) {
      initializeAccount(walletAddress, userId || 'test-user');
    }
  }, [walletAddress, snagAccount, initializeAccount, userId]);

  // Auto-complete waitlist task
  useEffect(() => {
    async function autoCompleteWaitlist() {
      if (!snagAccount || waitlistCompleted || snagRules.length === 0) return;

      const waitlistRule = snagRules.find(rule =>
        rule.type === 'profile_completed' ||
        rule.name.toLowerCase().includes('waitlist') ||
        rule.name.toLowerCase().includes('join')
      );

      if (waitlistRule) {
        const status = ruleStatuses.get(waitlistRule.id);
        if (!status?.completed) {
          try {
            console.log('[Dashboard] Auto-completing waitlist task:', waitlistRule.id);
            const success = await completeRule(waitlistRule.id);
            if (success) {
              setWaitlistCompleted(true);
              await new Promise(resolve => setTimeout(resolve, 1500));
              await refreshData();
              console.log('[Dashboard] Refreshed data after completing waitlist');
            }
          } catch (err) {
            console.error('Failed to auto-complete waitlist:', err);
          }
        } else {
          setWaitlistCompleted(true);
        }
      }
    }
    autoCompleteWaitlist();
  }, [snagAccount, snagRules, ruleStatuses, waitlistCompleted, completeRule, refreshData]);

  // Convert Snag rules to tasks
  const tasks: Task[] = useMemo(() => {
    if (snagRules.length === 0) {
      return [
        { id: 'waitlist', title: 'Join the Waitlist', description: 'Sign up for early access', points: 100, completed: true, action: 'Joined', claimType: 'auto' },
        { id: 'follow_x', title: 'Follow us on X', description: 'Stay updated with news', points: 50, completed: false, action: 'Follow', ctaUrl: 'https://x.com/Cloister' },
        { id: 'invite_friend', title: 'Invite a Friend', description: 'Share your referral link', points: 200, completed: false, action: 'Invite', type: 'referral' },
      ];
    }

    return snagRules.map(rule => {
      const status = ruleStatuses.get(rule.id);
      const points = rule.points || 0;
      const isReferral = rule.type === 'referral' || rule.type === 'referred_user';
      const isWaitlistTask = rule.type === 'profile_completed' || rule.name.toLowerCase().includes('waitlist');
      const isCompleted = status?.completed || isWaitlistTask;
      const ctaUrl = rule.metadata?.twitterAccountUrl || rule.metadata?.cta?.href;
      const referralPoints = rule.metadata?.referrerReward || 0;

      return {
        id: rule.id,
        title: rule.name,
        description: rule.description || '',
        points: isReferral && referralPoints > 0 ? referralPoints : points,
        completed: isCompleted,
        action: rule.metadata?.cta?.label || (isCompleted ? 'Done' : 'Complete'),
        ruleId: rule.id,
        type: isReferral ? 'referral' : rule.type,
        claimType: rule.claimType,
        ctaUrl,
      };
    });
  }, [snagRules, ruleStatuses]);

  const totalPoints = (snagAccount?.points || 0) + bonusPoints;
  const rank = snagRank?.position || 0;
  const totalUsers = snagRank?.total || 0;
  const rankPercent = totalUsers > 0 && rank > 0 ? Math.ceil((rank / totalUsers) * 100) : null;
  const completedTasksCount = tasks.filter(t => t.completed).length;

  const copyReferralLink = useCallback(async () => {
    if (referralLink) {
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
      }
    }
  }, [referralLink]);

  const handleTaskClick = useCallback(async (task: Task) => {
    if (task.claimType === 'auto' || task.completed) return;

    if (task.type === 'referral') {
      await copyReferralLink();
      return;
    }

    if (task.ctaUrl) {
      window.open(task.ctaUrl, '_blank');
    }

    if (task.ruleId) {
      setCompletingTaskId(task.id);
      try {
        const success = await completeRule(task.ruleId);
        if (success) await refreshData();
      } catch (err) {
        console.error('Failed to complete task:', err);
      } finally {
        setCompletingTaskId(null);
      }
    }
  }, [copyReferralLink, completeRule, refreshData]);

  const handlePrizeReveal = useCallback((points: number) => {
    setBonusPoints(prev => prev + points);
    setRevealsRemaining(prev => Math.max(0, prev - 1));
  }, []);

  // Modal overlay color
  const overlayBg = palette.overlay || (isDark ? 'rgba(12, 12, 12, 0.95)' : 'rgba(248, 249, 250, 0.95)');

  return (
    <div className="min-h-screen font-['Inter',sans-serif]" style={{ backgroundColor: palette.bg }}>
      {/* Header */}
      <header className="px-8 py-6 border-b" style={{ borderColor: palette.border }}>
        <nav className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
              style={{
                backgroundColor: palette.accent,
                color: isDark ? palette.bg : '#ffffff'
              }}
            >
              C
            </div>
            <span className="text-lg font-medium" style={{ color: palette.text }}>
              Cloister.AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: palette.textMuted }}>{email}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm border rounded-lg transition-colors"
              style={{
                borderColor: palette.border,
                color: palette.textMuted,
                backgroundColor: isDark ? palette.bgAlt : 'transparent'
              }}
            >
              {isTestMode ? 'Exit' : 'Sign out'}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-light tracking-tight mb-2" style={{ color: palette.text }}>
              Welcome back
            </h1>
            <p style={{ color: palette.textMuted }}>
              Complete tasks to earn points and climb the leaderboard.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Tasks */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm uppercase tracking-widest mb-4" style={{ color: palette.textLight }}>
                Tasks
              </h2>

              {tasks.map((task, index) => {
                const isReferralTask = task.type === 'referral';

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-5 rounded-xl border transition-all"
                    style={{
                      backgroundColor: task.completed ? palette.bgAlt : palette.bg,
                      borderColor: palette.border,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium" style={{ color: palette.text }}>{task.title}</h3>
                          {task.completed && (
                            <CheckCircle className="w-4 h-4" style={{ color: palette.success }} />
                          )}
                        </div>
                        <p className="text-sm mb-3" style={{ color: palette.textMuted }}>{task.description}</p>

                        {isReferralTask && !task.completed ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={referralLink}
                              className="flex-1 px-3 py-2 text-sm rounded-lg border"
                              style={{
                                backgroundColor: palette.bgAlt,
                                borderColor: palette.border,
                                color: palette.textMuted,
                              }}
                            />
                            <button
                              onClick={copyReferralLink}
                              className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2"
                              style={{
                                backgroundColor: palette.accent,
                                color: isDark ? palette.bg : '#ffffff'
                              }}
                            >
                              {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copiedReferral ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        ) : !task.completed ? (
                          <button
                            onClick={() => handleTaskClick(task)}
                            disabled={completingTaskId === task.id}
                            className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50"
                            style={{
                              backgroundColor: palette.accent,
                              color: isDark ? palette.bg : '#ffffff'
                            }}
                          >
                            {task.ctaUrl && <ExternalLink className="w-4 h-4" />}
                            {completingTaskId === task.id ? 'Processing...' : task.action}
                          </button>
                        ) : null}
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-medium" style={{ color: palette.accent }}>
                          +{task.points}
                        </span>
                        <span className="text-sm ml-1" style={{ color: palette.textLight }}>pts</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Prize Reveal Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-xl border mt-6"
                style={{ backgroundColor: palette.bgAlt, borderColor: palette.border }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium" style={{ color: palette.text }}>Daily Reward</h3>
                    <p className="text-sm" style={{ color: palette.textMuted }}>
                      Reveal your bonus points
                    </p>
                  </div>
                  {revealsRemaining > 0 && (
                    <button
                      onClick={() => setShowPrizeReveal(true)}
                      className="px-4 py-2 text-sm font-medium rounded-lg"
                      style={{
                        backgroundColor: palette.accent,
                        color: isDark ? palette.bg : '#ffffff'
                      }}
                    >
                      Reveal Prize
                    </button>
                  )}
                </div>
                {revealsRemaining <= 0 && (
                  <p className="text-sm" style={{ color: palette.textLight }}>
                    Come back tomorrow for another chance!
                  </p>
                )}
              </motion.div>
            </div>

            {/* Right: Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div className="p-6 rounded-2xl border" style={{ backgroundColor: palette.bg, borderColor: palette.border }}>
                {/* Points */}
                <div className="mb-6 pb-6 border-b" style={{ borderColor: palette.border }}>
                  <p className="text-sm uppercase tracking-widest mb-2" style={{ color: palette.textLight }}>
                    Total Points
                  </p>
                  <motion.p
                    className="text-5xl font-light tracking-tight"
                    style={{ color: palette.text }}
                    key={totalPoints}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {totalPoints.toLocaleString()}
                  </motion.p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: palette.textLight }}>Rank</p>
                    <p className="text-xl font-medium" style={{ color: palette.text }}>
                      {rankPercent !== null ? `Top ${rankPercent}%` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: palette.textLight }}>Tasks</p>
                    <p className="text-xl font-medium" style={{ color: palette.text }}>
                      {completedTasksCount}/{tasks.length}
                    </p>
                  </div>
                </div>

                {/* Wallet */}
                {walletAddress && (
                  <div className="pt-4 border-t" style={{ borderColor: palette.border }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: palette.textLight }}>Wallet</p>
                    <p className="text-sm font-mono truncate" style={{ color: palette.textMuted }}>
                      {walletAddress}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Prize Reveal Modal */}
      <AnimatePresence>
        {showPrizeReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: overlayBg }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative p-8 rounded-2xl max-w-sm w-full text-center"
              style={{ backgroundColor: palette.bg, border: `1px solid ${palette.border}` }}
            >
              <button
                onClick={() => setShowPrizeReveal(false)}
                className="absolute top-4 right-4 p-2 rounded-full transition-colors"
                style={{ color: palette.textLight }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-medium mb-2" style={{ color: palette.text }}>Daily Reward</h2>
              <p className="text-sm mb-8" style={{ color: palette.textMuted }}>
                Tap to reveal your bonus points
              </p>

              <PrizeReveal
                onRevealComplete={(points) => {
                  handlePrizeReveal(points);
                  setTimeout(() => setShowPrizeReveal(false), 2500);
                }}
                revealsRemaining={revealsRemaining}
                disabled={revealsRemaining <= 0}
                palette={palette}
                paletteId={paletteId}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
