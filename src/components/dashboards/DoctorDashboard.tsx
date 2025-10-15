import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Activity, 
  AlertTriangle, 
  Calendar, 
  Heart, 
  Pill, 
  Stethoscope, 
  Syringe, 
  Thermometer, 
  TrendingUp, 
  TrendingDown,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface HealthStatsProps {
  stats: {
    healthyCows: number;
    sickCows: number;
    underTreatment: number;
    vaccinated: number;
    pregnancyRate: number;
    mortalityRate: number;
    treatmentSuccessRate: number;
    totalCows: number;
  };
}

const HealthOverviewCard: React.FC<HealthStatsProps> = ({ stats }) => {
  const healthPercentage = (stats.healthyCows / stats.totalCows) * 100;
  const pregnancyPercentage = stats.pregnancyRate;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span>Herd Health Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.healthyCows}</div>
            <div className="text-sm text-gray-500">Healthy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.sickCows}</div>
            <div className="text-sm text-gray-500">Sick</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.underTreatment}</div>
            <div className="text-sm text-gray-500">Treatment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.vaccinated}</div>
            <div className="text-sm text-gray-500">Vaccinated</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Health Status</span>
              <span className="text-sm font-bold">{healthPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={healthPercentage} className="h-3" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Pregnancy Rate</span>
              <span className="text-sm font-bold">{pregnancyPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={pregnancyPercentage} className="h-3" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Treatment Success:</span>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{stats.treatmentSuccessRate}%</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mortality Rate:</span>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{stats.mortalityRate}%</span>
                <TrendingDown className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface HealthAlertsProps {
  alerts: {
    id: string;
    cowId: string;
    cowName: string;
    severity: 'critical' | 'urgent' | 'moderate';
    condition: string;
    symptoms: string;
    duration: number; // hours
    lastUpdated: string;
  }[];
}

const HealthAlertsCard: React.FC<HealthAlertsProps> = ({ alerts }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'urgent': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'moderate': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Health Alerts</span>
          </div>
          {alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No health alerts</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <AlertTitle className="text-sm font-semibold">
                        {alert.cowName} - {alert.condition}
                      </AlertTitle>
                      <AlertDescription className="text-xs mt-1">
                        {alert.symptoms}
                      </AlertDescription>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span>Duration: {alert.duration}h</span>
                        <span>•</span>
                        <span>Updated: {format(new Date(alert.lastUpdated), 'HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Examine
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface TreatmentScheduleProps {
  treatments: {
    id: string;
    cowId: string;
    cowName: string;
    treatment: string;
    medication: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    nextDose: string;
    status: 'active' | 'completed' | 'missed' | 'scheduled';
  }[];
}

const TreatmentScheduleCard: React.FC<TreatmentScheduleProps> = ({ treatments }) => {
  const todayTreatments = treatments.filter(t => 
    format(new Date(t.nextDose), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Syringe className="h-5 w-5 text-blue-500" />
            <span>Today's Treatment Schedule</span>
          </div>
          <Badge variant="secondary">{todayTreatments.length} treatments</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayTreatments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <p>No treatments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTreatments.map((treatment) => (
              <div key={treatment.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Pill className="h-4 w-4 text-purple-500" />
                    <span className="font-semibold text-sm">{treatment.cowName}</span>
                    <Badge className={getStatusColor(treatment.status)}>
                      {treatment.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(treatment.nextDose), 'HH:mm')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Treatment:</span>
                    <div className="font-medium">{treatment.treatment}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Medication:</span>
                    <div className="font-medium">{treatment.medication}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Dosage:</span>
                    <div className="font-medium">{treatment.dosage}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <div className="font-medium">{treatment.frequency}</div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Record
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Reschedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface RecentCasesProps {
  cases: {
    id: string;
    cowId: string;
    cowName: string;
    condition: string;
    diagnosis: string;
    treatment: string;
    status: 'active' | 'recovered' | 'monitoring';
    lastVisit: string;
    nextVisit?: string;
  }[];
}

const RecentCasesCard: React.FC<RecentCasesProps> = ({ cases }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600';
      case 'recovered': return 'text-green-600';
      case 'monitoring': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Stethoscope className="h-5 w-5 text-green-500" />
          <span>Recent Medical Cases</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cow</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Next Visit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((case_) => (
                <TableRow key={case_.id}>
                  <TableCell className="font-medium">{case_.cowName}</TableCell>
                  <TableCell className="text-sm">{case_.condition}</TableCell>
                  <TableCell className="text-sm">{case_.treatment}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(case_.status)}>
                      {case_.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(case_.lastVisit), 'MMM dd')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {case_.nextVisit ? format(new Date(case_.nextVisit), 'MMM dd') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        Update
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [healthStats, setHealthStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setHealthStats({
        healthyCows: 142,
        sickCows: 5,
        underTreatment: 8,
        vaccinated: 138,
        pregnancyRate: 85.2,
        mortalityRate: 1.2,
        treatmentSuccessRate: 94.5,
        totalCows: 150
      });

      setAlerts([
        {
          id: '1',
          cowId: 'COW001',
          cowName: 'Bella',
          severity: 'critical',
          condition: 'Mastitis',
          symptoms: 'Swollen udder, elevated temperature, reduced milk production',
          duration: 12,
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          cowId: 'COW045',
          cowName: 'Daisy',
          severity: 'urgent',
          condition: 'Lameness',
          symptoms: 'Favoring left hind leg, reluctant to move',
          duration: 6,
          lastUpdated: new Date().toISOString()
        }
      ]);

      setTreatments([
        {
          id: '1',
          cowId: 'COW001',
          cowName: 'Bella',
          treatment: 'Antibiotic Therapy',
          medication: 'Ceftiofur',
          dosage: '2ml IM',
          frequency: 'BID',
          startDate: new Date().toISOString(),
          endDate: addDays(new Date(), 5).toISOString(),
          nextDose: new Date().toISOString(),
          status: 'active'
        },
        {
          id: '2',
          cowId: 'COW023',
          cowName: 'Luna',
          treatment: 'Vitamin Supplement',
          medication: 'Vitamin B Complex',
          dosage: '10ml IM',
          frequency: 'Daily',
          startDate: new Date().toISOString(),
          endDate: addDays(new Date(), 7).toISOString(),
          nextDose: new Date().toISOString(),
          status: 'scheduled'
        }
      ]);

      setRecentCases([
        {
          id: '1',
          cowId: 'COW001',
          cowName: 'Bella',
          condition: 'Mastitis',
          diagnosis: 'Clinical mastitis - E.coli',
          treatment: 'Antibiotic therapy + supportive care',
          status: 'active',
          lastVisit: new Date().toISOString(),
          nextVisit: addDays(new Date(), 2).toISOString()
        },
        {
          id: '2',
          cowId: 'COW012',
          cowName: 'Rose',
          condition: 'Pregnancy Check',
          diagnosis: 'Pregnant - 45 days',
          treatment: 'Routine monitoring',
          status: 'monitoring',
          lastVisit: addDays(new Date(), -7).toISOString(),
          nextVisit: addDays(new Date(), 23).toISOString()
        }
      ]);
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
            New Treatment
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Stethoscope className="h-4 w-4 mr-2" />
            Health Check
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Syringe className="h-4 w-4 mr-2" />
            Vaccination
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Medical Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading || !healthStats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Medical Dashboard</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Medical Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Good morning, Dr. {user?.name}. Here's your herd health overview.
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          All Systems Normal
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Health Overview - Spans 2 columns */}
        <div className="lg:col-span-2">
          <HealthOverviewCard stats={healthStats} />
        </div>

        {/* Health Alerts */}
        <HealthAlertsCard alerts={alerts} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Treatment Schedule - Spans 2 columns */}
        <div className="lg:col-span-2">
          <TreatmentScheduleCard treatments={treatments} />
        </div>

        {/* Recent Cases - Full width */}
        <div className="lg:col-span-4">
          <RecentCasesCard cases={recentCases} />
        </div>
      </div>
    </div>
  );
};