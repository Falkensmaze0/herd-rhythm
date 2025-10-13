
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
  role: 'technician' | 'admin';
}
