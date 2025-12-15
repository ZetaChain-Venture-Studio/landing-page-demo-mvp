import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

// GET /api/snag/rules - Get all active rules
export async function GET() {
  try {
    console.log('[Snag API] Fetching rules...');
    console.log('[Snag API] Website ID:', process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID);
    console.log('[Snag API] API Key set:', !!process.env.SNAG_API_KEY);

    const rules = await snagClient.getRules();
    console.log('[Snag API] Got rules:', rules.length);

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('[Snag API] Error fetching rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/snag/rules - Complete a rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ruleId, walletAddress } = body;

    if (!ruleId) {
      return NextResponse.json(
        { error: 'ruleId is required' },
        { status: 400 }
      );
    }

    if (!userId && !walletAddress) {
      return NextResponse.json(
        { error: 'Either userId or walletAddress is required' },
        { status: 400 }
      );
    }

    console.log('[Snag API] Completing rule:', { ruleId, userId, walletAddress });

    let success: boolean;
    if (walletAddress) {
      // Use wallet-based completion (handles account creation)
      success = await snagClient.completeRuleByWallet(walletAddress, ruleId);
    } else {
      // Use direct userId completion
      success = await snagClient.completeRule(userId, ruleId);
    }

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to complete rule' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Snag API] Error completing rule:', error);
    return NextResponse.json(
      { error: 'Failed to complete rule', details: String(error) },
      { status: 500 }
    );
  }
}
