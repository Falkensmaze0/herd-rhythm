import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { AuthService } from '@/services/AuthService.server';
import { UserRole } from '@/types';
import { buildDefaultUserSettings, DEFAULT_NOTIFICATIONS } from '@/lib/userSettings/defaultSettings';
import { WidgetPreference, WidgetPreferenceUpdate } from '@/types/userSettings';

/**
 * GET returns the caller's settings, creating defaults if necessary.
 * PUT merges scalar settings, notifications, and profile details.
 */

type SuccessResponse = {
  success: true;
  data: unknown;
};

type ErrorResponse = {
  success: false;
  message: string;
};

const notificationSchema = z
  .object({
    alerts: z.boolean().optional(),
    digests: z.boolean().optional(),
    escalations: z.boolean().optional(),
    smsFallback: z.boolean().optional(),
  })
  .optional();

const profileSchema = z.record(z.any()).optional();
const widgetPreferenceSchema = z
  .record(
    z.object({
      enabled: z.boolean().optional(),
      scope: z.string().max(128).optional(),
      settings: z.record(z.any()).optional(),
    })
  )
  .optional();

const updateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  accentColor: z.string().max(32).optional(),
  density: z.enum(['comfortable', 'compact']).optional(),
  layoutPreset: z.string().max(64).nullable().optional(),
  inboxView: z.enum(['all', 'priority', 'automation', 'inbox', 'sent', 'archived', 'trash']).optional(),
  notifications: notificationSchema,
  profile: profileSchema,
  widgetPreferences: widgetPreferenceSchema,
});

const ensureUserSettings = async (userId: string, role: UserRole) => {
  const existing = await prisma.userSetting.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing;
  }

  return prisma.userSetting.create({
    data: {
      userId,
      ...buildDefaultUserSettings(role),
    },
  });
};

const mergeNotifications = (current: Record<string, unknown> | null, incoming?: Record<string, unknown>) => {
  if (!incoming) return current ?? DEFAULT_NOTIFICATIONS;
  return {
    ...(current ?? DEFAULT_NOTIFICATIONS),
    ...incoming,
  };
};

const mergeProfile = (current: Record<string, unknown> | null, incoming?: Record<string, unknown>) => {
  if (!incoming) return current ?? {};
  return {
    ...(current ?? {}),
    ...incoming,
  };
};

const mergeWidgetPreferences = (
  current: Record<string, WidgetPreference> | null,
  incoming?: WidgetPreferenceUpdate
) => {
  if (!incoming) return current ?? {};

  const base = { ...(current ?? {}) };
  Object.entries(incoming).forEach(([widgetId, updates]) => {
    const existing = base[widgetId] ?? {};
    base[widgetId] = {
      ...existing,
      ...updates,
    };
  });

  return base;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  const sessionToken = req.cookies.sessionToken || req.headers.authorization?.replace('Bearer ', '');

  if (!sessionToken) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const user = await AuthService.validateSession(sessionToken);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    if (req.method === 'GET') {
      const settings = await ensureUserSettings(user.id, user.role);
      return res.status(200).json({ success: true, data: settings });
    }

    if (req.method === 'PUT') {
      const parsed = updateSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues.map((issue) => issue.message).join(', '),
        });
      }

      const current = await ensureUserSettings(user.id, user.role);
      const {
        notifications: incomingNotifications,
        profile: incomingProfile,
        widgetPreferences: incomingWidgetPreferences,
        ...scalarUpdates
      } = parsed.data;

      const notifications = mergeNotifications(
        current.notifications as Record<string, unknown> | null,
        incomingNotifications
      ) as unknown as Prisma.InputJsonValue;
      const profile = mergeProfile(
        current.profile as Record<string, unknown> | null,
        incomingProfile
      ) as unknown as Prisma.InputJsonValue;
      const widgetPreferences = mergeWidgetPreferences(
        current.widgetPreferences as Record<string, WidgetPreference> | null,
        incomingWidgetPreferences
      ) as unknown as Prisma.InputJsonValue;

      const updated = await prisma.userSetting.update({
        where: { userId: user.id },
        data: {
          ...scalarUpdates,
          notifications,
          profile,
          widgetPreferences,
        },
      });

      return res.status(200).json({ success: true, data: updated });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('User settings API error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process user settings' });
  }
}
