import { NextResponse } from 'next/server';

/**
 * GET /api/snag/inspect
 * 
 * Endpoint de diagnóstico para ver exactamente qué hay configurado en Snag
 */
export async function GET() {
  const SNAG_API_KEY = process.env.SNAG_API_KEY || '';
  const SNAG_WEBSITE_ID = process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID || '';
  const SNAG_ORG_ID = process.env.SNAG_ORG_ID || '';
  const SNAG_CURRENCY_ID = process.env.SNAG_CURRENCY_ID || '';

  const baseUrl = 'https://admin.snagsolutions.io/api';
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': SNAG_API_KEY,
  };

  const results: Record<string, unknown> = {
    config: {
      apiKeySet: !!SNAG_API_KEY,
      apiKeyPrefix: SNAG_API_KEY ? SNAG_API_KEY.slice(0, 10) + '...' : 'NOT SET',
      websiteId: SNAG_WEBSITE_ID || 'NOT SET',
      orgId: SNAG_ORG_ID || 'NOT SET',
      currencyId: SNAG_CURRENCY_ID || 'NOT SET',
    },
  };

  // 1. Obtener TODAS las reglas (sin filtrar)
  try {
    const response = await fetch(
      `${baseUrl}/loyalty/rules?websiteId=${SNAG_WEBSITE_ID}&limit=50`,
      { headers }
    );
    const data = await response.json();
    
    results.allRules = {
      count: data.data?.length || 0,
      rules: (data.data || []).map((rule: Record<string, unknown>) => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        type: rule.type,
        amount: rule.amount,
        isActive: rule.isActive,
        hideInUi: rule.hideInUi,
        completionLimit: rule.completionLimit,
        claimType: rule.claimType,
        metadata: rule.metadata,
      })),
    };
  } catch (error) {
    results.allRules = { error: String(error) };
  }

  // 2. Obtener grupos de reglas
  try {
    const response = await fetch(
      `${baseUrl}/loyalty/rule-groups?websiteId=${SNAG_WEBSITE_ID}&limit=20`,
      { headers }
    );
    const data = await response.json();
    
    results.ruleGroups = {
      count: data.data?.length || 0,
      groups: data.data || [],
    };
  } catch (error) {
    results.ruleGroups = { error: String(error) };
  }

  // 3. Obtener monedas de lealtad
  try {
    const response = await fetch(
      `${baseUrl}/loyalty/currencies?websiteId=${SNAG_WEBSITE_ID}`,
      { headers }
    );
    const data = await response.json();
    
    results.currencies = {
      count: data.data?.length || 0,
      currencies: data.data || [],
    };
  } catch (error) {
    results.currencies = { error: String(error) };
  }

  // 4. Verificar endpoint de usuarios
  try {
    const response = await fetch(
      `${baseUrl}/users?organizationId=${SNAG_ORG_ID}&limit=5`,
      { headers }
    );
    const data = await response.json();
    
    results.usersEndpoint = {
      status: response.ok ? 'working' : 'error',
      sampleCount: data.data?.length || 0,
    };
  } catch (error) {
    results.usersEndpoint = { error: String(error) };
  }

  return NextResponse.json({
    message: 'Inspección de configuración de Snag',
    timestamp: new Date().toISOString(),
    ...results,
    instructions: {
      step1: 'Revisa "allRules" para ver las reglas que existen en Snag',
      step2: 'Copia los IDs de las reglas que quieres usar',
      step3: 'Actualiza RULE_IDS en PointsDashboard.tsx con esos IDs',
      step4: 'O crea las reglas faltantes en el dashboard de Snag',
    },
  });
}

