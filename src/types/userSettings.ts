import { UserRole } from './index';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type DensityChoice = 'comfortable' | 'compact';
export type InboxViewChoice =
  | 'all'
  | 'priority'
  | 'automation'
  | 'inbox'
  | 'sent'
  | 'archived'
  | 'trash';

export interface NotificationSettings {
  alerts: boolean;
  digests: boolean;
  escalations: boolean;
  smsFallback: boolean;
}

export interface WidgetPreference {
  enabled: boolean;
  scope?: string | null;
  settings?: Record<string, unknown>;
}

export type WidgetPreferences = Record<string, WidgetPreference>;
export type WidgetPreferenceUpdate = Record<string, Partial<WidgetPreference>>;

export interface ProfileSettings {
  avatarUrl?: string;
  region?: string;
  specialty?: string;
  coverageWindow?: string;
  squadFocus?: string;
  preferredChannel?: string;
  officeAnchor?: string;
  operationsLens?: string;
  headline?: string;
  availability?: string;
  contactChannel?: string;
  missionFocus?: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: ThemeChoice;
  accentColor: string;
  density: DensityChoice;
  layoutPreset?: string | null;
  inboxView: InboxViewChoice;
  notifications: NotificationSettings;
  profile: ProfileSettings;
  widgetPreferences?: WidgetPreferences | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    role: UserRole;
  };
}

export type UserSettingsUpdatePayload = Partial<
  Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'notifications' | 'profile' | 'user'>
> & {
  notifications?: Partial<NotificationSettings>;
  profile?: ProfileSettings;
  widgetPreferences?: WidgetPreferenceUpdate;
};
