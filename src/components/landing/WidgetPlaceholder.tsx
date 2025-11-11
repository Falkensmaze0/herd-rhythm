import React from 'react';
import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  Calendar,
  ClipboardList,
  Layers,
  LineChart,
  PieChart,
} from 'lucide-react';

type WidgetType = 'chart' | 'stats' | 'list' | 'calendar' | 'kpi' | 'timeline';

interface WidgetPlaceholderProps {
  title: string;
  description: string;
  type: WidgetType;
  className?: string;
  note?: string;
  accent?: string;
  children?: React.ReactNode;
}

/**
 * WidgetPlaceholder
 *  - Provides a visually rich, animated placeholder block that mimics the final UI.
 *  - Keeps developer TODOs visible for future replacement with live components.
 *  - Supports multiple styles (chart, stats, list, calendar, kpi, timeline).
 *  - Designed to be swapped out with production-ready widgets without layout changes.
 */
export const WidgetPlaceholder: React.FC<WidgetPlaceholderProps> = ({
  title,
  description,
  type,
  className,
  note,
  accent = 'from-emerald-400/80 via-sky-400/30 to-transparent',
  children,
}) => {
  const renderVisual = () => {
    switch (type) {
      case 'chart':
        return (
          <div className="mt-4 flex h-28 items-end gap-2 overflow-hidden">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="flex-1 rounded-lg bg-white/10"
                style={{
                  height: `${35 + Math.sin(index) * 20 + 20}%`,
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <div className="h-full w-full animate-[pulse_3.5s_ease-in-out_infinite] rounded-lg bg-gradient-to-t from-transparent via-white/20 to-white/60" />
              </div>
            ))}
          </div>
        );
      case 'stats':
        return (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {['Primary', 'Secondary', 'Tertiary', 'Quaternary'].map((label, index) => (
              <div
                key={label}
                className="rounded-2xl border border-white/5 bg-white/5/5 p-4 backdrop-blur transition-all duration-500 hover:border-white/20"
                style={{ animationDelay: `${index * 140}ms` }}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-400">
                  {label} Metric
                  <Activity className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div className="mt-3 text-2xl font-semibold text-white/90">
                  00.0<span className="text-lg text-slate-500">%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                  <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-white/40 to-white/10" />
                </div>
              </div>
            ))}
          </div>
        );
      case 'list':
        return (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`list-${index}`}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-white/90">Placeholder Item {index + 1}</div>
                    <div className="text-xs text-slate-400">Add contextual summary once data is wired.</div>
                  </div>
                </div>
                <div className="text-xs uppercase tracking-wide text-slate-500">TODO</div>
              </div>
            ))}
          </div>
        );
      case 'calendar':
        return (
          <div className="mt-6 grid gap-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-400">
              <span>Week Overview</span>
              <Calendar className="h-4 w-4" />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 14 }).map((_, index) => (
                <div
                  key={`calendar-${index}`}
                  className="aspect-square rounded-xl border border-white/5 bg-white/[0.05] backdrop-blur transition hover:border-white/15"
                >
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-slate-300">
                    <span className="text-[0.60rem] uppercase tracking-[0.4em] text-white/40">D{index + 1}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-white/50 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'kpi':
        return (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`kpi-${index}`}
                className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.04] p-6 backdrop-blur"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-60" />
                <div className="relative">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-400">
                    KPI {index + 1}
                    <PieChart className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <div className="text-4xl font-semibold text-white/90">0.00</div>
                    <span className="text-xs uppercase tracking-[0.28em] text-emerald-300/70">
                      +0.0%
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-white/10">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-400/80 to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'timeline':
        return (
          <div className="mt-5 space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`timeline-${index}`} className="flex items-start gap-4">
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
                  <div className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white/90">
                    <LineChart className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.04] p-4 backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.28em] text-slate-400">
                    Timeline Item {index + 1}
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.65rem] text-white/50">
                      Scheduled
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    Replace this narrative with live event detail once backend integrations are complete.
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-slate-200 shadow-[0_40px_120px_-40px_rgba(15,118,110,0.4)]',
        'backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_30px_80px_-40px_rgba(154,230,180,0.65)]',
        'animate-in fade-in slide-in-from-bottom-2',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100',
          'bg-gradient-to-br',
          accent,
        )}
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Placeholder</div>
            <h3 className="mt-2 text-lg font-semibold text-white/90">{title}</h3>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.10] text-white/70">
            {type === 'chart' && <BarChart3 className="h-5 w-5" />}
            {type === 'stats' && <Activity className="h-5 w-5" />}
            {type === 'list' && <ClipboardList className="h-5 w-5" />}
            {type === 'calendar' && <Calendar className="h-5 w-5" />}
            {type === 'kpi' && <PieChart className="h-5 w-5" />}
            {type === 'timeline' && <LineChart className="h-5 w-5" />}
          </div>
        </div>
        <p className="text-sm text-slate-300/85">{description}</p>
        {children}
        {renderVisual()}
        <div className="text-xs font-medium uppercase tracking-[0.28em] text-white/40">
          {/* TODO: Replace this placeholder block with the live component once data is connected. */}
          Developer TODO: Swap placeholder with production widget.
        </div>
        {note && <p className="text-xs text-slate-400">{note}</p>}
      </div>
    </div>
  );
};