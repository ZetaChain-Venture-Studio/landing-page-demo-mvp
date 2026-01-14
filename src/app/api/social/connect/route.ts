import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

const SNAG_API_KEY = process.env.SNAG_API_KEY || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Plataformas sociales soportadas por Snag
 * Documentación: https://docs.snagsolutions.io/loyalty/development/connect-social-accounts
 */
type SocialPlatform = 'twitter' | 'telegram' | 'tiktok' | 'discord';

const PLATFORM_ENDPOINTS: Record<SocialPlatform, string> = {
  twitter: 'https://admin.snagsolutions.io/api/twitter/auth',
  telegram: 'https://admin.snagsolutions.io/api/telegram/auth',
  tiktok: 'https://admin.snagsolutions.io/api/tiktok/auth',
  discord: 'https://admin.snagsolutions.io/api/discord/auth',
};

/**
 * GET /api/social/connect?platform=twitter&walletAddress=0x...
 * 
 * Genera la URL de OAuth para conectar una cuenta social.
 * Usa el userId de Snag (UUID), NO el de Privy.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform') as SocialPlatform;
  const walletAddress = searchParams.get('walletAddress');

  // Validaciones
  if (!platform) {
    return NextResponse.json(
      { error: 'platform is required (twitter, telegram, tiktok, discord)' },
      { status: 400 }
    );
  }

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'walletAddress is required' },
      { status: 400 }
    );
  }

  if (!PLATFORM_ENDPOINTS[platform]) {
    return NextResponse.json(
      { error: `Platform "${platform}" not supported. Use: twitter, telegram, tiktok, discord` },
      { status: 400 }
    );
  }

  if (!SNAG_API_KEY) {
    return NextResponse.json(
      { error: 'SNAG_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    // Primero obtener o crear el usuario en Snag para conseguir su UUID
    console.log(`[Social Connect] Obteniendo usuario de Snag para wallet: ${walletAddress}`);
    
    const snagAccount = await snagClient.getOrCreateAccount(walletAddress);
    
    if (!snagAccount || !snagAccount.id) {
      console.error('[Social Connect] No se pudo obtener/crear cuenta en Snag');
      return NextResponse.json(
        { error: 'Could not get Snag user account. Please try again.' },
        { status: 500 }
      );
    }

    const snagUserId = snagAccount.id; // Este es el UUID que Snag espera
    console.log(`[Social Connect] Snag userId obtenido: ${snagUserId}`);

    // URL de callback donde Snag redirigirá después del OAuth
    // En producción usa tu dominio, en desarrollo Snag redirige a su propio callback
    const redirectUri = `${BASE_URL}/api/social/callback`;
    const isLocalhost = BASE_URL.includes('localhost');
    
    // Construir URL con parámetros
    const endpoint = PLATFORM_ENDPOINTS[platform];
    const params = new URLSearchParams({
      userId: snagUserId, // UUID de Snag, no el de Privy
    });
    
    // Solo agregar redirectUri si NO es localhost (Snag no acepta localhost)
    if (!isLocalhost) {
      params.set('redirectUri', redirectUri);
    }

    console.log(`[Social Connect] Iniciando OAuth para ${platform}:`, {
      snagUserId,
      redirectUri: isLocalhost ? '(usando default de Snag)' : redirectUri,
      endpoint,
    });

    // Llamar a Snag para obtener la URL de OAuth
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'x-api-key': SNAG_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Social Connect] Error de Snag (${response.status}):`, errorText);
      
      // Si es error 400, probablemente la plataforma no está configurada en Snag
      if (response.status === 400) {
        return NextResponse.json(
          { 
            error: `Platform ${platform} may not be configured in Snag dashboard`,
            details: errorText,
            hint: 'Go to admin.snagsolutions.io → Settings → Social Connections to configure OAuth'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Snag API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Social Connect] URL de OAuth obtenida para ${platform}`);

    // Si se llama desde el navegador, redirigir directamente
    // Si se llama desde JS, devolver la URL
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('text/html')) {
      return NextResponse.redirect(data.url);
    }

    return NextResponse.json({ 
      url: data.url,
      platform,
      message: 'Redirect user to this URL to authorize'
    });
  } catch (error) {
    console.error(`[Social Connect] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to initiate social connection', details: String(error) },
      { status: 500 }
    );
  }
}
