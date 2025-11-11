import React from 'react';

import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  intro: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  intro,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12)_0%,_rgba(12,74,110,0.28)_45%,_rgba(15,23,42,1)_90%)]" />
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -right-24 bottom-[-6rem] h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-[128px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      <div className="relative z-10 w-full px-6 py-16 md:px-10">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-12 lg:grid-cols-[1.15fr_minmax(0,0.9fr)]">
          <div className="space-y-8">
            {intro}
          </div>
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;