import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { TechnicianDashboard } from './TechnicianDashboard';
import { HelperDashboard } from './HelperDashboard';
import { OfficeDashboard } from './OfficeDashboard';
import { UserRole } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DashboardRouterProps {
  className?: string;
}

export const DashboardRouter: React.FC<DashboardRouterProps> = ({ className }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
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

  // Route to appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role as UserRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'technician':
        return <TechnicianDashboard />;
      case 'helper':
        return <HelperDashboard />;
      case 'office':
        return <OfficeDashboard />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Unknown user role: {user.role}. Please contact your administrator.
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderDashboard()}
    </div>
  );
};

export default DashboardRouter;