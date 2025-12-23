import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { snagClient } from '@/lib/snag';

// POST /api/users - Create or update user on signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, walletAddress } = body;

    if (!email && !walletAddress) {
      return NextResponse.json(
        { error: 'email or walletAddress is required' },
        { status: 400 }
      );
    }

    console.log('[Users API] Creating/updating user:', { email, walletAddress });

    // Get Snag account first
    let snagUserId: string | null = null;
    if (walletAddress) {
      try {
        const snagAccount = await snagClient.getOrCreateAccount(walletAddress, email);
        snagUserId = snagAccount?.id || null;
        console.log('[Users API] Snag account:', snagUserId);
      } catch (snagError) {
        console.error('[Users API] Snag error:', snagError);
      }
    }

    // Save to database
    const db = getDb();
    if (!db) {
      console.log('[Users API] Database not configured, skipping DB save');
      return NextResponse.json({
        success: true,
        snagUserId,
        dbSaved: false,
        message: 'User registered with Snag (no database configured)',
      });
    }

    // Upsert user - create if not exists, update if exists
    const user = await db.user.upsert({
      where: email ? { email } : { walletAddress: walletAddress! },
      create: {
        email: email || `wallet_${walletAddress}@anuma.ai`,
        walletAddress,
        snagUserId,
        totalPoints: 0,
        referralCount: 0,
      },
      update: {
        walletAddress: walletAddress || undefined,
        snagUserId: snagUserId || undefined,
        updatedAt: new Date(),
      },
    });

    console.log('[Users API] User saved to database:', user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        totalPoints: user.totalPoints,
        createdAt: user.createdAt,
      },
      snagUserId,
      dbSaved: true,
    });
  } catch (error) {
    console.error('[Users API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/users?email=...&wallet=... - Get user info
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const walletAddress = request.nextUrl.searchParams.get('wallet');

  if (!email && !walletAddress) {
    return NextResponse.json(
      { error: 'email or wallet query param required' },
      { status: 400 }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const user = await db.user.findFirst({
      where: email ? { email } : { walletAddress: walletAddress! },
      include: {
        taskCompletions: {
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
        pointsHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[Users API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: String(error) },
      { status: 500 }
    );
  }
}
