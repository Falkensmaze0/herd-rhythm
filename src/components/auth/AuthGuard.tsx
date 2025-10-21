import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: { resource: string; action: string };
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-2/3 mx-auto" />
      </div>
    </div>
  </div>
);

const UnauthorizedScreen: React.FC<{ requiredRole?: UserRole; user?: any }> = ({ 
  requiredRole, 
  user 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Access Denied</AlertTitle>
        <AlertDescription className="text-red-700 mt-2">
          {requiredRole ? (
            <>You need {requiredRole} role access to view this page.</>
          ) : (
            <>You don't have permission to access this resource.</>
          )}
          {user && (
            <div className="mt-2 text-sm">
              Current role: <span className="font-semibold">{user.role}</span>
            </div>
          )}
        </AlertDescription>
      </Alert>
      <div className="mt-6 text-center">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mr-2"
        >
          Go Back
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  </div>
);

const LoginRequiredScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <Alert className="border-blue-200 bg-blue-50">
        <Lock className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Authentication Required</AlertTitle>
        <AlertDescription className="text-blue-700 mt-2">
          You need to be logged in to access this page.
        </AlertDescription>
      </Alert>
      <div className="mt-6 text-center">
        <Button
          onClick={() => window.location.href = '/login'}
          className="w-full"
        >
          Sign In
        </Button>
      </div>
    </div>
  </div>
);

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  requireAuth = true,
  fallback
}) => {
  const { user, isLoading, isAuthenticated, hasPermission } = useAuth();

  // Show loading screen while authentication is being initialized
  if (isLoading) {
    return fallback || <LoadingScreen />;
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return fallback || <LoginRequiredScreen />;
  }

  // Check role requirement
  if (requiredRole && user && user.role !== requiredRole) {
    // Special case: admin can access everything
    if (user.role !== 'admin') {
      return fallback || <UnauthorizedScreen requiredRole={requiredRole} user={user} />;
    }
  }

  // Check permission requirement
  if (requiredPermission && user) {
    const { resource, action } = requiredPermission;
    if (!hasPermission(resource, action)) {
      return fallback || <UnauthorizedScreen user={user} />;
    }
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

// Higher-order component for easier usage
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardProps?: Omit<AuthGuardProps, 'children'>
) => {
  return (props: P) => (
    <AuthGuard {...guardProps}>
      <Component {...props} />
    </AuthGuard>
  );
};

// Utility components for specific roles
export const AdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <AuthGuard requiredRole="admin" fallback={fallback}>
    {children}
  </AuthGuard>
);

export const ManagerGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <AuthGuard requiredRole="manager" fallback={fallback}>
    {children}
  </AuthGuard>
);

export const DoctorGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <AuthGuard requiredRole="doctor" fallback={fallback}>
    {children}
  </AuthGuard>
);

export const TechnicianGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <AuthGuard requiredRole="technician" fallback={fallback}>
    {children}
  </AuthGuard>
);

export const PermissionGuard: React.FC<{
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
}> = ({ children, resource, action, fallback }) => (
  <AuthGuard requiredPermission={{ resource, action }} fallback={fallback}>
    {children}
  </AuthGuard>
);