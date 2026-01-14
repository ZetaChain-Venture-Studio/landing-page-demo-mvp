"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// ============ TIPOS ============

export interface SnagAccount {
  id: string;
  walletAddress: string;
  points: number;
  externalIdentifier?: string;
  twitterUser?: string;
  discordUser?: string;
  telegramUsername?: string;
  tiktokUser?: string;
}

export interface SnagRule {
  id: string;
  name: string;
  description: string;
  type: string;
  uiType: string;
  points: number;
  amount?: string | number;
  imageUrl?: string;
  isActive?: boolean;
  completionLimit?: number;
  claimType?: 'manual' | 'auto';
  hideInUi?: boolean;
  ctaUrl?: string;
  icon?: string;
  metadata?: {
    cta?: { label?: string; href?: string };
    twitterAccountUrl?: string;
    referrerReward?: number;
    checkText?: string;
    requirePostLink?: boolean;
  };
}

export interface SnagRuleStatus {
  loyaltyRuleId: string;
  completed: boolean;
  completedAt?: string;
  completionCount: number;
}

export interface SnagRank {
  position: number;
  total: number;
}

export interface SocialStatus {
  connected: Record<string, boolean>;
  handles: Record<string, string | null>;
}

export interface UseSnagReturn {
  account: SnagAccount | null;
  rank: SnagRank | null;
  rules: SnagRule[];
  ruleStatuses: Map<string, SnagRuleStatus>;
  completedRuleIds: string[];
  socialStatus: SocialStatus | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  initializeAccount: (walletAddress: string, externalId?: string) => Promise<void>;
  completeRule: (ruleId: string) => Promise<{ success: boolean; points?: number; error?: string }>;
  refreshData: () => Promise<void>;
  refreshSocialStatus: () => Promise<void>;
  
  isRuleCompleted: (ruleId: string) => boolean;
  getRulesByType: (uiType: string) => SnagRule[];
  getTotalPointsFromRules: (uiType: string) => number;
}

export function useSnag(walletAddress?: string): UseSnagReturn {
  const [account, setAccount] = useState<SnagAccount | null>(null);
  const [rank, setRank] = useState<SnagRank | null>(null);
  const [rules, setRules] = useState<SnagRule[]>([]);
  const [ruleStatuses, setRuleStatuses] = useState<Map<string, SnagRuleStatus>>(new Map());
  const [completedRuleIds, setCompletedRuleIds] = useState<string[]>([]);
  const [socialStatus, setSocialStatus] = useState<SocialStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Refs para evitar llamadas duplicadas
  const initializingRef = useRef(false);
  const lastWalletRef = useRef<string | null>(null);
  const dataLoadedRef = useRef(false);

  // ============ FETCH FUNCTIONS ============

  // Obtener estado de redes sociales (llamada separada para refrescar)
  const fetchSocialStatus = useCallback(async (address: string) => {
    try {
      const response = await fetch(`/api/social/status?walletAddress=${address}`);
      const data = await response.json();
      setSocialStatus(data);
      return data;
    } catch (err) {
      console.error('[useSnag] Error al obtener estado social:', err);
      return null;
    }
  }, []);

  // Obtener cuenta (incluye socialStatus, rank, completedRuleIds)
  const fetchAccount = useCallback(async (address: string) => {
    try {
      console.log('[useSnag] Obteniendo cuenta para:', address);
      const response = await fetch(`/api/snag/account?walletAddress=${address}`);
      const data = await response.json();

      if (data.account) {
        setAccount(data.account);
        setRank(data.rank || null);
        console.log('[useSnag] Cuenta obtenida:', data.account.id, 'puntos:', data.account.points);
      }

      if (data.completedRuleIds && Array.isArray(data.completedRuleIds)) {
        setCompletedRuleIds(data.completedRuleIds);
      }

      if (data.socialStatus) {
        setSocialStatus(data.socialStatus);
      }

      return data.account;
    } catch (err) {
      console.error('[useSnag] Error al obtener cuenta:', err);
      return null;
    }
  }, []);

  // Obtener reglas desde Snag
  const fetchRules = useCallback(async () => {
    try {
      console.log('[useSnag] Obteniendo reglas...');
      const response = await fetch('/api/snag/rules');
      const data = await response.json();

      if (data.rules) {
        setRules(data.rules);
        console.log('[useSnag] Reglas obtenidas:', data.rules.length);
      } else if (data.error) {
        console.error('[useSnag] Error API:', data.error);
        setError(data.error);
      }
    } catch (err) {
      console.error('[useSnag] Error al obtener reglas:', err);
      setError('Failed to fetch rules');
    }
  }, []);

  // Obtener estados de reglas
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
      console.error('[useSnag] Error al obtener estados:', err);
    }
  }, []);

  // ============ ACTIONS ============

  // Inicializar cuenta - Solo crea si no existe
  const initializeAccount = useCallback(
    async (address: string, externalId?: string) => {
      if (initializingRef.current) return;
      if (initialized && lastWalletRef.current === address && account) return;

      initializingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        console.log('[useSnag] Inicializando cuenta para:', address);
        
        // POST crea/actualiza el usuario
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
          lastWalletRef.current = address;
          setInitialized(true);
          console.log('[useSnag] Cuenta inicializada:', data.account.id);
        } else if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to initialize account');
        console.error('[useSnag] Error al inicializar:', err);
      } finally {
        setLoading(false);
        initializingRef.current = false;
      }
    },
    [initialized, account]
  );

  // Completar una regla
  const completeRule = useCallback(
    async (ruleId: string): Promise<{ success: boolean; points?: number; error?: string }> => {
      if (!walletAddress && !account) {
        return { success: false, error: 'No wallet address' };
      }

      try {
        console.log('[useSnag] Completando regla:', ruleId);

        const response = await fetch('/api/snag/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress, ruleId }),
        });

        const data = await response.json();
        console.log('[useSnag] Respuesta de completar regla:', data);

        if (data.success && walletAddress) {
          // Refrescar datos de cuenta (puntos, completedRuleIds)
          await fetchAccount(walletAddress);
          if (account?.id) {
            await fetchRuleStatuses(account.id);
          }
          return { success: true, points: data.points };
        }

        return { success: false, error: data.error || 'Failed to complete rule' };
      } catch (err) {
        console.error('[useSnag] Error al completar regla:', err);
        return { success: false, error: 'Network error' };
      }
    },
    [account, walletAddress, fetchAccount, fetchRuleStatuses]
  );

  // Refrescar todos los datos
  const refreshData = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      await Promise.all([fetchAccount(walletAddress), fetchRules()]);
      if (account?.id) {
        await fetchRuleStatuses(account.id);
      }
    } finally {
      setLoading(false);
    }
  }, [walletAddress, account?.id, fetchAccount, fetchRules, fetchRuleStatuses]);

  // Refrescar solo estado social
  const refreshSocialStatus = useCallback(async () => {
    if (!walletAddress) return;
    await fetchSocialStatus(walletAddress);
  }, [walletAddress, fetchSocialStatus]);

  // ============ HELPERS ============

  const isRuleCompleted = useCallback((ruleId: string): boolean => {
    return completedRuleIds.includes(ruleId);
  }, [completedRuleIds]);

  const getRulesByType = useCallback((uiType: string): SnagRule[] => {
    return rules.filter(r => r.uiType === uiType);
  }, [rules]);

  const getTotalPointsFromRules = useCallback((uiType: string): number => {
    return rules.filter(r => r.uiType === uiType).reduce((sum, r) => sum + r.points, 0);
  }, [rules]);

  // ============ EFFECTS ============

  // Cargar datos UNA SOLA VEZ cuando hay wallet
  useEffect(() => {
    if (!walletAddress) return;
    if (dataLoadedRef.current && lastWalletRef.current === walletAddress) return;
    
    console.log('[useSnag] Cargando datos iniciales...');
    lastWalletRef.current = walletAddress;
    dataLoadedRef.current = true;
    
    // Cargar todo en paralelo
    Promise.all([fetchAccount(walletAddress), fetchRules()]);
  }, [walletAddress, fetchAccount, fetchRules]);

  // Cargar estados de reglas cuando se obtiene account.id
  useEffect(() => {
    if (account?.id && !initializingRef.current) {
      fetchRuleStatuses(account.id);
    }
  }, [account?.id, fetchRuleStatuses]);

  return {
    account,
    rank,
    rules,
    ruleStatuses,
    completedRuleIds,
    socialStatus,
    loading,
    error,
    initialized,
    
    initializeAccount,
    completeRule,
    refreshData,
    refreshSocialStatus,
    
    isRuleCompleted,
    getRulesByType,
    getTotalPointsFromRules,
  };
}
