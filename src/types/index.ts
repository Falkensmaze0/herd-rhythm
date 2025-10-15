
export interface Cow {
  id: string;
  name: string;
  breed: string;
  age: number;
  lastSyncDate: string;
  healthNotes: string;
  status: 'active' | 'pregnant' | 'sick' | 'retired';
  reminders: Reminder[];
}

export interface Reminder {
  id: string;
  cowId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'injection' | 'checkup' | 'ai' | 'custom';
  syncMethodId?: string;
  syncStepId?: string;
  estimatedCowCount?: number;
  workforceSnapshot?: {
    workers?: number;
    technicians?: number;
    doctors?: number;
  };
}

export interface SyncMethod {
  id: string;
  name: string;
  description: string;
  steps: SyncStep[];
  duration: number; // days
  isCustom: boolean;
  hasWorkforceSettings?: boolean;
}

export interface SyncStep {
  id: string;
  day: number;
  title: string;
  description: string;
  hormoneType?: string;
  notes?: string;
  workforceRequirements?: {
    worker_per_cows?: number;
    technician_per_cows?: number;
    doctor_per_cows?: number;
  };
}

export interface ExportData {
  cows: Cow[];
  reminders: Reminder[];
  syncMethods: SyncMethod[];
  exportDate: string;
}

export interface Analytics {
  totalCows: number;
  activeReminders: number;
  completedSyncs: number;
  pregnancyRate: number;
  complianceRate: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  department?: string;
  licenseNumber?: string;
  specializations?: string[];
  preferences?: UserPreferences;
  timezone: string;
  language: string;
  emailVerified?: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'doctor' | 'technician' | 'helper' | 'office';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
  defaultViews: {
    cowList: 'grid' | 'table';
    calendar: 'month' | 'week' | 'day';
  };
}

export interface AuthUser extends User {
  permissions: Permission[];
  sessionToken?: string;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'admin')[];
  conditions?: {
    own?: boolean;
    department?: string;
    role?: UserRole;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  department?: string;
  licenseNumber?: string;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  sessionId?: string;
  action: ActionType;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  duration?: number;
  createdAt: string;
}

export type ActionType = 
  | 'login' 
  | 'logout' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'export' 
  | 'import'
  | 'system_change'
  | 'user_management'
  | 'data_access'
  | 'api_call'
  | 'api_access'
  | 'access_denied'
  | 'error_occurrence'
  | 'performance_issue';

export interface SystemLog {
  id: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: any;
  source?: string;
  stackTrace?: string;
  userId?: string;
  sessionId?: string;
  memoryUsage?: number;
  cpuUsage?: number;
  responseTime?: number;
  queryCount?: number;
  diskUsage?: number;
  networkLatency?: number;
  createdAt: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface SystemMetrics {
  id: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  dbConnections: number;
  dbResponseTime: number;
  dbQueryCount: number;
  dbSlowQueries: number;
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  uptime: number;
  totalCows: number;
  activeReminders: number;
  completedTasks: number;
  systemAlerts: number;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  role: UserRole;
  stats: {
    [key: string]: {
      value: number | string;
      change?: number;
      trend?: 'up' | 'down' | 'stable';
      unit?: string;
    };
  };
}

export interface RoleConfig {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  dashboardLayout: DashboardWidget[];
  navigationItems: NavigationItem[];
  quickActions: QuickAction[];
}

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'chart' | 'table' | 'list' | 'calendar' | 'alert';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number; w: number; h: number };
  props?: any;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  requiredPermission?: { resource: string; action: string };
  badge?: string;
  children?: NavigationItem[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  variant: 'primary' | 'secondary' | 'danger';
  requiredPermission?: { resource: string; action: string };
}
