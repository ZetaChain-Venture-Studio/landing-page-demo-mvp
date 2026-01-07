"use client";

import { useState, useEffect, useCallback } from 'react';

interface SnagAccount {
  id: string;
  walletAddress: string;
  points: number;
  externalIdentifier?: string;
}

interface SnagRule {
  id: string;
  name: string;
  description: string;
  type: string;
  points: number;
  amount?: string | number;
  imageUrl?: string;
  isActive?: boolean;
  completionLimit?: number;
  claimType?: 'manual' | 'auto';
  hideInUi?: boolean;
  metadata?: {
    cta?: {
      label?: string;
      href?: string;
    };
    twitterAccountUrl?: string;
    referrerReward?: number;
    checkText?: string;
    requirePostLink?: boolean;
  };
}

interface SnagRuleStatus {
  loyaltyRuleId: string;
  completed: boolean;
  completedAt?: string;
  completionCount: number;
}

interface SnagRank {
  position: number;
  total: number;
}

interface UseSnagReturn {
  account: SnagAccount | null;
  rank: SnagRank | null;
  rules: SnagRule[];
  ruleStatuses: Map<string, SnagRuleStatus>;
  completedRuleIds: string[];
  loading: boolean;
  error: string | null;
  initializeAccount: (walletAddress: string, externalId?: string) => Promise<void>;
  completeRule: (ruleId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function useSnag(walletAddress?: string): UseSnagReturn {
  const [account, setAccount] = useState<SnagAccount | null>(null);
  const [rank, setRank] = useState<SnagRank | null>(null);
  const [rules, setRules] = useState<SnagRule[]>([]);
  const [ruleStatuses, setRuleStatuses] = useState<Map<string, SnagRuleStatus>>(
    new Map()
  );
  const [completedRuleIds, setCompletedRuleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch account data
  const fetchAccount = useCallback(async (address: string) => {
    try {
      const response = await fetch(`/api/snag/account?walletAddress=${address}`);
      const data = await response.json();

      if (data.account) {
        setAccount(data.account);
        setRank(data.rank || null);
      }

      // Set completed rule IDs from transactions (reliable source of truth)
      if (data.completedRuleIds && Array.isArray(data.completedRuleIds)) {
        console.log('[useSnag] Completed rule IDs from API:', data.completedRuleIds);
        setCompletedRuleIds(data.completedRuleIds);
      }
    } catch (err) {
      console.error('Failed to fetch account:', err);
    }
  }, []);

  // Fetch rules
  const fetchRules = useCallback(async () => {
    try {
      console.log('[useSnag] Fetching rules...');
      const response = await fetch('/api/snag/rules');
      console.log('[useSnag] Rules response status:', response.status);
      const data = await response.json();
      console.log('[useSnag] Rules data:', data);

      if (data.rules) {
        // Filter out hidden rules and convert amount to points
        const processedRules = data.rules
          .filter((rule: SnagRule) => !rule.hideInUi)
          .map((rule: SnagRule) => {
            const points = rule.points || (typeof rule.amount === 'string' ? parseInt(rule.amount, 10) : rule.amount) || 0;
            console.log('[useSnag] Rule:', rule.name, 'points:', points, 'ctaUrl:', rule.metadata?.twitterAccountUrl || rule.metadata?.cta?.href, 'metadata:', rule.metadata);
            return { ...rule, points };
          });
        setRules(processedRules);
        console.log('[useSnag] Set rules:', processedRules.length, '(filtered hidden)');
      } else if (data.error) {
        console.error('[useSnag] API error:', data.error, data.details);
        setError(data.error);
      }
    } catch (err) {
      console.error('[useSnag] Failed to fetch rules:', err);
      setError('Failed to fetch rules');
    }
  }, []);

  // Fetch rule statuses
  const fetchRuleStatuses = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/snag/rules/status?userId=${userId}`);
      const data = await response.json();

      if (data.statuses) {
        const statusMap = new Map<string, SnagRuleStatus>();
        data.statuses.forEach((status: SnagRuleStatus) => {
          statusMap.set(status.loyaltyRuleId, status);
        });
        setRuleStatuses(statusMap);
      }
    } catch (err) {
      console.error('Failed to fetch rule statuses:', err);
    }
  }, []);

  // Initialize account (create if doesn't exist)
  const initializeAccount = useCallback(
    async (address: string, externalId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/snag/account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            externalIdentifier: externalId,
          }),
        });

        const data = await response.json();

        if (data.account) {
          setAccount(data.account);
          // Fetch rank and statuses
          await fetchAccount(address);
          await fetchRuleStatuses(data.account.id);
        } else if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to initialize account');
        console.error('Failed to initialize account:', err);
      } finally {
        setLoading(false);
      }
    },
    [fetchAccount, fetchRuleStatuses]
  );

  // Complete a rule
  const completeRule = useCallback(
    async (ruleId: string): Promise<boolean> => {
      if (!walletAddress && !account) {
        console.error('[useSnag] Cannot complete rule: no wallet address or account');
        return false;
      }

      try {
        console.log('[useSnag] Completing rule:', { ruleId, accountId: account?.id, walletAddress });

        const response = await fetch('/api/snag/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: account?.id,
            walletAddress: walletAddress,
            ruleId,
          }),
        });

        const data = await response.json();
        console.log('[useSnag] Complete rule response:', data);

        if (data.success) {
          // Refresh data after completing rule
          if (walletAddress) {
            await fetchAccount(walletAddress);
          }
          if (account?.id) {
            await fetchRuleStatuses(account.id);
          }
          return true;
        }

        return false;
      } catch (err) {
        console.error('[useSnag] Failed to complete rule:', err);
        return false;
      }
    },
    [account, walletAddress, fetchAccount, fetchRuleStatuses]
  );

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchAccount(walletAddress),
        fetchRules(),
      ]);

      if (account?.id) {
        await fetchRuleStatuses(account.id);
      }
    } finally {
      setLoading(false);
    }
  }, [walletAddress, account?.id, fetchAccount, fetchRules, fetchRuleStatuses]);

  // Initial data fetch when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchAccount(walletAddress);
      fetchRules();
    }
  }, [walletAddress, fetchAccount, fetchRules]);

  // Fetch rule statuses when account is loaded
  useEffect(() => {
    if (account?.id) {
      fetchRuleStatuses(account.id);
    }
  }, [account?.id, fetchRuleStatuses]);

  return {
    account,
    rank,
    rules,
    ruleStatuses,
    completedRuleIds,
    loading,
    error,
    initializeAccount,
    completeRule,
    refreshData,
  };
}
