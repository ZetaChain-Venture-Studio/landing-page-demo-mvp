"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Modern minimalism color palette
const colors = {
  bg: '#fafaff',           // Ghost White
  bgAlt: '#eef0f2',        // Platinum
  text: '#1c1c1c',         // Carbon Black
  textMuted: '#4a4a4a',
  textLight: '#7a7a7a',
  accent: '#1c1c1c',       // Carbon Black
  accentLight: '#daddd8',  // Dust Grey
  border: '#daddd8',
};

interface AdminStats {
  totalUsers: number;
  totalPoints: number;
  totalTasks: number;
  totalReferrals: number;
  recentUsers: Array<{
    id: string;
    email: string;
    walletAddress: string | null;
    totalPoints: number;
    createdAt: string;
    tasksCompleted: number;
  }>;
  taskBreakdown: Array<{
    taskType: string;
    taskName: string;
    count: number;
    pointsEarned: number;
  }>;
  message?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || 'Failed to fetch stats');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: colors.accent, borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: colors.textLight }}>
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="text-center p-8 rounded-xl" style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}>
          <p className="text-lg mb-2" style={{ color: colors.text }}>Error loading dashboard</p>
          <p className="text-sm" style={{ color: colors.textMuted }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Inter',sans-serif]" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <header className="px-8 py-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: colors.accent }}
              >
                C
              </div>
              <span className="text-lg font-medium tracking-tight" style={{ color: colors.text }}>
                Cloister.AI
              </span>
            </Link>
            <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: colors.bgAlt, color: colors.textMuted }}>
              Admin
            </span>
          </div>
          <Link
            href="/"
            className="text-sm transition-colors"
            style={{ color: colors.textMuted }}
          >
            Back to Landing
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-light tracking-tight mb-2" style={{ color: colors.text }}>
              Admin Dashboard
            </h1>
            <p className="text-sm" style={{ color: colors.textLight }}>
              Overview of waitlist activity and user engagement
            </p>
          </motion.div>

          {/* Database Notice */}
          {stats?.message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl"
              style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
            >
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {stats.message}
              </p>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Total Users"
              value={stats?.totalUsers || 0}
              delay={0.1}
            />
            <StatCard
              label="Total Points"
              value={stats?.totalPoints || 0}
              delay={0.15}
            />
            <StatCard
              label="Tasks Completed"
              value={stats?.totalTasks || 0}
              delay={0.2}
            />
            <StatCard
              label="Referrals"
              value={stats?.totalReferrals || 0}
              delay={0.25}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Users */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
            >
              <h2 className="text-lg font-medium mb-4" style={{ color: colors.text }}>
                Recent Users
              </h2>
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
                          {user.email}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: colors.accentLight, color: 'white' }}>
                          {user.totalPoints} pts
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: colors.textLight }}>
                        {user.tasksCompleted} tasks · {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: colors.textLight }}>
                  No users yet
                </p>
              )}
            </motion.div>

            {/* Task Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
            >
              <h2 className="text-lg font-medium mb-4" style={{ color: colors.text }}>
                Task Breakdown
              </h2>
              {stats?.taskBreakdown && stats.taskBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {stats.taskBreakdown.map((task, index) => (
                    <div
                      key={`${task.taskType}-${index}`}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium" style={{ color: colors.text }}>
                          {task.taskName}
                        </p>
                        <span className="text-xs" style={{ color: colors.textMuted }}>
                          {task.count} completed
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase tracking-wider" style={{ color: colors.textLight }}>
                          {task.taskType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs" style={{ color: colors.accent }}>
                          {task.pointsEarned} pts earned
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: colors.textLight }}>
                  No tasks completed yet
                </p>
              )}
            </motion.div>
          </div>

          {/* Quick Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-6 rounded-xl"
            style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
          >
            <h2 className="text-lg font-medium mb-4" style={{ color: colors.text }}>
              Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-light" style={{ color: colors.text }}>
                  {stats?.totalUsers ? (stats.totalPoints / stats.totalUsers).toFixed(0) : 0}
                </p>
                <p className="text-xs uppercase tracking-wider" style={{ color: colors.textLight }}>
                  Avg Points/User
                </p>
              </div>
              <div>
                <p className="text-2xl font-light" style={{ color: colors.text }}>
                  {stats?.totalUsers ? (stats.totalTasks / stats.totalUsers).toFixed(1) : 0}
                </p>
                <p className="text-xs uppercase tracking-wider" style={{ color: colors.textLight }}>
                  Avg Tasks/User
                </p>
              </div>
              <div>
                <p className="text-2xl font-light" style={{ color: colors.text }}>
                  {stats?.totalTasks ? ((stats.totalReferrals / stats.totalTasks) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-xs uppercase tracking-wider" style={{ color: colors.textLight }}>
                  Referral Rate
                </p>
              </div>
              <div>
                <p className="text-2xl font-light" style={{ color: colors.text }}>
                  {stats?.taskBreakdown?.length || 0}
                </p>
                <p className="text-xs uppercase tracking-wider" style={{ color: colors.textLight }}>
                  Active Tasks
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 mt-10" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs" style={{ color: colors.textLight }}>
            Cloister.AI Admin Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-6 rounded-xl text-center"
      style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
    >
      <p className="text-3xl font-light mb-1" style={{ color: colors.text }}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs uppercase tracking-wider" style={{ color: colors.textLight }}>
        {label}
      </p>
    </motion.div>
  );
}
