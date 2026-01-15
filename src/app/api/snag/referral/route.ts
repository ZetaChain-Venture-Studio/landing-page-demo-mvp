import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

/**
 * GET /api/snag/referral?walletAddress=0x...
 * Obtiene o genera el código de referido de un usuario
 * 
 * Según la documentación de Snag, este endpoint es idempotente:
 * - Si el usuario ya tiene código, lo devuelve
 * - Si no tiene, lo crea
 */
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'walletAddress is required' },
      { status: 400 }
    );
  }

  if (!snagClient.isConfigured()) {
    return NextResponse.json({
      error: 'Snag SDK not configured',
      referralCode: null,
    }, { status: 500 });
  }

  try {
    console.log('[Referral API] Obteniendo código de referido para:', walletAddress);

    // Primero obtener el userId de Snag
    const account = await snagClient.getAccount(walletAddress);
    if (!account) {
      return NextResponse.json({
        error: 'User not found in Snag',
        referralCode: null,
      }, { status: 404 });
    }

    // Obtener el ID de la regla de referidos
    const referralRuleId = await snagClient.getReferralRuleId();
    if (!referralRuleId) {
      return NextResponse.json({
        error: 'Referral rule not found in Snag. Create a "Refer a Friend" rule first.',
        referralCode: null,
      }, { status: 404 });
    }

    console.log('[Referral API] Usando ruleId:', referralRuleId);

    // Generar/obtener código de referido desde Snag
    const referralCode = await snagClient.getReferralCode(account.id, referralRuleId);

    if (!referralCode) {
      return NextResponse.json({
        error: 'Could not generate referral code',
        referralCode: null,
      }, { status: 500 });
    }

    // Construir el link completo
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://anuma.ai';
    const referralLink = `${baseUrl}?ref=${referralCode}`;

    console.log('[Referral API] Código generado:', referralCode);

    return NextResponse.json({
      referralCode,
      referralLink,
      userId: account.id,
    });
  } catch (error) {
    console.error('[Referral API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get referral code', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/snag/referral
 * Registra una relación de referido
 * 
 * Body:
 * - referralCode: string - Código del referidor
 * - referredWalletAddress: string - Wallet del nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, referredWalletAddress } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: 'referralCode is required' },
        { status: 400 }
      );
    }

    if (!referredWalletAddress) {
      return NextResponse.json(
        { error: 'referredWalletAddress is required' },
        { status: 400 }
      );
    }

    if (!snagClient.isConfigured()) {
      return NextResponse.json({
        error: 'Snag SDK not configured',
      }, { status: 500 });
    }

    console.log('[Referral API] Registrando referido:', { referralCode, referredWalletAddress });

    // Obtener el userId del nuevo usuario
    const referredAccount = await snagClient.getAccount(referredWalletAddress);
    if (!referredAccount) {
      return NextResponse.json({
        error: 'Referred user not found in Snag. Create user first.',
      }, { status: 404 });
    }

    // Registrar la relación de referido en Snag
    const result = await snagClient.createReferralUser(referralCode, referredAccount.id);

    if (!result) {
      return NextResponse.json({
        error: 'Could not register referral relationship',
      }, { status: 500 });
    }

    console.log('[Referral API] ✅ Referido registrado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Referral registered successfully',
      referredUserId: referredAccount.id,
    });
  } catch (error) {
    console.error('[Referral API] Error:', error);
    
    // Manejar caso de referido ya existente
    if (String(error).includes('already') || String(error).includes('duplicate')) {
      return NextResponse.json({
        success: false,
        error: 'User was already referred',
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to register referral', details: String(error) },
      { status: 500 }
    );
  }
}

