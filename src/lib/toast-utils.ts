import { UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

const DEFAULT_DURATION = 5000;

export const showLoginSuccess = (userName: string) => {
  toast({
    title: 'Login Successful',
    description: `Welcome back, ${userName}!`,
    variant: 'default',
    duration: DEFAULT_DURATION,
    className: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
  });
};

export const showLoginError = (message: string) => {
  toast({
    title: 'Login Failed',
    description: message,
    variant: 'destructive',
    duration: DEFAULT_DURATION,
  });
};

export const showLogoutSuccess = () => {
  toast({
    title: 'Logout Successful',
    description: 'You have been securely logged out.',
    variant: 'default',
    duration: DEFAULT_DURATION,
    className: 'border-slate-400/40 bg-slate-500/10 text-slate-100',
  });
};