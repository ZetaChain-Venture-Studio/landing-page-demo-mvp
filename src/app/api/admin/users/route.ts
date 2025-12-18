import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Track a new user or update existing
export async function POST(request: NextRequest) {
  try {
    const prisma = getDb();

    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
      });
    }

    const body = await request.json();
    const { email, walletAddress, snagUserId } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        walletAddress: walletAddress || undefined,
        snagUserId: snagUserId || undefined,
      },
      create: {
        email,
        walletAddress,
        snagUserId,
      },
    });

    // Update global stats
    await prisma.adminStats.upsert({
      where: { id: 'global' },
      update: {
        totalUsers: await prisma.user.count(),
      },
      create: {
        id: 'global',
        totalUsers: 1,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        totalPoints: user.totalPoints,
      },
    });
  } catch (error) {
    console.error('User tracking error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Get user by email
export async function GET(request: NextRequest) {
  try {
    const prisma = getDb();

    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
      });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        taskCompletions: true,
        pointsHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
