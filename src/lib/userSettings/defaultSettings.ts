import type { Prisma } from '@prisma/client';

import { UserRole } from '@/types';
import {
  DensityChoice,
  InboxViewChoice,
  NotificationSettings,
  ProfileSettings,
  ThemeChoice,
  UserSettings,
  WidgetPreferences,
} from '@/types/userSettings';
import { ROLE_SETTINGS } from '@/data/roleSettings';

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  alerts: true,
  digests: true,
  escalations: true,
  smsFallback: false,
};

export const ROLE_DEFAULT_PROFILE: Record<UserRole, ProfileSettings> = {
  admin: {
    region: 'Global network',
    specialty: 'Governance & compliance',
    coverageWindow: 'System hours',
    preferredChannel: '#command',
    missionFocus: 'Security posture',
  },
  manager: {
    region: 'Ops HQ',
    squadFocus: 'Habitat pods',
    coverageWindow: 'Shift cadence',
    preferredChannel: '#manager-ops',
    missionFocus: 'Crew cadence',
  },
  doctor: {
    region: 'Primary barn cluster',
    specialty: 'Internal medicine',
    coverageWindow: 'On-call window',
    preferredChannel: '#clinical',
    missionFocus: 'Care intelligence',
  },
  technician: {
    region: 'Rover workshop',
    squadFocus: 'Device ops',
    coverageWindow: 'Field rotation',
    preferredChannel: '#tech-lab',
    missionFocus: 'Device uptime',
  },
  helper: {
    region: 'Resident loop',
    coverageWindow: 'Daily rhythm',
    preferredChannel: '#helper-support',
    missionFocus: 'Resident storytelling',
  },
  office: {
    region: 'HQ',
    officeAnchor: 'Finance / Procurement',
    coverageWindow: 'Core hours',
    preferredChannel: '#office-ops',
    missionFocus: 'Budget stewardship',
  },
};

const buildDefaultWidgetPreferences = (role: UserRole): WidgetPreferences => {
  const config = ROLE_SETTINGS[role];
  if (!config) {
    return {};
  }

  return config.widgetControls.reduce<WidgetPreferences>((acc, widget) => {
    acc[widget.id] = {
      enabled:
        widget.required || widget.defaultEnabled === undefined ? true : Boolean(widget.defaultEnabled),
      scope: widget.scope,
    };
    return acc;
  }, {});
};

export const buildDefaultUserSettings = (
  role: UserRole
): Pick<UserSettings, 'theme' | 'accentColor' | 'density' | 'layoutPreset' | 'inboxView'> & {
  notifications: Prisma.InputJsonValue;
  profile: Prisma.InputJsonValue;
  widgetPreferences: Prisma.InputJsonValue;
} => ({
  theme: 'system',
  accentColor: 'emerald',
  density: 'comfortable',
  layoutPreset: null,
  inboxView: 'inbox',
  notifications: DEFAULT_NOTIFICATIONS as unknown as Prisma.InputJsonValue,
  profile: ROLE_DEFAULT_PROFILE[role] as unknown as Prisma.InputJsonValue,
  widgetPreferences: buildDefaultWidgetPreferences(role) as unknown as Prisma.InputJsonValue,
});
