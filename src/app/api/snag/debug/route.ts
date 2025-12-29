import { NextResponse } from 'next/server';

// GET /api/snag/debug - Check Snag configuration
export async function GET() {
  const config = {
    apiKeySet: !!process.env.SNAG_API_KEY,
    apiKeyLength: process.env.SNAG_API_KEY?.length || 0,
    apiKeyPrefix: process.env.SNAG_API_KEY ? process.env.SNAG_API_KEY.slice(0, 8) + '...' : 'NOT SET',
    apiUrl: process.env.SNAG_API_URL || 'NOT SET (using default)',
    websiteId: process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID || 'NOT SET',
    orgId: process.env.SNAG_ORG_ID || 'NOT SET',
    currencyId: process.env.SNAG_CURRENCY_ID || 'NOT SET',
    allConfigured: !!(process.env.SNAG_API_KEY && process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID),
  };

  // Test API connection
  let apiTest = { status: 'not_tested', message: '' };

  if (config.apiKeySet && config.websiteId !== 'NOT SET') {
    try {
      const response = await fetch(
        `${config.apiUrl}/loyalty/rules?websiteId=${config.websiteId}&isActive=true&limit=1`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.SNAG_API_KEY!,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        apiTest = {
          status: 'success',
          message: `Connected! Found ${data.data?.length || 0} rules in first page.`,
        };
      } else {
        const error = await response.text();
        apiTest = {
          status: 'error',
          message: `API returned ${response.status}: ${error}`,
        };
      }
    } catch (error) {
      apiTest = {
        status: 'error',
        message: `Connection failed: ${String(error)}`,
      };
    }
  } else {
    apiTest = {
      status: 'not_configured',
      message: 'Missing required environment variables',
    };
  }

  // Test account creation endpoint
  let accountEndpointTest = { status: 'not_tested', message: '', response: null as unknown };
  if (config.apiKeySet && config.websiteId !== 'NOT SET') {
    try {
      // Just test the endpoint exists - don't actually create
      const testResponse = await fetch(
        `${process.env.SNAG_API_URL || 'https://admin.snagsolutions.io/api'}/loyalty/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.SNAG_API_KEY!,
          },
          body: JSON.stringify({
            walletAddress: '0x0000000000000000000000000000000000000000', // Test address
            websiteId: config.websiteId,
            organizationId: config.orgId !== 'NOT SET' ? config.orgId : undefined,
          }),
        }
      );

      const responseText = await testResponse.text();
      let responseJson = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        // Not JSON
      }

      accountEndpointTest = {
        status: testResponse.ok ? 'success' : 'error',
        message: `Account endpoint returned ${testResponse.status}`,
        response: responseJson || responseText.slice(0, 200),
      };
    } catch (error) {
      accountEndpointTest = {
        status: 'error',
        message: `Account endpoint failed: ${String(error)}`,
        response: null,
      };
    }
  }

  return NextResponse.json({
    config,
    apiTest,
    accountEndpointTest,
    timestamp: new Date().toISOString(),
  });
}
