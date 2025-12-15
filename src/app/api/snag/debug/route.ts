import { NextResponse } from 'next/server';

// GET /api/snag/debug - Check Snag configuration
export async function GET() {
  const config = {
    apiKeySet: !!process.env.SNAG_API_KEY,
    apiKeyPrefix: process.env.SNAG_API_KEY?.slice(0, 8) + '...',
    apiUrl: process.env.SNAG_API_URL || 'NOT SET',
    websiteId: process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID || 'NOT SET',
    orgId: process.env.SNAG_ORG_ID || 'NOT SET',
    currencyId: process.env.SNAG_CURRENCY_ID || 'NOT SET',
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

  return NextResponse.json({
    config,
    apiTest,
    timestamp: new Date().toISOString(),
  });
}
