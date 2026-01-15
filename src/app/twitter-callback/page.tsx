"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ColorPalette, anumaSanctuary, isDarkPalette } from '@/lib/palettes';

export default function TwitterCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [palette] = useState<ColorPalette>(anumaSanctuary);
  const [paletteId] = useState<string>('2');
  const isDark = isDarkPalette(paletteId);

  useEffect(() => {
    // Verificar parámetros de la URL
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const code = searchParams.get('code');
    const platform = searchParams.get('platform');

    console.log('[Twitter Callback] Parámetros recibidos:', {
      success,
      error,
      code: code ? 'present' : 'absent',
      platform,
    });

    if (error) {
      setStatus('error');
      setMessage(`Error al conectar Twitter: ${error}`);
    } else if (success === 'true' || code) {
      setStatus('success');
      setMessage('¡Twitter conectado exitosamente! Ya podés reclamar la recompensa por seguirnos en X.');
      
      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push('/dashboard?social_connected=true&platform=twitter');
      }, 3000);
    } else {
      // Si no hay indicadores claros, asumir éxito
      setStatus('success');
      setMessage('Twitter conectado. Redirigiendo al dashboard...');
      setTimeout(() => {
        router.push('/dashboard?social_connected=true&platform=twitter');
      }, 2000);
    }
  }, [searchParams, router]);

  const colors = palette;
  const overlayBg = colors.overlay || (isDark ? 'rgba(12, 12, 12, 0.95)' : 'rgba(248, 249, 250, 0.95)');

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: overlayBg }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full p-8 rounded-2xl text-center"
        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: colors.accent }} />
            <h1 className="text-2xl font-semibold mb-2" style={{ color: colors.text }}>
              Conectando Twitter...
            </h1>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Por favor espera mientras procesamos tu conexión.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: colors.success, color: isDark ? colors.bg : '#ffffff' }}
            >
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: colors.text }}>
              ✅ Twitter conectado
            </h1>
            <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
              {message}
            </p>
            <p className="text-xs" style={{ color: colors.textLight }}>
              Redirigiendo al dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: colors.error || '#ef4444', color: '#ffffff' }}
            >
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: colors.text }}>
              Error al conectar
            </h1>
            <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
              {message}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.accent, color: isDark ? colors.bg : '#ffffff' }}
            >
              Volver al Dashboard
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

