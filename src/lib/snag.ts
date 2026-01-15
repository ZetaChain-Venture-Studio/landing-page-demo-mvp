/**
 * SnagSolutions SDK Client
 * Integración con Snag Loyalty usando el SDK oficial @snagsolutions/sdk
 * Docs: https://docs.snagsolutions.io
 * 
 * IMPORTANTE: Este cliente debe usarse solo en el servidor (API routes, getServerSideProps)
 * Nunca expongas la API key en el cliente/browser.
 */

import SnagSolutions from '@snagsolutions/sdk';

// ============ CONFIGURACIÓN ============
// Estas variables deben estar en .env (sin NEXT_PUBLIC_ para mantenerlas seguras)
const SNAG_API_KEY = process.env.SNAG_API_KEY || '';
const SNAG_API_URL = process.env.SNAG_API_URL || 'https://admin.snagsolutions.io/api';
const SNAG_WEBSITE_ID = process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID || '';
const SNAG_ORG_ID = process.env.SNAG_ORG_ID || '';
const SNAG_CURRENCY_ID = process.env.SNAG_CURRENCY_ID || '';

// ============ TIPOS ============
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

export interface SnagRuleGroup {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
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

export interface SnagUserMetadata {
  walletAddress: string;
  externalIdentifier?: string;
  discordUser?: string;
  twitterUser?: string;
  telegramUsername?: string;
  emailAddress?: string;
  displayName?: string;
}

// Tipos de wallet soportados por Snag
type WalletType = 'evm' | 'ton' | 'sui' | 'cosmos' | 'solana' | 'imx' | 'ultra' | 'agw' | 'flow_cadence' | 'substrate';

// ============ CLIENTE SDK ============

/**
 * Cliente de Snag Solutions
 * Usa el SDK oficial donde está disponible, y llamadas HTTP directas para endpoints adicionales
 */
class SnagSolutionsClient {
  private sdk: SnagSolutions;
  private websiteId: string;
  private orgId: string;
  private currencyId: string;
  private baseUrl: string;
  private apiKey: string;
  private initialized: boolean = false;

  constructor() {
    this.websiteId = SNAG_WEBSITE_ID;
    this.orgId = SNAG_ORG_ID;
    this.currencyId = SNAG_CURRENCY_ID;
    this.baseUrl = SNAG_API_URL;
    this.apiKey = SNAG_API_KEY;

    // Inicializar SDK con la API key
    if (SNAG_API_KEY) {
      this.sdk = new SnagSolutions({
        apiKey: SNAG_API_KEY,
      });
      this.initialized = true;
      console.log('[Snag SDK] Cliente inicializado correctamente');
    } else {
      console.warn('[Snag SDK] ⚠️ SNAG_API_KEY no configurada. El cliente no funcionará.');
      // Crear instancia vacía para evitar errores
      this.sdk = new SnagSolutions({ apiKey: '' });
    }
  }

  /**
   * Realiza una petición HTTP a la API de Snag
   * Usado para endpoints no cubiertos por el SDK
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      const errorText = await response.text();
      throw new Error(`Snag API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Verifica si el SDK está correctamente configurado
   */
  isConfigured(): boolean {
    return this.initialized && !!this.apiKey && !!this.websiteId;
  }

  /**
   * Obtiene los IDs de configuración actuales
   */
  getConfig() {
    return {
      websiteId: this.websiteId,
      orgId: this.orgId,
      currencyId: this.currencyId,
      isConfigured: this.isConfigured(),
    };
  }

  // ============ USUARIOS ============

  /**
   * Obtiene un usuario por wallet address desde /users/metadatas
   * Este es el endpoint principal para usuarios según la documentación de Snag
   */
  async getUserMetadata(walletAddress: string): Promise<SnagAccount | null> {
    if (!this.isConfigured()) {
      console.error('[Snag SDK] Cliente no configurado');
      return null;
    }

    try {
      const normalizedWallet = walletAddress.toLowerCase();
      console.log('[Snag SDK] Buscando usuario en metadatas para wallet:', normalizedWallet);

      // Buscar en /users/metadatas que es donde se crean los usuarios
      const response = await this.request<{ 
        data?: Array<{
          id?: string;
          walletAddress?: string;
          externalIdentifier?: string;
          createdAt?: string;
        }>;
        id?: string;
        walletAddress?: string;
        externalIdentifier?: string;
        createdAt?: string;
      }>(
        `/users/metadatas?walletAddress=${normalizedWallet}&organizationId=${this.orgId}`
      );

      // La respuesta puede venir como array en data o como objeto directo
      const userData = response.data?.[0] || (response.id ? response : null);
      
      if (!userData || !userData.id) {
        console.log('[Snag SDK] Usuario no encontrado en metadatas para wallet:', normalizedWallet);
        return null;
      }

      console.log('[Snag SDK] Usuario encontrado en metadatas:', userData.id);

      return {
        id: String(userData.id),
        walletAddress: String(userData.walletAddress || normalizedWallet),
        points: 0, // Los puntos se obtienen por separado
        externalIdentifier: userData.externalIdentifier,
        createdAt: userData.createdAt,
      };
    } catch (error) {
      console.error('[Snag SDK] Error al obtener usuario de metadatas:', error);
      return null;
    }
  }

  /**
   * Obtiene una cuenta de usuario por wallet address
   * Primero busca en metadatas, luego en loyalty accounts
   */
  async getAccount(walletAddress: string): Promise<SnagAccount | null> {
    if (!this.isConfigured()) {
      console.error('[Snag SDK] Cliente no configurado');
      return null;
    }

    const normalizedWallet = walletAddress.toLowerCase();
    
    // Primero intentar obtener desde metadatas (donde se crean los usuarios)
    const userMetadata = await this.getUserMetadata(normalizedWallet);
    
    if (userMetadata) {
      // Obtener balance desde transacciones
      const balance = await this.getAccountBalance(normalizedWallet);
      return {
        ...userMetadata,
        points: balance,
      };
    }

    // Fallback: buscar en loyalty accounts (usuarios con transacciones)
    try {
      console.log('[Snag SDK] Buscando en loyalty accounts para wallet:', normalizedWallet);

      const response = await this.request<{ data: Record<string, unknown>[] }>(
        `/loyalty/accounts?walletAddress=${normalizedWallet}&websiteId=${this.websiteId}`
      );

      const user = response.data?.[0];
      if (!user) {
        console.log('[Snag SDK] No se encontró usuario en loyalty accounts:', normalizedWallet);
        return null;
      }

      // Extraer puntos de los diferentes formatos posibles
      let points = 0;
      if (typeof user.points === 'number') {
        points = user.points;
      } else if (typeof user.balance === 'number') {
        points = user.balance;
      } else if (typeof user.loyaltyBalance === 'number') {
        points = user.loyaltyBalance;
      } else if (Array.isArray(user.balances)) {
        points = (user.balances as Array<{ balance?: number; amount?: number }>).reduce(
          (sum, b) => sum + (b.balance || b.amount || 0), 0
        );
      }

      console.log('[Snag SDK] Cuenta encontrada en loyalty accounts:', user.id, 'puntos:', points);

      return {
        id: String(user.id),
        walletAddress: String(user.walletAddress || normalizedWallet),
        points: Number(points),
        externalIdentifier: user.externalIdentifier as string | undefined,
        createdAt: user.createdAt as string | undefined,
      };
    } catch (error) {
      console.error('[Snag SDK] Error al obtener cuenta:', error);
      return null;
    }
  }

  /**
   * Calcula el balance desde las transacciones (fallback más confiable)
   */
  async getAccountBalance(walletAddress: string): Promise<number> {
    if (!this.isConfigured()) return 0;

    try {
      const normalizedWallet = walletAddress.toLowerCase();
      const transactions = await this.getTransactions(normalizedWallet);
      const total = transactions.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
      
      console.log('[Snag SDK] Balance calculado desde transacciones:', total);
      return Number(total) || 0;
    } catch (error) {
      console.error('[Snag SDK] Error al calcular balance:', error);
      return 0;
    }
  }

  /**
   * Crea un nuevo usuario
   * Usa el endpoint /users/metadatas según la documentación oficial
   * Docs: https://docs.snagsolutions.io/loyalty/development/create-users
   */
  async createAccount(
    walletAddress: string,
    metadata?: Partial<SnagUserMetadata>
  ): Promise<SnagAccount | null> {
    if (!this.isConfigured()) {
      console.error('[Snag SDK] Cliente no configurado');
      return null;
    }

    const normalizedWallet = walletAddress.toLowerCase();
    console.log('[Snag SDK] Creando cuenta para:', normalizedWallet);

    try {
      // Usar endpoint /users/metadatas según la guía oficial
      // La respuesta incluye el id del usuario creado
      const response = await this.request<{ id: string; walletAddress: string; createdAt?: string }>(
        '/users/metadatas',
        {
          method: 'POST',
          body: JSON.stringify({
            walletAddress: normalizedWallet,
            organizationId: this.orgId,
            ...metadata,
          }),
        }
      );

      console.log('[Snag SDK] Usuario creado exitosamente:', response);

      // Devolver la cuenta directamente desde la respuesta
      if (response && response.id) {
        const account: SnagAccount = {
          id: response.id,
          walletAddress: response.walletAddress || normalizedWallet,
          points: 0,
          createdAt: response.createdAt,
        };
        console.log('[Snag SDK] Cuenta creada:', account.id);
        return account;
      }

      // Si no hay id en la respuesta, buscar el usuario
      console.log('[Snag SDK] Respuesta sin ID, buscando usuario...');
      const existingAccount = await this.getUserMetadata(normalizedWallet);
      if (existingAccount) {
        return existingAccount;
      }

      // Si no se encontró la cuenta, devolver null
      console.error('[Snag SDK] No se pudo obtener el ID del usuario creado');
      return null;
    } catch (error) {
      console.error('[Snag SDK] Error al crear cuenta:', error);
      
      // Fallback: intentar obtener cuenta existente (podría ya existir)
      const existingAccount = await this.getUserMetadata(normalizedWallet);
      if (existingAccount) {
        console.log('[Snag SDK] Cuenta ya existía:', existingAccount.id);
        return existingAccount;
      }

      return null;
    }
  }

  /**
   * Obtiene o crea una cuenta de usuario
   */
  async getOrCreateAccount(
    walletAddress: string,
    metadata?: Partial<SnagUserMetadata>
  ): Promise<SnagAccount | null> {
    let account = await this.getAccount(walletAddress);
    
    if (!account) {
      console.log('[Snag SDK] Cuenta no existe, creando...');
      account = await this.createAccount(walletAddress, metadata);
    }
    
    return account;
  }

  /**
   * Obtiene el ranking de un usuario
   */
  async getAccountRank(walletAddress: string): Promise<{ position: number; total: number }> {
    if (!this.isConfigured()) return { position: 0, total: 0 };

    try {
      const account = await this.getAccount(walletAddress);
      if (!account || !account.id) return { position: 0, total: 0 };

      // El endpoint de rank requiere organizationId y loyaltyCurrencyId
      const params = new URLSearchParams({
        websiteId: this.websiteId,
        organizationId: this.orgId,
        loyaltyCurrencyId: this.currencyId,
      });

      const response = await this.request<{ rank: number; totalUsers: number }>(
        `/loyalty/accounts/${account.id}/rank?${params.toString()}`
      );

      return {
        position: response.rank || 0,
        total: response.totalUsers || 0,
      };
    } catch (error) {
      // No mostrar error si el usuario simplemente no tiene rank aún
      console.log('[Snag SDK] No se pudo obtener rank (usuario sin transacciones)');
      return { position: 0, total: 0 };
    }
  }

  /**
   * Conecta una wallet adicional a un usuario existente (multi-wallet)
   */
  async connectWallet(
    walletAddress: string,
    walletType: WalletType = 'evm'
  ): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      await this.request('/users/connect', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: this.orgId,
          websiteId: this.websiteId,
          walletAddress: walletAddress.toLowerCase(),
          walletType,
        }),
      });
      console.log('[Snag SDK] Wallet conectada:', walletAddress);
      return true;
    } catch (error) {
      console.error('[Snag SDK] Error al conectar wallet:', error);
      return false;
    }
  }

  // ============ REGLAS DE LEALTAD ============

  /**
   * Obtiene los grupos de reglas de lealtad
   */
  async getRuleGroups(): Promise<SnagRuleGroup[]> {
    if (!this.isConfigured()) return [];

    try {
      const response = await this.request<{ data: SnagRuleGroup[] }>(
        `/loyalty/rule-groups?websiteId=${this.websiteId}&limit=20`
      );

      const groups = response.data || [];
      console.log('[Snag SDK] Grupos de reglas obtenidos:', groups.length);
      return groups;
    } catch (error) {
      console.error('[Snag SDK] Error al obtener grupos de reglas:', error);
      return [];
    }
  }

  /**
   * Obtiene las reglas de lealtad activas
   */
  async getRules(ruleGroupId?: string): Promise<SnagRule[]> {
    if (!this.isConfigured()) return [];

    try {
      console.log('[Snag SDK] Obteniendo reglas...');

      let url = `/loyalty/rules?websiteId=${this.websiteId}&isActive=true&limit=50`;
      if (ruleGroupId) {
        url += `&loyaltyRuleGroupId=${ruleGroupId}`;
      }

      const response = await this.request<{ data: SnagRule[] }>(url);
      const rules = response.data || [];

      console.log('[Snag SDK] Reglas obtenidas:', rules.length);

      // Normalizar puntos
      return rules.map((rule) => ({
        ...rule,
        points: Number(rule.amount) || 0,
      }));
    } catch (error) {
      console.error('[Snag SDK] Error al obtener reglas:', error);
      return [];
    }
  }

  /**
   * Obtiene el estado de todas las reglas para un usuario
   */
  async getAllRuleStatuses(userId: string): Promise<SnagRuleStatus[]> {
    if (!this.isConfigured() || !userId) return [];

    try {
      const response = await this.request<{ data: SnagRuleStatus[] }>(
        `/loyalty/rules/status?userId=${userId}&websiteId=${this.websiteId}`
      );

      return response.data || [];
    } catch (error) {
      // 404 es normal para usuarios sin completados - no es un error real
      const errorStr = String(error);
      if (errorStr.includes('404') || errorStr.includes('User Not found')) {
        console.log('[Snag SDK] Usuario sin reglas completadas aún');
        return [];
      }
      console.error('[Snag SDK] Error al obtener estados de reglas:', error);
      return [];
    }
  }

  /**
   * Completa una regla de lealtad para un usuario
   * IMPORTANTE: Snag solo acepta userId OR walletAddress, NO ambos
   */
  async completeRule(userId: string, ruleId: string): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      console.log('[Snag SDK] Completando regla:', { userId, ruleId });

      // Snag solo acepta userId OR walletAddress, no ambos
      // Preferimos userId porque es más confiable
      await this.request(`/loyalty/rules/${ruleId}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          websiteId: this.websiteId,
        }),
      });

      console.log('[Snag SDK] Regla completada exitosamente');
      return true;
    } catch (error) {
      console.error('[Snag SDK] Error al completar regla:', error);
      return false;
    }
  }

  /**
   * Completa una regla usando la wallet address
   * Primero obtiene el userId de Snag, luego completa la regla
   */
  async completeRuleByWallet(walletAddress: string, ruleId: string): Promise<{ success: boolean; alreadyAwarded?: boolean }> {
    const normalizedWallet = walletAddress.toLowerCase();

    try {
      // Paso 1: Obtener o crear la cuenta para conseguir el userId
      let account = await this.getAccount(normalizedWallet);
      
      if (!account) {
        console.log('[Snag SDK] Cuenta no encontrada, creando...');
        account = await this.createAccount(normalizedWallet);
      }

      if (!account?.id) {
        console.error('[Snag SDK] No se pudo obtener userId');
        return { success: false };
      }

      // Paso 2: Intentar completar con userId (método preferido por Snag)
      const success = await this.completeRule(account.id, ruleId);
      if (success) {
        return { success: true };
      }

      // Si completeRule falla, devolver false sin hacer fallback aquí
      // El fallback se maneja en la ruta API para evitar duplicación
      return { success: false };
    } catch (error) {
      console.error('[Snag SDK] Error al completar regla por wallet:', error);
      return { success: false };
    }
  }

  // ============ TRANSACCIONES / PUNTOS ============

  /**
   * Otorga puntos a un usuario
   */
  async awardPoints(
    walletAddress: string,
    amount: number,
    ruleId: string,
    description?: string
  ): Promise<SnagTransaction | null> {
    if (!this.isConfigured()) return null;

    try {
      console.log('[Snag SDK] Otorgando puntos:', { walletAddress, amount, ruleId });

      const desc = description || `Points award: ${amount}`;

      // Usar idempotencyKey para evitar duplicados (máx 32 chars)
      // Formato: últimos 8 chars del wallet + últimos 8 chars del ruleId
      const shortWallet = walletAddress.toLowerCase().slice(-8);
      const shortRuleId = ruleId.slice(-8);
      const idempotencyKey = `${shortWallet}:${shortRuleId}`;
      
      const response = await this.request<SnagTransaction>('/loyalty/transactions', {
        method: 'POST',
        body: JSON.stringify({
          description: desc,
          entries: [
            {
              walletAddress: walletAddress.toLowerCase(),
              amount,
              direction: 'credit',
              loyaltyCurrencyId: this.currencyId,
              websiteId: this.websiteId,
              idempotencyKey, // ← Previene duplicados
            },
          ],
        }),
      });

      console.log('[Snag SDK] Puntos otorgados exitosamente:', response);
      
      // La respuesta es directamente el objeto transacción
      return response || null;
    } catch (error) {
      console.error('[Snag SDK] Error al otorgar puntos:', error);
      return null;
    }
  }

  /**
   * Obtiene las entradas de transacciones de un usuario
   */
  async getTransactions(walletAddress: string): Promise<SnagTransaction[]> {
    if (!this.isConfigured()) return [];

    try {
      // Usar transaction_entries que filtra directamente por wallet
      const response = await this.request<{ data: SnagTransaction[] }>(
        `/loyalty/transaction_entries?walletAddress=${walletAddress.toLowerCase()}&websiteId=${this.websiteId}&limit=100`
      );

      return response.data || [];
    } catch (error) {
      console.error('[Snag SDK] Error al obtener transacciones:', error);
      return [];
    }
  }

  /**
   * Verifica si una tarea ya fue completada por el usuario
   * Busca por idempotencyKey (nuevas transacciones) o por descripción (transacciones antiguas)
   */
  async isTaskCompleted(walletAddress: string, ruleId: string, ruleName?: string): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      // Obtener entradas de transacción del usuario
      const entries = await this.getTransactions(walletAddress);
      
      // El idempotencyKey tiene formato corto: últimos8wallet:últimos8ruleId
      const shortWallet = walletAddress.toLowerCase().slice(-8);
      const shortRuleId = ruleId.slice(-8);
      const expectedKey = `${shortWallet}:${shortRuleId}`;
      
      const completed = entries.some(entry => {
        // Buscar por idempotencyKey (nuevas transacciones)
        const entryKey = (entry as { idempotencyKey?: string }).idempotencyKey;
        if (entryKey === expectedKey) return true;
        
        // Fallback: buscar por descripción en la transacción (transacciones antiguas)
        const txn = (entry as { loyaltyTransaction?: { description?: string } }).loyaltyTransaction;
        if (ruleName && txn?.description === ruleName) return true;
        
        return false;
      });

      if (completed) {
        console.log('[Snag SDK] Tarea ya completada:', ruleId);
      }
      
      return completed;
    } catch (error) {
      console.error('[Snag SDK] Error verificando tarea completada:', error);
      return false;
    }
  }

  /**
   * Obtiene los IDs de reglas completadas (desde transacciones)
   * Busca por descripción (nombre de regla) y mapea a ruleId
   */
  async getCompletedRuleIds(walletAddress: string): Promise<string[]> {
    try {
      // Obtener transacciones del usuario
      const entries = await this.getTransactions(walletAddress);
      
      // Obtener todas las reglas para mapear nombre -> id
      const rules = await this.getRules();
      const ruleNameToId = new Map<string, string>();
      rules.forEach(rule => {
        if (rule.name) ruleNameToId.set(rule.name, rule.id);
      });
      
      const completedRuleIds = new Set<string>();
      
      // Buscar por descripción en las transacciones
      entries.forEach(entry => {
        // Verificar si tiene loyaltyTransaction con descripción
        const txn = (entry as { loyaltyTransaction?: { description?: string } }).loyaltyTransaction;
        if (txn?.description) {
          const ruleId = ruleNameToId.get(txn.description);
          if (ruleId) {
            completedRuleIds.add(ruleId);
          }
        }
        
        // También verificar por idempotencyKey (nuevas transacciones)
        // Formato corto: últimos8wallet:últimos8ruleId
        const idempKey = (entry as { idempotencyKey?: string }).idempotencyKey;
        if (idempKey && idempKey.includes(':')) {
          const shortRuleId = idempKey.split(':')[1];
          // Buscar la regla completa que termina con estos 8 caracteres
          rules.forEach(rule => {
            if (rule.id.slice(-8) === shortRuleId) {
              completedRuleIds.add(rule.id);
            }
          });
        }
      });

      console.log('[Snag SDK] IDs de reglas completadas:', [...completedRuleIds]);
      return [...completedRuleIds];
    } catch (error) {
      console.error('[Snag SDK] Error al obtener reglas completadas:', error);
      return [];
    }
  }

  // ============ LEADERBOARD ============

  /**
   * Obtiene el leaderboard
   */
  async getLeaderboard(limit = 100, offset = 0): Promise<SnagLeaderboardEntry[]> {
    if (!this.isConfigured()) return [];

    try {
      const response = await this.request<{ data: SnagLeaderboardEntry[] }>(
        `/loyalty/leaderboard?websiteId=${this.websiteId}&limit=${limit}&offset=${offset}`
      );

      return response.data || [];
    } catch (error) {
      console.error('[Snag SDK] Error al obtener leaderboard:', error);
      return [];
    }
  }

  // ============ UTILIDADES DEL SDK ============

  /**
   * Acceso directo al SDK para métodos adicionales
   * Usar con precaución y verificar que el método exista
   */
  getSdk(): SnagSolutions {
    return this.sdk;
  }
}

// ============ EXPORTAR SINGLETON ============
export const snagClient = new SnagSolutionsClient();
