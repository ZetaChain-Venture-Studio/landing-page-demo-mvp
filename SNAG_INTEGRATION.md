# Guía de Integración - Snag Loyalty SDK

Esta guía explica cómo está integrado el SDK de Snag Solutions Loyalty en esta aplicación Next.js.

## Tabla de Contenidos

1. [Configuración](#configuración)
2. [Arquitectura](#arquitectura)
3. [Cliente SDK](#cliente-sdk)
4. [APIs Disponibles](#apis-disponibles)
5. [Flujo de Usuario](#flujo-de-usuario)
6. [Troubleshooting](#troubleshooting)

---

## Configuración

### Variables de Entorno Requeridas

```env
# API Key de Snag (obtener desde Admin Dashboard → API Keys)
# IMPORTANTE: Usa "Website API Key", NO "Stratus API Key"
SNAG_API_KEY=your-website-api-key-here

# ID del sitio web en Snag
NEXT_PUBLIC_SNAG_WEBSITE_ID=your-website-id-here

# ID de la organización
SNAG_ORG_ID=your-organization-id-here

# ID de la moneda de lealtad (para puntos)
SNAG_CURRENCY_ID=your-currency-id-here

# URL base de tu aplicación (para callbacks de OAuth)
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # En producción: https://tu-dominio.com
```

### Cómo Obtener las Claves

1. **Crear cuenta en Snag**: https://www.snagsolutions.io
2. **Acceder al Admin Dashboard**: https://admin.snagsolutions.io
3. **API Keys**: Menú lateral → "API Keys" → "Create New API Key"
4. **Website ID y Org ID**: Se encuentran en la configuración del sitio en el dashboard

### Tipos de API Keys

- **Website API Key** ✅: Para APIs de lealtad (usuarios, reglas, puntos)
- **Stratus API Key** ❌: Solo para funciones on-chain avanzadas

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Cliente)                       │
│  - useSnag hook (src/hooks/useSnag.ts)                      │
│  - PointsDashboard component                                 │
│  - Llama a las API routes (NO directamente a Snag)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API ROUTES (Servidor)                      │
│  - /api/snag/account - Gestión de cuentas                   │
│  - /api/snag/rules - Reglas de lealtad                      │
│  - /api/snag/staking - Staking de ZETA                      │
│  La API key SOLO está aquí (segura)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SNAG SDK CLIENT (src/lib/snag.ts)            │
│  - Inicializa con API key desde env                         │
│  - Usa @snagsolutions/sdk oficial                           │
│  - Wrapper con compatibilidad y fallbacks                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SNAG SOLUTIONS API                       │
│  https://admin.snagsolutions.io/api                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Cliente SDK

### Ubicación
`src/lib/snag.ts`

### Inicialización

```typescript
import SnagSolutions from '@snagsolutions/sdk';

const sdk = new SnagSolutions({
  apiKey: process.env.SNAG_API_KEY!,
});
```

### Métodos Principales

#### Usuarios

```typescript
// Obtener cuenta por wallet
const account = await snagClient.getAccount('0x...');

// Crear cuenta con metadatos
const newAccount = await snagClient.createAccount('0x...', {
  displayName: 'Juan',
  emailAddress: 'juan@example.com',
  twitterUser: '@juan',
});

// Obtener o crear cuenta
const account = await snagClient.getOrCreateAccount('0x...');

// Obtener ranking
const rank = await snagClient.getAccountRank('0x...');
// → { position: 5, total: 100 }
```

#### Reglas de Lealtad

```typescript
// Obtener grupos de reglas
const groups = await snagClient.getRuleGroups();

// Obtener reglas activas
const rules = await snagClient.getRules();

// Obtener reglas de un grupo específico
const rules = await snagClient.getRules('group-id');

// Completar una regla
const success = await snagClient.completeRule(userId, ruleId, walletAddress);

// Completar regla solo con wallet
const success = await snagClient.completeRuleByWallet('0x...', 'rule-id');
```

#### Puntos y Transacciones

```typescript
// Otorgar puntos
const txn = await snagClient.awardPoints(
  '0x...',      // walletAddress
  100,          // amount
  'rule-id',    // ruleId
  'Bonus'       // description
);

// Obtener transacciones
const transactions = await snagClient.getTransactions('0x...');

// Obtener balance calculado
const balance = await snagClient.getAccountBalance('0x...');

// Obtener IDs de reglas completadas
const completedRuleIds = await snagClient.getCompletedRuleIds('0x...');
```

#### Leaderboard

```typescript
const leaderboard = await snagClient.getLeaderboard(100, 0);
// → [{ rank, walletAddress, points, userId }, ...]
```

---

## APIs Disponibles

### GET /api/snag/account

Obtiene información de una cuenta.

**Query params:**
- `walletAddress`: Dirección de wallet

**Response:**
```json
{
  "account": {
    "id": "user-id",
    "walletAddress": "0x...",
    "points": 1000
  },
  "rank": { "position": 5, "total": 100 },
  "completedRuleIds": ["rule-1", "rule-2"]
}
```

### POST /api/snag/account

Crea o obtiene una cuenta.

**Body:**
```json
{
  "walletAddress": "0x...",
  "displayName": "Juan",
  "emailAddress": "juan@example.com",
  "twitterUser": "@juan",
  "discordUser": "juan#1234",
  "telegramUsername": "@juan_tg"
}
```

### GET /api/snag/rules

Obtiene las reglas de lealtad activas.

**Response:**
```json
{
  "rules": [
    {
      "id": "rule-1",
      "name": "Follow Twitter",
      "description": "...",
      "points": 100,
      "type": "social"
    }
  ]
}
```

### POST /api/snag/rules

Completa una regla y otorga puntos.

**Body:**
```json
{
  "walletAddress": "0x...",
  "ruleId": "rule-id"
}
```

### POST /api/snag/staking

Registra staking y otorga puntos.

**Body:**
```json
{
  "walletAddress": "0x...",
  "amount": "100",
  "txHash": "0x..."
}
```

---

## Flujo de Usuario

```
1. Usuario conecta wallet (Privy)
        ↓
2. Frontend llama POST /api/snag/account
        ↓
3. SDK crea usuario en Snag via createMetadata()
        ↓
4. Se otorgan 400 puntos de bienvenida
        ↓
5. Usuario completa tareas (follow, share, etc.)
        ↓
6. Frontend llama POST /api/snag/rules
        ↓
7. SDK otorga puntos via awardPoints()
        ↓
8. Frontend actualiza UI con nuevos puntos
```

---

## Troubleshooting

### "SDK no configurado"

Verificar que las variables de entorno estén correctamente configuradas:

```typescript
const config = snagClient.getConfig();
console.log(config);
// Debería mostrar: { websiteId: "...", orgId: "...", isConfigured: true }
```

### Puntos no se actualizan

El SDK calcula el balance desde las transacciones como fallback:

```typescript
// Si account.points es 0, intentar:
const balance = await snagClient.getAccountBalance(walletAddress);
```

### Regla no se completa

El SDK tiene fallbacks automáticos:
1. Intenta completar regla con userId
2. Intenta completar con walletAddress
3. Otorga puntos directamente via transacción

### Logs de debugging

El cliente SDK logea información útil:
```
[Snag SDK] Buscando cuenta para wallet: 0x...
[Snag SDK] Cuenta encontrada: user-123 puntos: 500
[Snag SDK] Completando regla: { userId, ruleId, walletAddress }
```

---

## Recursos

- **Snag Docs**: https://docs.snagsolutions.io
- **Admin Dashboard**: https://admin.snagsolutions.io
- **SDK npm**: https://www.npmjs.com/package/@snagsolutions/sdk
- **API Reference**: https://docs.snagsolutions.io/api-reference

---

## Verificación de Redes Sociales (OAuth)

### Estado Actual

Actualmente, la verificación de seguimientos en redes sociales es **basada en confianza**:
- El usuario hace clic en "Follow"
- Se abre la URL de la red social
- Se otorgan los puntos automáticamente

### Implementar Verificación Real con OAuth

Para verificación real, Snag soporta integración OAuth. Aquí está cómo implementarla:

#### 1. Configurar OAuth en Snag Dashboard

1. Ir a **Admin Dashboard** → **Settings** → **OAuth Providers**
2. Configurar cada proveedor:
   - **Twitter**: Crear app en developer.twitter.com
   - **Discord**: Crear app en discord.com/developers
   - **Telegram**: Configurar bot con BotFather

#### 2. Crear Reglas con Verificación

En el dashboard de Snag, al crear una regla de tipo "Social":
- Seleccionar "Require OAuth verification"
- Snag verificará automáticamente antes de dar puntos

#### 3. Flujo con OAuth

```
1. Usuario hace clic en "Follow Twitter"
        ↓
2. Redirige a Twitter OAuth (via Snag)
        ↓
3. Usuario autoriza la app
        ↓
4. Snag verifica el follow
        ↓
5. Si verificado → otorga puntos
   Si no verificado → muestra error
```

#### 4. Código de Ejemplo (Futuro)

```typescript
// En el frontend, usar el widget de Snag para OAuth
import { SnagWidget } from '@snagsolutions/widget';

<SnagWidget
  websiteId={process.env.NEXT_PUBLIC_SNAG_WEBSITE_ID}
  walletAddress={walletAddress}
  onRuleComplete={(ruleId, points) => {
    console.log('Regla completada con verificación:', ruleId);
    refreshData();
  }}
/>
```

#### 5. Tipos de Verificación Disponibles

| Red Social | Tipo de Verificación | Requiere OAuth |
|------------|---------------------|----------------|
| Twitter | Follow, Retweet, Like | ✅ Sí |
| Discord | Join Server, Has Role | ✅ Sí |
| Telegram | Join Channel/Group | ✅ Sí |
| Instagram | Follow | ⚠️ Limitado |
| TikTok | Follow | ⚠️ Limitado |

#### Notas sobre Instagram/TikTok

Instagram y TikTok tienen APIs más restrictivas. Opciones:
1. **Trust-based**: Sistema actual (el usuario declara que siguió)
2. **Manual verification**: Admin verifica manualmente
3. **Screenshot proof**: Usuario sube captura de pantalla

---

## Reglas Dinámicas (Implementado)

### Cómo Funciona

Las tareas ahora se obtienen dinámicamente desde Snag:

```
┌─────────────────────────────────────────────────────────────┐
│                    ANTES (Hardcodeado)                       │
│                                                              │
│  Frontend tenía los IDs, títulos y puntos escritos          │
│  directamente en el código. Cambios requerían deploy.       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    AHORA (Dinámico)                          │
│                                                              │
│  1. GET /api/snag/rules obtiene reglas de Snag              │
│  2. La API enriquece con metadatos (uiType, ctaUrl)         │
│  3. Frontend renderiza dinámicamente                         │
│  4. Cambios en Snag Dashboard → cambios en la app           │
└─────────────────────────────────────────────────────────────┘
```

### Agregar Nuevas Tareas

1. **En Snag Dashboard**: Crear nueva regla de lealtad
2. **Configurar metadatos**: 
   - Nombre y descripción
   - Puntos (amount)
   - Tipo (twitter_follow, telegram_join, etc.)
   - URL del CTA si aplica
3. **La app la mostrará automáticamente**

### Mapeo de Tipos

El API mapea los tipos de Snag a tipos de UI:

```typescript
const RULE_TYPE_MAPPING = {
  'twitter_follow': 'social',
  'instagram_follow': 'social',
  'tiktok_follow': 'social',
  'telegram_join': 'social',
  'discord_join': 'social',
  'referral': 'referral',
  'external': 'external',
  'manual': 'manual',
  'staking': 'staking',
  'waitlist': 'waitlist',
};
```

### Validación de Completado

El sistema ahora valida antes de otorgar puntos:

1. **Verifica límite de completado**: Si la regla tiene `completionLimit: 1`, no permite completar dos veces
2. **Usa completeRule primero**: Intenta el método oficial de Snag
3. **Fallback a awardPoints**: Si completeRule falla, otorga puntos directamente

---

## Estado de Completado (Servidor)

### Antes: localStorage

```javascript
// ❌ Vulnerable - el usuario podía borrar localStorage
localStorage.setItem('completed_tasks', JSON.stringify([...ids]));
```

### Ahora: Transacciones de Snag

```typescript
// ✅ Fuente de verdad: transacciones en el servidor
const completedRuleIds = await snagClient.getCompletedRuleIds(walletAddress);
// → ['rule-1', 'rule-2', 'rule-3']
```

Esto evita que usuarios completen tareas múltiples veces.

---

## Conexión de Redes Sociales (OAuth)

### Flujo de Autenticación

La aplicación usa el **OAuth Flow de Snag** para conectar cuentas sociales:

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario hace clic en "Conectar Twitter"                 │
│                         ↓                                   │
│  2. Frontend → GET /api/social/connect?platform=twitter     │
│                         ↓                                   │
│  3. Backend → Snag API → Obtiene URL de OAuth               │
│                         ↓                                   │
│  4. Redirige a Twitter para autorización                    │
│                         ↓                                   │
│  5. Usuario autoriza → Twitter redirige a Snag              │
│                         ↓                                   │
│  6. Snag procesa → Redirige a /api/social/callback          │
│                         ↓                                   │
│  7. Callback redirige a /dashboard con mensaje de éxito     │
└─────────────────────────────────────────────────────────────┘
```

### Plataformas Soportadas

| Plataforma | Endpoint Snag | Tipo de Regla |
|------------|---------------|---------------|
| Twitter/X | `/api/twitter/auth` | `connected_twitter` |
| Telegram | `/api/telegram/auth` | `connected_telegram` |
| TikTok | `/api/tiktok/auth` | `connected_tiktok` |
| Discord | `/api/discord/auth` | `connected_discord` |

> ⚠️ **Instagram** NO está soportado por Snag actualmente.

### APIs Implementadas

**GET `/api/social/connect`**
```typescript
// Parámetros:
// - platform: 'twitter' | 'telegram' | 'tiktok' | 'discord'
// - walletAddress: string
// - userId?: string

// Respuesta:
{ url: "https://auth-provider.com/oauth/authorize?..." }
```

**GET `/api/social/callback`**
```typescript
// Snag redirige aquí después del OAuth
// Redirige al dashboard con:
// - ?social_connected=true&platform=twitter (éxito)
// - ?social_error=message&platform=twitter (error)
```

**GET `/api/social/status`**
```typescript
// Parámetros:
// - walletAddress: string

// Respuesta:
{
  connected: {
    twitter: true,
    telegram: false,
    tiktok: false,
    discord: false
  },
  handles: {
    twitter: "usuario123",
    telegram: null,
    ...
  }
}
```

### Componente UI

El componente `SocialConnectCard` muestra:
- Estado de cada plataforma (conectado/desconectado)
- Handle/username si está conectado
- Botón para conectar
- Mensajes de éxito/error

### Reglas de Tipo `auto`

Las reglas con `claimType: auto` se completan **automáticamente** cuando:
1. El usuario conecta su cuenta social vía OAuth
2. Snag verifica que la acción se cumple (ej: sigue la cuenta)
3. Los puntos se otorgan automáticamente

No necesitan hacer clic en "Completar" - solo conectar la cuenta.

---

## Notas de Seguridad

⚠️ **IMPORTANTE:**

1. **NUNCA** expongas `SNAG_API_KEY` en el cliente/browser
2. Solo usa el SDK en código del servidor (API routes, getServerSideProps)
3. Las variables sin `NEXT_PUBLIC_` no se envían al cliente
4. Usa `.env.local` para desarrollo (está en .gitignore)
5. Los IDs de reglas completadas vienen del servidor, no de localStorage
6. El OAuth se maneja completamente server-side (las claves nunca van al browser)


