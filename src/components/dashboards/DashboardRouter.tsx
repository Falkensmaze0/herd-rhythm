
import React, { Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import dashboard components with error boundary
const AdminDashboard = lazy(() => 
  import('./AdminDashboard').then(module => ({ default: module.AdminDashboard }))
);
const ManagerDashboard = lazy(() => 
  import('./ManagerDashboard').then(module => ({ default: module.ManagerDashboard }))
);
const DoctorDashboard = lazy(() => 
  import('./DoctorDashboard').then(module => ({ default: module.DoctorDashboard }))
);
const TechnicianDashboard = lazy(() => 
  import('./TechnicianDashboard').then(module => ({ default: module.TechnicianDashboard }))
);
const HelperDashboard = lazy(() => 
  import('./HelperDashboard').then(module => ({ default: module.HelperDashboard }))
);
const OfficeDashboard = lazy(() => 
  import('./OfficeDashboard').then(module => ({ default: module.OfficeDashboard }))
);
import { UserRole } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-8 w-32" />
    </div>

    {/* Stats/KPI Row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={`stat-${i}`} className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </Card>
      ))}
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={`content-${i}`} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Side Cards */}
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Card key={`side-${i}`} className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="max-w-md mx-auto mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div>There was an error loading the dashboard. Please try refreshing the page.</div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-2 text-xs text-red-600 overflow-auto max-h-32">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface DashboardRouterProps {
  className?: string;
}

export const DashboardRouter: React.FC<DashboardRouterProps> = ({ className }) => {
  const { user, isLoading } = useAuth();
  
  console.log('DashboardRouter: User state:', { user, isLoading });

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role with Suspense
  const renderDashboard = () => {
    const role = user?.role as UserRole;
    let DashboardComponent;

    try {
      switch (role) {
        case 'admin':
          DashboardComponent = AdminDashboard;
          break;
        case 'manager':
          DashboardComponent = ManagerDashboard;
          break;
        case 'doctor':
          DashboardComponent = DoctorDashboard;
          break;
        case 'technician':
          DashboardComponent = TechnicianDashboard;
          break;
        case 'helper':
          DashboardComponent = HelperDashboard;
          break;
        case 'office':
          DashboardComponent = OfficeDashboard;
          break;
        default:
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Alert className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Unknown user role: {role}. Please contact your administrator.
                </AlertDescription>
              </Alert>
            </div>
          );
      }

      return (
        <ErrorBoundary>
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardComponent />
          </Suspense>
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('Dashboard loading error:', error);
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              An error occurred loading the dashboard. Please try refreshing the page.
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs text-red-600">{String(error)}</div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  };

  return (
    <div className={className} suppressHydrationWarning>
      {typeof window === 'undefined' ? <DashboardSkeleton /> : renderDashboard()}
    </div>
  );
};

// Removed default export: use named import { DashboardRouter } as everywhere in the project.
