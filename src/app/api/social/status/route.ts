import { NextRequest, NextResponse } from 'next/server';

const SNAG_API_KEY = process.env.SNAG_API_KEY || '';
const SNAG_ORG_ID = process.env.SNAG_ORG_ID || '';

// Interfaz extendida para metadata de usuario de Snag
interface SnagUserMetadata {
  id?: string;
  walletAddress?: string;
  twitterUser?: string;
  twitterUserId?: string;
  telegramUsername?: string;
  telegramUserId?: string;
  tiktokUser?: string;
  tiktokUserId?: string;
  discordUser?: string;
  discordUserId?: string;
  displayName?: string;
  emailAddress?: string;
}

/**
 * GET /api/social/status?walletAddress=0x...
 * 
 * Obtiene el estado de las cuentas sociales conectadas del usuario.
 * Usa POST a /users/metadatas porque es idempotente y devuelve TODOS los campos.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'walletAddress is required' },
      { status: 400 }
    );
  }

  try {
    console.log('[Social Status] Obteniendo estado para:', walletAddress);

    // Usar POST porque devuelve TODOS los campos incluyendo redes sociales
    // GET solo devuelve campos básicos
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
      console.log('[Social Status] Error de Snag:', response.status);
      return NextResponse.json({
        connected: {
          twitter: false,
          telegram: false,
          tiktok: false,
          discord: false,
        },
        handles: {},
        message: 'User not found in Snag',
      });
    }

    const userData: SnagUserMetadata = await response.json();
    
    console.log('[Social Status] Datos de usuario:', {
      id: userData.id,
      twitter: userData.twitterUser,
      telegram: userData.telegramUsername,
      tiktok: userData.tiktokUser,
      discord: userData.discordUser,
    });

    // Extraer información de cuentas sociales conectadas
    const socialData = {
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

    console.log('[Social Status] Estado calculado:', socialData);

    return NextResponse.json(socialData);
  } catch (error) {
    console.error('[Social Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get social status', details: String(error) },
      { status: 500 }
    );
  }
}
