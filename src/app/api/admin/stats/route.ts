import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const prisma = getDb();

    // Return mock data when database is not configured
    if (!prisma) {
      return NextResponse.json({
        success: true,
        data: {
          totalUsers: 0,
          totalPoints: 0,
          totalTasks: 0,
          totalReferrals: 0,
          recentUsers: [],
          taskBreakdown: [],
          pointsOverTime: [],
          message: 'Database not configured. Add DATABASE_URL to .env.local and run prisma generate + prisma db push to enable real data.',
        },
      });
    }

    // Get total counts
    const [totalUsers, totalPoints, totalTasks, totalReferrals] = await Promise.all([
      prisma.user.count(),
      prisma.pointsHistory.aggregate({
        _sum: { amount: true },
      }),
      prisma.taskCompletion.count(),
      prisma.taskCompletion.count({
        where: { taskType: 'referred_user' },
      }),
    ]);

    // Get recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        totalPoints: true,
        createdAt: true,
        _count: {
          select: { taskCompletions: true },
        },
      },
    });

    // Get task completion breakdown
    const taskBreakdown = await prisma.taskCompletion.groupBy({
      by: ['taskType', 'taskName'],
      _count: { id: true },
      _sum: { pointsEarned: true },
    });

    // Get points over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pointsOverTime = await prisma.pointsHistory.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      _sum: { amount: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalPoints: totalPoints._sum.amount || 0,
        totalTasks,
        totalReferrals,
        recentUsers: recentUsers.map((u: typeof recentUsers[0]) => ({
          ...u,
          tasksCompleted: u._count.taskCompletions,
        })),
        taskBreakdown: taskBreakdown.map((t: typeof taskBreakdown[0]) => ({
          taskType: t.taskType,
          taskName: t.taskName,
          count: t._count.id,
          pointsEarned: t._sum.pointsEarned || 0,
        })),
        pointsOverTime: pointsOverTime.map((p: typeof pointsOverTime[0]) => ({
          date: p.createdAt,
          amount: p._sum.amount || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
