import { LucideIcon } from 'lucide-react';
import { UserRole } from '@/types';

export type LandingWidgetType = 'chart' | 'stats' | 'list' | 'calendar' | 'kpi' | 'timeline';

export interface LandingWidgetConfig {
  id: string;
  type: LandingWidgetType;
  title: string;
  description: string;
  accent?: string;
  note?: string;
}

export interface LandingSectionConfig {
  id: string;
  title: string;
  description: string;
  widgets: LandingWidgetConfig[];
}

export interface LandingTabConfig {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  sections: LandingSectionConfig[];
}

export interface LandingHeroMetric {
  id: string;
  label: string;
  value: string;
  hint?: string;
  delta?: {
    label: string;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface LandingHeroConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  description?: string;
  metrics: LandingHeroMetric[];
  callToAction?: {
    primaryLabel: string;
    secondaryLabel?: string;
  };
}

export interface RoleLandingConfig {
  role: UserRole;
  hero: LandingHeroConfig;
  tabs: LandingTabConfig[];
  recommendations?: string[];
}
