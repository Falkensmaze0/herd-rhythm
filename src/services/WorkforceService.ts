import { Reminder, SyncMethod } from '../types';
import { addDays, startOfDay, isSameDay } from 'date-fns';

export interface WorkforceRequirement {
  date: Date;
  workers: number;
  technicians: number;
  doctors: number;
  tasks: {
    reminderTitle: string;
    cowCount: number;
    workers: number;
    technicians: number;
    doctors: number;
  }[];
}

export class WorkforceService {
  private static remindersByDate: Map<string, Reminder[]> = new Map();
  private static syncMethods: SyncMethod[] = [];

  static initialize(reminders: Reminder[], syncMethods: SyncMethod[]) {
    this.syncMethods = syncMethods;
    this.remindersByDate = new Map();
    
    reminders.forEach(reminder => {
      const dateKey = startOfDay(new Date(reminder.dueDate)).toISOString();
      if (!this.remindersByDate.has(dateKey)) {
        this.remindersByDate.set(dateKey, []);
      }
      this.remindersByDate.get(dateKey)?.push(reminder);
    });
  }

  static getForecastForNextDays(days: number): WorkforceRequirement[] {
    const forecast: WorkforceRequirement[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < days; i++) {
      const date = addDays(today, i);
      const dateKey = date.toISOString();
      const reminders = this.remindersByDate.get(dateKey) || [];
      
      const requirement: WorkforceRequirement = {
        date,
        workers: 0,
        technicians: 0,
        doctors: 0,
        tasks: []
      };

      reminders.forEach(reminder => {
        if (reminder.completed) return;

        const syncMethod = this.syncMethods.find(m => m.id === reminder.syncMethodId);
        const step = syncMethod?.steps.find(s => s.id === reminder.syncStepId);
        const cowCount = reminder.estimatedCowCount || 1;

        if (step?.workforceRequirements) {
          const { worker_per_cows = 0, technician_per_cows = 0, doctor_per_cows = 0 } = step.workforceRequirements;
          
          const workers = Math.ceil(cowCount * worker_per_cows);
          const technicians = Math.ceil(cowCount * technician_per_cows);
          const doctors = Math.ceil(cowCount * doctor_per_cows);

          requirement.workers += workers;
          requirement.technicians += technicians;
          requirement.doctors += doctors;

          requirement.tasks.push({
            reminderTitle: reminder.title,
            cowCount,
            workers,
            technicians,
            doctors
          });
        }
      });

      forecast.push(requirement);
    }

    return forecast;
  }

  static getRequirementsByDate(date: Date): WorkforceRequirement | null {
    const forecast = this.getForecastForNextDays(14);
    return forecast.find(req => isSameDay(req.date, date)) || null;
  }
}