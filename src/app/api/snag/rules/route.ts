import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

/**
 * Mapeo automático de tipos de reglas de Snag a categorías de UI
 */
function detectUiType(rule: {
  type?: string;
  name?: string;
  description?: string;
  metadata?: {
    cta?: { href?: string };
    twitterAccountUrl?: string;
    referrerReward?: number;
  };
}): string {
  const type = rule.type?.toLowerCase() || '';
  const name = rule.name?.toLowerCase() || '';
  const description = rule.description?.toLowerCase() || '';

  // Detectar por tipo explícito de Snag
  if (type.includes('twitter') || type.includes('follow')) return 'social';
  if (type.includes('instagram')) return 'social';
  if (type.includes('tiktok')) return 'social';
  if (type.includes('telegram')) return 'social';
  if (type.includes('discord')) return 'social';
  if (type.includes('referral')) return 'referral';
  if (type.includes('staking') || type.includes('stake')) return 'staking';
  if (type.includes('waitlist')) return 'waitlist';

  // Detectar por nombre/descripción
  if (name.includes('twitter') || name.includes('follow') || description.includes('follow')) return 'social';
  if (name.includes('instagram')) return 'social';
  if (name.includes('tiktok')) return 'social';
  if (name.includes('telegram')) return 'social';
  if (name.includes('discord')) return 'social';
  if (name.includes('invite') || name.includes('referral') || name.includes('refer')) return 'referral';
  if (name.includes('stake') || name.includes('staking')) return 'staking';
  if (name.includes('waitlist') || name.includes('join')) return 'waitlist';

  // Detectar por metadata
  if (rule.metadata?.twitterAccountUrl) return 'social';
  if (rule.metadata?.cta?.href?.includes('twitter.com') || rule.metadata?.cta?.href?.includes('x.com')) return 'social';
  if (rule.metadata?.cta?.href?.includes('instagram.com')) return 'social';
  if (rule.metadata?.cta?.href?.includes('tiktok.com')) return 'social';
  if (rule.metadata?.cta?.href?.includes('t.me') || rule.metadata?.cta?.href?.includes('telegram')) return 'social';
  if (rule.metadata?.referrerReward) return 'referral';

  return 'manual';
}

/**
 * Detectar icono según el contenido de la regla
 */
function detectIcon(rule: {
  type?: string;
  name?: string;
  metadata?: {
    cta?: { href?: string };
    twitterAccountUrl?: string;
  };
}): string | undefined {
  const type = rule.type?.toLowerCase() || '';
  const name = rule.name?.toLowerCase() || '';
  const ctaUrl = rule.metadata?.cta?.href || rule.metadata?.twitterAccountUrl || '';

  if (type.includes('twitter') || name.includes('twitter') || ctaUrl.includes('twitter.com') || ctaUrl.includes('x.com')) return 'twitter';
  if (type.includes('instagram') || name.includes('instagram') || ctaUrl.includes('instagram.com')) return 'instagram';
  if (type.includes('tiktok') || name.includes('tiktok') || ctaUrl.includes('tiktok.com')) return 'tiktok';
  if (type.includes('telegram') || name.includes('telegram') || ctaUrl.includes('t.me')) return 'telegram';
  if (type.includes('discord') || name.includes('discord') || ctaUrl.includes('discord')) return 'discord';

  return undefined;
}

/**
 * GET /api/snag/rules - Obtener todas las reglas activas desde Snag
 * 
 * Devuelve las reglas dinámicamente SIN IDs hardcodeados
 */
export async function GET() {
  try {
    console.log('[Rules API] Obteniendo reglas de Snag...');

    // Verificar configuración
    if (!snagClient.isConfigured()) {
      console.warn('[Rules API] SDK no configurado');
      return NextResponse.json({
        rules: [],
        warning: 'Snag SDK not configured - check environment variables',
        config: snagClient.getConfig(),
      });
    }

    // Obtener reglas de Snag
    const snagRules = await snagClient.getRules();
    console.log('[Rules API] Reglas obtenidas de Snag:', snagRules.length);

    // Procesar las reglas
    const processedRules = snagRules.map((rule) => {
      // Detectar tipo de UI automáticamente
      const uiType = detectUiType(rule);
      const icon = detectIcon(rule);
      
      // Obtener URL de CTA desde múltiples campos posibles de Snag
      // Snag puede tener campos adicionales no tipados, usamos type assertion
      const metadata = rule.metadata as Record<string, unknown> | undefined;
      const ctaObj = metadata?.cta as { href?: string } | undefined;
      
      const possibleUrls = [
        ctaObj?.href,
        metadata?.link as string | undefined,
        metadata?.url as string | undefined,
        metadata?.redirectUrl as string | undefined,
        metadata?.twitterAccountUrl as string | undefined,
        metadata?.instagramUrl as string | undefined,
        metadata?.telegramUrl as string | undefined,
        metadata?.discordUrl as string | undefined,
        metadata?.tiktokUrl as string | undefined,
        (rule as { redirectUrl?: string }).redirectUrl,
        (rule as { url?: string }).url,
      ];
      
      // Usar la primera URL válida (no vacía)
      const ctaUrl = possibleUrls.find(url => url && url.trim().length > 0);

      // Puntos desde Snag (amount es el campo principal)
      const points = Number(rule.amount) || rule.points || 0;
      
      // Log para debug
      if (rule.metadata) {
        console.log(`[Rules API] Metadata de ${rule.name}:`, JSON.stringify(rule.metadata));
      }

      return {
        id: rule.id,
        name: rule.name,
        description: rule.description || '',
        points,
        type: rule.type,
        uiType,
        ctaUrl,
        icon,
        isActive: rule.isActive !== false,
        completionLimit: rule.completionLimit || 1,
        claimType: rule.claimType || 'manual',
        hideInUi: rule.hideInUi || false,
        imageUrl: rule.imageUrl,
        metadata: rule.metadata,
      };
    });

    // Filtrar reglas activas y no ocultas
    const visibleRules = processedRules.filter(r => r.isActive && !r.hideInUi);

    console.log('[Rules API] Reglas procesadas:', visibleRules.length);

    // Debug: mostrar las reglas
    visibleRules.forEach(r => {
      console.log(`[Rules API] - ${r.name} (${r.id}) | tipo: ${r.uiType} | puntos: ${r.points}`);
    });

    return NextResponse.json({ 
      rules: visibleRules,
      total: snagRules.length,
      visible: visibleRules.length,
    });
  } catch (error) {
    console.error('[Rules API] Error al obtener reglas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/snag/rules - Completar una regla (otorgar puntos)
 * 
 * Para tareas de tipo "seguir/unirse" (Join Discord, Follow X, etc.)
 * usamos awardPoints directamente ya que la verificación real
 * requiere configuración avanzada en Snag.
 * 
 * Body:
 * - walletAddress: string (requerido)
 * - ruleId: string (requerido)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, walletAddress } = body;

    if (!ruleId) {
      return NextResponse.json(
        { error: 'ruleId is required' },
        { status: 400 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    console.log('[Rules API] Completando regla:', { ruleId, walletAddress });

    // Verificar configuración
    if (!snagClient.isConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Snag SDK not configured',
      }, { status: 500 });
    }

    // Obtener información de la regla para saber los puntos
    const rules = await snagClient.getRules();
    const rule = rules.find(r => r.id === ruleId);
    
    if (!rule) {
      console.error('[Rules API] Regla no encontrada:', ruleId);
      return NextResponse.json(
        { 
          error: 'Rule not found', 
          ruleId,
          availableRules: rules.map(r => ({ id: r.id, name: r.name }))
        },
        { status: 404 }
      );
    }

    const points = Number(rule.amount) || rule.points || 0;
    console.log('[Rules API] Regla encontrada:', rule.name, 'puntos:', points);

    // Verificar si ya fue completada (por ruleId o nombre)
    const alreadyCompleted = await snagClient.isTaskCompleted(walletAddress, ruleId, rule.name);

    if (alreadyCompleted) {
      console.log('[Rules API] Tarea ya completada anteriormente:', rule.name);
      return NextResponse.json({
        success: false,
        error: 'Task already completed',
        message: `Ya completaste "${rule.name}"`,
      }, { status: 400 });
    }

    // Otorgar puntos directamente
    console.log('[Rules API] Otorgando puntos para:', rule.name);
    
    try {
      const txn = await snagClient.awardPoints(
        walletAddress,
        points,
        ruleId,
        rule.name // Usar el nombre de la regla como descripción
      );

      if (txn) {
        console.log('[Rules API] ✅ Puntos otorgados:', points);
        return NextResponse.json({ 
          success: true, 
          points,
          ruleName: rule.name,
          transactionId: txn.id,
        });
      } else {
        console.error('[Rules API] ❌ No se pudo otorgar puntos');
        return NextResponse.json(
          { error: 'Failed to award points' },
          { status: 500 }
        );
      }
    } catch (awardError) {
      const errorStr = String(awardError);
      
      // Rate limit
      if (errorStr.includes('429') || errorStr.includes('Too many requests')) {
        return NextResponse.json({
          success: false,
          error: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.',
          retryAfter: 60,
        }, { status: 429 });
      }
      
      throw awardError;
    }
  } catch (error) {
    console.error('[Rules API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to complete rule', details: String(error) },
      { status: 500 }
    );
  }
}
