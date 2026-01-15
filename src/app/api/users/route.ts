import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { snagClient } from '@/lib/snag';

// Nombre de la regla de bienvenida (debe coincidir con Snag)
const WAITLIST_RULE_NAME = 'Joined Waitlist';

// POST /api/users - Create or update user on signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, walletAddress, role, referralCode } = body;

    if (!email && !walletAddress) {
      return NextResponse.json(
        { error: 'email or walletAddress is required' },
        { status: 400 }
      );
    }

    console.log('[Users API] ========== INICIO DE REQUEST ==========');
    console.log('[Users API] Creating/updating user:', { email, walletAddress, role, referralCode });
    console.log('[Users API] Body completo recibido:', JSON.stringify(body, null, 2));
    console.log('[Users API] referralCode del body:', body.referralCode);
    console.log('[Users API] typeof referralCode:', typeof body.referralCode);
    console.log('[Users API] referralCode truthy?', !!body.referralCode);

    // Verificar si el usuario ya existe en Snag
    let snagUserId: string | null = null;
    let isNewUser = false;
    let welcomePoints = 0;
    let welcomeRuleName: string | null = null;
    let referralRegistered = false;

    if (walletAddress && snagClient.isConfigured()) {
      try {
        // Primero verificar si ya existe
        const existingAccount = await snagClient.getAccount(walletAddress);
        
        if (existingAccount) {
          // Usuario existente
          snagUserId = existingAccount.id;
          console.log('[Users API] Usuario existente en Snag:', snagUserId);
          
          // Aún así, si hay código de referido y el usuario es nuevo en nuestro sistema, intentar registrar
          if (referralCode) {
            console.log('[Users API] ⚠️ Usuario existente pero con código de referido. Intentando registrar...');
            try {
              const refResult = await snagClient.createReferralUser(referralCode, snagUserId);
              if (refResult) {
                referralRegistered = true;
                console.log('[Users API] ✅ Referido registrado exitosamente (usuario existente)');
              }
            } catch (refError) {
              console.error('[Users API] Error al registrar referido (usuario existente):', refError);
            }
          }
        } else {
          // Usuario nuevo - crear cuenta
          const snagAccount = await snagClient.createAccount(walletAddress, { emailAddress: email });
          snagUserId = snagAccount?.id || null;
          isNewUser = true;
          console.log('[Users API] ✨ Nuevo usuario creado en Snag:', snagUserId);

          // Si hay código de referido, registrar la relación ANTES de otorgar puntos de bienvenida
          if (snagUserId && referralCode) {
            try {
              console.log('[Users API] 🔗 Registrando referido con código:', referralCode, 'para userId:', snagUserId);
              
              // Paso 1: Registrar la relación de referido
              const refResult = await snagClient.createReferralUser(referralCode, snagUserId);
              
              if (refResult) {
                referralRegistered = true;
                console.log('[Users API] ✅ Referido registrado exitosamente');
                
                // Paso 2: Como la regla es "External", necesitamos completarla manualmente
                // Completar la regla para el usuario referido (nuevo usuario)
                try {
                  const referralRuleId = await snagClient.getReferralRuleId();
                  if (referralRuleId) {
                    console.log('[Users API] 🔄 Completando regla de referidos (External) para usuario referido:', snagUserId);
                    const completed = await snagClient.completeRule(snagUserId, referralRuleId);
                    if (completed) {
                      console.log('[Users API] ✅ Regla de referidos completada para usuario referido (250 puntos otorgados)');
                    } else {
                      console.error('[Users API] ❌ No se pudo completar regla de referidos para usuario referido');
                    }
                    
                    // Paso 3: Intentar obtener el userId del referrer desde el código
                    // Si no podemos obtenerlo, el referrer deberá completar la regla manualmente
                    // o Snag lo hará automáticamente cuando procese la relación
                    console.log('[Users API] 📝 Nota: El referrer debería recibir puntos automáticamente cuando Snag procese la relación');
                    console.log('[Users API] 📝 Si no recibe puntos, puede completar la regla manualmente desde su dashboard');
                  } else {
                    console.error('[Users API] ❌ No se encontró regla de referidos');
                  }
                } catch (completeError) {
                  console.error('[Users API] ❌ Error al completar regla de referidos:', completeError);
                  // No bloquear el flujo si falla
                }
              } else {
                console.error('[Users API] ❌ createReferralUser retornó false');
              }
            } catch (refError) {
              console.error('[Users API] ❌ Error al registrar referido:', refError);
              console.error('[Users API] Error details:', JSON.stringify(refError, null, 2));
              // No bloquear el flujo si falla el referido
            }
          } else {
            if (!snagUserId) {
              console.log('[Users API] ⚠️ No se pudo crear userId, no se puede registrar referido');
            }
            if (!referralCode) {
              console.log('[Users API] ⚠️ No hay código de referido en el body');
              console.log('[Users API] 🔍 DEBUG: body completo:', JSON.stringify(body, null, 2));
              console.log('[Users API] 🔍 DEBUG: body.referralCode:', body.referralCode);
              console.log('[Users API] 🔍 DEBUG: typeof body.referralCode:', typeof body.referralCode);
            } else {
              console.log('[Users API] ✅ Código de referido encontrado:', referralCode);
            }
          }

          // Buscar y completar regla de bienvenida
          if (snagUserId) {
            try {
              const rules = await snagClient.getRules();
              const waitlistRule = rules.find(r => 
                r.name.toLowerCase().includes('waitlist') || 
                r.name.toLowerCase().includes('welcome') ||
                r.name.toLowerCase() === WAITLIST_RULE_NAME.toLowerCase()
              );

              if (waitlistRule) {
                console.log('[Users API] 🎁 Regla de bienvenida encontrada:', waitlistRule.name);
                
                // Verificar que no haya sido completada (por si acaso)
                const alreadyCompleted = await snagClient.isTaskCompleted(
                  walletAddress, 
                  waitlistRule.id, 
                  waitlistRule.name
                );

                if (!alreadyCompleted) {
                  const points = Number(waitlistRule.amount) || waitlistRule.points || 400;
                  const txn = await snagClient.awardPoints(
                    walletAddress,
                    points,
                    waitlistRule.id,
                    waitlistRule.name
                  );

                  if (txn) {
                    welcomePoints = points;
                    welcomeRuleName = waitlistRule.name;
                    console.log('[Users API] 🎉 Puntos de bienvenida otorgados:', points);
                  }
                }
              } else {
                console.log('[Users API] No se encontró regla de bienvenida');
              }
            } catch (ruleError) {
              console.error('[Users API] Error al otorgar puntos de bienvenida:', ruleError);
            }
          }
        }
      } catch (snagError) {
        console.error('[Users API] Snag error:', snagError);
      }
    }

    // Save to database
    const db = getDb();
    if (!db) {
      console.log('[Users API] Database not configured, skipping DB save');
      return NextResponse.json({
        success: true,
        snagUserId,
        isNewUser,
        welcomePoints,
        welcomeRuleName,
        referralRegistered,
        dbSaved: false,
        message: isNewUser 
          ? `¡Bienvenido! Has recibido ${welcomePoints} puntos por unirte.`
          : 'User registered with Snag (no database configured)',
      });
    }

    // Upsert user - create if not exists, update if exists
    const user = await db.user.upsert({
      where: email ? { email } : { walletAddress: walletAddress! },
      create: {
        email: email || `wallet_${walletAddress}@anuma.ai`,
        walletAddress,
        snagUserId,
        role: role || null,
        totalPoints: welcomePoints,
        referralCount: 0,
      },
      update: {
        walletAddress: walletAddress || undefined,
        snagUserId: snagUserId || undefined,
        role: role || undefined,
        updatedAt: new Date(),
      },
    });

    console.log('[Users API] User saved to database:', user.id, 'isNewUser:', isNewUser);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        totalPoints: user.totalPoints,
        createdAt: user.createdAt,
      },
      snagUserId,
      isNewUser,
      welcomePoints,
      welcomeRuleName,
      referralRegistered,
      dbSaved: true,
    });
  } catch (error) {
    console.error('[Users API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/users?email=...&wallet=... - Get user info
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const walletAddress = request.nextUrl.searchParams.get('wallet');

  if (!email && !walletAddress) {
    return NextResponse.json(
      { error: 'email or wallet query param required' },
      { status: 400 }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const user = await db.user.findFirst({
      where: email ? { email } : { walletAddress: walletAddress! },
      include: {
        taskCompletions: {
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
        pointsHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[Users API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: String(error) },
      { status: 500 }
    );
  }
}
