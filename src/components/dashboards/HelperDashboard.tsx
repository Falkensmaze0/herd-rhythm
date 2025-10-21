import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle, 
  Clock, 
  Droplets, 
  PenTool, 
  Wheat, 
  Wrench,
  AlertTriangle,
  Activity,
  Plus,
  FileText,
  ClipboardList,
  Sparkles
} from 'lucide-react';
import { format, addHours, startOfDay } from 'date-fns';

interface DailyTasksProps {
  tasks: {
    id: string;
    title: string;
    description: string;
    type: 'feeding' | 'cleaning' | 'maintenance' | 'care';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedTime: number; // minutes
    assignedTime: string;
    dueTime: string;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    cowIds?: string[];
    location: string;
    notes?: string;
  }[];
}

const DailyTasksCard: React.FC<DailyTasksProps> = ({ tasks }) => {
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = tasks.filter(t => t.status === 'overdue');
  
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Wheat className="h-4 w-4 text-green-500" />;
      case 'cleaning': return <Sparkles className="h-4 w-4 text-blue-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'care': return <Activity className="h-4 w-4 text-purple-500" />;
      default: return <ClipboardList className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            <span>My Daily Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            {overdueTasks.length > 0 && (
              <Badge variant="destructive">{overdueTasks.length} overdue</Badge>
            )}
            <Badge variant="secondary">{pendingTasks.length} pending</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {completedTasks.length}/{tasks.length} completed</span>
            <span>{((completedTasks.length / tasks.length) * 100).toFixed(0)}%</span>
          </div>
          <Progress value={(completedTasks.length / tasks.length) * 100} className="h-2" />
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tasks.map((task) => (
            <div key={task.id} className={`border rounded-lg p-3 ${
              task.status === 'overdue' ? 'border-red-200 bg-red-50' : 
              task.status === 'completed' ? 'border-green-200 bg-green-50' : 
              'border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTaskIcon(task.type)}
                  <span className="font-semibold text-sm">{task.title}</span>
                                      <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                </div>
                                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">{task.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="text-gray-500">Location:</span>
                  <div className="font-medium">{task.location}</div>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <div className="font-medium">{task.estimatedTime} min</div>
                </div>
                <div>
                  <span className="text-gray-500">Assigned:</span>
                  <div className="font-medium">{format(new Date(task.assignedTime), 'HH:mm')}</div>
                </div>
                <div>
                  <span className="text-gray-500">Due:</span>
                  <div className={`font-medium ${
                    task.status === 'overdue' ? 'text-red-600' : ''
                  }`}>
                    {format(new Date(task.dueTime), 'HH:mm')}
                  </div>
                </div>
              </div>
              
              {task.notes && (
                <div className="text-xs text-gray-600 mb-2 p-2 bg-gray-100 rounded">
                  <strong>Notes:</strong> {task.notes}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                {task.status === 'pending' && (
                  <Button size="sm" className="h-6 text-xs">
                    Start Task
                  </Button>
                )}
                {task.status === 'in-progress' && (
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Complete
                  </Button>
                )}
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface CowStatusProps {
  status: {
    totalCows: number;
    fedCows: number;
    cleanedAreas: number;
    totalAreas: number;
    careNeeded: number;
    lastFeedingTime: string;
    nextFeedingTime: string;
    waterStatus: 'good' | 'low' | 'critical';
    environmentStatus: 'clean' | 'moderate' | 'dirty';
  };
}

const CowStatusCard: React.FC<CowStatusProps> = ({ status }) => {
  const feedingProgress = (status.fedCows / status.totalCows) * 100;
  const cleaningProgress = (status.cleanedAreas / status.totalAreas) * 100;
  
  const getWaterStatusColor = (waterStatus: string) => {
    switch (waterStatus) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEnvironmentStatusColor = (envStatus: string) => {
    switch (envStatus) {
      case 'clean': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dirty': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-green-500" />
          <span>Cow Care Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{status.totalCows}</div>
              <div className="text-sm text-gray-500">Total Cows</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{status.careNeeded}</div>
              <div className="text-sm text-gray-500">Need Care</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <Wheat className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Feeding Progress</span>
                </div>
                <span className="text-sm">{status.fedCows}/{status.totalCows}</span>
              </div>
              <Progress value={feedingProgress} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Cleaning Progress</span>
                </div>
                <span className="text-sm">{status.cleanedAreas}/{status.totalAreas}</span>
              </div>
              <Progress value={cleaningProgress} className="h-2" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Water Status</span>
              </div>
              <Badge className={getWaterStatusColor(status.waterStatus)}>
                {status.waterStatus}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Environment</span>
              <Badge className={getEnvironmentStatusColor(status.environmentStatus)}>
                {status.environmentStatus}
              </Badge>
            </div>
            
            <div className="text-xs text-gray-600 pt-2 border-t">
              <div>Last feeding: {format(new Date(status.lastFeedingTime), 'HH:mm')}</div>
              <div>Next feeding: {format(new Date(status.nextFeedingTime), 'HH:mm')}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface WorkLogProps {
  logs: {
    id: string;
    timestamp: string;
    task: string;
    cowId?: string;
    cowName?: string;
    location: string;
    duration: number; // minutes
    status: 'completed' | 'partial' | 'skipped';
    notes?: string;
    quality: 'excellent' | 'good' | 'average' | 'poor';
  }[];
}

const WorkLogCard: React.FC<WorkLogProps> = ({ logs }) => {
  const todayLogs = logs.filter(log => 
    format(new Date(log.timestamp), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'skipped': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-purple-500" />
          <span>Today's Work Log</span>
          <Badge variant="secondary">{todayLogs.length} entries</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayLogs.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <ClipboardList className="h-8 w-8 mx-auto mb-2" />
            <p>No work logged today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.timestamp), 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{log.task}</div>
                      {log.cowName && (
                        <div className="text-xs text-gray-500">{log.cowName}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{log.location}</TableCell>
                    <TableCell className="text-sm">{log.duration} min</TableCell>
                    <TableCell>
                                          <Badge className={getQualityColor(log.quality)}>
                      {log.quality}
                    </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
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

export const HelperDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [cowStatus, setCowStatus] = useState<any>(null);
  const [workLog, setWorkLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setTasks([
        {
          id: '1',
          title: 'Morning Feeding - Barn A',
          description: 'Feed all cows in Barn A with fresh hay and concentrate',
          type: 'feeding',
          priority: 'high',
          estimatedTime: 45,
          assignedTime: startOfDay(new Date()).toISOString(),
          dueTime: addHours(startOfDay(new Date()), 6).toISOString(),
          status: 'completed',
          location: 'Barn A',
          notes: 'Check water levels while feeding'
        },
        {
          id: '2',
          title: 'Clean Milking Parlor',
          description: 'Clean and sanitize milking equipment and floor',
          type: 'cleaning',
          priority: 'medium',
          estimatedTime: 60,
          assignedTime: addHours(startOfDay(new Date()), 8).toISOString(),
          dueTime: addHours(startOfDay(new Date()), 10).toISOString(),
          status: 'in-progress',
          location: 'Milking Parlor'
        },
        {
          id: '3',
          title: 'Check Water Troughs',
          description: 'Inspect and refill water troughs in all areas',
          type: 'maintenance',
          priority: 'medium',
          estimatedTime: 30,
          assignedTime: addHours(startOfDay(new Date()), 10).toISOString(),
          dueTime: addHours(startOfDay(new Date()), 12).toISOString(),
          status: 'pending',
          location: 'All Areas'
        },
        {
          id: '4',
          title: 'Afternoon Feeding - Barn B',
          description: 'Distribute afternoon feed rations',
          type: 'feeding',
          priority: 'high',
          estimatedTime: 40,
          assignedTime: addHours(startOfDay(new Date()), 14).toISOString(),
          dueTime: addHours(startOfDay(new Date()), 16).toISOString(),
          status: 'pending',
          location: 'Barn B'
        }
      ]);

      setCowStatus({
        totalCows: 75,
        fedCows: 75,
        cleanedAreas: 3,
        totalAreas: 5,
        careNeeded: 2,
        lastFeedingTime: addHours(startOfDay(new Date()), 6).toISOString(),
        nextFeedingTime: addHours(startOfDay(new Date()), 14).toISOString(),
        waterStatus: 'good',
        environmentStatus: 'clean'
      });

      setWorkLog([
        {
          id: '1',
          timestamp: addHours(startOfDay(new Date()), 6).toISOString(),
          task: 'Morning Feeding - Barn A',
          location: 'Barn A',
          duration: 42,
          status: 'completed',
          quality: 'excellent',
          notes: 'All cows fed properly, water levels good'
        },
        {
          id: '2',
          timestamp: addHours(startOfDay(new Date()), 8).toISOString(),
          task: 'Equipment Cleaning',
          location: 'Milking Parlor',
          duration: 25,
          status: 'partial',
          quality: 'good',
          notes: 'Started cleaning, need to finish equipment sanitization'
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
            <Wheat className="h-4 w-4 mr-2" />
            Log Feeding
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Sparkles className="h-4 w-4 mr-2" />
            Log Cleaning
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Issue
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Clock className="h-4 w-4 mr-2" />
            Break Time
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading || !cowStatus) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Helper Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Helper Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Good job, {user?.name}! Keep up the great work taking care of our cows.
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          On Duty
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Tasks - Spans 2 columns */}
        <div className="lg:col-span-2">
          <DailyTasksCard tasks={tasks} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Cow Status */}
        <CowStatusCard status={cowStatus} />

        {/* Work Log - Spans 2 columns */}
        <div className="lg:col-span-2">
          <WorkLogCard logs={workLog} />
        </div>
      </div>
    </div>
  );
};