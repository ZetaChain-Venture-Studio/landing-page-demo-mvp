import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

/**
 * GET /api/snag/debug - Verificar configuración del SDK de Snag
 * 
 * Útil para debugging y verificar que todo esté correctamente configurado.
 * 
 * Query params:
 * - wallet: Dirección de wallet para pruebas (opcional)
 */
export async function GET(request: NextRequest) {
  const testWallet = request.nextUrl.searchParams.get('wallet') || '0xe76092f380d10cb2f428b273eb88acc41c34f0d7';

  // Obtener configuración del SDK
  const sdkConfig = snagClient.getConfig();

  const config = {
    ...sdkConfig,
    apiKeySet: !!process.env.SNAG_API_KEY,
    apiKeyLength: process.env.SNAG_API_KEY?.length || 0,
    apiKeyPrefix: process.env.SNAG_API_KEY ? process.env.SNAG_API_KEY.slice(0, 8) + '...' : 'NOT SET',
    sdkVersion: '@snagsolutions/sdk',
  };

  const tests: Record<string, unknown> = {};

  // Test 1: Obtener reglas usando el SDK
  try {
    console.log('[Debug] Probando getRules...');
    const rules = await snagClient.getRules();
    tests.rules = {
      status: 'success',
      message: `Found ${rules.length} rules`,
      count: rules.length,
      sample: rules[0] ? {
        id: rules[0].id,
        name: rules[0].name,
        points: rules[0].points,
      } : null,
    };
  } catch (error) {
    tests.rules = {
      status: 'error',
      message: String(error),
    };
  }

  // Test 2: Obtener grupos de reglas
  try {
    console.log('[Debug] Probando getRuleGroups...');
    const groups = await snagClient.getRuleGroups();
    tests.ruleGroups = {
      status: 'success',
      message: `Found ${groups.length} rule groups`,
      count: groups.length,
      groups: groups.map(g => ({ id: g.id, name: g.name })),
    };
  } catch (error) {
    tests.ruleGroups = {
      status: 'error',
      message: String(error),
    };
  }

  // Test 3: Buscar cuenta de usuario
  try {
    console.log('[Debug] Probando getAccount para:', testWallet);
    const account = await snagClient.getAccount(testWallet);
    tests.account = {
      status: account ? 'success' : 'not_found',
      message: account ? `Account found: ${account.id}` : 'No account found for this wallet',
      account: account,
    };
  } catch (error) {
    tests.account = {
      status: 'error',
      message: String(error),
    };
  }

  // Test 4: Obtener balance desde transacciones
  try {
    console.log('[Debug] Probando getAccountBalance...');
    const balance = await snagClient.getAccountBalance(testWallet);
    tests.balance = {
      status: 'success',
      message: `Balance from transactions: ${balance}`,
      balance,
    };
  } catch (error) {
    tests.balance = {
      status: 'error',
      message: String(error),
    };
  }

  // Test 5: Obtener transacciones
  try {
    console.log('[Debug] Probando getTransactions...');
    const transactions = await snagClient.getTransactions(testWallet);
    const completedRuleIds = await snagClient.getCompletedRuleIds(testWallet);
    tests.transactions = {
      status: 'success',
      message: `Found ${transactions.length} transactions`,
      count: transactions.length,
      completedRuleIds,
      sample: transactions[0] || null,
    };
  } catch (error) {
    tests.transactions = {
      status: 'error',
      message: String(error),
    };
  }

  // Test 6: Obtener ranking
  try {
    console.log('[Debug] Probando getAccountRank...');
    const rank = await snagClient.getAccountRank(testWallet);
    tests.rank = {
      status: 'success',
      message: rank.position > 0 ? `Ranked #${rank.position} of ${rank.total}` : 'Not ranked',
      rank,
    };
  } catch (error) {
    tests.rank = {
      status: 'error',
      message: String(error),
    };
  }

  // Test 7: Probar creación de cuenta (solo si no existe)
  if (!tests.account || (tests.account as Record<string, unknown>).status === 'not_found') {
    try {
      console.log('[Debug] Probando createAccount...');
      const newAccount = await snagClient.createAccount(testWallet, {
        displayName: 'Debug Test User',
      });
      tests.createAccount = {
        status: newAccount ? 'success' : 'failed',
        message: newAccount ? `Account created: ${newAccount.id}` : 'Failed to create account',
        account: newAccount,
      };
    } catch (error) {
      tests.createAccount = {
        status: 'error',
        message: String(error),
      };
    }
  }

  // Test 8: Probar otorgar 1 punto (solo si el SDK está configurado)
  if (config.isConfigured && config.currencyId) {
    try {
      console.log('[Debug] Probando awardPoints (1 punto de prueba)...');
      const txn = await snagClient.awardPoints(
        testWallet,
        1,
        '4ed917a4-8655-4f75-bbb3-5c8f4894d5ed', // waitlist rule ID
        'Debug test - 1 point'
      );
      tests.awardPoints = {
        status: txn ? 'success' : 'failed',
        message: txn ? 'Successfully awarded 1 test point!' : 'Failed to award points',
        transaction: txn,
      };
    } catch (error) {
      tests.awardPoints = {
        status: 'error',
        message: String(error),
      };
    }
  } else {
    tests.awardPoints = {
      status: 'not_configured',
      message: 'SDK not fully configured - currencyId required',
    };
  }

  // Resumen general
  const allTests = Object.entries(tests);
  const passed = allTests.filter(([, t]) => (t as Record<string, unknown>).status === 'success').length;
  const failed = allTests.filter(([, t]) => (t as Record<string, unknown>).status === 'error').length;
  const skipped = allTests.length - passed - failed;

  return NextResponse.json({
    summary: {
      total: allTests.length,
      passed,
      failed,
      skipped,
      allPassed: failed === 0,
    },
    config,
    tests,
    testWallet,
    timestamp: new Date().toISOString(),
    documentation: 'Ver SNAG_INTEGRATION.md para más información',
  });
}
