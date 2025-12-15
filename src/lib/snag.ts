// SnagSolutions API Client
// Docs: https://docs.snagsolutions.io

const SNAG_API_URL = process.env.SNAG_API_URL || 'https://admin.snagsolutions.io/api';
const SNAG_API_KEY = process.env.SNAG_API_KEY || '';
const SNAG_WEBSITE_ID = process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID || '';

interface SnagAccount {
  id: string;
  walletAddress: string;
  points: number;
  externalIdentifier?: string;
  createdAt: string;
}

interface SnagRule {
  id: string;
  name: string;
  description: string;
  type: string;
  points: number;
  imageUrl?: string;
  isActive: boolean;
  completionLimit?: number;
}

interface SnagRuleStatus {
  loyaltyRuleId: string;
  completed: boolean;
  completedAt?: string;
  completionCount: number;
}

interface SnagTransaction {
  id: string;
  amount: number;
  description?: string;
  loyaltyRuleId?: string;
  createdAt: string;
}

interface SnagLeaderboardEntry {
  rank: number;
  walletAddress: string;
  points: number;
  userId: string;
}

class SnagSolutionsClient {
  private apiKey: string;
  private baseUrl: string;
  private websiteId: string;

  constructor() {
    this.apiKey = SNAG_API_KEY;
    this.baseUrl = SNAG_API_URL;
    this.websiteId = SNAG_WEBSITE_ID;
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
      const accounts = await this.request<{ data: SnagAccount[] }>(
        `/loyalty/accounts?walletAddress=${walletAddress}&websiteId=${this.websiteId}`
      );
      return accounts.data?.[0] || null;
    } catch {
      return null;
    }
  }

  async getAccountByExternalId(externalId: string): Promise<SnagAccount | null> {
    try {
      const accounts = await this.request<{ data: SnagAccount[] }>(
        `/loyalty/accounts?externalIdentifier=${externalId}&websiteId=${this.websiteId}`
      );
      return accounts.data?.[0] || null;
    } catch {
      return null;
    }
  }

  async createAccount(
    walletAddress: string,
    externalIdentifier?: string
  ): Promise<SnagAccount> {
    return this.request<SnagAccount>('/users', {
      method: 'POST',
      body: JSON.stringify({
        walletAddress,
        externalIdentifier,
        websiteId: this.websiteId,
      }),
    });
  }

  async getOrCreateAccount(
    walletAddress: string,
    externalIdentifier?: string
  ): Promise<SnagAccount> {
    let account = await this.getAccount(walletAddress);
    if (!account) {
      account = await this.createAccount(walletAddress, externalIdentifier);
    }
    return account;
  }

  async getAccountRank(walletAddress: string): Promise<{ position: number; total: number }> {
    const account = await this.getAccount(walletAddress);
    if (!account) {
      return { position: 0, total: 0 };
    }

    return this.request<{ position: number; total: number }>(
      `/loyalty/accounts/${account.id}/rank?websiteId=${this.websiteId}`
    );
  }

  // ============ RULES / TASKS ============

  async getRules(): Promise<SnagRule[]> {
    const response = await this.request<{ data: SnagRule[] }>(
      `/loyalty/rules?websiteId=${this.websiteId}&isActive=true`
    );
    return response.data || [];
  }

  async getRuleStatus(userId: string, ruleId: string): Promise<SnagRuleStatus | null> {
    try {
      const response = await this.request<{ data: SnagRuleStatus[] }>(
        `/loyalty/rules/status?userId=${userId}&loyaltyRuleId=${ruleId}&websiteId=${this.websiteId}`
      );
      return response.data?.[0] || null;
    } catch {
      return null;
    }
  }

  async getAllRuleStatuses(userId: string): Promise<SnagRuleStatus[]> {
    try {
      const response = await this.request<{ data: SnagRuleStatus[] }>(
        `/loyalty/rules/status?userId=${userId}&websiteId=${this.websiteId}`
      );
      return response.data || [];
    } catch {
      return [];
    }
  }

  async completeRule(userId: string, ruleId: string): Promise<boolean> {
    try {
      await this.request('/loyalty/rules/complete', {
        method: 'POST',
        body: JSON.stringify({
          loyaltyRuleId: ruleId,
          userId,
          websiteId: this.websiteId,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  // ============ TRANSACTIONS / POINTS ============

  async awardPoints(
    walletAddress: string,
    amount: number,
    ruleId: string,
    description?: string
  ): Promise<SnagTransaction> {
    return this.request<SnagTransaction>('/loyalty/transactions', {
      method: 'POST',
      body: JSON.stringify({
        walletAddress,
        amount,
        loyaltyRuleId: ruleId,
        description,
        websiteId: this.websiteId,
      }),
    });
  }

  async getTransactions(walletAddress: string): Promise<SnagTransaction[]> {
    const response = await this.request<{ data: SnagTransaction[] }>(
      `/loyalty/transaction_entries?walletAddress=${walletAddress}&websiteId=${this.websiteId}`
    );
    return response.data || [];
  }

  // ============ LEADERBOARD ============

  async getLeaderboard(limit = 100, offset = 0): Promise<SnagLeaderboardEntry[]> {
    const response = await this.request<{ data: SnagLeaderboardEntry[] }>(
      `/loyalty/leaderboard?websiteId=${this.websiteId}&limit=${limit}&offset=${offset}`
    );
    return response.data || [];
  }
}

// Export singleton instance
export const snagClient = new SnagSolutionsClient();

// Export types
export type {
  SnagAccount,
  SnagRule,
  SnagRuleStatus,
  SnagTransaction,
  SnagLeaderboardEntry,
};
