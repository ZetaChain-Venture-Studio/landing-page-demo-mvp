// Database utilities - database features are disabled until Prisma adapter issues are resolved
// The admin dashboard will show mock data for now

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  // Database integration temporarily disabled due to Prisma 7 adapter compatibility issues
  // The app works with Snag API for points tracking
  // Database will be enabled after resolving adapter configuration
  return null;
}

export default { getDb };
