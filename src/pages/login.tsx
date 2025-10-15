import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('technician');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const returnUrl = (router.query.returnUrl as string) || '/';
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLoginSuccess = () => {
    const returnUrl = (router.query.returnUrl as string) || '/';
    router.push(returnUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - App information */}
        <div className="space-y-6 text-center lg:text-left">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              CattleSync Pro
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Professional cattle management and synchronization system
            </p>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                🐄 Cattle Management
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                💉 AI Synchronization
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                📊 Analytics & Reports
              </Badge>
            </div>
          </div>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-500" />
                <span>Role-Based Access</span>
              </CardTitle>
              <CardDescription>
                Different roles have specialized interfaces and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-red-700">👑 Admin</div>
                  <div className="text-gray-600">System management & monitoring</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-blue-700">📊 Manager</div>
                  <div className="text-gray-600">Farm operations & staff coordination</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-green-700">🩺 Doctor</div>
                  <div className="text-gray-600">Medical care & health monitoring</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-purple-700">🔬 Technician</div>
                  <div className="text-gray-600">AI procedures & synchronization</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-yellow-700">👷 Helper</div>
                  <div className="text-gray-600">Daily care & maintenance</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-gray-700">🏢 Office</div>
                  <div className="text-gray-600">Administration & communication</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo credentials alert */}
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Demo System:</strong> Use any email with password "demo123" to test different role interfaces.
              <br />
              <small className="text-amber-700">
                Examples: admin@farm.com, manager@farm.com, doctor@farm.com, etc.
              </small>
            </AlertDescription>
          </Alert>
        </div>

        {/* Right side - Login form */}
        <div className="flex justify-center">
          <LoginForm
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            onSuccess={handleLoginSuccess}
            className="w-full max-w-md"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;