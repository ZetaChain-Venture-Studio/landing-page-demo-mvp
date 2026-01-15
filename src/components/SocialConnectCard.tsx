"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { ColorPalette, isDarkPalette } from '@/lib/palettes';

// Iconos de redes sociales
const TwitterIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
  </svg>
);

// Configuración de plataformas
interface PlatformConfig {
  id: 'twitter' | 'telegram' | 'tiktok' | 'discord';
  name: string;
  displayName: string;
  icon: React.ReactNode;
  color: string;
}

// Plataformas con OAuth configurado en Snag
const PLATFORMS: PlatformConfig[] = [
  { id: 'twitter', name: 'X', displayName: 'X (Twitter)', icon: <TwitterIcon />, color: '#000000' },
  { id: 'discord', name: 'Discord', displayName: 'Discord', icon: <DiscordIcon />, color: '#5865F2' },
];

export interface SocialStatus {
  connected: Record<string, boolean>;
  handles: Record<string, string | null>;
}

interface SocialConnectCardProps {
  walletAddress: string;
  palette: ColorPalette;
  paletteId: string;
  socialStatus?: SocialStatus | null; // Ahora viene del hook useSnag
  onConnectionChange?: () => void;
}

export default function SocialConnectCard({
  walletAddress,
  palette,
  paletteId,
  socialStatus,
  onConnectionChange,
}: SocialConnectCardProps) {
  const isDark = isDarkPalette(paletteId);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Verificar si llegamos con un mensaje de éxito/error desde el callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const socialConnected = params.get('social_connected');
      const socialError = params.get('social_error');
      const platform = params.get('platform');

      if (socialConnected === 'true') {
        setSuccessMessage(`¡${platform || 'Cuenta'} conectada exitosamente!`);
        // Limpiar URL
        window.history.replaceState({}, '', window.location.pathname);
        // Notificar cambio para refrescar datos
        onConnectionChange?.();
        setTimeout(() => setSuccessMessage(null), 5000);
      }

      if (socialError) {
        setError(`Error al conectar ${platform || 'cuenta'}: ${socialError}`);
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(() => setError(null), 5000);
      }
    }
  }, [onConnectionChange]);

  // Iniciar conexión
  const connectPlatform = async (platform: PlatformConfig) => {
    setConnecting(platform.id);
    setError(null);

    try {
      let response;

      // Discord usa flujo OAuth directo (no a través de Snag)
      if (platform.id === 'discord') {
        const params = new URLSearchParams({
          action: 'connect',
          walletAddress,
        });
        response = await fetch(`/api/social/discord?${params.toString()}`);
      } else if (platform.id === 'twitter') {
        // Twitter: usar el endpoint específico como sugiere el prompt
        const params = new URLSearchParams({
          walletAddress,
        });
        response = await fetch(`/api/twitter-auth-url?${params.toString()}`);
      } else {
        // Otras plataformas usan el flujo genérico de Snag
        const params = new URLSearchParams({
          platform: platform.id,
          walletAddress,
        });
        response = await fetch(`/api/social/connect?${params.toString()}`);
      }
      const data = await response.json();

      if (data.url) {
        // Redirigir al OAuth
        window.location.href = data.url;
      } else if (data.error) {
        setError(data.error);
        setConnecting(null);
      }
    } catch (err) {
      setError('Error al iniciar conexión');
      setConnecting(null);
    }
  };

  const loading = !socialStatus;
  const allConnected = PLATFORMS.every(p => socialStatus?.connected[p.id]);
  const connectedCount = PLATFORMS.filter(p => socialStatus?.connected[p.id]).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: palette.bg, borderColor: palette.border }}
    >
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: palette.border }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium flex items-center gap-2" style={{ color: palette.text }}>
              Conectar Redes Sociales
              {allConnected && <CheckCircle className="w-4 h-4" style={{ color: palette.success }} />}
            </h3>
            <p className="text-sm mt-1" style={{ color: palette.textMuted }}>
              Conecta tus cuentas para completar tareas automáticamente ({connectedCount}/{PLATFORMS.length})
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 py-3 flex items-center gap-2 border-b"
            style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca' }}
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 py-3 flex items-center gap-2 border-b"
            style={{ backgroundColor: '#d1fae5', borderColor: '#a7f3d0' }}
          >
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-sm text-green-700">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de plataformas */}
      <div className="divide-y" style={{ borderColor: palette.border }}>
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: palette.textMuted }} />
          </div>
        ) : (
          PLATFORMS.map((platform) => {
            const isConnected = socialStatus?.connected[platform.id];
            const handle = socialStatus?.handles[platform.id];
            const isConnecting = connecting === platform.id;

            return (
              <div
                key={platform.id}
                className="px-5 py-4 flex items-center justify-between"
                style={{ backgroundColor: isConnected ? palette.bgAlt : 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      color: palette.text 
                    }}
                  >
                    {platform.icon}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: palette.text }}>
                      {platform.displayName}
                    </p>
                    {isConnected && handle && (
                      <p className="text-sm" style={{ color: palette.textMuted }}>
                        @{handle}
                      </p>
                    )}
                  </div>
                </div>

                {isConnected ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: palette.success + '20' }}>
                    <CheckCircle className="w-4 h-4" style={{ color: palette.success }} />
                    <span className="text-sm font-medium" style={{ color: palette.success }}>
                      Conectado
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => connectPlatform(platform)}
                    disabled={isConnecting}
                    className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: palette.accent, color: isDark ? palette.bg : '#ffffff' }}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Conectar
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div className="px-5 py-3 border-t" style={{ borderColor: palette.border, backgroundColor: palette.bgAlt }}>
        <p className="text-xs" style={{ color: palette.textLight }}>
          Al conectar, autorizas a verificar tu cuenta. Las tareas sociales se completarán automáticamente.
        </p>
      </div>
    </motion.div>
  );
}
