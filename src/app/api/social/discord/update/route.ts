import { NextRequest, NextResponse } from 'next/server';

const SNAG_API_KEY = process.env.SNAG_API_KEY || '';
const SNAG_ORG_ID = process.env.SNAG_ORG_ID || '';

/**
 * POST /api/social/discord/update
 * 
 * Actualiza la metadata del usuario en Snag con su info de Discord
 * Docs: https://docs.snagsolutions.io/loyalty/development/connect-social-accounts#method-2-direct-social-handle-passing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, discordUser, discordUserId } = body;

    if (!walletAddress || !discordUser || !discordUserId) {
      return NextResponse.json(
        { error: 'walletAddress, discordUser, and discordUserId are required' },
        { status: 400 }
      );
    }

    console.log('[Discord Update] Actualizando metadata en Snag:', {
      walletAddress,
      discordUser,
      discordUserId,
    });

    // Actualizar metadata del usuario en Snag usando el endpoint oficial
    const response = await fetch('https://admin.snagsolutions.io/api/users/metadatas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SNAG_API_KEY,
      },
      body: JSON.stringify({
        walletAddress: walletAddress.toLowerCase(),
        organizationId: SNAG_ORG_ID,
        discordUser,
        discordUserId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Discord Update] Error de Snag:', errorText);
      return NextResponse.json(
        { error: 'Failed to update Snag metadata', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Discord Update] Metadata actualizada:', data);

    return NextResponse.json({
      success: true,
      message: 'Discord account connected successfully',
      user: data,
    });
  } catch (error) {
    console.error('[Discord Update] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update Discord metadata', details: String(error) },
      { status: 500 }
    );
  }
}

