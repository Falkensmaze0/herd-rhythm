import { PrismaClient, UserRole } from '@prisma/client';

import { buildDefaultUserSettings } from '../src/lib/userSettings/defaultSettings';

const prisma = new PrismaClient();

/**
 * Ensures a given user has a settings record; creates one if it is missing.
 */
async function ensureSettingsForUser(userId: string, role: UserRole) {
  const existing = await prisma.userSetting.findUnique({
    where: { userId },
  });

  if (existing) {
    return { created: false };
  }

  await prisma.userSetting.create({
    data: {
      userId,
      ...buildDefaultUserSettings(role),
    },
  });

  return { created: true };
}

/**
 * Entry point that walks through all users and seeds defaults where needed.
 */
async function run() {
  console.log('[cold-start] Hydrating user settings table...');

  const users = await prisma.user.findMany({
    select: { id: true, role: true, email: true },
  });

  let createdCount = 0;

  for (const user of users) {
    const result = await ensureSettingsForUser(user.id, user.role);
    if (result.created) {
      createdCount += 1;
      console.log(`  • Created defaults for ${user.email} (${user.role})`);
    }
  }

  console.log(
    createdCount
      ? `[cold-start] Completed. Added ${createdCount} missing user settings records.`
      : '[cold-start] All users already had settings records.'
  );
}

run()
  .catch((error) => {
    console.error('[cold-start] Failed to hydrate settings', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
