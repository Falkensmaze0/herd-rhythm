import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Minus,
  Settings,
  User,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { WidgetPlaceholder } from './WidgetPlaceholder';
import {
  LandingHeroMetric,
  RoleLandingConfig,
} from './types';

interface RoleLandingProps {
  config: RoleLandingConfig;
  className?: string;
}

const metricTrendConfig: Record<
  NonNullable<LandingHeroMetric['delta']>['trend'],
  {
    icon: React.ReactNode;
    labelClass: string;
  }
> = {
  up: {
    icon: <ArrowUpRight className="h-4 w-4" />,
    labelClass: 'text-emerald-300',
  },
  down: {
    icon: <ArrowDownRight className="h-4 w-4" />,
    labelClass: 'text-rose-300',
  },
  stable: {
    icon: <Minus className="h-4 w-4" />,
    labelClass: 'text-slate-300',
  },
};

const HeroMetricCard: React.FC<{ metric: LandingHeroMetric }> = ({ metric }) => {
  const { label, value, hint, delta } = metric;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.08]">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%)]" />
      <div className="relative flex flex-col gap-3 text-white/90">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</div>
        <div className="text-3xl font-semibold text-white">
          {value}
          {hint && <span className="ml-2 text-base font-normal text-slate-300/80">{hint}</span>}
        </div>
        {delta && (
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em]',
              metricTrendConfig[delta.trend].labelClass,
            )}
          >
            {metricTrendConfig[delta.trend].icon}
            <span>{delta.label}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const RoleLanding: React.FC<RoleLandingProps> = ({ config, className }) => {
  const { hero, tabs, recommendations } = config;
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const userFirstName = React.useMemo(() => {
    if (!user?.name) return 'Admin';
    return user.name.split(' ')[0];
  }, [user?.name]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen w-full bg-slate-950/95 text-slate-100',
        className,
      )}
    >
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.2)_0%,_rgba(15,118,110,0.12)_35%,_transparent_75%)]" />
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-20">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_28px_120px_-40px_rgba(16,185,129,0.45)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15 text-emerald-200">
                <LayoutDashboard className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                  Welcome back, {userFirstName}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">
                    Command Surface
                  </h2>
                  <Badge
                    variant="outline"
                    className="rounded-full border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.28em] text-emerald-100"
                  >
                    {config.role.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300/80">
                  Backend-aligned intelligence, live telemetry, and modular oversight stitched for decisive administration.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Button
                size="sm"
                className="flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-500/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-[0_18px_50px_-20px_rgba(16,185,129,0.75)] transition hover:bg-emerald-400"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Overview
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-2 rounded-full border border-transparent bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                Profile
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-2 rounded-full border border-transparent bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-100 transition hover:border-rose-300/60 hover:bg-rose-500/30 disabled:cursor-not-allowed"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {isLoggingOut ? 'Logging out…' : 'Logout'}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge
                variant="outline"
                className="border-emerald-400/50 bg-white/5 text-[0.65rem] uppercase tracking-[0.3em] text-emerald-200/80 backdrop-blur"
              >
                {hero.eyebrow}
              </Badge>
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {hero.title}
                </h1>
                <p className="max-w-2xl text-base text-slate-300/90 sm:text-lg">
                  {hero.subtitle}
                </p>
                {hero.description && (
                  <p className="max-w-3xl text-sm text-slate-400/90 sm:text-base">
                    {hero.description}
                  </p>
                )}
              </div>
              {hero.callToAction && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    size="lg"
                    className="rounded-full border border-emerald-400/70 bg-emerald-500/70 text-white shadow-[0_20px_60px_-20px_rgba(16,185,129,0.8)] transition hover:bg-emerald-400"
                  >
                    {hero.callToAction.primaryLabel}
                  </Button>
                  {hero.callToAction.secondaryLabel && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-slate-700 bg-white/5 text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                    >
                      {hero.callToAction.secondaryLabel}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hero.metrics.map((metric) => (
              <HeroMetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
        <Tabs defaultValue={tabs[0]?.id} className="w-full">
          <TabsList className="relative flex w-full flex-wrap gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur sm:flex-nowrap sm:overflow-visible">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group flex items-center gap-2 rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/10 hover:bg-white/[0.08] data-[state=active]:border-white/20 data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/5 bg-white/[0.06] text-white/80 transition group-data-[state=active]:border-white/15 group-data-[state=active]:bg-white/15">
                  <tab.icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col text-left">
                  <span>{tab.label}</span>
                  {tab.description && (
                    <span className="text-xs font-normal text-slate-400/90">
                      {tab.description}
                    </span>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="pt-10">
              <div className="space-y-12">
                {tab.sections.map((section) => (
                  <section
                    key={section.id}
                    className="space-y-6 rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:border-white/10 hover:bg-white/[0.05] md:p-8"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                          {tab.label}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                          <p className="mt-2 max-w-2xl text-sm text-slate-300/90">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {section.widgets.map((widget) => (
                        <WidgetPlaceholder
                          key={widget.id}
                          title={widget.title}
                          description={widget.description}
                          type={widget.type}
                          note={widget.note}
                          accent={widget.accent}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-emerald-100 backdrop-blur transition hover:border-emerald-300/50 hover:bg-emerald-500/20 md:p-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-400/40 bg-emerald-400/20 text-emerald-100">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Next Best Actions</h3>
                  <p className="text-sm text-emerald-100/80">
                    Suggestions derived from recent activity and configuration heuristics.
                  </p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-emerald-50/90">
                {recommendations.map((item, index) => (
                  <li
                    key={`${config.role}-recommendation-${index}`}
                    className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3 text-left text-emerald-50/90 backdrop-blur transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-emerald-300 to-sky-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleLanding;