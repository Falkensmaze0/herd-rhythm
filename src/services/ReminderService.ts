
import { Reminder, Cow, SyncMethod } from '../types';
import { addDays, format, startOfDay, isSameDay } from 'date-fns';

export interface WorkforceRequirement {
  workers?: number;
  technicians?: number;
  doctors?: number;
}

export interface WorkforceDefaults {
  [taskType: string]: {
    worker_per_cows?: number;
    technician_per_cows?: number;
    doctor_per_cows?: number;
  };
}

export interface WorkforceForecast {
  date: string;
  workers: number;
  technicians: number;
  doctors: number;
  taskBreakdown: Array<{
    task: string;
    cowCount: number;
    workforceNeeded: WorkforceRequirement;
  }>;
}

// Default workforce requirements per task type
const DEFAULT_WORKFORCE_REQUIREMENTS: WorkforceDefaults = {
  'injection': {
    worker_per_cows: 20,
    technician_per_cows: 15,
    doctor_per_cows: undefined
  },
  'ai': {
    worker_per_cows: undefined,
    technician_per_cows: 10,
    doctor_per_cows: undefined
  },
  'checkup': {
    worker_per_cows: 25,
    technician_per_cows: undefined,
    doctor_per_cows: 20
  },
  'custom': {
    worker_per_cows: 15,
    technician_per_cows: 12,
    doctor_per_cows: undefined
  }
};

class ReminderServiceClass {
  private reminders: Reminder[] = [];
  private cows: Cow[] = [];
  private syncMethods: SyncMethod[] = [];

  // Initialize service with data
  initialize(reminders: Reminder[], cows: Cow[], syncMethods: SyncMethod[]) {
    this.reminders = reminders;
    this.cows = cows;
    this.syncMethods = syncMethods;
  }

  // Get all reminders (single source of truth)
  getAllReminders(): Reminder[] {
    return this.reminders;
  }

  // Get reminders for a specific date
  getRemindersForDate(date: Date): Reminder[] {
    return this.reminders.filter(reminder => 
      isSameDay(new Date(reminder.dueDate), date)
    );
  }

  // Get today's reminders
  getTodaysReminders(): Reminder[] {
    return this.getRemindersForDate(new Date());
  }

  // Get reminders for next N days
  getUpcomingReminders(days: number = 14): Reminder[] {
    const today = startOfDay(new Date());
    const endDate = addDays(today, days);
    
    return this.reminders.filter(reminder => {
      const reminderDate = new Date(reminder.dueDate);
      return reminderDate >= today && reminderDate <= endDate;
    });
  }

  // Calculate workforce requirements for a task
  calculateWorkforceForTask(
    taskType: string,
    cowCount: number,
    customRequirements?: WorkforceDefaults[string]
  ): WorkforceRequirement {
    const requirements = customRequirements || DEFAULT_WORKFORCE_REQUIREMENTS[taskType] || DEFAULT_WORKFORCE_REQUIREMENTS['custom'];
    
    return {
      workers: requirements.worker_per_cows && requirements.worker_per_cows > 0 ? 
        Math.max(1, Math.ceil(cowCount / requirements.worker_per_cows)) : 0,
      technicians: requirements.technician_per_cows && requirements.technician_per_cows > 0 ? 
        Math.max(1, Math.ceil(cowCount / requirements.technician_per_cows)) : 0,
      doctors: requirements.doctor_per_cows && requirements.doctor_per_cows > 0 ? 
        Math.max(1, Math.ceil(cowCount / requirements.doctor_per_cows)) : 0
    };
  }

  // Generate workforce forecast for next N days
  generateWorkforceForecast(days: number = 14): WorkforceForecast[] {
    const forecast: WorkforceForecast[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < days; i++) {
      const date = addDays(today, i);
      const dayReminders = this.getRemindersForDate(date);
      
      // Group reminders by task type
      const taskGroups = dayReminders.reduce((groups, reminder) => {
        const key = `${reminder.type}-${reminder.title}`;
        if (!groups[key]) {
          groups[key] = {
            task: reminder.title,
            type: reminder.type,
            reminders: []
          };
        }
        groups[key].reminders.push(reminder);
        return groups;
      }, {} as Record<string, {
        task: string;
        type: string;
        reminders: Reminder[];
      }>);

      let totalWorkers = 0;
      let totalTechnicians = 0;
      let totalDoctors = 0;
      const taskBreakdown: Array<{
        task: string;
        cowCount: number;
        workforceNeeded: WorkforceRequirement;
      }> = [];

      Object.values(taskGroups).forEach((group) => {
        const cowCount = group.reminders.length;
        const workforceNeeded = this.calculateWorkforceForTask(group.type, cowCount);
        
        totalWorkers += workforceNeeded.workers || 0;
        totalTechnicians += workforceNeeded.technicians || 0;
        totalDoctors += workforceNeeded.doctors || 0;

        taskBreakdown.push({
          task: group.task,
          cowCount,
          workforceNeeded
        });
      });

      forecast.push({
        date: format(date, 'MMM dd'),
        workers: totalWorkers,
        technicians: totalTechnicians,
        doctors: totalDoctors,
        taskBreakdown
      });
    }

    return forecast;
  }

  // Update reminder completion status
  completeReminder(reminderId: string): void {
    const reminderIndex = this.reminders.findIndex(r => r.id === reminderId);
    if (reminderIndex !== -1) {
      this.reminders[reminderIndex].completed = true;
    }
  }

  // Update reminders array
  updateReminders(newReminders: Reminder[]): void {
    this.reminders = newReminders;
  }

  // Get default workforce requirements
  getDefaultWorkforceRequirements(): WorkforceDefaults {
    return DEFAULT_WORKFORCE_REQUIREMENTS;
  }
}

export const ReminderService = new ReminderServiceClass();
