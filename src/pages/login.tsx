import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Info, LayoutDashboard, Shield, Sparkles, Users } from 'lucide-react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { getRoleDisplayName } from '@/config/roleConfig';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserRole } from '@/types';
import { GetServerSideProps } from 'next';

const ROLE_INSIGHTS: Array<{
  role: UserRole;
  label: string;
  description: string;
  accent: string;
}> = [
  {
    role: 'admin',
    label: 'Mission Control',
    description: 'Secure governance over infrastructure, data, and audits.',
    accent: 'from-rose-400/80 via-rose-500/40 to-rose-500/10',
  },
  {
    role: 'manager',
    label: 'Operational Pulse',
    description: 'Crew allocation, herd throughput, and logistics planning.',
    accent: 'from-sky-400/70 via-sky-500/30 to-sky-500/5',
  },
  {
    role: 'doctor',
    label: 'Precision Care',
    description: 'Clinical intelligence and health telemetry for the herd.',
    accent: 'from-emerald-400/70 via-emerald-500/30 to-emerald-500/5',
  },
  {
    role: 'technician',
    label: 'Protocol Engine',
    description: 'Synchronization sequences, AI workflows, and equipment readiness.',
    accent: 'from-violet-500/70 via-violet-500/30 to-violet-500/5',
  },
  {
    role: 'helper',
    label: 'Daily Rhythm',
    description: 'Task execution, stall hygiene, and wellness checkpoints.',
    accent: 'from-amber-400/70 via-amber-400/20 to-amber-400/5',
  },
  {
    role: 'office',
    label: 'Administrative Flow',
    description: 'Communications, documentation, and compliance coverage.',
    accent: 'from-slate-400/70 via-slate-500/20 to-slate-500/5',
  },
];


interface LoginPageProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  returnUrl?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ isAuthenticated, isLoading, returnUrl }) => {
  // Login no longer requires selecting a role. Roles are assigned via Admin panel.
  const highlightedRole = ROLE_INSIGHTS[1];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center text-slate-200">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-300/80 border-t-transparent"></div>
          <p className="text-sm tracking-[0.28em] uppercase text-slate-400">Calibrating access…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (returnUrl) {
      if (typeof window !== 'undefined') {
        window.location.replace(returnUrl);
      }
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm font-medium tracking-[0.3em] text-slate-400 uppercase">
          Redirecting to your command surface…
        </p>
      </div>
    );
  }

  return (
    <AuthLayout
      intro={(
        <div className="space-y-8">
          <div className="space-y-5">
            <Badge className="border border-white/10 bg-white/10 text-[0.7rem] tracking-[0.3em] text-emerald-200">
              Unified herd operations
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Herd Rhythm Access Portal
              </h1>
              <p className="max-w-2xl text-base text-slate-300/90 sm:text-lg">
                Authenticate to unlock the Herd Rhythm admin command experience—real-time analytics, workforce orchestration, and protocol intelligence woven together for decisive action.
              </p>
            </div>
          </div>

          {highlightedRole && (
            <Card className="border border-white/10 bg-white/[0.05] text-slate-100 backdrop-blur-xl">
              <CardContent className="flex flex-col gap-3 px-6 py-6">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-200/90">
                  <Sparkles className="h-4 w-4" />
                  Current role focus
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {getRoleDisplayName(highlightedRole.role)}
                  </h2>
                  <p className="text-sm text-slate-300/80">{highlightedRole.description}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ROLE_INSIGHTS.map((role) => (
              <div
                key={role.role}
                className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.04] p-5 backdrop-blur transition hover:border-white/10 hover:bg-white/[0.07]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${role.accent} opacity-0 transition-opacity duration-500 hover:opacity-100`} />
                <div className="relative z-10 space-y-2">
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    {role.label}
                  </div>
                  <p className="text-sm text-slate-300/90">{role.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Alert className="border border-emerald-300/40 bg-emerald-500/10 text-emerald-100 backdrop-blur">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm text-emerald-100/90">
              <strong className="font-semibold">Demo credentials:</strong> enter any role-based email with password
              <span className="mx-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.28em]">
                demo123
              </span>
              to explore the tailored interfaces.
            </AlertDescription>
          </Alert>
        </div>
      )}
    >
      <div className="mx-auto w-full max-w-md space-y-6">
        <Card className="border border-white/10 bg-white/[0.06] shadow-[0_34px_120px_-40px_rgba(16,185,129,0.45)] backdrop-blur-xl">
          <CardContent className="px-6 py-8">
            <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-400">
              <span className="flex items-center gap-2 text-slate-300/80">
                <LayoutDashboard className="h-4 w-4 text-emerald-300" /> Sign in to synchronize
              </span>
              <span className="flex items-center gap-2 text-slate-300/60">
                <Shield className="h-4 w-4 text-emerald-200/80" /> Secure access
              </span>
            </div>

            <LoginForm />
          </CardContent>
        </Card>

        <Card className="border border-white/5 bg-white/[0.03] text-slate-200 backdrop-blur">
          <CardContent className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
            <div className="flex items-center gap-3 text-slate-300/80">
              <Users className="h-5 w-5 text-emerald-300" />
              <span>Need help onboarding your team?</span>
            </div>
            <Link
              href="/forgot-password"
              className="rounded-full border border-emerald-300/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200 transition hover:border-emerald-200 hover:bg-emerald-500/20"
            >
              Reset access
            </Link>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, query } = context;
  const sessionToken = context.req.cookies.sessionToken;
  let returnUrl = query.returnUrl ? String(query.returnUrl) : '/';

  if (sessionToken) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/session`, {
        method: 'GET',
        headers: {
          'Cookie': `sessionToken=${sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          return {
            redirect: {
              destination: returnUrl,
              permanent: false,
            },
          };
        }
      }
    } catch (error) {
      console.error('Session validation error:', error);
    }
  }

  return {
    props: {
      isAuthenticated: false,
      isLoading: false,
      returnUrl,
    },
  };
};

export default LoginPage;