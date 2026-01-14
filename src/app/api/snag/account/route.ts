import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

// Tipo local para metadatos de usuario
interface UserMetadata {
  externalIdentifier?: string;
  discordUser?: string;
  twitterUser?: string;
  telegramUsername?: string;
  emailAddress?: string;
  displayName?: string;
}

const SNAG_API_KEY = process.env.SNAG_API_KEY || '';
const SNAG_ORG_ID = process.env.SNAG_ORG_ID || '';

// Helper para obtener estado social con POST (devuelve todos los campos)
async function getSocialStatus(walletAddress: string) {
  try {
    const response = await fetch(
      'https://admin.snagsolutions.io/api/users/metadatas',
      {
        method: 'POST',
        headers: {
          'x-api-key': SNAG_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress.toLowerCase(),
          organizationId: SNAG_ORG_ID,
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    
    return {
      connected: {
        twitter: !!(userData.twitterUser || userData.twitterUserId),
        telegram: !!(userData.telegramUsername || userData.telegramUserId),
        tiktok: !!(userData.tiktokUser || userData.tiktokUserId),
        discord: !!(userData.discordUser || userData.discordUserId),
      },
      handles: {
        twitter: userData.twitterUser || null,
        telegram: userData.telegramUsername || null,
        tiktok: userData.tiktokUser || null,
        discord: userData.discordUser || null,
      },
    };
  } catch {
    return null;
  }
}

/**
 * GET /api/snag/account?walletAddress=0x...
 * Obtiene la cuenta de un usuario por su wallet address
 */
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'walletAddress is required' },
      { status: 400 }
    );
  }

  // Verificar configuración del SDK
  if (!snagClient.isConfigured()) {
    console.warn('[Account API] SDK no configurado correctamente');
    return NextResponse.json({
      account: null,
      warning: 'Snag SDK not configured',
      config: snagClient.getConfig(),
    });
  }

  try {
    const account = await snagClient.getAccount(walletAddress);

    if (!account) {
      return NextResponse.json({ account: null }, { status: 200 });
    }

    // Si la cuenta tiene 0 puntos, intentar calcular desde transacciones
    if (account.points === 0) {
      const txnBalance = await snagClient.getAccountBalance(walletAddress);
      if (txnBalance > 0) {
        account.points = txnBalance;
        console.log('[Account API] Balance calculado desde transacciones:', txnBalance);
      }
    }

    // Obtener todo en paralelo para optimizar
    const [completedRuleIds, rank, socialStatus] = await Promise.all([
      snagClient.getCompletedRuleIds(walletAddress),
      snagClient.getAccountRank(walletAddress),
      getSocialStatus(walletAddress),
    ]);

    return NextResponse.json({
      account,
      rank,
      completedRuleIds,
      socialStatus,
    });
  } catch (error) {
    console.error('[Account API] Error al obtener cuenta:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/snag/account - Crear o obtener una cuenta
 * 
 * Body:
 * - walletAddress: string (requerido) - Dirección de wallet
 * - externalIdentifier?: string - ID externo de tu sistema
 * - displayName?: string - Nombre para mostrar
 * - emailAddress?: string - Email del usuario
 * - twitterUser?: string - Usuario de Twitter
 * - discordUser?: string - Usuario de Discord
 * - telegramUsername?: string - Usuario de Telegram
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      walletAddress, 
      externalIdentifier,
      displayName,
      emailAddress,
      twitterUser,
      discordUser,
      telegramUsername,
    } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    // Verificar configuración del SDK
    if (!snagClient.isConfigured()) {
      console.warn('[Account API] SDK no configurado correctamente');
      return NextResponse.json({
        account: null,
        warning: 'Snag SDK not configured',
        config: snagClient.getConfig(),
      });
    }

    console.log('[Account API] Creando/obteniendo cuenta para:', walletAddress);

    // Preparar metadatos del usuario
    const metadata: Partial<UserMetadata> = {};
    if (externalIdentifier) metadata.externalIdentifier = externalIdentifier;
    if (displayName) metadata.displayName = displayName;
    if (emailAddress) metadata.emailAddress = emailAddress;
    if (twitterUser) metadata.twitterUser = twitterUser;
    if (discordUser) metadata.discordUser = discordUser;
    if (telegramUsername) metadata.telegramUsername = telegramUsername;

    const account = await snagClient.getOrCreateAccount(walletAddress, metadata);

    if (!account) {
      console.log('[Account API] No se pudo crear la cuenta');
      return NextResponse.json({ account: null });
    }

    // Si la cuenta tiene 0 puntos, calcular desde transacciones
    if (account.points === 0) {
      const txnBalance = await snagClient.getAccountBalance(walletAddress);
      if (txnBalance > 0) {
        account.points = txnBalance;
        console.log('[Account API] Balance calculado desde transacciones:', txnBalance);
      }
    }

    console.log('[Account API] Cuenta devuelta:', account.id, 'puntos:', account.points);
    return NextResponse.json({ account });
  } catch (error) {
    console.error('[Account API] Error al crear cuenta:', error);
    return NextResponse.json(
      { error: 'Failed to create account', details: String(error) },
      { status: 500 }
    );
  }
}
