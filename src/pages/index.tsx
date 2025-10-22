import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardRouter } from '@/components/dashboards/DashboardRouter';
const Index = () => {
  const { isAuthenticated } = useAuth();

  // Unified dashboard view for "/" route
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardRouter />
    </AuthGuard>
  );
};

export default Index;

