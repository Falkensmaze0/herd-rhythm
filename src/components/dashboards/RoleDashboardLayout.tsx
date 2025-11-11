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

type HighlightTone = 'default' | 'positive' | 'warn';

interface Highlight {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: HighlightTone;
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

  return (
    <section className={cn('role-surface', className)} data-role-surface={role}>
      <div className="role-hero">
        <div className="role-hero__heading">
          <div className="role-icon">
            {icon ?? <HeroIcon className="h-5 w-5" strokeWidth={1.9} />}
          </div>
          <div className="role-hero__text">
            <span className="role-chip">{kicker ?? copy.kicker}</span>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="role-hero__actions">{actions}</div> : null}
      </div>

      {highlights.length ? (
        <div className="role-meta-grid">
          {highlights.map(({ label, value, hint, tone = 'default' }, index) => (
            <div key={`${label}-${index}`} className="role-meta-card" data-tone={tone}>
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
