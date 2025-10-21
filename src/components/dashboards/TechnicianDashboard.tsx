import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Activity, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FlaskConical, 
  Microscope, 
  Plus, 
  Settings, 
  Target, 
  TestTube, 
  TrendingUp, 
  Wrench,
  AlertCircle,
  FileText,
  Zap
} from 'lucide-react';
import { format, addDays, addHours } from 'date-fns';

interface BreedingStatsProps {
  stats: {
    pendingAI: number;
    completedAI: number;
    successRate: number;
    pregnancyConfirmed: number;
    equipmentStatus: 'operational' | 'maintenance' | 'repair';
    monthlyTarget: number;
    currentMonthAI: number;
    avgConceptionRate: number;
  };
}

const BreedingStatsCard: React.FC<BreedingStatsProps> = ({ stats }) => {
  const completionRate = (stats.currentMonthAI / stats.monthlyTarget) * 100;
  
  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'repair': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5 text-blue-500" />
          <span>Breeding Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingAI}</div>
            <div className="text-sm text-gray-500">Pending AI</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedAI}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <span className="text-2xl font-bold text-purple-600">{stats.successRate}%</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.pregnancyConfirmed}</div>
            <div className="text-sm text-gray-500">Confirmed</div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Monthly Progress</span>
              <span className="text-sm">{stats.currentMonthAI}/{stats.monthlyTarget}</span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <div className="text-xs text-gray-500 mt-1">
              {completionRate.toFixed(1)}% of monthly target
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Equipment Status</span>
            <Badge className={getEquipmentStatusColor(stats.equipmentStatus)}>
              {stats.equipmentStatus}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Avg. Conception Rate</span>
            <span className="font-semibold">{stats.avgConceptionRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SyncCalendarProps {
  events: {
    id: string;
    cowId: string;
    cowName: string;
    protocol: string;
    step: string;
    scheduledTime: string;
    duration: number; // minutes
    status: 'pending' | 'in-progress' | 'completed' | 'missed';
    notes?: string;
  }[];
}

const SyncCalendarCard: React.FC<SyncCalendarProps> = ({ events }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const todayEvents = events.filter(event => 
    format(new Date(event.scheduledTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  ).sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span>Sync Schedule</span>
          </div>
          <Badge variant="secondary">
            {format(selectedDate, 'MMM dd, yyyy')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todayEvents.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p>No procedures scheduled for today</p>
            </div>
          ) : (
            todayEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FlaskConical className="h-4 w-4 text-purple-500" />
                    <span className="font-semibold text-sm">{event.cowName}</span>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {format(new Date(event.scheduledTime), 'HH:mm')}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-gray-600">Protocol:</span>
                    <div className="font-medium">{event.protocol}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Step:</span>
                    <div className="font-medium">{event.step}</div>
                  </div>
                </div>
                
                {event.notes && (
                  <div className="text-xs text-gray-600 mb-2 p-2 bg-gray-50 rounded">
                    <strong>Notes:</strong> {event.notes}
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  {event.status === 'pending' && (
                    <Button size="sm" className="h-6 text-xs">
                      Start Procedure
                    </Button>
                  )}
                  {event.status === 'in-progress' && (
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      Complete
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface AIProceduresProps {
  procedures: {
    id: string;
    cowId: string;
    cowName: string;
    breed: string;
    lastAI?: string;
    protocol: string;
    currentStep: string;
    expectedHeat: string;
    aiTiming: string;
    sireId: string;
    sireName: string;
    technician: string;
    notes: string;
    status: 'scheduled' | 'ready' | 'completed' | 'failed';
  }[];
}

const AIProceduresCard: React.FC<AIProceduresProps> = ({ procedures }) => {
  const todayProcedures = procedures.filter(proc => 
    format(new Date(proc.aiTiming), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ready': return <Target className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Microscope className="h-5 w-5 text-green-500" />
          <span>Today's AI Procedures</span>
          <Badge variant="secondary">{todayProcedures.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayProcedures.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <TestTube className="h-8 w-8 mx-auto mb-2" />
            <p>No AI procedures scheduled for today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cow</TableHead>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Timing</TableHead>
                  <TableHead>Sire</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayProcedures.map((proc) => (
                  <TableRow key={proc.id}>
                    <TableCell>
                      <div className="font-medium">{proc.cowName}</div>
                      <div className="text-xs text-gray-500">{proc.breed}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{proc.protocol}</div>
                      <div className="text-xs text-gray-500">{proc.currentStep}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(proc.aiTiming), 'HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{proc.sireName}</div>
                      <div className="text-xs text-gray-500">{proc.sireId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(proc.status)}
                        <span className="text-sm capitalize">{proc.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {proc.status === 'ready' && (
                          <Button size="sm" className="h-6 text-xs">
                            Perform AI
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SuccessRatesProps {
  data: {
    successful: number;
    pending: number;
    failed: number;
    total: number;
  };
}

const SuccessRatesCard: React.FC<SuccessRatesProps> = ({ data }) => {
  const successRate = (data.successful / data.total) * 100;
  const pendingRate = (data.pending / data.total) * 100;
  const failureRate = (data.failed / data.total) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-green-500" />
          <span>Success Rates</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Overall Success Rate</div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Successful</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{data.successful}</div>
                <div className="text-xs text-gray-500">{successRate.toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Pending</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{data.pending}</div>
                <div className="text-xs text-gray-500">{pendingRate.toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Failed</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{data.failed}</div>
                <div className="text-xs text-gray-500">{failureRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="text-sm font-medium text-gray-700">
              Total Procedures: {data.total}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const [breedingStats, setBreedingStats] = useState<any>(null);
  const [syncEvents, setSyncEvents] = useState<any[]>([]);
  const [aiProcedures, setAiProcedures] = useState<any[]>([]);
  const [successRates, setSuccessRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setBreedingStats({
        pendingAI: 12,
        completedAI: 45,
        successRate: 87.5,
        pregnancyConfirmed: 38,
        equipmentStatus: 'operational',
        monthlyTarget: 60,
        currentMonthAI: 45,
        avgConceptionRate: 85.2
      });

      setSyncEvents([
        {
          id: '1',
          cowId: 'COW001',
          cowName: 'Bella',
          protocol: 'Ovsynch',
          step: 'GnRH Injection',
          scheduledTime: new Date().toISOString(),
          duration: 15,
          status: 'pending',
          notes: 'First GnRH of Ovsynch protocol'
        },
        {
          id: '2',
          cowId: 'COW023',
          cowName: 'Luna',
          protocol: 'CIDR',
          step: 'CIDR Insert',
          scheduledTime: addHours(new Date(), 2).toISOString(),
          duration: 10,
          status: 'pending'
        }
      ]);

      setAiProcedures([
        {
          id: '1',
          cowId: 'COW045',
          cowName: 'Daisy',
          breed: 'Holstein',
          protocol: 'Ovsynch',
          currentStep: 'AI Ready',
          expectedHeat: new Date().toISOString(),
          aiTiming: addHours(new Date(), 1).toISOString(),
          sireId: 'SIRE001',
          sireName: 'Champion Bull',
          technician: user?.name || 'Current User',
          notes: 'Good heat signs observed',
          status: 'ready'
        },
        {
          id: '2',
          cowId: 'COW067',
          cowName: 'Rose',
          breed: 'Jersey',
          protocol: 'CIDR',
          currentStep: 'Pre-AI',
          expectedHeat: addHours(new Date(), 4).toISOString(),
          aiTiming: addHours(new Date(), 6).toISOString(),
          sireId: 'SIRE002',
          sireName: 'Elite Sire',
          technician: user?.name || 'Current User',
          notes: 'CIDR removed yesterday',
          status: 'scheduled'
        }
      ]);

      setSuccessRates({
        successful: 38,
        pending: 15,
        failed: 7,
        total: 60
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const QuickActions: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button variant="default" className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Record AI
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Wrench className="h-4 w-4 mr-2" />
            Equipment Check
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Update Protocol
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Breeding Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading || !breedingStats || !successRates) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Technician Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Technician Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Hello, {user?.name}. Ready for today's breeding procedures?
          </p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Equipment Operational
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Breeding Stats - Spans 2 columns */}
        <div className="lg:col-span-2">
          <BreedingStatsCard stats={breedingStats} />
        </div>

        {/* Success Rates */}
        <SuccessRatesCard data={successRates} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Sync Calendar - Spans 2 columns */}
        <div className="lg:col-span-2">
          <SyncCalendarCard events={syncEvents} />
        </div>

        {/* AI Procedures - Full width */}
        <div className="lg:col-span-4">
          <AIProceduresCard procedures={aiProcedures} />
        </div>
      </div>
    </div>
  );
};