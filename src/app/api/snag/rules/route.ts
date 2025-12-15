import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

// GET /api/snag/rules - Get all active rules
export async function GET() {
  try {
    const rules = await snagClient.getRules();
    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error fetching Snag rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    );
  }
}

// POST /api/snag/rules - Complete a rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ruleId } = body;

    if (!userId || !ruleId) {
      return NextResponse.json(
        { error: 'userId and ruleId are required' },
        { status: 400 }
      );
    }

    const success = await snagClient.completeRule(userId, ruleId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to complete rule' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error completing rule:', error);
    return NextResponse.json(
      { error: 'Failed to complete rule' },
      { status: 500 }
    );
  }
}
