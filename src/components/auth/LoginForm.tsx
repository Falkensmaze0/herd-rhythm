import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials, UserRole } from '@/types';
import { getRoleConfig, getRoleDisplayName } from '@/config/roleConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
  twoFactorCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  selectedRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onSuccess?: () => void;
  className?: string;
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-500 text-white',
  manager: 'bg-blue-500 text-white',
  doctor: 'bg-green-500 text-white',
  technician: 'bg-purple-500 text-white',
  helper: 'bg-yellow-500 text-black',
  office: 'bg-gray-500 text-white',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Complete system access and configuration',
  manager: 'Farm operations and staff management',
  doctor: 'Medical care and health management',
  technician: 'AI procedures and sync protocols',
  helper: 'Daily care and maintenance tasks',
  office: 'Administrative and communication tasks',
};

export const LoginForm: React.FC<LoginFormProps> = ({
  selectedRole,
  onRoleChange,
  onSuccess,
  className
}) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(selectedRole || 'technician');
  const [showPassword, setShowPassword] = useState(false);
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { login, isLoading } = useAuth();
  const roleConfig = getRoleConfig(currentRole);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      twoFactorCode: '',
    },
  });

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    onRoleChange?.(role);
    setLoginError(null);
    form.reset();
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      // Ensure required fields are present
      const loginData: LoginCredentials = {
        email: data.email!,
        password: data.password!,
        rememberMe: data.rememberMe,
        twoFactorCode: data.twoFactorCode
      };
      await login(loginData);
      onSuccess?.();
    } catch (error: any) {
      if (error.message === 'Two-factor authentication required') {
        setRequireTwoFactor(true);
      } else {
        setLoginError(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const RoleHeader: React.FC<{ role: UserRole }> = ({ role }) => {
    const config = getRoleConfig(role);
    return (
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <Badge className={cn('text-sm', ROLE_COLORS[role])}>
            {getRoleDisplayName(role)}
          </Badge>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-600 mt-1">
            {ROLE_DESCRIPTIONS[role]}
          </p>
        </div>
      </div>
    );
  };

  const RoleSelector: React.FC = () => (
    <Tabs value={currentRole} onValueChange={(value) => handleRoleSelect(value as UserRole)}>
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
        <TabsTrigger value="manager" className="text-xs">Manager</TabsTrigger>
        <TabsTrigger value="doctor" className="text-xs">Doctor</TabsTrigger>
      </TabsList>
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="technician" className="text-xs">Technician</TabsTrigger>
        <TabsTrigger value="helper" className="text-xs">Helper</TabsTrigger>
        <TabsTrigger value="office" className="text-xs">Office</TabsTrigger>
      </TabsList>
    </Tabs>
  );

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-6 pb-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">CattleSync Pro</CardTitle>
            <CardDescription className="text-gray-500">
              Secure farm management system
            </CardDescription>
          </div>
          
          <RoleSelector />
          <RoleHeader role={currentRole} />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder={`Enter your ${currentRole} email`}
                          className="pl-10 h-12 border-gray-200 focus:border-primary"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              
              {/* Two Factor Code (if required) */}
              {requireTwoFactor && (
                <FormField
                  control={form.control}
                  name="twoFactorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Two-Factor Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter 6-digit code"
                          className="h-12 border-gray-200 focus:border-primary text-center font-mono"
                          maxLength={6}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Remember Me */}
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-gray-600 font-normal">
                      Remember me on this device
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  `Sign In as ${getRoleDisplayName(currentRole)}`
                )}
              </Button>
            </form>
          </Form>
          
          {/* Footer Links */}
          <div className="text-center space-y-2">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                // TODO: Implement forgot password
                console.log('Forgot password clicked');
              }}
            >
              Forgot your password?
            </button>
            
            {currentRole === 'admin' && (
              <div className="text-xs text-gray-500 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="inline h-3 w-3 mr-1 text-red-500" />
                <span className="font-medium text-red-700">Admin Access:</span>
                <span className="text-red-600 ml-1">
                  Complete system control and sensitive data access
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;