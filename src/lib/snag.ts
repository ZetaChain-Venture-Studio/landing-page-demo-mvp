// SnagSolutions API Client
// Docs: https://docs.snagsolutions.io

const SNAG_API_URL = process.env.SNAG_API_URL || 'https://admin.snagsolutions.io/api';
const SNAG_API_KEY = process.env.SNAG_API_KEY || '';
const SNAG_WEBSITE_ID = process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID || '';
const SNAG_ORG_ID = process.env.SNAG_ORG_ID || '';
const SNAG_CURRENCY_ID = process.env.SNAG_CURRENCY_ID || '';

export interface SnagAccount {
  id: string;
  walletAddress: string;
  points: number;
  externalIdentifier?: string;
  createdAt?: string;
}

export interface SnagRule {
  id: string;
  name: string;
  description: string;
  type: string;
  amount: string | number;
  points?: number;
  imageUrl?: string;
  isActive: boolean;
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

export interface SnagRuleStatus {
  loyaltyRuleId: string;
  completed: boolean;
  completedAt?: string;
  completionCount: number;
}

export interface SnagTransaction {
  id: string;
  amount: number;
  description?: string;
  loyaltyRuleId?: string;
  createdAt: string;
}

export interface SnagLeaderboardEntry {
  rank: number;
  walletAddress: string;
  points: number;
  userId: string;
}

class SnagSolutionsClient {
  private apiKey: string;
  private baseUrl: string;
  private websiteId: string;
  private orgId: string;
  private currencyId: string;

  constructor() {
    this.apiKey = SNAG_API_KEY;
    this.baseUrl = SNAG_API_URL;
    this.websiteId = SNAG_WEBSITE_ID;
    this.orgId = SNAG_ORG_ID;
    this.currencyId = SNAG_CURRENCY_ID;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Snag API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // ============ ACCOUNTS ============

  async getAccount(walletAddress: string): Promise<SnagAccount | null> {
    try {
      const normalizedWallet = walletAddress.toLowerCase();
      console.log('[Snag] Fetching account for wallet:', normalizedWallet);

      const response = await this.request<{ data: SnagAccount[] }>(
        `/loyalty/accounts?walletAddress=${normalizedWallet}&websiteId=${this.websiteId}`
      );

      console.log('[Snag] Raw account response:', JSON.stringify(response, null, 2));

      const account = response.data?.[0];
      if (!account) return null;

      // Handle different point field names - Snag may return balances in various formats
      const accountData = account as unknown as Record<string, unknown>;

      // Try to get points from various possible fields
      let points = 0;

      // Check for direct points/balance fields
      if (typeof accountData.points === 'number') {
        points = accountData.points;
      } else if (typeof accountData.balance === 'number') {
        points = accountData.balance;
      } else if (typeof accountData.loyaltyBalance === 'number') {
        points = accountData.loyaltyBalance;
      } else if (Array.isArray(accountData.balances)) {
        // Sum up all currency balances
        points = (accountData.balances as Array<{ balance?: number; amount?: number }>).reduce(
          (sum, b) => sum + (b.balance || b.amount || 0), 0
        );
      }

      console.log('[Snag] Found account:', account.id, 'points:', points);

      return {
        id: account.id,
        walletAddress: account.walletAddress || normalizedWallet,
        points: Number(points),
        createdAt: account.createdAt,
      };
    } catch (error) {
      console.error('[Snag] Error fetching account:', error);
      return null;
    }
  }

  // Fetch account balance separately (more reliable)
  async getAccountBalance(walletAddress: string): Promise<number> {
    try {
      const normalizedWallet = walletAddress.toLowerCase();

      // Try fetching transactions to calculate balance
      const transactions = await this.getTransactions(normalizedWallet);
      // Ensure we're adding numbers, not strings
      const totalFromTxns = transactions.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

      console.log('[Snag] Calculated balance from transactions:', totalFromTxns);
      return Number(totalFromTxns) || 0;
    } catch (error) {
      console.error('[Snag] Error fetching balance:', error);
      return 0;
    }
  }

  async createAccount(
    walletAddress: string,
    externalIdentifier?: string
  ): Promise<SnagAccount | null> {
    const normalizedWallet = walletAddress.toLowerCase();

    // Try multiple methods to create account
    const attempts = [
      {
        // Method 1: Create user metadata (per Snag docs)
        endpoint: '/users/metadatas',
        body: {
          walletAddress: normalizedWallet,
          organizationId: this.orgId,
        },
      },
      {
        // Method 2: Loyalty users endpoint
        endpoint: '/loyalty/users',
        body: {
          walletAddress: normalizedWallet,
          websiteId: this.websiteId,
          organizationId: this.orgId,
          externalIdentifier,
        },
      },
      {
        // Method 3: Complete waitlist rule (auto-creates account)
        // Rule ID goes in URL path, not body
        endpoint: '/loyalty/rules/b17b786f-1398-4b78-966a-10a68ae82cbc/complete',
        body: {
          walletAddress: normalizedWallet,
          websiteId: this.websiteId,
        },
      },
    ];

    for (const attempt of attempts) {
      try {
        console.log(`[Snag] Trying ${attempt.endpoint} for:`, normalizedWallet);
        await this.request(attempt.endpoint, {
          method: 'POST',
          body: JSON.stringify(attempt.body),
        });

        // Check if account was created
        const account = await this.getAccount(normalizedWallet);
        if (account) {
          console.log('[Snag] Account created via', attempt.endpoint);
          return account;
        }
      } catch (error) {
        console.log(`[Snag] ${attempt.endpoint} failed:`, error);
      }
    }

    console.error('[Snag] All account creation methods failed for:', normalizedWallet);
    return null;
  }

  async getOrCreateAccount(
    walletAddress: string,
    externalIdentifier?: string
  ): Promise<SnagAccount | null> {
    let account = await this.getAccount(walletAddress);
    if (!account) {
      account = await this.createAccount(walletAddress, externalIdentifier);
    }
    return account;
  }

  async getAccountRank(walletAddress: string): Promise<{ position: number; total: number }> {
    try {
      const account = await this.getAccount(walletAddress);
      if (!account) return { position: 0, total: 0 };

      const response = await this.request<{ rank: number; totalUsers: number }>(
        `/loyalty/accounts/${account.id}/rank?websiteId=${this.websiteId}`
      );

      return {
        position: response.rank || 0,
        total: response.totalUsers || 0,
      };
    } catch (error) {
      console.error('[Snag] Error getting rank:', error);
      return { position: 0, total: 0 };
    }
  }

  // ============ RULES / TASKS ============

  async getRules(): Promise<SnagRule[]> {
    try {
      const response = await this.request<{ data: SnagRule[] }>(
        `/loyalty/rules?websiteId=${this.websiteId}&isActive=true`
      );

      return (response.data || []).map((rule) => ({
        ...rule,
        points: Number(rule.amount) || 0,
      }));
    } catch (error) {
      console.error('[Snag] Error fetching rules:', error);
      return [];
    }
  }

  async getAllRuleStatuses(userId: string): Promise<SnagRuleStatus[]> {
    try {
      const response = await this.request<{ data: SnagRuleStatus[] }>(
        `/loyalty/rules/status?userId=${userId}&websiteId=${this.websiteId}`
      );

      return response.data || [];
    } catch (error) {
      console.error('[Snag] Error fetching rule statuses:', error);
      return [];
    }
  }

  async completeRule(userId: string, ruleId: string, walletAddress?: string): Promise<boolean> {
    try {
      console.log('[Snag] Completing rule:', { userId, ruleId, walletAddress });
      // Rule ID goes in URL path per Snag API
      // Send both userId and walletAddress for compatibility
      const body: Record<string, string> = {
        websiteId: this.websiteId,
      };

      if (userId) body.userId = userId;
      if (walletAddress) body.walletAddress = walletAddress.toLowerCase();

      await this.request(`/loyalty/rules/${ruleId}/complete`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      console.log('[Snag] Rule completed successfully');
      return true;
    } catch (error) {
      console.error('[Snag] Failed to complete rule:', error);
      return false;
    }
  }

  async completeRuleByWallet(walletAddress: string, ruleId: string): Promise<boolean> {
    const normalizedWallet = walletAddress.toLowerCase();

    try {
      // First ensure account exists
      let account = await this.getAccount(normalizedWallet);

      if (!account) {
        console.log('[Snag] Account not found, creating...');
        account = await this.createAccount(normalizedWallet);
      }

      if (account) {
        // Complete with both userId and walletAddress
        return this.completeRule(account.id, ruleId, normalizedWallet);
      }

      // Fallback: Try completing with wallet directly
      console.log('[Snag] Completing rule with wallet address only');
      await this.request(`/loyalty/rules/${ruleId}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: normalizedWallet,
          websiteId: this.websiteId,
        }),
      });
      return true;
    } catch (error) {
      console.error('[Snag] Failed to complete rule by wallet:', error);

      // Last resort: Try awarding points directly via transaction
      try {
        const rules = await this.getRules();
        const rule = rules.find(r => r.id === ruleId);
        if (rule && rule.points) {
          console.log('[Snag] Trying direct point award as fallback');
          const txn = await this.awardPoints(normalizedWallet, rule.points, ruleId, rule.name);
          return !!txn;
        }
      } catch (txnError) {
        console.error('[Snag] Fallback point award failed:', txnError);
      }

      return false;
    }
  }

  // ============ TRANSACTIONS / POINTS ============

  async awardPoints(
    walletAddress: string,
    amount: number,
    ruleId: string,
    description?: string
  ): Promise<SnagTransaction | null> {
    try {
      console.log('[Snag] Awarding points:', { walletAddress, amount, ruleId, currencyId: this.currencyId });

      // Snag API expects "description" at top level and "direction" in each entry
      const desc = description || `Points award: ${amount}`;
      const response = await this.request<{ data: SnagTransaction[] }>('/loyalty/transactions', {
        method: 'POST',
        body: JSON.stringify({
          description: desc,
          entries: [
            {
              walletAddress: walletAddress.toLowerCase(),
              amount,
              direction: 'credit', // 'credit' to add points, 'debit' to subtract
              loyaltyRuleId: ruleId,
              loyaltyCurrencyId: this.currencyId,
              websiteId: this.websiteId,
            }
          ]
        }),
      });

      console.log('[Snag] Points awarded successfully:', response);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('[Snag] Error awarding points:', error);
      return null;
    }
  }

  async getTransactions(walletAddress: string): Promise<SnagTransaction[]> {
    try {
      const response = await this.request<{ data: SnagTransaction[] }>(
        `/loyalty/transaction_entries?walletAddress=${walletAddress.toLowerCase()}&websiteId=${this.websiteId}`
      );

      return response.data || [];
    } catch (error) {
      console.error('[Snag] Error fetching transactions:', error);
      return [];
    }
  }

  // Get rule IDs that have been completed (from transactions)
  async getCompletedRuleIds(walletAddress: string): Promise<string[]> {
    try {
      const transactions = await this.getTransactions(walletAddress);
      // Extract unique rule IDs from transactions
      const ruleIds = new Set<string>();
      transactions.forEach(txn => {
        if (txn.loyaltyRuleId) {
          ruleIds.add(txn.loyaltyRuleId);
        }
      });
      console.log('[Snag] Completed rule IDs from transactions:', [...ruleIds]);
      return [...ruleIds];
    } catch (error) {
      console.error('[Snag] Error getting completed rule IDs:', error);
      return [];
    }
  }

  // ============ LEADERBOARD ============

  async getLeaderboard(limit = 100, offset = 0): Promise<SnagLeaderboardEntry[]> {
    try {
      const response = await this.request<{ data: SnagLeaderboardEntry[] }>(
        `/loyalty/leaderboard?websiteId=${this.websiteId}&limit=${limit}&offset=${offset}`
      );

      return response.data || [];
    } catch (error) {
      console.error('[Snag] Error fetching leaderboard:', error);
      return [];
    }
  }
}

// Export singleton instance
export const snagClient = new SnagSolutionsClient();
