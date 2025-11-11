
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, KeyRound, Shield } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GetServerSideProps } from 'next';

const PASSWORD_GUARDRAILS = [
  'Minimum of 8 characters',
  'Include at least one number',
  'Combine uppercase and lowercase letters',
  'Incorporate a special symbol to strengthen security',
];

interface ResetPasswordProps {
  token?: string;
}

const ResetPasswordPage: React.FC<ResetPasswordProps> = ({ token }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const guardrailChecks = useMemo(() => {
    return PASSWORD_GUARDRAILS.map((rule) => ({
      label: rule,
      met: password.length >= 8 &&
        (rule.includes('number') ? /\d/.test(password) : true) &&
        (rule.includes('uppercase') ? /[A-Z]/.test(password) : true) &&
        (rule.includes('lowercase') ? /[a-z]/.test(password) : true) &&
        (rule.includes('special') ? /[^A-Za-z0-9]/.test(password) : true),
    }));
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (res.ok) {
        setMessage('Password reset successfully! Redirecting to login…');
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    return null;
  }

  return (
    <AuthLayout
      intro={(
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/40 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
              <Shield className="h-4 w-4" /> Credential hardening
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Securely configure your new passphrase
              </h1>
              <p className="max-w-2xl text-base text-slate-300/90">
                A strong password defends your Herd Rhythm command surface against unauthorized access. Follow the guardrails to create a resilient credential.
              </p>
            </div>
    </div>

          <Card className="border border-white/10 bg-white/[0.04] text-slate-200 backdrop-blur">
            <CardContent className="space-y-3 px-6 py-6 text-sm text-slate-300/80">
              <p>
                • Keep this browser open while you complete the reset. Closing the window will invalidate the request.
              </p>
              <p>
                • If you did not request this change, contact security immediately at
                <Link href="mailto:security@herdrhythm.io" className="ml-1 text-emerald-200 underline underline-offset-4">security@herdrhythm.io</Link>.
              </p>
              <p>
                • Password updates propagate instantly across all Herd Rhythm services.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    >
      <div className="mx-auto w-full max-w-md space-y-6">
        <Card className="border border-white/10 bg-white/[0.06] shadow-[0_34px_120px_-40px_rgba(99,102,241,0.4)] backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <KeyRound className="h-5 w-5 text-sky-300" /> Reset password
            </CardTitle>
            <CardDescription className="text-sm text-slate-300/80">
              Enter and confirm your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 border-white/10 bg-white/[0.08] text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">
                  Confirm new password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 border-white/10 bg-white/[0.08] text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-400">Security guardrails</p>
                <ul className="space-y-2 text-sm text-slate-300/80">
                  {guardrailChecks.map((item) => (
                    <li key={item.label} className="flex items-center gap-2">
                      <CheckCircle2
                        className={`${item.met ? 'text-emerald-300' : 'text-slate-500'} h-4 w-4`}
                      />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <Alert variant="destructive" className="border border-rose-400/50 bg-rose-500/20 text-rose-100">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="border border-emerald-400/40 bg-emerald-500/15 text-emerald-100">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="h-12 w-full rounded-full border border-sky-300/50 bg-sky-500/70 text-white transition hover:bg-sky-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Applying new credentials…' : 'Reset password'}
                </Button>
                <Link href="/login" passHref legacyBehavior>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 w-full rounded-full border border-white/10 bg-white/[0.05] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    Return to login
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs uppercase tracking-[0.28em] text-slate-400">
          Questions? <Link href="mailto:security@herdrhythm.io" className="text-emerald-200 underline underline-offset-4">Reach security operations</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const token = typeof query.token === 'string' ? query.token : undefined;

  // If no token, redirect to login
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      token,
    },
  };
};

export default ResetPasswordPage;
