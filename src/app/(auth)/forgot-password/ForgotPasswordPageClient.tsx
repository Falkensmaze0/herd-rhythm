'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage('If an account with that email exists, a password reset link has been sent.');
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

  return (
    <AuthLayout
      intro={(
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
              <ShieldCheck className="h-4 w-4" /> Secure recovery
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Regain access to your command surface
              </h1>
              <p className="max-w-2xl text-base text-slate-300/90">
                Enter the email associated with your Herd Rhythm account. We will dispatch a secure reset link to help you restore access swiftly.
              </p>
            </div>
    </div>

          <Card className="border border-white/10 bg-white/[0.04] text-slate-200 backdrop-blur">
            <CardContent className="space-y-3 px-6 py-6 text-sm text-slate-300/80">
              <p>
                • Reset links stay active for 20 minutes. For security, links can only be used once.
              </p>
              <p>
                • If your team uses single sign-on, contact your administrator for assistance.
              </p>
              <p>
                • Need a new account? Ask your admin to provision access in the Admin Command Center.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    >
      <div className="mx-auto w-full max-w-md">
        <Card className="border border-white/10 bg-white/[0.06] shadow-[0_34px_120px_-40px_rgba(56,189,248,0.35)] backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Mail className="h-5 w-5 text-emerald-300" /> Forgot password
            </CardTitle>
            <CardDescription className="text-sm text-slate-300/80">
              We will send a recovery link to the email you specify below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@organization.com"
                  className="h-12 border-white/10 bg-white/[0.08] text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400"
                />
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
                  className="h-12 w-full rounded-full border border-emerald-300/50 bg-emerald-500/70 text-white transition hover:bg-emerald-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Dispatching reset link…' : 'Send reset link'}
                </Button>
                <Link href="/login" passHref legacyBehavior>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 w-full rounded-full border border-white/10 bg-white/[0.05] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    Back to login
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs uppercase tracking-[0.28em] text-slate-400">
          Prefer live assistance? <Link href="mailto:support@herdrhythm.io" className="text-emerald-200 underline underline-offset-4">Contact support</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
