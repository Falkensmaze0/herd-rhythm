import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | undefined;

function attachShutdownHooks(client: PrismaClient) {
  const shutdown = async () => {
    try {
      await client.$disconnect();
      // eslint-disable-next-line no-console
      console.log('[prisma] Disconnected on shutdown.');
      process.exit(0);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[prisma] Error during disconnect:', err);
      process.exit(1);
    }
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

export const prisma = (() => {
  if (global.prisma) return global.prisma;

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Try to connect/verify We only do this once because Prisma connects lazily
    client.$connect().then(() => {
      // eslint-disable-next-line no-console
      console.log('[prisma] Connected to PostgreSQL.');
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[prisma] Connection error:', err);
      // Optionally: kill process if DB connection is critical
      // process.exit(1);
    });

    attachShutdownHooks(client);

    if (process.env.NODE_ENV !== 'production') global.prisma = client;

    prismaInstance = client;

    return client;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[prisma] Failed to initialize PrismaClient:', err);
    throw err;
  }
})();

export default prisma;
