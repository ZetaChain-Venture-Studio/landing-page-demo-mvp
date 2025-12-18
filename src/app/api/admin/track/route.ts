import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Track task completion or points earned
export async function POST(request: NextRequest) {
  try {
    const prisma = getDb();

    if (!prisma) {
      return NextResponse.json({
        success: true,
        message: 'Database not configured - tracking skipped',
      });
    }

    const body = await request.json();
    const { email, type, data } = body;

    if (!email || !type) {
      return NextResponse.json(
        { success: false, error: 'Email and type are required' },
        { status: 400 }
      );
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    if (type === 'task_completion') {
      const { taskId, taskName, taskType, pointsEarned } = data;

      // Create task completion record (upsert to prevent duplicates)
      await prisma.taskCompletion.upsert({
        where: {
          userId_taskId: {
            userId: user.id,
            taskId,
          },
        },
        update: {
          pointsEarned,
        },
        create: {
          userId: user.id,
          taskId,
          taskName,
          taskType,
          pointsEarned,
        },
      });

      // Add to points history
      await prisma.pointsHistory.create({
        data: {
          userId: user.id,
          amount: pointsEarned,
          type: 'task_completion',
          description: `Completed: ${taskName}`,
        },
      });

      // Update user total points
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: pointsEarned },
        },
      });

      // Update global stats
      await prisma.adminStats.upsert({
        where: { id: 'global' },
        update: {
          totalTasks: { increment: 1 },
          totalPoints: { increment: pointsEarned },
          totalReferrals: taskType === 'referred_user' ? { increment: 1 } : undefined,
        },
        create: {
          id: 'global',
          totalTasks: 1,
          totalPoints: pointsEarned,
          totalReferrals: taskType === 'referred_user' ? 1 : 0,
        },
      });
    } else if (type === 'prize_reveal') {
      const { pointsEarned } = data;

      // Add to points history
      await prisma.pointsHistory.create({
        data: {
          userId: user.id,
          amount: pointsEarned,
          type: 'prize_reveal',
          description: `Prize reveal: +${pointsEarned} points`,
        },
      });

      // Update user total points
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: pointsEarned },
        },
      });

      // Update global stats
      await prisma.adminStats.upsert({
        where: { id: 'global' },
        update: {
          totalPoints: { increment: pointsEarned },
        },
        create: {
          id: 'global',
          totalPoints: pointsEarned,
        },
      });
    } else if (type === 'referral') {
      // Update referral count
      await prisma.user.update({
        where: { id: user.id },
        data: {
          referralCount: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
