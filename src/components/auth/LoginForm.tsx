import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, Eye, EyeOff, LayoutGrid, Loader2, Lock, Mail, Sparkles } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
  twoFactorCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, className, }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Use auth context loading state to avoid local/prop collisions
  const { login, isLoading: authIsLoading } = useAuth();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      twoFactorCode: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      const payload: LoginCredentials = {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        twoFactorCode: data.twoFactorCode,
      };

      await login(payload);
      // Don't call onSuccess since we're doing direct navigation
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === 'Two-factor authentication required') {
        setRequireTwoFactor(true);
      } else {
        setLoginError(error.message || 'Login failed. Please try again.');
      }
    }
  };



  return (
    <div className={cn('w-full', className)}>
      <div className="space-y-8 rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-slate-200 shadow-[0_28px_120px_-40px_rgba(16,185,129,0.6)] backdrop-blur-xl">
        <header className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/40 bg-emerald-500/20">
            <LayoutGrid className="h-5 w-5 text-emerald-200" />
          </div>
          <div className="space-y-2">
            <Badge
              className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.7rem] uppercase tracking-[0.32em] text-emerald-200"
            >
              Secure login surface
            </Badge>
            <h2 className="text-2xl font-semibold text-white">Authenticate to Herd Rhythm</h2>
            <p className="text-sm text-slate-300/80">
              Log in using your role-aligned credentials. Multifactor hardening is enabled for privileged roles.
            </p>
          </div>
        </header>

        <div className="space-y-4">
          {/* Roles and user registration are managed in the Admin panel. Login accepts email + password only. */}
          <Alert className="border border-slate-400/40 bg-white/[0.02] text-slate-200">
            <span className="text-sm">Tip: Admin user management (roles/registrations) is available in the Admin panel.</span>
          </Alert>
        </div>

        {loginError && (
          <Alert className="border border-rose-400/40 bg-rose-500/15 text-rose-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-300">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        type="email"
                        placeholder={`you@herdrhythm.io`}
                        className="h-12 rounded-2xl border border-white/15 bg-white/[0.08] pl-11 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400"
                        disabled={authIsLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-300" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-300">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="h-12 rounded-2xl border border-white/15 bg-white/[0.08] pl-11 pr-12 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400"
                        disabled={authIsLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-200"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        disabled={authIsLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-300" />
                </FormItem>
              )}
            />

            {requireTwoFactor && (
              <FormField
                control={form.control}
                name="twoFactorCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-300">
                      Two-factor code
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        className="h-12 rounded-2xl border border-white/15 bg-white/[0.08] text-center font-semibold tracking-[0.4em] text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400"
                        disabled={authIsLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-300" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-white/40 data-[state=checked]:border-emerald-400 data-[state=checked]:bg-emerald-500"
                      disabled={authIsLoading}
                    />
                  </FormControl>
                  <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Remember me on this device
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-12 w-full rounded-full border border-emerald-300/50 bg-emerald-500/80 text-sm font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-emerald-400"
              disabled={authIsLoading}
            >
              {authIsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                `Sign in`
              )}
            </Button>
          </form>
        </Form>

        <footer className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-400">
          <Link href="/forgot-password" className="text-emerald-200 hover:text-emerald-100">
            Forgot password
          </Link>
          <span className="flex items-center gap-2 text-slate-500">
            <Sparkles className="h-4 w-4 text-emerald-300" /> Secure session
          </span>
        </footer>
      </div>
    </div>
  );
};

export default LoginForm;