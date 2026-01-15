import { NextRequest, NextResponse } from 'next/server';

const SNAG_API_KEY = process.env.SNAG_API_KEY || '';
const SNAG_ORG_ID = process.env.SNAG_ORG_ID || '';

interface SnagUserMetadata {
  id?: string;
  walletAddress?: string;
  twitterUser?: string;
  twitterUserId?: string;
}

/**
 * GET /api/twitter/status?walletAddress=0x...
 * 
 * Consulta si el usuario ya tiene Twitter conectado en Snag
 * Retorna: { connected: boolean, twitterUser: string | null }
 * 
 * Usa POST a /users/metadatas porque devuelve TODOS los campos incluyendo twitterUser
 */
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'walletAddress is required' },
      { status: 400 }
    );
  }

  if (!SNAG_API_KEY || !SNAG_ORG_ID) {
    return NextResponse.json(
      { error: 'Snag API not configured' },
      { status: 500 }
    );
  }

  try {
    console.log('[Twitter Status] Consultando estado de Twitter para:', walletAddress);

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
      console.log('[Twitter Status] Usuario no encontrado en Snag');
      return NextResponse.json({
        connected: false,
        twitterUser: null,
      });
    }

    const userData: SnagUserMetadata = await response.json();
    
    const twitterUser = userData.twitterUser || null;
    const connected = !!(twitterUser || userData.twitterUserId);

    console.log('[Twitter Status] Estado:', {
      walletAddress,
      connected,
      twitterUser,
    });

    return NextResponse.json({
      connected,
      twitterUser,
    });
  } catch (error) {
    console.error('[Twitter Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check Twitter status', details: String(error) },
      { status: 500 }
    );
  }
}

