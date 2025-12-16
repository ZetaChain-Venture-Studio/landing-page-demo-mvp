"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Twitter, MessageCircle, Share2, CheckCircle, Sparkles, Trophy, Zap, UserPlus, LucideIcon } from 'lucide-react';
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

// Map Snag rule types to icons
const RULE_TYPE_ICONS: Record<string, LucideIcon> = {
  twitter_follow: Twitter,
  twitter_post: Twitter,
  twitter_reaction: Twitter,
  discord_role: MessageCircle,
  discord_messages: MessageCircle,
  telegram_join: MessageCircle,
  refer_friend: UserPlus,
  connect_twitter: Twitter,
  connect_discord: MessageCircle,
  external: Zap,
  default: Sparkles,
};

// Default mock tasks (used when Snag is not configured)
const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Follow on Twitter',
    description: 'Follow @PopAI on Twitter for updates',
    points: 50,
    icon: Twitter,
    completed: false,
    action: 'Follow'
  },
  {
    id: '2',
    title: 'Join Discord',
    description: 'Join our Discord community',
    points: 50,
    icon: MessageCircle,
    completed: false,
    action: 'Join'
  },
  {
    id: '3',
    title: 'Share on Twitter',
    description: 'Tweet about Pop AI with #PopAI',
    points: 75,
    icon: Share2,
    completed: false,
    action: 'Tweet'
  },
  {
    id: '4',
    title: 'Refer a Friend',
    description: 'Invite friends to join the waitlist',
    points: 100,
    icon: Zap,
    completed: false,
    action: 'Share'
  },
  {
    id: '5',
    title: 'Complete Profile',
    description: 'Add your bio and interests',
    points: 25,
    icon: Sparkles,
    completed: false,
    action: 'Complete'
  },
];

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

  // Snag integration
  const {
    account: snagAccount,
    rank: snagRank,
    rules: snagRules,
    ruleStatuses,
    loading: snagLoading,
    error: snagError,
    initializeAccount,
    completeRule: completeSnagRule,
  } = useSnag(walletAddress);

  // Debug: Log Snag state
  useEffect(() => {
    console.log('[PointsDashboard] Snag state:', {
      account: snagAccount,
      rulesCount: snagRules.length,
      loading: snagLoading,
      error: snagError,
      walletAddress,
    });
  }, [snagAccount, snagRules, snagLoading, snagError, walletAddress]);

  // Local state for mock mode
  const [mockTasks, setMockTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [mockPoints, setMockPoints] = useState(100);

  // Initialize Snag account when wallet is available
  useEffect(() => {
    if (walletAddress && !snagAccount) {
      initializeAccount(walletAddress, userId || 'test-user');
    }
  }, [walletAddress, snagAccount, initializeAccount, userId]);

  // Determine if using Snag or mock data
  // We use Snag data if we have rules, regardless of account status
  // Account will be created when user completes their first task
  const useSnagData = snagRules.length > 0;

  // Get action label based on task type
  const getActionLabel = (type: string, claimType?: string) => {
    if (claimType === 'auto') return 'Auto';

    switch (type) {
      case 'drip_x_follow':
        return 'Follow';
      case 'drip_x_new_tweet':
        return 'Tweet';
      case 'swap':
        return 'Swap';
      case 'connected_telegram':
        return 'Connect';
      case 'connected_email':
        return 'Connect';
      case 'connect_wallet':
        return 'Connect';
      case 'referred_user':
        return 'Share';
      case 'check_in':
        return 'Check In';
      default:
        return 'Claim';
    }
  };

  // Get CTA URL for external tasks
  const getCtaUrl = (type: string, metadata?: { cta?: { href?: string } }) => {
    if (metadata?.cta?.href) return metadata.cta.href;

    switch (type) {
      case 'drip_x_follow':
        return 'https://twitter.com/memoryless_ai'; // You can customize this
      case 'connected_telegram':
        return 'https://t.me/memoryless_ai'; // You can customize this
      default:
        return undefined;
    }
  };

  // Convert Snag rules to tasks format
  const snagTasks: Task[] = useMemo(() => {
    return snagRules.map((rule) => {
      const status = ruleStatuses.get(rule.id);
      const iconType = rule.type || 'default';
      const Icon = RULE_TYPE_ICONS[iconType] || RULE_TYPE_ICONS.default;
      const ruleAny = rule as { claimType?: string; metadata?: { cta?: { href?: string } } };

      return {
        id: rule.id,
        title: rule.name,
        description: rule.description || `Complete this task to earn ${rule.points} points`,
        points: rule.points,
        icon: Icon,
        completed: status?.completed || false,
        action: getActionLabel(rule.type, ruleAny.claimType),
        ruleId: rule.id,
        type: rule.type,
        claimType: ruleAny.claimType as 'manual' | 'auto' | undefined,
        ctaUrl: getCtaUrl(rule.type, ruleAny.metadata),
      };
    });
  }, [snagRules, ruleStatuses]);

  // Use Snag tasks or mock tasks
  const tasks = useSnagData ? snagTasks : mockTasks;
  const totalPoints = useSnagData ? (snagAccount?.points || 0) : mockPoints;
  const rank = useSnagData
    ? (snagRank?.position || 0)
    : Math.ceil(12847 / (1 + mockPoints / 100));
  const totalUsers = snagRank?.total || 12847;

  // State for task completion loading
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Handle task click - different behavior based on task type
  const handleTaskClick = async (task: Task) => {
    // If task has external URL, open it
    if (task.ctaUrl) {
      window.open(task.ctaUrl, '_blank');
      return;
    }

    // Auto tasks can't be manually completed
    if (task.claimType === 'auto') {
      return;
    }

    // Try to complete/claim the task
    await handleCompleteTask(task.id);
  };

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId);

    try {
      if (useSnagData) {
        // Use Snag API
        console.log('[Dashboard] Attempting to complete task:', taskId);
        const success = await completeSnagRule(taskId);
        if (!success) {
          console.error('[Dashboard] Failed to complete task');
          alert('Could not complete task. It may require external verification.');
        } else {
          console.log('[Dashboard] Task completed successfully');
        }
      } else {
        // Mock mode
        setMockTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, completed: true } : task
          )
        );
        const task = mockTasks.find(t => t.id === taskId);
        if (task) {
          setMockPoints(prev => prev + task.points);
        }
      }
    } finally {
      setCompletingTaskId(null);
    }
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;

  // Calculate tier based on points
  const getTier = (points: number) => {
    if (points >= 10000) return 'Diamond';
    if (points >= 5000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  };

  const tier = getTier(totalPoints);
  const nextTierPoints = totalPoints < 1000 ? 1000 : totalPoints < 5000 ? 5000 : totalPoints < 10000 ? 10000 : null;
  const progressPercent = nextTierPoints
    ? Math.min((totalPoints / nextTierPoints) * 100, 100)
    : 100;

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
              {!useSnagData && !snagLoading && (
                <span className="ml-2 text-yellow-500/60 text-sm">(Demo Mode - Snag not connected)</span>
              )}
              {snagError && (
                <span className="ml-2 text-red-500/60 text-sm">(Error: {snagError})</span>
              )}
              {isTestMode && (
                <span className="ml-2 text-cyan-500/60 text-sm">(Test Mode)</span>
              )}
            </p>
            {!useSnagData && !snagLoading && (
              <p className="text-yellow-500/40 text-sm mt-2">
                Check Vercel env vars: SNAG_API_KEY, SNAG_API_URL, NEXT_PUBLIC_SNAG_WEBSITE_ID.
                Test at: <a href="/api/snag/debug" className="underline">/api/snag/debug</a>
              </p>
            )}
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
              {snagLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  No tasks available yet
                </div>
              ) : (
                tasks.map((task, index) => {
                  const Icon = task.icon;
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
                            ) : task.claimType === 'auto' ? (
                              <div className="flex items-center gap-2 text-white/30 text-sm font-[350]">
                                <span>Auto-verified when connected</span>
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
                })
              )}
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
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-white/80 uppercase tracking-wider font-[450]">{tier} Member</span>
                    </div>

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
                          {rank > 0 ? `#${rank.toLocaleString()}` : '-'}
                        </div>
                        {totalUsers > 0 && (
                          <div className="text-white/30 text-xs mt-1">of {totalUsers.toLocaleString()}</div>
                        )}
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-1 font-[350]">Tasks</div>
                        <div className="text-2xl text-white font-[500]">{completedTasksCount}/{tasks.length}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-white/40 mb-2 font-[350]">
                        <span>Level Progress</span>
                        <span>{nextTierPoints ? `${totalPoints}/${nextTierPoints}` : 'Max Level'}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
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

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs text-white/40 font-[350]">
                        <span>Member since Genesis</span>
                        <span>{useSnagData ? 'Verified ✓' : 'Demo Mode'}</span>
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
