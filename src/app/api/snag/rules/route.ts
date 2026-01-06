import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

// Rule ID to points mapping (since rule completion API doesn't work reliably)
const RULE_POINTS: Record<string, number> = {
  '4ed917a4-8655-4f75-bbb3-5c8f4894d5ed': 400, // Sign up to waitlist
  '4b65ae80-6ac7-4542-9915-1734c96a8193': 100, // Follow Twitter
  '0abfd745-342b-4e55-9de4-7ec4dfdfd455': 100, // Follow Instagram
  '5b61746a-e6c2-4773-be30-ae056050995c': 100, // Follow TikTok
  '520fbffd-464b-4d6a-bef6-fffce5e1cf19': 100, // Join Telegram
  '4d0c19a7-e2db-43ad-abae-179bacea0b80': 250, // Invite a friend
  '6c275439-581a-4126-9467-4ec5ce813a69': 1,   // Stake and earn (per ZETA)
};

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

// POST /api/snag/rules - Complete a rule (uses direct point award)
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

    console.log('[Snag API] Completing rule via direct point award:', { ruleId, walletAddress });

    // Get points for this rule
    const points = RULE_POINTS[ruleId];
    if (!points) {
      console.error('[Snag API] Unknown rule ID:', ruleId);
      return NextResponse.json(
        { error: 'Unknown rule ID' },
        { status: 400 }
      );
    }

    // Award points directly via transactions API (this actually works)
    const txn = await snagClient.awardPoints(
      walletAddress,
      points,
      ruleId,
      `Rule completion: ${ruleId}`
    );

    if (txn) {
      console.log('[Snag API] Points awarded successfully:', points);
      return NextResponse.json({ success: true, points });
    } else {
      console.error('[Snag API] Failed to award points');
      return NextResponse.json(
        { error: 'Failed to award points' },
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
