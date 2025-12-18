import { PrismaClient } from '../generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

// Global Prisma client instance for edge/serverless
declare const globalThis: {
  prismaGlobal: PrismaClient | undefined;
};

export function getDb(): PrismaClient | null {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('[DB] No DATABASE_URL configured');
    return null;
  }

  // In production or when not already cached
  if (!globalThis.prismaGlobal) {
    console.log('[DB] Initializing Prisma with Neon adapter');
    const sql = neon(databaseUrl);
    // @ts-expect-error - Neon adapter type compatibility
    const adapter = new PrismaNeon(sql);
    globalThis.prismaGlobal = new PrismaClient({ adapter });
  }

  return globalThis.prismaGlobal;
}

export default { getDb };
