"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Twitter, CheckCircle, Sparkles, UserPlus, LucideIcon, Copy, Check, ExternalLink, Gift, Star, Zap } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useSnag } from '@/hooks/useSnag';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: LucideIcon;
  completed: boolean;
  action: string;
  ruleId?: string; // Snag rule ID
  type?: string; // Task type for handling different actions
  claimType?: 'manual' | 'auto';
  ctaUrl?: string; // External URL for task
}

// Map task types/names to icons
function getTaskIcon(name: string, type?: string): LucideIcon {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('follow') || lowerName.includes('twitter') || lowerName.includes('x')) return Twitter;
  if (lowerName.includes('invite') || lowerName.includes('referral') || lowerName.includes('friend')) return UserPlus;
  if (lowerName.includes('join') || lowerName.includes('waitlist') || lowerName.includes('signup')) return Sparkles;
  if (lowerName.includes('gift') || lowerName.includes('reward')) return Gift;
  if (lowerName.includes('star') || lowerName.includes('rate')) return Star;
  if (type === 'social') return Twitter;
  if (type === 'referral') return UserPlus;
  return Zap;
}

// Get CTA label from task
function getTaskAction(name: string, metadata?: { cta?: { label?: string } }): string {
  if (metadata?.cta?.label) return metadata.cta.label;
  const lowerName = name.toLowerCase();
  if (lowerName.includes('follow')) return 'Follow';
  if (lowerName.includes('invite') || lowerName.includes('referral')) return 'Invite';
  if (lowerName.includes('join')) return 'Join';
  return 'Complete';
}

interface PointsDashboardProps {
  email: string;
  testWallet?: string; // Optional test wallet for bypassing Privy
}

// Inner component that uses Privy (when available)
function PointsDashboardWithPrivy({ email }: { email: string }) {
  const { logout, user } = usePrivy();
  return (
    <PointsDashboardContent
      email={email}
      walletAddress={user?.wallet?.address}
      userId={user?.id}
      onLogout={logout}
    />
  );
}

// Component for test mode (no Privy)
function PointsDashboardTestMode({ email, testWallet }: { email: string; testWallet: string }) {
  return (
    <PointsDashboardContent
      email={email}
      walletAddress={testWallet}
      userId="test-user"
      onLogout={() => window.location.href = '/'}
      isTestMode
    />
  );
}

// Main export - chooses between Privy and test mode
export default function PointsDashboard({ email, testWallet }: PointsDashboardProps) {
  if (testWallet) {
    return <PointsDashboardTestMode email={email} testWallet={testWallet} />;
  }
  return <PointsDashboardWithPrivy email={email} />;
}

// Shared content component
interface PointsDashboardContentProps {
  email: string;
  walletAddress?: string;
  userId?: string;
  onLogout: () => void;
  isTestMode?: boolean;
}

function PointsDashboardContent({ email, walletAddress, userId, onLogout, isTestMode }: PointsDashboardContentProps) {

  // Snag integration (for points tracking and tasks)
  const {
    account: snagAccount,
    rank: snagRank,
    rules: snagRules,
    ruleStatuses,
    loading: snagLoading,
    initializeAccount,
    completeRule,
    refreshData,
  } = useSnag(walletAddress);

  const [copiedReferral, setCopiedReferral] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Generate referral link based on wallet address
  const referralLink = useMemo(() => {
    if (typeof window !== 'undefined' && walletAddress) {
      return `${window.location.origin}?ref=${walletAddress.slice(0, 8)}`;
    }
    return '';
  }, [walletAddress]);

  // Initialize Snag account when wallet is available
  useEffect(() => {
    if (walletAddress && !snagAccount) {
      console.log('[Dashboard] Initializing Snag account for:', walletAddress);
      initializeAccount(walletAddress, userId || 'test-user');
    }
  }, [walletAddress, snagAccount, initializeAccount, userId]);

  // Convert Snag rules to Task format
  const tasks: Task[] = useMemo(() => {
    console.log('[Dashboard] Converting Snag rules to tasks:', snagRules.length, 'rules');

    if (snagRules.length === 0) {
      // Fallback to default tasks if no Snag rules available
      console.log('[Dashboard] No Snag rules, using fallback tasks');
      return [
        {
          id: 'waitlist',
          title: 'Join the Waitlist',
          description: 'Sign up to be among the first to access Pop AI',
          points: 100,
          icon: Sparkles,
          completed: true, // Auto-completed since they're viewing dashboard
          action: 'Joined',
          claimType: 'auto',
        },
        {
          id: 'follow_x',
          title: 'Follow us on X',
          description: 'Stay updated with the latest news and announcements',
          points: 50,
          icon: Twitter,
          completed: false,
          action: 'Follow',
          ctaUrl: 'https://x.com/PopAI_xyz',
        },
        {
          id: 'invite_friend',
          title: 'Invite a Friend',
          description: 'Share your referral link and earn points for each signup',
          points: 200,
          icon: UserPlus,
          completed: false,
          action: 'Invite',
          type: 'referral',
        },
      ];
    }

    return snagRules.map(rule => {
      const status = ruleStatuses.get(rule.id);
      const isCompleted = status?.completed || false;
      // Use points if available, otherwise parse amount
      const points = rule.points || (typeof rule.amount === 'string' ? parseInt(rule.amount, 10) : rule.amount) || 0;

      // Determine task type from rule
      const isReferral = rule.type === 'referral' || rule.type === 'referred_user' || rule.name.toLowerCase().includes('invite') || rule.name.toLowerCase().includes('referral');
      const isTwitterFollow = rule.type === 'drip_x_follow' || rule.name.toLowerCase().includes('follow');

      // Get CTA URL from Snag metadata - check twitterAccountUrl for follow tasks
      const ctaUrl = rule.metadata?.twitterAccountUrl || rule.metadata?.cta?.href;
      const ctaLabel = rule.metadata?.cta?.label;

      // For referral tasks, get the referrer reward amount
      const referralPoints = rule.metadata?.referrerReward || 0;

      // Use referrerReward for referral tasks
      const displayPoints = isReferral && referralPoints > 0 ? referralPoints : points;

      console.log('[Dashboard] Mapping rule:', {
        id: rule.id,
        name: rule.name,
        type: rule.type,
        points: displayPoints,
        ctaUrl,
        ctaLabel,
        isReferral,
        metadata: rule.metadata,
      });

      return {
        id: rule.id,
        title: rule.name,
        description: rule.description || '',
        points: displayPoints,
        icon: getTaskIcon(rule.name, rule.type),
        completed: isCompleted,
        action: ctaLabel || getTaskAction(rule.name),
        ruleId: rule.id,
        type: isReferral ? 'referral' : rule.type,
        claimType: rule.claimType,
        ctaUrl,
      };
    });
  }, [snagRules, ruleStatuses]);

  // Total points from Snag account
  const totalPoints = snagAccount?.points || 0;

  // Use Snag rank
  const rank = snagRank?.position || 0;
  const totalUsers = snagRank?.total || 0;

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(async () => {
    if (referralLink) {
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
        console.log('[Dashboard] Referral link copied:', referralLink);
      } catch (err) {
        console.error('[Dashboard] Failed to copy referral link:', err);
        // Fallback for older browsers
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

  // Handle task click - different behavior based on task type
  const handleTaskClick = useCallback(async (task: Task) => {
    console.log('[Dashboard] Task clicked:', task.id, task.title);

    // Auto-completed tasks can't be clicked
    if (task.claimType === 'auto' || task.completed) {
      console.log('[Dashboard] Task already completed or auto-claim');
      return;
    }

    // Referral task - copy link
    if (task.type === 'referral') {
      console.log('[Dashboard] Referral task - copying link');
      await copyReferralLink();
      return;
    }

    // If task has external URL, open it and then try to complete
    if (task.ctaUrl) {
      console.log('[Dashboard] Opening external URL:', task.ctaUrl);
      window.open(task.ctaUrl, '_blank');
    }

    // Try to complete the rule in Snag
    if (task.ruleId) {
      setCompletingTaskId(task.id);
      console.log('[Dashboard] Completing Snag rule:', task.ruleId);

      try {
        const success = await completeRule(task.ruleId);
        console.log('[Dashboard] Rule completion result:', success);

        if (success) {
          // Refresh data to get updated points/status
          await refreshData();
        }
      } catch (err) {
        console.error('[Dashboard] Failed to complete rule:', err);
      } finally {
        setCompletingTaskId(null);
      }
    }
  }, [copyReferralLink, completeRule, refreshData]);

  const completedTasksCount = tasks.filter(t => t.completed).length;

  // Calculate rank percentage (top X%)
  const rankPercent = totalUsers > 0 && rank > 0
    ? Math.ceil((rank / totalUsers) * 100)
    : null;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-['Space_Grotesk']">
      {/* Film Grain */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none">
        <svg className="w-full h-full">
          <filter id="noise2">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise2)" />
        </svg>
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8 border-b border-white/5">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div
              className="relative w-9 h-9"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-lg blur-sm" />
              <div className="absolute inset-[2px] bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </motion.div>
            <span className="text-xl text-white tracking-[0.02em] font-[500] uppercase">Pop AI</span>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-sm text-white/60 font-[350]">{email}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs text-white/50 hover:text-white transition-colors uppercase tracking-[0.15em] border border-white/10 rounded-full backdrop-blur-sm"
            >
              {isTestMode ? 'Exit Test' : 'Logout'}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl tracking-[-0.02em] mb-4 font-[600]">
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                Start Earning Points
              </span>
            </h1>
            <p className="text-white/40 text-lg font-[350]">
              Complete tasks to increase your rank and unlock exclusive benefits
            </p>
          </motion.div>

          {/* Wallet Info */}
          {walletAddress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 p-4 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white/40 font-[350]">Wallet Created</p>
                  <p className="text-sm text-white/80 font-mono truncate max-w-[300px] sm:max-w-none">{walletAddress}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Tasks List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {tasks.map((task, index) => {
                const Icon = task.icon;
                const isReferralTask = task.type === 'referral';

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${task.completed ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                          <Icon className={`w-5 h-5 ${task.completed ? 'text-emerald-400' : 'text-white/60'}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-[450] tracking-tight">{task.title}</h3>
                            <span className="text-violet-400 text-sm font-[500]">+{task.points} pts</span>
                          </div>
                          <p className="text-white/40 text-sm font-[350] mb-4">{task.description}</p>

                          {task.completed ? (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-[450]">
                              <CheckCircle className="w-4 h-4" />
                              <span>Completed</span>
                            </div>
                          ) : isReferralTask ? (
                            // Special UI for referral task - show copy link
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={referralLink}
                                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm font-mono truncate"
                                />
                                <motion.button
                                  onClick={copyReferralLink}
                                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg text-sm text-white font-[500] uppercase tracking-wider hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {copiedReferral ? (
                                    <>
                                      <Check className="w-4 h-4" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            <motion.button
                              onClick={() => handleTaskClick(task)}
                              disabled={completingTaskId === task.id}
                              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg text-sm text-white font-[500] uppercase tracking-wider hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              whileHover={{ scale: completingTaskId === task.id ? 1 : 1.02 }}
                              whileTap={{ scale: completingTaskId === task.id ? 1 : 0.98 }}
                            >
                              {completingTaskId === task.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  {task.ctaUrl && <span>→</span>}
                                  <span>{task.action}</span>
                                </>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Right: NFT Coupon Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/30 to-cyan-500/30 rounded-3xl blur-2xl" />

                {/* Card */}
                <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/20 rounded-3xl p-8 overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl" />

                  <div className="relative z-10">
                    {/* Points Display */}
                    <div className="mb-8">
                      <div className="text-sm text-white/40 uppercase tracking-widest mb-2 font-[350]">Total Points</div>
                      <motion.div
                        className="text-7xl font-[600] tracking-tight bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent"
                        key={totalPoints}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        {totalPoints.toLocaleString()}
                      </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1 font-[350]">Rank</div>
                        <div className="text-2xl text-white font-[500]">
                          {rankPercent !== null ? `Top ${rankPercent}%` : '-'}
                        </div>
                        {rank > 0 && (
                          <div className="text-white/30 text-xs mt-1">#{rank.toLocaleString()} of {totalUsers.toLocaleString()}</div>
                        )}
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1 font-[350]">Tasks</div>
                        <div className="text-2xl text-white font-[500]">{completedTasksCount}/{tasks.length}</div>
                      </div>
                    </div>

                    {/* NFT Visual Element */}
                    <div className="relative p-6 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl border border-white/20 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30 rounded-2xl" />
                      <div className="relative text-center">
                        <Sparkles className="w-12 h-12 text-white/60 mx-auto mb-3" />
                        <div className="text-sm text-white/60 uppercase tracking-widest font-[450]">Access Pass</div>
                        <div className="text-xs text-white/40 mt-2 font-[350]">
                          {snagAccount?.id ? `#${snagAccount.id.slice(0, 8)}` : 'Genesis'}
                        </div>
                      </div>
                    </div>

                    {/* Footer - TODO: Get actual join date from database */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs text-white/40 font-[350]">
                        <span>Member since {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>Active ✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
