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
    <div className={cn('auth-shell', className)}>
      <div className="auth-shell__layers">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsla(158,70%,60%,0.2)_0%,_hsla(210,70%,18%,0.55)_55%,_hsla(215,45%,6%,0.95)_90%)]" />
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="absolute -right-24 bottom-[-6rem] h-[28rem] w-[28rem] rounded-full bg-sky-400/15 blur-[128px]" />
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
