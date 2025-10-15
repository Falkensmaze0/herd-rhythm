import { RoleConfig, UserRole, DashboardWidget, NavigationItem, QuickAction } from '@/types';

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    role: 'admin',
    displayName: 'System Administrator',
    description: 'Complete system access and configuration management',
    permissions: [
      { resource: '*', actions: ['create', 'read', 'update', 'delete', 'admin'] }
    ],
    dashboardLayout: [
      {
        id: 'system-health',
        type: 'stats',
        title: 'System Health',
        size: 'large',
        position: { x: 0, y: 0, w: 6, h: 4 },
        props: {
          metrics: ['cpu', 'memory', 'disk', 'network'],
          thresholds: { warning: 70, critical: 90 }
        }
      },
      {
        id: 'performance-chart',
        type: 'chart',
        title: 'Performance Metrics',
        size: 'large',
        position: { x: 6, y: 0, w: 6, h: 4 },
        props: {
          chartType: 'line',
          metrics: ['responseTime', 'requestsPerMinute', 'errorRate'],
          timeRange: '24h'
        }
      },
      {
        id: 'user-activity',
        type: 'table',
        title: 'Active Users',
        size: 'medium',
        position: { x: 0, y: 4, w: 4, h: 3 },
        props: {
          columns: ['user', 'role', 'lastActivity', 'location'],
          realtime: true
        }
      },
      {
        id: 'audit-logs',
        type: 'table',
        title: 'Recent Audit Logs',
        size: 'medium',
        position: { x: 4, y: 4, w: 8, h: 3 },
        props: {
          columns: ['timestamp', 'user', 'action', 'resource', 'status'],
          filter: 'recent',
          limit: 50
        }
      },
      {
        id: 'system-alerts',
        type: 'alert',
        title: 'System Alerts',
        size: 'full',
        position: { x: 0, y: 7, w: 12, h: 2 },
        props: {
          alertTypes: ['critical', 'warning'],
          autoRefresh: true
        }
      },
      {
        id: 'database-stats',
        type: 'stats',
        title: 'Database Statistics',
        size: 'medium',
        position: { x: 0, y: 9, w: 6, h: 3 },
        props: {
          metrics: ['connections', 'queryTime', 'slowQueries', 'storage']
        }
      },
      {
        id: 'backup-status',
        type: 'list',
        title: 'Backup Status',
        size: 'medium',
        position: { x: 6, y: 9, w: 6, h: 3 },
        props: {
          items: ['database', 'files', 'logs'],
          showStatus: true,
          lastBackup: true
        }
      }
    ],
    navigationItems: [
      {
        id: 'dashboard',
        label: 'Admin Dashboard',
        icon: '🖥️',
        path: '/admin/dashboard'
      },
      {
        id: 'system-monitor',
        label: 'System Monitor',
        icon: '📊',
        path: '/admin/system',
        children: [
          { id: 'performance', label: 'Performance', icon: '⚡', path: '/admin/system/performance' },
          { id: 'logs', label: 'System Logs', icon: '📋', path: '/admin/system/logs' },
          { id: 'alerts', label: 'Alerts', icon: '🚨', path: '/admin/system/alerts' }
        ]
      },
      {
        id: 'user-management',
        label: 'User Management',
        icon: '👥',
        path: '/admin/users',
        children: [
          { id: 'users', label: 'All Users', icon: '👤', path: '/admin/users/list' },
          { id: 'roles', label: 'Role Management', icon: '🔐', path: '/admin/users/roles' },
          { id: 'permissions', label: 'Permissions', icon: '🛡️', path: '/admin/users/permissions' }
        ]
      },
      {
        id: 'database',
        label: 'Database Admin',
        icon: '🗄️',
        path: '/admin/database',
        children: [
          { id: 'tables', label: 'Tables', icon: '📊', path: '/admin/database/tables' },
          { id: 'backups', label: 'Backups', icon: '💾', path: '/admin/database/backups' },
          { id: 'migrations', label: 'Migrations', icon: '🔄', path: '/admin/database/migrations' }
        ]
      },
      {
        id: 'system-settings',
        label: 'System Settings',
        icon: '⚙️',
        path: '/admin/settings',
        children: [
          { id: 'general', label: 'General', icon: '🔧', path: '/admin/settings/general' },
          { id: 'security', label: 'Security', icon: '🔒', path: '/admin/settings/security' },
          { id: 'integrations', label: 'Integrations', icon: '🔗', path: '/admin/settings/integrations' }
        ]
      },
      {
        id: 'audit',
        label: 'Audit & Compliance',
        icon: '📝',
        path: '/admin/audit'
      }
    ],
    quickActions: [
      { id: 'create-user', label: 'Create User', icon: '➕', action: 'create_user', variant: 'primary' },
      { id: 'system-backup', label: 'System Backup', icon: '💾', action: 'system_backup', variant: 'secondary' },
      { id: 'maintenance-mode', label: 'Maintenance Mode', icon: '🔧', action: 'maintenance_mode', variant: 'secondary' },
      { id: 'emergency-shutdown', label: 'Emergency Shutdown', icon: '🚨', action: 'emergency_shutdown', variant: 'danger' }
    ]
  },

  manager: {
    role: 'manager',
    displayName: 'Farm Manager',
    description: 'Farm operations and staff management',
    permissions: [
      { resource: 'cows', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'reminders', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'sync-methods', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'reports', actions: ['create', 'read'] },
      { resource: 'scheduling', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'budget', actions: ['read', 'update'] }
    ],
    dashboardLayout: [
      {
        id: 'farm-overview',
        type: 'stats',
        title: 'Farm Overview',
        size: 'large',
        position: { x: 0, y: 0, w: 8, h: 3 },
        props: {
          metrics: ['totalCows', 'activeTasks', 'staffOnDuty', 'dailyProduction']
        }
      },
      {
        id: 'kpi-chart',
        type: 'chart',
        title: 'Key Performance Indicators',
        size: 'medium',
        position: { x: 8, y: 0, w: 4, h: 3 },
        props: {
          chartType: 'gauge',
          metrics: ['productivity', 'compliance', 'efficiency']
        }
      },
      {
        id: 'staff-schedule',
        type: 'calendar',
        title: 'Staff Schedule',
        size: 'large',
        position: { x: 0, y: 3, w: 6, h: 4 },
        props: {
          view: 'week',
          showStaffing: true
        }
      },
      {
        id: 'task-progress',
        type: 'chart',
        title: 'Task Completion',
        size: 'medium',
        position: { x: 6, y: 3, w: 6, h: 4 },
        props: {
          chartType: 'bar',
          groupBy: 'department'
        }
      },
      {
        id: 'alerts-manager',
        type: 'alert',
        title: 'Management Alerts',
        size: 'full',
        position: { x: 0, y: 7, w: 12, h: 2 },
        props: {
          alertTypes: ['operational', 'compliance', 'budget']
        }
      }
    ],
    navigationItems: [
      { id: 'dashboard', label: 'Manager Dashboard', icon: '📊', path: '/manager/dashboard' },
      { id: 'operations', label: 'Operations', icon: '🏭', path: '/manager/operations' },
      { id: 'staff', label: 'Staff Management', icon: '👥', path: '/manager/staff' },
      { id: 'scheduling', label: 'Scheduling', icon: '📅', path: '/manager/scheduling' },
      { id: 'analytics', label: 'Farm Analytics', icon: '📈', path: '/manager/analytics' },
      { id: 'reports', label: 'Reports', icon: '📄', path: '/manager/reports' },
      { id: 'budget', label: 'Budget Overview', icon: '💰', path: '/manager/budget' }
    ],
    quickActions: [
      { id: 'create-task', label: 'Create Task', icon: '➕', action: 'create_task', variant: 'primary' },
      { id: 'schedule-staff', label: 'Schedule Staff', icon: '👤', action: 'schedule_staff', variant: 'secondary' },
      { id: 'generate-report', label: 'Generate Report', icon: '📊', action: 'generate_report', variant: 'secondary' }
    ]
  },

  doctor: {
    role: 'doctor',
    displayName: 'Veterinarian',
    description: 'Animal health and medical management',
    permissions: [
      { resource: 'cows', actions: ['read', 'update'] },
      { resource: 'medical-records', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'treatments', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'prescriptions', actions: ['create', 'read', 'update'] },
      { resource: 'breeding', actions: ['read', 'update'] },
      { resource: 'health-analytics', actions: ['read'] }
    ],
    dashboardLayout: [
      {
        id: 'health-overview',
        type: 'stats',
        title: 'Herd Health Overview',
        size: 'large',
        position: { x: 0, y: 0, w: 8, h: 3 },
        props: {
          metrics: ['healthyCows', 'sickCows', 'vaccinated', 'pregnancyRate']
        }
      },
      {
        id: 'health-alerts',
        type: 'alert',
        title: 'Health Alerts',
        size: 'medium',
        position: { x: 8, y: 0, w: 4, h: 3 },
        props: {
          alertTypes: ['critical', 'urgent'],
          filter: 'medical'
        }
      },
      {
        id: 'treatment-schedule',
        type: 'calendar',
        title: 'Treatment Schedule',
        size: 'large',
        position: { x: 0, y: 3, w: 6, h: 4 },
        props: {
          view: 'day',
          filterBy: 'medical'
        }
      },
      {
        id: 'disease-trends',
        type: 'chart',
        title: 'Disease Trends',
        size: 'medium',
        position: { x: 6, y: 3, w: 6, h: 4 },
        props: {
          chartType: 'line',
          timeRange: '3months'
        }
      },
      {
        id: 'recent-cases',
        type: 'table',
        title: 'Recent Medical Cases',
        size: 'full',
        position: { x: 0, y: 7, w: 12, h: 3 },
        props: {
          columns: ['cow', 'condition', 'treatment', 'status', 'lastVisit']
        }
      }
    ],
    navigationItems: [
      { id: 'dashboard', label: 'Medical Dashboard', icon: '🩺', path: '/doctor/dashboard' },
      { id: 'medical-records', label: 'Medical Records', icon: '📋', path: '/doctor/records' },
      { id: 'treatments', label: 'Treatments', icon: '💊', path: '/doctor/treatments' },
      { id: 'prescriptions', label: 'Prescriptions', icon: '📝', path: '/doctor/prescriptions' },
      { id: 'breeding', label: 'Breeding Program', icon: '🐄', path: '/doctor/breeding' },
      { id: 'health-analytics', label: 'Health Analytics', icon: '📊', path: '/doctor/analytics' },
      { id: 'emergency', label: 'Emergency Cases', icon: '🚨', path: '/doctor/emergency' }
    ],
    quickActions: [
      { id: 'add-treatment', label: 'Add Treatment', icon: '💉', action: 'add_treatment', variant: 'primary' },
      { id: 'emergency-case', label: 'Emergency Case', icon: '🚨', action: 'emergency_case', variant: 'danger' },
      { id: 'health-check', label: 'Health Check', icon: '🔍', action: 'health_check', variant: 'secondary' }
    ]
  },

  technician: {
    role: 'technician',
    displayName: 'AI/Sync Technician',
    description: 'Artificial insemination and synchronization protocols',
    permissions: [
      { resource: 'cows', actions: ['create', 'read', 'update'] },
      { resource: 'reminders', actions: ['read', 'update'] },
      { resource: 'sync-methods', actions: ['read', 'update'] },
      { resource: 'ai-procedures', actions: ['create', 'read', 'update'] },
      { resource: 'breeding-records', actions: ['create', 'read', 'update'] },
      { resource: 'equipment', actions: ['read', 'update'] }
    ],
    dashboardLayout: [
      {
        id: 'breeding-stats',
        type: 'stats',
        title: 'Breeding Statistics',
        size: 'large',
        position: { x: 0, y: 0, w: 6, h: 3 },
        props: {
          metrics: ['pendingAI', 'successRate', 'pregnancyConfirmed', 'equipmentStatus']
        }
      },
      {
        id: 'sync-calendar',
        type: 'calendar',
        title: 'Sync Schedule',
        size: 'large',
        position: { x: 6, y: 0, w: 6, h: 3 },
        props: {
          view: 'week',
          filterBy: 'sync'
        }
      },
      {
        id: 'ai-procedures',
        type: 'table',
        title: 'Today\'s AI Procedures',
        size: 'large',
        position: { x: 0, y: 3, w: 8, h: 4 },
        props: {
          columns: ['cow', 'protocol', 'timing', 'notes', 'status']
        }
      },
      {
        id: 'success-chart',
        type: 'chart',
        title: 'Success Rates',
        size: 'medium',
        position: { x: 8, y: 3, w: 4, h: 4 },
        props: {
          chartType: 'pie',
          metrics: ['successful', 'pending', 'failed']
        }
      }
    ],
    navigationItems: [
      { id: 'dashboard', label: 'Tech Dashboard', icon: '🔬', path: '/technician/dashboard' },
      { id: 'sync-protocols', label: 'Sync Protocols', icon: '🔄', path: '/technician/protocols' },
      { id: 'ai-procedures', label: 'AI Procedures', icon: '🧪', path: '/technician/procedures' },
      { id: 'breeding-records', label: 'Breeding Records', icon: '📊', path: '/technician/records' },
      { id: 'equipment', label: 'Equipment', icon: '🔧', path: '/technician/equipment' },
      { id: 'calendar', label: 'Schedule', icon: '📅', path: '/technician/calendar' }
    ],
    quickActions: [
      { id: 'record-ai', label: 'Record AI', icon: '📝', action: 'record_ai', variant: 'primary' },
      { id: 'check-equipment', label: 'Equipment Check', icon: '🔧', action: 'equipment_check', variant: 'secondary' },
      { id: 'update-protocol', label: 'Update Protocol', icon: '🔄', action: 'update_protocol', variant: 'secondary' }
    ]
  },

  helper: {
    role: 'helper',
    displayName: 'Farm Worker',
    description: 'Basic cow care and maintenance tasks',
    permissions: [
      { resource: 'cows', actions: ['read'] },
      { resource: 'reminders', actions: ['read', 'update'], conditions: { own: true } },
      { resource: 'feeding-logs', actions: ['create', 'read', 'update'] },
      { resource: 'cleaning-logs', actions: ['create', 'read', 'update'] },
      { resource: 'basic-care', actions: ['create', 'read', 'update'] }
    ],
    dashboardLayout: [
      {
        id: 'daily-tasks',
        type: 'list',
        title: 'My Daily Tasks',
        size: 'large',
        position: { x: 0, y: 0, w: 6, h: 4 },
        props: {
          filter: 'assigned',
          sortBy: 'priority'
        }
      },
      {
        id: 'cow-status',
        type: 'stats',
        title: 'Cow Status',
        size: 'large',
        position: { x: 6, y: 0, w: 6, h: 4 },
        props: {
          metrics: ['feedingStatus', 'cleaningStatus', 'careNeeded']
        }
      },
      {
        id: 'work-log',
        type: 'table',
        title: 'Work Log',
        size: 'full',
        position: { x: 0, y: 4, w: 12, h: 4 },
        props: {
          columns: ['time', 'task', 'cow', 'status', 'notes']
        }
      }
    ],
    navigationItems: [
      { id: 'dashboard', label: 'My Dashboard', icon: '🏠', path: '/helper/dashboard' },
      { id: 'tasks', label: 'My Tasks', icon: '✅', path: '/helper/tasks' },
      { id: 'feeding', label: 'Feeding Logs', icon: '🌾', path: '/helper/feeding' },
      { id: 'cleaning', label: 'Cleaning Logs', icon: '🧽', path: '/helper/cleaning' },
      { id: 'cow-care', label: 'Cow Care', icon: '🐄', path: '/helper/care' }
    ],
    quickActions: [
      { id: 'log-feeding', label: 'Log Feeding', icon: '🌾', action: 'log_feeding', variant: 'primary' },
      { id: 'log-cleaning', label: 'Log Cleaning', icon: '🧽', action: 'log_cleaning', variant: 'secondary' },
      { id: 'report-issue', label: 'Report Issue', icon: '⚠️', action: 'report_issue', variant: 'danger' }
    ]
  },

  office: {
    role: 'office',
    displayName: 'Office Administrator',
    description: 'Administrative tasks and communication',
    permissions: [
      { resource: 'cows', actions: ['read'] },
      { resource: 'reminders', actions: ['read'] },
      { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'communications', actions: ['create', 'read', 'update'] },
      { resource: 'documents', actions: ['create', 'read', 'update'] },
      { resource: 'reports', actions: ['read'] }
    ],
    dashboardLayout: [
      {
        id: 'appointments',
        type: 'calendar',
        title: 'Appointments',
        size: 'large',
        position: { x: 0, y: 0, w: 8, h: 4 },
        props: {
          view: 'week',
          editable: true
        }
      },
      {
        id: 'communications',
        type: 'list',
        title: 'Recent Communications',
        size: 'medium',
        position: { x: 8, y: 0, w: 4, h: 4 },
        props: {
          type: 'communications',
          limit: 10
        }
      },
      {
        id: 'pending-tasks',
        type: 'table',
        title: 'Pending Administrative Tasks',
        size: 'full',
        position: { x: 0, y: 4, w: 12, h: 3 },
        props: {
          columns: ['task', 'priority', 'assignee', 'dueDate', 'status']
        }
      }
    ],
    navigationItems: [
      { id: 'dashboard', label: 'Office Dashboard', icon: '🏢', path: '/office/dashboard' },
      { id: 'appointments', label: 'Appointments', icon: '📅', path: '/office/appointments' },
      { id: 'communications', label: 'Communications', icon: '📞', path: '/office/communications' },
      { id: 'documents', label: 'Documents', icon: '📄', path: '/office/documents' },
      { id: 'reports', label: 'Reports', icon: '📊', path: '/office/reports' }
    ],
    quickActions: [
      { id: 'schedule-appointment', label: 'Schedule Appointment', icon: '📅', action: 'schedule_appointment', variant: 'primary' },
      { id: 'send-communication', label: 'Send Communication', icon: '📧', action: 'send_communication', variant: 'secondary' },
      { id: 'create-document', label: 'Create Document', icon: '📝', action: 'create_document', variant: 'secondary' }
    ]
  }
};

export const getRoleConfig = (role: UserRole): RoleConfig => {
  return ROLE_CONFIGS[role];
};

export const getAllRoles = (): UserRole[] => {
  return Object.keys(ROLE_CONFIGS) as UserRole[];
};

export const getRoleDisplayName = (role: UserRole): string => {
  return ROLE_CONFIGS[role]?.displayName || role;
};