import { prisma } from '@/lib/prisma';
import type { Analytics } from '@/types';

export const getAnalyticsSnapshot = async (): Promise<Analytics> => {
  const [totalCows, activeReminders, completedSyncs, reminderCounts, pregnantCows] = await Promise.all([
    prisma.cow.count(),
    prisma.reminder.count({ where: { completed: false } }),
    prisma.reminder.count({ where: { type: 'ai', completed: true } }),
    prisma.reminder.aggregate({
      _count: {
        id: true,
      },
      where: {},
    }),
    prisma.cow.count({ where: { status: 'pregnant' } }),
  ]);

  const totalReminders = reminderCounts._count.id ?? 0;
  const completedReminders = totalReminders
    ? await prisma.reminder.count({ where: { completed: true } })
    : 0;

  const complianceRate = totalReminders
    ? Math.round((completedReminders / totalReminders) * 100)
    : 0;

  const pregnancyRate = totalCows
    ? Math.round((pregnantCows / totalCows) * 100)
    : 0;

  return {
    totalCows,
    activeReminders,
    completedSyncs,
    pregnancyRate,
    complianceRate,
  };
};
