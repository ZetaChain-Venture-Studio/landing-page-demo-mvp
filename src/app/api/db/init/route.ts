import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET /api/db/init - Initialize database tables
export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  try {
    const sql = neon(databaseUrl);

    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "email" TEXT UNIQUE NOT NULL,
        "walletAddress" TEXT UNIQUE,
        "snagUserId" TEXT UNIQUE,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "totalPoints" INTEGER DEFAULT 0 NOT NULL,
        "referralCount" INTEGER DEFAULT 0 NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "TaskCompletion" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "taskId" TEXT NOT NULL,
        "taskName" TEXT NOT NULL,
        "taskType" TEXT NOT NULL,
        "pointsEarned" INTEGER NOT NULL,
        "completedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE("userId", "taskId")
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "PointsHistory" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "amount" INTEGER NOT NULL,
        "type" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "AdminStats" (
        "id" TEXT PRIMARY KEY DEFAULT 'global',
        "totalUsers" INTEGER DEFAULT 0 NOT NULL,
        "totalPoints" INTEGER DEFAULT 0 NOT NULL,
        "totalTasks" INTEGER DEFAULT 0 NOT NULL,
        "totalReferrals" INTEGER DEFAULT 0 NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt")`;
    await sql`CREATE INDEX IF NOT EXISTS "User_totalPoints_idx" ON "User"("totalPoints")`;
    await sql`CREATE INDEX IF NOT EXISTS "TaskCompletion_completedAt_idx" ON "TaskCompletion"("completedAt")`;
    await sql`CREATE INDEX IF NOT EXISTS "TaskCompletion_taskType_idx" ON "TaskCompletion"("taskType")`;
    await sql`CREATE INDEX IF NOT EXISTS "PointsHistory_createdAt_idx" ON "PointsHistory"("createdAt")`;
    await sql`CREATE INDEX IF NOT EXISTS "PointsHistory_type_idx" ON "PointsHistory"("type")`;

    // Get table counts
    const userCount = await sql`SELECT COUNT(*) as count FROM "User"`;
    const taskCount = await sql`SELECT COUNT(*) as count FROM "TaskCompletion"`;
    const pointsCount = await sql`SELECT COUNT(*) as count FROM "PointsHistory"`;

    return NextResponse.json({
      success: true,
      message: 'Database tables initialized',
      tables: {
        User: { created: true, count: userCount[0].count },
        TaskCompletion: { created: true, count: taskCount[0].count },
        PointsHistory: { created: true, count: pointsCount[0].count },
        AdminStats: { created: true },
      },
    });
  } catch (error) {
    console.error('[DB Init] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}
