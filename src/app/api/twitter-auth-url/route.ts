import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * GET /api/twitter-auth-url?userId=...
 * 
 * Genera la URL de autenticación de Twitter vía Snag
 * Como sugiere el prompt: GET /api/twitter/auth?userId=...&redirectUri=...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const walletAddress = searchParams.get('walletAddress'); // Alternativa: obtener userId desde wallet

  // Si no hay userId pero hay walletAddress, obtener el userId de Snag
  let snagUserId = userId;
  
  if (!snagUserId && walletAddress) {
    try {
      const account = await snagClient.getAccount(walletAddress);
      if (account?.id) {
        snagUserId = account.id;
        console.log('[Twitter Auth] userId obtenido desde wallet:', snagUserId);
      }
    } catch (error) {
      console.error('[Twitter Auth] Error obteniendo cuenta:', error);
    }
  }

  if (!snagUserId) {
    return NextResponse.json(
      { error: 'Missing userId or walletAddress' },
      { status: 400 }
    );
  }

  const redirectUri = `${BASE_URL}/twitter-callback`;

  try {
    // Llamar al endpoint de Snag para obtener la URL de OAuth
    const endpoint = 'https://admin.snagsolutions.io/api/twitter/auth';
    const params = new URLSearchParams({
      userId: snagUserId,
    });

    // Solo agregar redirectUri si NO es localhost (Snag no acepta localhost)
    const isLocalhost = BASE_URL.includes('localhost');
    if (!isLocalhost) {
      params.set('redirectUri', redirectUri);
    }

    console.log('[Twitter Auth] Obteniendo URL de OAuth:', {
      userId: snagUserId,
      redirectUri: isLocalhost ? '(usando default de Snag)' : redirectUri,
    });

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.SNAG_API_KEY || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Twitter Auth] Error de Snag:', errorText);
      return NextResponse.json(
        { error: `Snag API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Twitter Auth] URL de OAuth obtenida exitosamente');

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('[Twitter Auth] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get Twitter auth URL', details: String(error) },
      { status: 500 }
    );
  }
}

