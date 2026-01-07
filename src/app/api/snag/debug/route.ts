import { NextRequest, NextResponse } from 'next/server';

// GET /api/snag/debug - Check Snag configuration
export async function GET(request: NextRequest) {
  const testWallet = request.nextUrl.searchParams.get('wallet') || '0xe76092f380d10cb2f428b273eb88acc41c34f0d7';

  const config = {
    apiKeySet: !!process.env.SNAG_API_KEY,
    apiKeyLength: process.env.SNAG_API_KEY?.length || 0,
    apiKeyPrefix: process.env.SNAG_API_KEY ? process.env.SNAG_API_KEY.slice(0, 8) + '...' : 'NOT SET',
    apiUrl: process.env.SNAG_API_URL || 'https://admin.snagsolutions.io/api',
    websiteId: process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID || 'NOT SET',
    orgId: process.env.SNAG_ORG_ID || 'NOT SET',
    currencyId: process.env.SNAG_CURRENCY_ID || 'NOT SET',
    allConfigured: !!(process.env.SNAG_API_KEY && process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID && process.env.SNAG_CURRENCY_ID),
  };

  const baseUrl = config.apiUrl;
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.SNAG_API_KEY || '',
  };

  // Test 1: Rules API
  let rulesTest = { status: 'not_tested', message: '', data: null as unknown };
  try {
    const response = await fetch(
      `${baseUrl}/loyalty/rules?websiteId=${config.websiteId}&isActive=true&limit=1`,
      { headers }
    );
    const data = await response.json();
    rulesTest = {
      status: response.ok ? 'success' : 'error',
      message: response.ok ? `Found ${data.data?.length || 0} rules` : `Error ${response.status}`,
      data: response.ok ? data.data?.[0] : data,
    };
  } catch (error) {
    rulesTest = { status: 'error', message: String(error), data: null };
  }

  // Test 2: Get user balance
  let balanceTest = { status: 'not_tested', message: '', data: null as unknown };
  try {
    const response = await fetch(
      `${baseUrl}/loyalty/users?walletAddress=${testWallet.toLowerCase()}&websiteId=${config.websiteId}`,
      { headers }
    );
    const data = await response.json();
    balanceTest = {
      status: response.ok ? 'success' : 'error',
      message: response.ok ? `User found with balance: ${data.data?.[0]?.points || 0}` : `Error ${response.status}`,
      data: data,
    };
  } catch (error) {
    balanceTest = { status: 'error', message: String(error), data: null };
  }

  // Test 3: Test awarding 1 point (actually do it to test)
  let awardTest = { status: 'not_tested', message: '', data: null as unknown, requestBody: null as unknown };
  if (config.currencyId !== 'NOT SET') {
    // Snag API expects description at top level and direction in each entry
    const requestBody = {
      description: 'Debug test - 1 point',
      entries: [
        {
          walletAddress: testWallet.toLowerCase(),
          amount: 1,
          direction: 'credit', // 'credit' to add, 'debit' to subtract
          loyaltyRuleId: '4ed917a4-8655-4f75-bbb3-5c8f4894d5ed', // waitlist rule
          loyaltyCurrencyId: config.currencyId,
          websiteId: config.websiteId,
        }
      ]
    };

    try {
      const response = await fetch(`${baseUrl}/loyalty/transactions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      awardTest = {
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Successfully awarded 1 test point!' : `Error ${response.status}: ${JSON.stringify(data)}`,
        data: data,
        requestBody: requestBody,
      };
    } catch (error) {
      awardTest = { status: 'error', message: String(error), data: null, requestBody };
    }
  } else {
    awardTest = {
      status: 'not_configured',
      message: 'SNAG_CURRENCY_ID is not set - this is required!',
      data: null,
      requestBody: null,
    };
  }

  return NextResponse.json({
    config,
    tests: {
      rules: rulesTest,
      balance: balanceTest,
      award: awardTest,
    },
    testWallet,
    timestamp: new Date().toISOString(),
  });
}
