import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Mail, 
  Phone, 
  Plus, 
  Send, 
  Users,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Archive
} from 'lucide-react';
import { format, addDays, addHours, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface AppointmentProps {
  appointments: {
    id: string;
    title: string;
    type: 'veterinary' | 'inspection' | 'maintenance' | 'meeting' | 'delivery';
    date: string;
    startTime: string;
    endTime: string;
    attendees: string[];
    location: string;
    description?: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    contactPerson?: string;
    contactPhone?: string;
  }[];
}

const AppointmentsCard: React.FC<AppointmentProps> = ({ appointments }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate)
  });

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'veterinary': return 'bg-green-100 text-green-800 border-green-200';
      case 'inspection': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivery': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Weekly Appointments</span>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Schedule
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weekDays.map((day, index) => {
            const dayAppointments = appointments.filter(apt => 
              format(new Date(apt.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            
            return (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">
                    {format(day, 'EEE, MMM dd')}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {dayAppointments.length === 0 ? (
                  <div className="text-center text-gray-500 text-xs py-2">
                    No appointments
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayAppointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getStatusIcon(apt.status)}
                            <span className="font-medium">{apt.title}</span>
                            <Badge className={getAppointmentTypeColor(apt.type)}>
                              {apt.type}
                            </Badge>
                          </div>
                          <div className="text-gray-600">
                            {format(new Date(apt.startTime), 'HH:mm')} - {format(new Date(apt.endTime), 'HH:mm')} • {apt.location}
                          </div>
                          {apt.contactPerson && (
                            <div className="text-gray-500">
                              Contact: {apt.contactPerson}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
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

interface CommunicationsProps {
  communications: {
    id: string;
    type: 'email' | 'phone' | 'sms' | 'letter' | 'meeting';
    direction: 'incoming' | 'outgoing';
    subject: string;
    from: string;
    to: string;
    timestamp: string;
    status: 'read' | 'unread' | 'replied' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'vendor' | 'customer' | 'regulatory' | 'internal' | 'other';
    attachments?: number;
    snippet?: string;
  }[];
}

const CommunicationsCard: React.FC<CommunicationsProps> = ({ communications }) => {
  const recentComms = communications.filter(comm => 
    new Date(comm.timestamp) > addDays(new Date(), -7)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'phone': return <Phone className="h-4 w-4 text-green-500" />;
      case 'sms': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'letter': return <FileText className="h-4 w-4 text-orange-500" />;
      case 'meeting': return <Users className="h-4 w-4 text-red-500" />;
      default: return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vendor': return 'bg-purple-100 text-purple-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'regulatory': return 'bg-red-100 text-red-800';
      case 'internal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            <span>Recent Communications</span>
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recentComms.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <p>No recent communications</p>
            </div>
          ) : (
            recentComms.map((comm) => (
              <div key={comm.id} className={`border rounded-lg p-3 hover:bg-gray-50 transition-colors ${
                comm.status === 'unread' ? 'bg-blue-50 border-blue-200' : ''
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(comm.type)}
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${comm.status === 'unread' ? 'font-semibold' : 'font-medium'}`}>
                        {comm.subject}
                      </span>
                      <Badge className={getPriorityColor(comm.priority)}>
                        {comm.priority}
                      </Badge>
                      <Badge className={getCategoryColor(comm.category)}>
                        {comm.category}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comm.timestamp), 'MMM dd, HH:mm')}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  <div className="flex items-center justify-between">
                    <span>
                      {comm.direction === 'incoming' ? 'From' : 'To'}: {comm.direction === 'incoming' ? comm.from : comm.to}
                    </span>
                    {comm.attachments && comm.attachments > 0 && (
                      <div className="flex items-center space-x-1">
                        <Paperclip className="h-3 w-3" />
                        <span>{comm.attachments}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {comm.snippet && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {comm.snippet}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {comm.status}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      Reply
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface AdminTasksProps {
  tasks: {
    id: string;
    task: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignee: string;
    dueDate: string;
    status: 'pending' | 'in-progress' | 'review' | 'completed';
    category: 'documentation' | 'compliance' | 'coordination' | 'communication' | 'filing';
    description?: string;
    estimatedHours?: number;
  }[];
}

const AdminTasksCard: React.FC<AdminTasksProps> = ({ tasks }) => {
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-600';
      case 'in-progress': return 'text-blue-600';
      case 'review': return 'text-orange-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-orange-500" />
          <span>Administrative Tasks</span>
          <Badge variant="secondary">{pendingTasks.length} pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="text-sm font-medium">{task.task}</div>
                    {task.description && (
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{task.assignee}</TableCell>
                  <TableCell className="text-sm">
                    <div className={new Date(task.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                      {format(new Date(task.dueDate), 'MMM dd')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        Edit
                      </Button>
                      {task.status === 'in-progress' && (
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          Complete
                        </Button>
                      )}
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

export const OfficeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);
  const [adminTasks, setAdminTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setAppointments([
        {
          id: '1',
          title: 'Veterinary Inspection',
          type: 'veterinary',
          date: new Date().toISOString(),
          startTime: addHours(new Date(), 2).toISOString(),
          endTime: addHours(new Date(), 3).toISOString(),
          attendees: ['Dr. Smith', 'Farm Manager'],
          location: 'Barn A',
          status: 'confirmed',
          priority: 'high',
          contactPerson: 'Dr. Smith',
          contactPhone: '(555) 123-4567'
        },
        {
          id: '2',
          title: 'Feed Delivery',
          type: 'delivery',
          date: addDays(new Date(), 1).toISOString(),
          startTime: addDays(addHours(new Date(), 8), 1).toISOString(),
          endTime: addDays(addHours(new Date(), 10), 1).toISOString(),
          attendees: ['Farm Manager', 'Helper'],
          location: 'Main Entrance',
          status: 'scheduled',
          priority: 'medium',
          contactPerson: 'Feed Supply Co',
          contactPhone: '(555) 987-6543'
        }
      ]);

      setCommunications([
        {
          id: '1',
          type: 'email',
          direction: 'incoming',
          subject: 'Monthly Compliance Report Due',
          from: 'regulatory@state.gov',
          to: 'office@farm.com',
          timestamp: addHours(new Date(), -2).toISOString(),
          status: 'unread',
          priority: 'high',
          category: 'regulatory',
          snippet: 'This is a reminder that your monthly compliance report is due by the end of this week...'
        },
        {
          id: '2',
          type: 'phone',
          direction: 'outgoing',
          subject: 'Vet appointment confirmation',
          from: 'office@farm.com',
          to: 'Dr. Smith Clinic',
          timestamp: addHours(new Date(), -4).toISOString(),
          status: 'completed',
          priority: 'medium',
          category: 'vendor',
          snippet: 'Confirmed appointment for tomorrow at 2 PM'
        },
        {
          id: '3',
          type: 'email',
          direction: 'incoming',
          subject: 'Feed Order Confirmation',
          from: 'orders@feedsupply.com',
          to: 'office@farm.com',
          timestamp: addHours(new Date(), -6).toISOString(),
          status: 'read',
          priority: 'low',
          category: 'vendor',
          attachments: 1,
          snippet: 'Your feed order #12345 has been confirmed and will be delivered tomorrow...'
        }
      ]);

      setAdminTasks([
        {
          id: '1',
          task: 'Prepare Monthly Compliance Report',
          priority: 'high',
          assignee: user?.name || 'Office Staff',
          dueDate: addDays(new Date(), 2).toISOString(),
          status: 'in-progress',
          category: 'compliance',
          description: 'Compile all necessary documentation for state regulatory compliance',
          estimatedHours: 4
        },
        {
          id: '2',
          task: 'Update Farm Insurance Documentation',
          priority: 'medium',
          assignee: user?.name || 'Office Staff',
          dueDate: addDays(new Date(), 7).toISOString(),
          status: 'pending',
          category: 'documentation',
          description: 'Review and update all insurance policies and documentation'
        },
        {
          id: '3',
          task: 'Coordinate Equipment Maintenance Schedule',
          priority: 'medium',
          assignee: 'Farm Manager',
          dueDate: addDays(new Date(), 3).toISOString(),
          status: 'review',
          category: 'coordination',
          description: 'Schedule all equipment maintenance for next month'
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
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Send className="h-4 w-4 mr-2" />
            Send Communication
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Create Document
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Archive className="h-4 w-4 mr-2" />
            File Archive
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Office Dashboard</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Office Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Hello, {user?.name}. Let's keep everything organized and running smoothly.
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Office Hours
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Appointments - Spans 2 columns */}
        <div className="lg:col-span-2">
          <AppointmentsCard appointments={appointments} />
        </div>

        {/* Communications */}
        <CommunicationsCard communications={communications} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Administrative Tasks - Full width */}
        <div className="lg:col-span-4">
          <AdminTasksCard tasks={adminTasks} />
        </div>
      </div>
    </div>
  );
};