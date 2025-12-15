import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

// GET /api/snag/rules/status?userId=xxx
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  try {
    const statuses = await snagClient.getAllRuleStatuses(userId);
    return NextResponse.json({ statuses });
  } catch (error) {
    console.error('Error fetching rule statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rule statuses' },
      { status: 500 }
    );
  }
}
