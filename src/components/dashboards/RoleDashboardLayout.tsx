'use client';

import { type ReactNode } from 'react';
import {
  Activity,
  Briefcase,
  ClipboardList,
  LucideIcon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wrench,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { ThemeSelector } from '@/components/layout/ThemeSelector';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import { useAuth } from '@/contexts/AuthContext';

const LogoutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden
  >
    <path d="M9 3h-2a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h2" />
    <path d="M16 17 21 12 16 7" />
    <path d="M21 12H9" />
  </svg>
);

export type HighlightTone = 'default' | 'positive' | 'warn';

export interface Highlight {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: HighlightTone;
  className?: string;
}

interface RoleDashboardLayoutProps {
  role: UserRole;
  title: string;
  description?: ReactNode;
  kicker?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  highlights?: Highlight[];
  children: ReactNode;
  className?: string;
}

const ROLE_COPY: Record<UserRole | 'default', { kicker: string; icon: LucideIcon }> = {
  admin: { kicker: 'System integrity', icon: ShieldCheck },
  manager: { kicker: 'Crew cadence', icon: ClipboardList },
  doctor: { kicker: 'Health intelligence', icon: Stethoscope },
  technician: { kicker: 'Protocol engine', icon: Wrench },
  helper: { kicker: 'Daily rhythm', icon: Sparkles },
  office: { kicker: 'Back office flow', icon: Briefcase },
  default: { kicker: 'Herd rhythm', icon: Activity },
};

export const RoleDashboardLayout = ({
  role,
  title,
  description,
  kicker,
  icon,
  actions,
  highlights = [],
  children,
  className,
}: RoleDashboardLayoutProps) => {
  const copy = ROLE_COPY[role] ?? ROLE_COPY.default;
  const HeroIcon = ROLE_COPY[role]?.icon ?? ROLE_COPY.default.icon;
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <section className={cn('role-surface', className)} data-role-surface={role}>
      <div className="role-hero">
        <div className="role-hero__controls">
          <ProfileMenu role={role} className="role-hero__control" />
          <ThemeSelector className="role-hero__control" />
          <button
            type="button"
            aria-label="Log out"
            className="role-hero__control"
            onClick={handleLogout}
          >
            <LogoutIcon />
            <span className="sr-only">Log out</span>
          </button>
        </div>
        <div className="role-hero__heading">
          <div className="role-icon">
            {icon ?? <HeroIcon className="h-5 w-5" strokeWidth={1.9} />}
          </div>
          <div className="role-hero__text">
            <div className="role-hero__title-row">
              <div className="role-hero__title-block">
                <span className="role-chip">{kicker ?? copy.kicker}</span>
                <h1>{title}</h1>
              </div>
              {actions ? (
                <div className="role-hero__actions" aria-label="role-actions">
                  {actions}
                </div>
              ) : null}
            </div>
            {description ? <p>{description}</p> : null}
          </div>
        </div>
      </div>

      {highlights.length ? (
        <div className="role-meta-grid">
          {highlights.map(({ label, value, hint, tone = 'default', className: highlightClass }, index) => (
            <div
              key={`${label}-${index}`}
              className={cn('role-meta-card', highlightClass)}
              data-tone={tone}
            >
              <p className="role-meta-label">{label}</p>
              <div className="role-meta-value">{value}</div>
              {hint ? <p className="role-meta-hint">{hint}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="role-content">{children}</div>
    </section>
  );
};
