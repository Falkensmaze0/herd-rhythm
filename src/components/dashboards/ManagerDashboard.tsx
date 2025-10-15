import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clipboard, 
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Plus,
  FileText,
  Settings
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface FarmStatsProps {
  stats: {
    totalCows: number;
    activeTasks: number;
    staffOnDuty: number;
    dailyProduction: number;
    weeklyProduction: number;
    productionChange: number;
    complianceRate: number;
    budgetUtilization: number;
  };
}

const FarmOverviewCard: React.FC<FarmStatsProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Farm Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCows}</div>
            <div className="text-sm text-gray-500">Total Cows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeTasks}</div>
            <div className="text-sm text-gray-500">Active Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.staffOnDuty}</div>
            <div className="text-sm text-gray-500">Staff on Duty</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <span className="text-2xl font-bold text-orange-600">{stats.dailyProduction}L</span>
              {stats.productionChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-sm text-gray-500">Daily Production</div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Compliance Rate</span>
            <span className="text-sm font-bold">{stats.complianceRate}%</span>
          </div>
          <Progress value={stats.complianceRate} className="h-2" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Budget Utilization</span>
            <span className="text-sm font-bold">{stats.budgetUtilization}%</span>
          </div>
          <Progress value={stats.budgetUtilization} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

interface StaffScheduleProps {
  schedule: {
    date: string;
    staff: {
      id: string;
      name: string;
      role: string;
      shift: string;
      status: 'present' | 'absent' | 'late';
    }[];
  }[];
}

const StaffScheduleCard: React.FC<StaffScheduleProps> = ({ schedule }) => {
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Staff Schedule</span>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Shift
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weekDays.map((day, index) => {
            const daySchedule = schedule.find(s => 
              format(new Date(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );
            
            return (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">
                    {format(day, 'EEE, MMM dd')}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {daySchedule?.staff.length || 0} staff scheduled
                  </span>
                </div>
                
                {daySchedule ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {daySchedule.staff.map((person) => (
                      <div key={person.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{person.name}</div>
                          <div className="text-gray-500">{person.role} - {person.shift}</div>
                        </div>
                        <Badge className={getStatusColor(person.status)}>
                          {person.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-xs py-2">
                    No staff scheduled
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface TaskProgressProps {
  tasks: {
    department: string;
    completed: number;
    total: number;
    overdue: number;
  }[];
}

const TaskProgressCard: React.FC<TaskProgressProps> = ({ tasks }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clipboard className="h-5 w-5" />
          <span>Task Completion by Department</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((dept, index) => {
            const completionRate = (dept.completed / dept.total) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dept.department}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {dept.completed}/{dept.total}
                    </span>
                    {dept.overdue > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {dept.overdue} overdue
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress value={completionRate} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{completionRate.toFixed(1)}% complete</span>
                  <span>{dept.total - dept.completed} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface ManagementAlertsProps {
  alerts: {
    id: string;
    type: 'operational' | 'compliance' | 'budget' | 'staff';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    timestamp: string;
  }[];
}

const ManagementAlertsCard: React.FC<ManagementAlertsProps> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'operational': return <Activity className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'budget': return <DollarSign className="h-4 w-4" />;
      case 'staff': return <Users className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Management Alerts</span>
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
            <p>No alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(alert.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="text-sm font-semibold">{alert.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.priority}
                  </Badge>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {format(new Date(alert.timestamp), 'MMM dd, HH:mm')}
                  </span>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Review
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

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [taskProgress, setTaskProgress] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      setStats({
        totalCows: 150,
        activeTasks: 23,
        staffOnDuty: 8,
        dailyProduction: 1250,
        weeklyProduction: 8750,
        productionChange: 2.5,
        complianceRate: 95,
        budgetUtilization: 78
      });

      setSchedule([
        {
          date: format(new Date(), 'yyyy-MM-dd'),
          staff: [
            { id: '1', name: 'John Doe', role: 'Technician', shift: 'Morning', status: 'present' },
            { id: '2', name: 'Jane Smith', role: 'Helper', shift: 'Morning', status: 'present' },
            { id: '3', name: 'Mike Johnson', role: 'Doctor', shift: 'Afternoon', status: 'late' }
          ]
        }
      ]);

      setTaskProgress([
        { department: 'Breeding', completed: 8, total: 12, overdue: 1 },
        { department: 'Health Care', completed: 15, total: 18, overdue: 0 },
        { department: 'Feeding', completed: 25, total: 25, overdue: 0 },
        { department: 'Maintenance', completed: 3, total: 7, overdue: 2 }
      ]);

      setAlerts([
        {
          id: '1',
          type: 'budget',
          title: 'Feed Budget Alert',
          description: 'Feed costs exceeded 80% of monthly budget',
          priority: 'high',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'operational',
          title: 'Equipment Maintenance Due',
          description: 'Milking equipment #3 requires scheduled maintenance',
          priority: 'medium',
          timestamp: new Date().toISOString()
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
        <div className="grid grid-cols-1 gap-3">
          <Button variant="default" className="justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
          <Button variant="outline" className="justify-start">
            <Users className="h-4 w-4 mr-2" />
            Schedule Staff
          </Button>
          <Button variant="outline" className="justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" className="justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Farm Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}. Here's your farm overview.
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Farm Operations Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Farm Overview - Spans 2 columns */}
        <div className="lg:col-span-3">
          <FarmOverviewCard stats={stats} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Staff Schedule - Spans 2 columns */}
        <div className="lg:col-span-2">
          <StaffScheduleCard schedule={schedule} />
        </div>

        {/* Task Progress */}
        <div className="lg:col-span-2">
          <TaskProgressCard tasks={taskProgress} />
        </div>

        {/* Management Alerts - Full width */}
        <div className="lg:col-span-4">
          <ManagementAlertsCard alerts={alerts} />
        </div>
      </div>
    </div>
  );
};