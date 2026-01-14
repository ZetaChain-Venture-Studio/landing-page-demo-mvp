import { NextRequest, NextResponse } from 'next/server';

/**
 * Discord OAuth Configuration
 * Este flujo usa Discord OAuth directamente, luego pasa los datos a Snag
 * Docs: https://docs.snagsolutions.io/loyalty/development/connect-social-accounts#method-2-direct-social-handle-passing
 */

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Scopes necesarios para obtener info del usuario
const DISCORD_SCOPES = ['identify', 'email'].join('%20');

/**
 * GET /api/social/discord?action=connect&walletAddress=0x...
 * 
 * Inicia el flujo OAuth de Discord directamente (no a través de Snag)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const walletAddress = searchParams.get('walletAddress');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Si tenemos code, es el callback de Discord
  if (code) {
    return handleDiscordCallback(code, state);
  }

  // Si action es connect, iniciamos el OAuth
  if (action === 'connect') {
    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    if (!DISCORD_CLIENT_ID) {
      return NextResponse.json({ 
        error: 'Discord OAuth not configured',
        hint: 'Add DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET to your environment variables'
      }, { status: 500 });
    }

    // Crear state con la wallet para recuperarla en el callback
    const stateData = Buffer.from(JSON.stringify({ walletAddress })).toString('base64');
    
    // URL de autorización de Discord
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?` +
      `client_id=${DISCORD_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(`${BASE_URL}/api/social/discord`)}` +
      `&response_type=code` +
      `&scope=${DISCORD_SCOPES}` +
      `&state=${stateData}`;

    console.log('[Discord OAuth] Iniciando flujo para wallet:', walletAddress);

    return NextResponse.json({ 
      url: discordAuthUrl,
      message: 'Redirect user to this URL'
    });
  }

  return NextResponse.json({ error: 'Invalid action. Use ?action=connect&walletAddress=0x...' }, { status: 400 });
}

/**
 * Maneja el callback de Discord OAuth
 */
async function handleDiscordCallback(code: string, state: string | null) {
  try {
    // Decodificar state para obtener walletAddress
    let walletAddress = '';
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        walletAddress = stateData.walletAddress;
      } catch {
        console.error('[Discord OAuth] Error decodificando state');
      }
    }

    console.log('[Discord OAuth] Callback recibido para wallet:', walletAddress);

    // Intercambiar code por access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${BASE_URL}/api/social/discord`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Discord OAuth] Error obteniendo token:', errorText);
      return NextResponse.redirect(`${BASE_URL}/dashboard?social_error=discord_token_error`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Obtener información del usuario de Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error('[Discord OAuth] Error obteniendo usuario');
      return NextResponse.redirect(`${BASE_URL}/dashboard?social_error=discord_user_error`);
    }

    const discordUser = await userResponse.json();
    console.log('[Discord OAuth] Usuario obtenido:', {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
    });

    // Actualizar metadata del usuario en Snag
    if (walletAddress) {
      const snagResponse = await fetch(`${BASE_URL}/api/social/discord/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          discordUser: discordUser.username,
          discordUserId: discordUser.id,
        }),
      });

      if (!snagResponse.ok) {
        console.error('[Discord OAuth] Error actualizando Snag');
      } else {
        console.log('[Discord OAuth] Metadata actualizada en Snag');
      }
    }

    // Redirigir al dashboard con éxito
    return NextResponse.redirect(`${BASE_URL}/dashboard?social_connected=true&platform=discord`);
  } catch (error) {
    console.error('[Discord OAuth] Error:', error);
    return NextResponse.redirect(`${BASE_URL}/dashboard?social_error=discord_error`);
  }
}

