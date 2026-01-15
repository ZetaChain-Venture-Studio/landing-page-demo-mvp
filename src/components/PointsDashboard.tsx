"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, Check, ExternalLink, Share2, User, ChevronDown, ChevronRight, LogOut, AlertCircle } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useSnag, SnagRule } from '@/hooks/useSnag';
import { ColorPalette, anumaSanctuary, isDarkPalette } from '@/lib/palettes';
import PrizeReveal from './PrizeReveal';
import ShareModal from './ShareModal';
import StakingModal from './StakingModal';
import SocialConnectCard from './SocialConnectCard';
import WelcomeModal from './WelcomeModal';

// ============ TIPOS ============

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  action: string;
  ruleId?: string;
  type?: string;
  uiType?: string;
  claimType?: 'manual' | 'auto';
  ctaUrl?: string;
  icon?: string;
}

interface PointsDashboardProps {
  email: string;
  testWallet?: string;
  palette?: ColorPalette;
  paletteId?: string;
}

// ============ COMPONENTES WRAPPER ============

function PointsDashboardWithPrivy({ email, palette, paletteId }: { email: string; palette: ColorPalette; paletteId: string }) {
  const { logout, user } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const userId = user?.id;

  return (
    <PointsDashboardContent
      email={email}
      walletAddress={walletAddress}
      userId={userId}
      onLogout={logout}
      palette={palette}
      paletteId={paletteId}
    />
  );
}

function PointsDashboardTestMode({ email, testWallet, palette, paletteId }: { email: string; testWallet: string; palette: ColorPalette; paletteId: string }) {
  return (
    <PointsDashboardContent
      email={email}
      walletAddress={testWallet}
      userId="test-user"
      onLogout={() => window.location.href = '/'}
      isTestMode
      palette={palette}
      paletteId={paletteId}
    />
  );
}

export default function PointsDashboard({ email, testWallet, palette, paletteId = '2' }: PointsDashboardProps) {
  const colors = palette || anumaSanctuary;

  if (testWallet) {
    return <PointsDashboardTestMode email={email} testWallet={testWallet} palette={colors} paletteId={paletteId} />;
  }
  return <PointsDashboardWithPrivy email={email} palette={colors} paletteId={paletteId} />;
}

// ============ COMPONENTE PRINCIPAL ============

interface PointsDashboardContentProps {
  email: string;
  walletAddress?: string;
  userId?: string;
  onLogout: () => void;
  isTestMode?: boolean;
  palette: ColorPalette;
  paletteId: string;
}

function PointsDashboardContent({ email, walletAddress, userId, onLogout, isTestMode, palette, paletteId }: PointsDashboardContentProps) {
  const isDark = isDarkPalette(paletteId);

  // Hook de Snag - reglas dinámicas desde el servidor
  const {
    account: snagAccount,
    rank: snagRank,
    rules: snagRules,
    completedRuleIds,
    socialStatus,
    loading: snagLoading,
    error: snagError,
    initialized: snagInitialized,
    initializeAccount,
    completeRule,
    refreshData,
    refreshSocialStatus,
    isRuleCompleted,
  } = useSnag(walletAddress);

  // Estados locales
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [showPrizeReveal, setShowPrizeReveal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [revealsRemaining, setRevealsRemaining] = useState(1);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [stakingPoints, setStakingPoints] = useState(0);
  
  // Estados para el modal de bienvenida
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomePoints, setWelcomePoints] = useState(0);
  const [welcomeRuleName, setWelcomeRuleName] = useState<string | undefined>();

  // Ref para evitar llamadas duplicadas
  const userInitializedRef = useRef(false);
  const referralFetchedRef = useRef(false);
  const referralProcessedRef = useRef<string | null>(null); // Para evitar procesar el mismo código múltiples veces

  // Función helper para guardar y procesar código de referido
  const saveAndProcessReferralCode = useCallback((refCode: string | null, wallet: string) => {
    if (!refCode || !wallet) return null;
    
    const refKey = `anuma_ref_code_${wallet}`;
    const existingRef = localStorage.getItem(refKey);
    
    // Guardar si no existe o es diferente
    if (!existingRef || existingRef !== refCode) {
      localStorage.setItem(refKey, refCode);
      console.log('[Dashboard] 💾 Código de referido guardado:', refCode);
    }
    
    return refCode;
  }, []);

  // Capturar código de referido INMEDIATAMENTE cuando se carga la página (antes de Privy)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Capturar código de la URL actual
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && walletAddress) {
      saveAndProcessReferralCode(refCode, walletAddress);
    }
    
    // También escuchar cambios en la URL (por si Privy redirige)
    const handleLocationChange = () => {
      const newParams = new URLSearchParams(window.location.search);
      const newRefCode = newParams.get('ref');
      if (newRefCode && walletAddress) {
        saveAndProcessReferralCode(newRefCode, walletAddress);
      }
    };
    
    // Escuchar eventos de popstate (navegación del navegador)
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [walletAddress, saveAndProcessReferralCode]);

  // Estado para código de referido real de Snag
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralStats, setReferralStats] = useState<{ totalReferrals: number } | null>(null);

  // Obtener código de referido real de Snag - SOLO cuando el usuario ya existe en Snag
  useEffect(() => {
    // Esperar a que el usuario tenga cuenta en Snag antes de pedir el código
    if (!walletAddress || !snagAccount?.id || referralFetchedRef.current) return;
    
    referralFetchedRef.current = true;
    console.log('[Dashboard] Usuario existe en Snag, obteniendo código de referido...');
    
    fetch(`/api/snag/referral?walletAddress=${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        if (data.referralCode) {
          setReferralCode(data.referralCode);
          // Construir link con el código real
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          setReferralLink(`${baseUrl}?ref=${data.referralCode}`);
          console.log('[Dashboard] ✅ Código de referido obtenido:', data.referralCode);
        } else {
          console.log('[Dashboard] No se obtuvo código, usando fallback');
          // Fallback al método anterior si no hay código
          const fallbackLink = typeof window !== 'undefined' && walletAddress
            ? `${window.location.origin}?ref=${walletAddress.slice(0, 8)}`
            : '';
          setReferralLink(fallbackLink);
        }
      })
      .catch(err => {
        console.error('[Dashboard] Error obteniendo código de referido:', err);
        // Fallback
        const fallbackLink = typeof window !== 'undefined' && walletAddress
          ? `${window.location.origin}?ref=${walletAddress.slice(0, 8)}`
          : '';
        setReferralLink(fallbackLink);
      });
  }, [walletAddress, snagAccount?.id]); // Depende de snagAccount para esperar a que exista

  // Debug logging
  useEffect(() => {
    console.log('[Dashboard] Estado de Snag:', {
      walletAddress,
      accountId: snagAccount?.id,
      accountPoints: snagAccount?.points,
      rulesCount: snagRules.length,
      rules: snagRules.map(r => ({ id: r.id, name: r.name, points: r.points, uiType: r.uiType })),
      completedRuleIds,
      loading: snagLoading,
      error: snagError,
    });
  }, [walletAddress, snagAccount, snagRules, completedRuleIds, snagLoading, snagError]);

  // Inicializar cuenta y verificar si es usuario nuevo (UNA SOLA VEZ)
  useEffect(() => {
    if (!walletAddress) return;

    // Verificar si hay código de referido en la URL (ANTES de cualquier otra cosa)
    // Esto debe hacerse SIEMPRE, incluso si ya se inicializó, para capturar códigos nuevos
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    // Guardar el código de referido usando la función helper
    if (refCode) {
      saveAndProcessReferralCode(refCode, walletAddress);
    }
    
    // Obtener código de referido: primero de la URL, luego de localStorage
    const referralCodeToUse = refCode || localStorage.getItem(`anuma_ref_code_${walletAddress}`) || undefined;
    
    // Log detallado para debugging
    console.log('[Dashboard] 🔍 Verificando código de referido:', {
      refCodeFromURL: refCode,
      refCodeFromStorage: localStorage.getItem(`anuma_ref_code_${walletAddress}`),
      referralCodeToUse,
      walletAddress,
      userInitialized: userInitializedRef.current,
    });
    
    // Verificar si el modal de bienvenida ya se mostró para esta wallet
    const welcomeShown = localStorage.getItem(`anuma_welcome_shown_${walletAddress}`);
    
    // Si ya se inicializó Y no hay código de referido, no hacer nada más
    if (userInitializedRef.current && !referralCodeToUse) {
      return;
    }
    
    // Si hay código de referido, SIEMPRE intentar registrarlo (incluso si ya se inicializó)
    if (referralCodeToUse && userInitializedRef.current) {
      console.log('[Dashboard] 🔄 Código de referido detectado después de inicialización, registrando...');
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          email: email || undefined,
          referralCode: referralCodeToUse,
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('[Dashboard] Respuesta de referido:', {
            referralRegistered: data.referralRegistered,
          });
          
          if (data.referralRegistered) {
            localStorage.removeItem(`anuma_ref_code_${walletAddress}`);
            console.log('[Dashboard] ✅ Referido registrado, código limpiado');
          }
          
          // Limpiar el código de referido de la URL
          if (refCode) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            console.log('[Dashboard] 🧹 Código de referido limpiado de URL');
          }
        })
        .catch(err => console.error('[Dashboard] Error registrando referido:', err));
      return;
    }
    
    // Si ya se inicializó, no hacer nada más
    if (userInitializedRef.current) return;
    
    // Marcar como inicializado ANTES de hacer la llamada
    userInitializedRef.current = true;

    // Inicializar cuenta de Snag
    if (!snagInitialized && !snagLoading) {
      initializeAccount(walletAddress, userId || 'test-user');
    }
    
    // Si ya se mostró el welcome y no hay código, no hacer nada más
    if (welcomeShown && !referralCodeToUse) {
      console.log('[Dashboard] Welcome ya mostrado y sin código de referido, saltando...');
      return;
    }
    
    // Crear/verificar usuario y mostrar welcome si es nuevo
    console.log('[Dashboard] Verificando usuario nuevo...', referralCodeToUse ? `(referido por ${referralCodeToUse})` : '(sin referido)');
    console.log('[Dashboard] Body que se enviará:', { walletAddress, email: email || undefined, referralCode: referralCodeToUse });
    
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        email: email || undefined,
        referralCode: referralCodeToUse, // Pasar código de referido si existe
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('[Dashboard] Respuesta de usuario:', {
          isNewUser: data.isNewUser,
          welcomePoints: data.welcomePoints,
          referralRegistered: data.referralRegistered,
        });
        
        // Si el referido se registró exitosamente, limpiar el código guardado
        if (data.referralRegistered) {
          localStorage.removeItem(`anuma_ref_code_${walletAddress}`);
          console.log('[Dashboard] ✅ Referido registrado, código limpiado');
        }
        
        if (data.isNewUser && data.welcomePoints > 0) {
          setWelcomePoints(data.welcomePoints);
          setWelcomeRuleName(data.welcomeRuleName);
          setShowWelcomeModal(true);
          localStorage.setItem(`anuma_welcome_shown_${walletAddress}`, 'true');
        }
        
        // Limpiar el código de referido de la URL para evitar re-uso (después de enviarlo)
        if (refCode) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          console.log('[Dashboard] 🧹 Código de referido limpiado de URL');
        }
      })
      .catch(err => console.error('[Dashboard] Error verificando usuario:', err));
  }, [walletAddress, snagInitialized, snagLoading, initializeAccount, userId, email, saveAndProcessReferralCode]);

  // ============ CONVERTIR REGLAS DE SNAG A TASKS ============

  // Helper para convertir una regla de Snag a Task
  const ruleToTask = useCallback((rule: SnagRule): Task => {
    const completed = isRuleCompleted(rule.id);
    
    // Determinar la acción según el tipo
    let action = 'Complete';
    const uiType = rule.uiType || 'manual';
    
    if (uiType === 'social') action = 'Follow';
    if (uiType === 'referral') action = 'Invite';
    if (uiType === 'staking') action = 'Stake';
    if (uiType === 'waitlist') action = completed ? 'Completed' : 'Join';
    if (rule.claimType === 'auto') action = completed ? 'Completed' : 'Auto';

    return {
      id: rule.id,
      title: rule.name,
      description: rule.description || '',
      points: rule.points,
      completed,
      action,
      ruleId: rule.id,
      type: uiType,
      uiType: uiType,
      claimType: rule.claimType,
      ctaUrl: rule.ctaUrl,
      icon: rule.icon,
    };
  }, [isRuleCompleted]);

  // Tareas desde Snag (dinámico - sin hardcodes)
  const tasks: Task[] = useMemo(() => {
    if (snagRules.length === 0) {
      return [];
    }

    // Convertir todas las reglas de Snag a tareas
    return snagRules.map(ruleToTask);
  }, [snagRules, ruleToTask]);

  // Separar tareas sociales para agruparlas
  const socialTasks = useMemo(() => tasks.filter(t => t.uiType === 'social'), [tasks]);
  const otherTasks = useMemo(() => tasks.filter(t => t.uiType !== 'social'), [tasks]);

  // ============ CÁLCULOS DE PUNTOS ============

  const snagPoints = Number(snagAccount?.points) || 0;
  const totalPoints = snagPoints + Number(bonusPoints) + Number(stakingPoints);
  
  const rank = snagRank?.position || 0;
  const totalUsers = snagRank?.total || 0;
  const rankPercent = totalUsers > 0 && rank > 0 ? Math.ceil((rank / totalUsers) * 100) : null;
  
  const totalTaskCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;

  // ============ HANDLERS ============

  const copyReferralLink = useCallback(async () => {
    if (referralLink) {
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
      }
    }
  }, [referralLink]);

  const handleTaskClick = useCallback(async (task: Task) => {
    if (task.claimType === 'auto') return;
    if (task.completed) return;

    // Casos especiales
    if (task.type === 'referral' || task.uiType === 'referral') {
      await copyReferralLink();
      setShowShareModal(true);
      return;
    }

    if (task.type === 'staking' || task.uiType === 'staking') {
      setShowStakingModal(true);
      return;
    }

    // Abrir URL si existe
    if (task.ctaUrl) {
      window.open(task.ctaUrl, '_blank');
    }

    // Completar regla en Snag
    if (task.ruleId && walletAddress) {
      setCompletingTaskId(task.id);
      try {
        console.log('[Dashboard] Completando tarea:', task.ruleId);
        const result = await completeRule(task.ruleId);
        console.log('[Dashboard] Resultado:', result);

        if (result.success) {
          await refreshData();
        }
      } catch (err) {
        console.error('[Dashboard] Error al completar tarea:', err);
      } finally {
        setCompletingTaskId(null);
      }
    }
  }, [copyReferralLink, walletAddress, completeRule, refreshData]);

  const handlePrizeReveal = useCallback((points: number) => {
    setBonusPoints(prev => prev + points);
    setRevealsRemaining(prev => Math.max(0, prev - 1));
  }, []);

  const handleStakeSuccess = useCallback((amount: string) => {
    const points = Math.floor(parseFloat(amount) * 2.5);
    setStakingPoints(prev => prev + points);
  }, []);

  const copyWalletAddress = useCallback(async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopiedWallet(true);
        setTimeout(() => setCopiedWallet(false), 2000);
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = walletAddress;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedWallet(true);
        setTimeout(() => setCopiedWallet(false), 2000);
      }
    }
  }, [walletAddress]);

  const overlayBg = palette.overlay || (isDark ? 'rgba(12, 12, 12, 0.95)' : 'rgba(248, 249, 250, 0.95)');

  // ============ RENDER ============

  return (
    <div className="min-h-screen font-['Inter',sans-serif]" style={{ backgroundColor: palette.bg }}>
      {/* Header */}
      <header className="px-8 py-6 border-b" style={{ borderColor: palette.border }}>
        <nav className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <span
              className="text-2xl font-medium"
              style={{
                color: palette.text,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.08em',
              }}
            >
              ΛNUMΛ
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:opacity-80"
              style={{
                backgroundColor: isDark ? palette.bgAlt : palette.bg,
                borderColor: palette.border
              }}
            >
              <User className="w-4 h-4" style={{ color: palette.textMuted }} />
              <span className="text-sm hidden sm:inline" style={{ color: palette.text }}>{email}</span>
              <ChevronDown className="w-4 h-4" style={{ color: palette.textMuted }} />
            </button>

            <AnimatePresence>
              {showAccountMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 rounded-xl border shadow-lg z-50 overflow-hidden"
                    style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: palette.border }}>
                      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: palette.textLight }}>Email</p>
                      <p className="text-sm truncate" style={{ color: palette.text }}>{email}</p>
                    </div>

                    {walletAddress && (
                      <div className="px-4 py-3 border-b" style={{ borderColor: palette.border }}>
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: palette.textLight }}>Wallet</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono truncate flex-1" style={{ color: palette.text }}>
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </p>
                          <button
                            onClick={copyWalletAddress}
                            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                            style={{ backgroundColor: palette.bgAlt }}
                          >
                            {copiedWallet ? (
                              <Check className="w-4 h-4" style={{ color: palette.success }} />
                            ) : (
                              <Copy className="w-4 h-4" style={{ color: palette.textMuted }} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => { setShowAccountMenu(false); onLogout(); }}
                      className="w-full px-4 py-3 flex items-center gap-2 transition-colors hover:opacity-80"
                      style={{ color: palette.textMuted }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">{isTestMode ? 'Exit' : 'Sign out'}</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-light tracking-tight mb-2" style={{ color: palette.text, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
              Get Early Access
            </h1>
            <p className="max-w-2xl" style={{ color: palette.textMuted }}>
              Complete tasks to earn AI Credits. The more credits you earn, the earlier you get access to Anuma.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Tasks */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm uppercase tracking-widest mb-4" style={{ color: palette.textLight }}>
                Earn AI Credits
                {snagLoading && <span className="ml-2 text-xs">(Loading...)</span>}
                {!snagLoading && snagRules.length > 0 && <span className="ml-2 text-xs text-green-600">({snagRules.length} tasks from Snag)</span>}
              </h2>

              {/* Conectar Redes Sociales */}
              {walletAddress && (
                <SocialConnectCard
                  walletAddress={walletAddress}
                  palette={palette}
                  paletteId={paletteId}
                  socialStatus={socialStatus}
                  onConnectionChange={() => {
                    // Solo refrescar estado social (no todos los datos)
                    refreshSocialStatus();
                  }}
                />
              )}

              {/* Error de Snag */}
              {snagError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border flex items-start gap-3"
                  style={{ backgroundColor: palette.bgAlt, borderColor: '#ef4444' }}
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-600">Error cargando tareas</p>
                    <p className="text-sm" style={{ color: palette.textMuted }}>{snagError}</p>
                            </div>
                          </motion.div>
                        )}

              {/* Sin tareas configuradas */}
              {!snagLoading && snagRules.length === 0 && !snagError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl border text-center"
                  style={{ backgroundColor: palette.bgAlt, borderColor: palette.border }}
                  >
                  <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: palette.textMuted }} />
                  <p className="font-medium mb-2" style={{ color: palette.text }}>No hay tareas configuradas</p>
                  <p className="text-sm mb-4" style={{ color: palette.textMuted }}>
                    Necesitas crear reglas de lealtad en el dashboard de Snag Solutions.
                  </p>
                  <a
                    href="https://admin.snagsolutions.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: palette.accent, color: isDark ? palette.bg : '#ffffff' }}
                            >
                    <ExternalLink className="w-4 h-4" />
                    Ir a Snag Dashboard
                  </a>
                </motion.div>
              )}

              {/* Tareas sociales agrupadas */}
              {socialTasks.length > 0 && (
                <SocialTasksGroup
                  tasks={socialTasks}
                  onTaskClick={handleTaskClick}
                  completingTaskId={completingTaskId}
                  palette={palette}
                  isDark={isDark}
                />
              )}

              {/* Otras tareas */}
              {otherTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onTaskClick={handleTaskClick}
                  completingTaskId={completingTaskId}
                  palette={palette}
                  isDark={isDark}
                  referralLink={referralLink}
                  copiedReferral={copiedReferral}
                  onCopyReferral={copyReferralLink}
                  onShowShareModal={() => setShowShareModal(true)}
                  onShowStakingModal={() => setShowStakingModal(true)}
                />
              ))}

              {/* More Coming Soon */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-5 rounded-xl border mt-4"
                style={{ backgroundColor: palette.bgAlt, borderColor: palette.border, opacity: 0.7 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.border }}>
                    <span style={{ color: palette.textLight }}>✨</span>
                  </div>
                  <div>
                    <h3 className="font-medium" style={{ color: palette.textMuted }}>More Ways to Earn</h3>
                    <p className="text-sm" style={{ color: palette.textLight }}>Coming soon...</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div className="p-6 rounded-2xl border" style={{ backgroundColor: palette.bg, borderColor: palette.border }}>
                <div className="mb-6 pb-6 border-b" style={{ borderColor: palette.border }}>
                  <p className="text-sm uppercase tracking-widest mb-2" style={{ color: palette.textLight }}>
                    AI Credits
                  </p>
                  <motion.p
                    className="text-5xl font-light tracking-tight"
                    style={{ color: palette.text }}
                    key={totalPoints}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {totalPoints.toLocaleString()}
                  </motion.p>
                  <p className="text-xs mt-2" style={{ color: palette.textLight }}>
                    Credits count toward future rewards
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b" style={{ borderColor: palette.border }}>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: palette.textLight }}>Rank</p>
                    <p className="text-xl font-medium" style={{ color: palette.text }}>
                      {rankPercent !== null ? `Top ${rankPercent}%` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: palette.textLight }}>Tasks</p>
                    <p className="text-xl font-medium" style={{ color: palette.text }}>
                      {completedTasksCount}/{totalTaskCount}
                    </p>
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl border"
                  style={{ backgroundColor: palette.bgAlt, borderColor: palette.border }}
                >
                    <p className="font-medium text-sm mb-1 flex items-center gap-2" style={{ color: totalPoints >= 10000 ? palette.success : palette.textMuted }}>
                      <span>{totalPoints >= 10000 ? '✓' : '🔒'}</span> {totalPoints >= 10000 ? 'Eligibility Confirmed' : 'Get Early Access'}
                    </p>
                    <p className="text-xs mb-2" style={{ color: palette.textLight }}>
                      Priority eligibility at 10,000 credits
                    </p>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: palette.border }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          backgroundColor: totalPoints >= 10000 ? palette.success : palette.accent,
                          width: `${Math.min((totalPoints / 10000) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-right" style={{ color: palette.textLight }}>
                      {totalPoints.toLocaleString()} / 10,000
                    </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showPrizeReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: overlayBg }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative p-8 rounded-2xl max-w-sm w-full text-center"
              style={{ backgroundColor: palette.bg, border: `1px solid ${palette.border}` }}
            >
              <button
                onClick={() => setShowPrizeReveal(false)}
                className="absolute top-4 right-4 p-2 rounded-full"
                style={{ color: palette.textLight }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-medium mb-2" style={{ color: palette.text }}>Daily Reward</h2>
              <p className="text-sm mb-8" style={{ color: palette.textMuted }}>Tap to reveal your bonus points</p>

              <PrizeReveal
                onRevealComplete={(points) => {
                  handlePrizeReveal(points);
                  setTimeout(() => setShowPrizeReveal(false), 2500);
                }}
                revealsRemaining={revealsRemaining}
                disabled={revealsRemaining <= 0}
                palette={palette}
                paletteId={paletteId}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        referralLink={referralLink}
        palette={palette}
        paletteId={paletteId}
      />

      {walletAddress && (
        <StakingModal
          isOpen={showStakingModal}
          onClose={() => setShowStakingModal(false)}
          walletAddress={walletAddress}
          palette={palette}
          paletteId={paletteId}
          onStakeSuccess={handleStakeSuccess}
        />
      )}

      {/* Welcome Modal - Mostrado cuando usuario nuevo se une */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => {
          setShowWelcomeModal(false);
          // Refrescar datos para mostrar los puntos actualizados
          refreshData();
        }}
        points={welcomePoints}
        ruleName={welcomeRuleName}
        palette={palette}
        paletteId={paletteId}
      />
    </div>
  );
}

// ============ COMPONENTES AUXILIARES ============

interface TaskCardProps {
  task: Task;
  index: number;
  onTaskClick: (task: Task) => void;
  completingTaskId: string | null;
  palette: ColorPalette;
  isDark: boolean;
  referralLink: string;
  copiedReferral: boolean;
  onCopyReferral: () => void;
  onShowShareModal: () => void;
  onShowStakingModal: () => void;
}

function TaskCard({
  task,
  index,
  onTaskClick,
  completingTaskId,
  palette,
  isDark,
  referralLink,
  copiedReferral,
  onCopyReferral,
  onShowShareModal,
  onShowStakingModal,
}: TaskCardProps) {
  const isReferralTask = task.uiType === 'referral';
  const isStakingTask = task.uiType === 'staking';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-5 rounded-xl border transition-all"
      style={{
        backgroundColor: task.completed ? palette.bgAlt : palette.bg,
        borderColor: palette.border,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium" style={{ color: palette.text }}>{task.title}</h3>
            {task.completed && <CheckCircle className="w-4 h-4" style={{ color: palette.success }} />}
          </div>
          <p className="text-sm mb-3" style={{ color: palette.textMuted }}>{task.description}</p>

          {isReferralTask && !task.completed ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border"
                  style={{ backgroundColor: palette.bgAlt, borderColor: palette.border, color: palette.textMuted }}
                />
                <button
                  onClick={onCopyReferral}
                  className="px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1"
                  style={{ backgroundColor: palette.bgAlt, border: `1px solid ${palette.border}`, color: palette.textMuted }}
                >
                  {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={onShowShareModal}
                className="w-full px-4 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: palette.accent, color: isDark ? palette.bg : '#ffffff' }}
              >
                <Share2 className="w-4 h-4" />
                Share & Earn Credits
              </button>
            </div>
          ) : isStakingTask && !task.completed ? (
            <button
              onClick={onShowStakingModal}
              className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2"
              style={{ backgroundColor: palette.accent, color: isDark ? palette.bg : '#ffffff' }}
            >
              Stake ZETA
            </button>
          ) : !task.completed && task.claimType !== 'auto' ? (
            <button
              onClick={() => onTaskClick(task)}
              disabled={completingTaskId === task.id}
              className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: palette.accent, color: isDark ? palette.bg : '#ffffff' }}
            >
              {task.ctaUrl && <ExternalLink className="w-4 h-4" />}
              {completingTaskId === task.id ? 'Processing...' : task.action}
            </button>
          ) : null}
        </div>

        <div className="text-right">
          {isStakingTask ? (
            <>
              <span className="text-lg font-medium" style={{ color: palette.accent }}>2.5</span>
              <span className="text-sm ml-1" style={{ color: palette.textLight }}>per ZETA</span>
            </>
          ) : (
            <>
              <span className="text-lg font-medium" style={{ color: palette.accent }}>+{task.points}</span>
              <span className="text-sm ml-1" style={{ color: palette.textLight }}>Credits</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface SocialTasksGroupProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  completingTaskId: string | null;
  palette: ColorPalette;
  isDark: boolean;
}

function SocialTasksGroup({ tasks, onTaskClick, completingTaskId, palette, isDark }: SocialTasksGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const completedCount = tasks.filter(t => t.completed).length;
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const allCompleted = completedCount === tasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: palette.bg, borderColor: palette.border }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-start justify-between gap-4 text-left transition-colors hover:opacity-90"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium" style={{ color: palette.text }}>Follow Us</h3>
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="w-4 h-4" style={{ color: palette.textMuted }} />
            </motion.div>
            {allCompleted && <CheckCircle className="w-4 h-4" style={{ color: palette.success }} />}
          </div>
          <p className="text-sm" style={{ color: palette.textMuted }}>
            Follow on social media ({completedCount}/{tasks.length} completed)
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-medium" style={{ color: palette.accent }}>+{totalPoints}</span>
          <span className="text-sm ml-1" style={{ color: palette.textLight }}>Credits</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t" style={{ borderColor: palette.border }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="px-5 py-4 flex items-center justify-between border-b last:border-b-0"
                  style={{
                    backgroundColor: task.completed ? palette.bgAlt : 'transparent',
                    borderColor: palette.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium" style={{ color: palette.text }}>{task.title}</h4>
                    {task.completed && <CheckCircle className="w-3.5 h-3.5" style={{ color: palette.success }} />}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: palette.accent }}>+{task.points}</span>
                    {!task.completed && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                        disabled={completingTaskId === task.id}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 disabled:opacity-50"
                        style={{ backgroundColor: palette.accent, color: isDark ? palette.bg : '#ffffff' }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        {completingTaskId === task.id ? '...' : task.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
