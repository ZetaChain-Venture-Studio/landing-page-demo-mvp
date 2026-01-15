import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * GET /api/social/callback
 * 
 * Callback que recibe la respuesta de Snag después del OAuth
 * Snag redirige aquí con los parámetros de éxito/error
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parámetros que Snag puede enviar
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const platform = searchParams.get('platform');
  const userId = searchParams.get('userId');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  console.log('[Social Callback] Recibido:', {
    success,
    error,
    platform,
    userId,
    code: code ? 'present' : 'absent',
    state: state ? 'present' : 'absent',
  });

  // Si es Twitter, redirigir a la página específica /twitter-callback
  if (platform === 'twitter' || platform === 'x') {
    const twitterCallbackUrl = new URL('/twitter-callback', BASE_URL);
    
    if (error) {
      twitterCallbackUrl.searchParams.set('error', error);
    } else if (success === 'true' || code) {
      twitterCallbackUrl.searchParams.set('success', 'true');
      if (code) twitterCallbackUrl.searchParams.set('code', code);
    }
    
    if (userId) twitterCallbackUrl.searchParams.set('userId', userId);
    if (state) twitterCallbackUrl.searchParams.set('state', state);
    
    console.log('[Social Callback] Redirigiendo a /twitter-callback:', twitterCallbackUrl.toString());
    return NextResponse.redirect(twitterCallbackUrl.toString());
  }

  // Para otras plataformas, redirigir al dashboard
  const dashboardUrl = new URL('/dashboard', BASE_URL);
  
  if (error) {
    dashboardUrl.searchParams.set('social_error', error);
    if (platform) dashboardUrl.searchParams.set('platform', platform);
  } else if (success === 'true' || code) {
    dashboardUrl.searchParams.set('social_connected', 'true');
    if (platform) dashboardUrl.searchParams.set('platform', platform);
  } else {
    // Si no hay indicador claro, asumir éxito si llegamos aquí sin error
    dashboardUrl.searchParams.set('social_connected', 'true');
  }

  console.log('[Social Callback] Redirigiendo a:', dashboardUrl.toString());

  // Redirigir al dashboard con el resultado
  return NextResponse.redirect(dashboardUrl.toString());
}

