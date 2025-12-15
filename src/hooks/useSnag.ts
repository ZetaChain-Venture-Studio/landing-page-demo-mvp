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
  imageUrl?: string;
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
    } catch (err) {
      console.error('Failed to fetch account:', err);
    }
  }, []);

  // Fetch rules
  const fetchRules = useCallback(async () => {
    try {
      const response = await fetch('/api/snag/rules');
      const data = await response.json();

      if (data.rules) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to fetch rules:', err);
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
      if (!account) return false;

      try {
        const response = await fetch('/api/snag/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: account.id,
            ruleId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Refresh data after completing rule
          await fetchAccount(account.walletAddress);
          await fetchRuleStatuses(account.id);
          return true;
        }

        return false;
      } catch (err) {
        console.error('Failed to complete rule:', err);
        return false;
      }
    },
    [account, fetchAccount, fetchRuleStatuses]
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
    loading,
    error,
    initializeAccount,
    completeRule,
    refreshData,
  };
}
