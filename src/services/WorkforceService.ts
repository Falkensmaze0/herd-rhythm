import { Reminder } from '../types';
import type { SyncMethod, SyncMethodStep, WorkforceRequirements } from '../types/sync-method';
import { addDays, startOfDay, isSameDay } from 'date-fns';
import { prisma } from '@/lib/prisma';

const MEDICAL_TASK_TYPES = ['checkup', 'ai', 'injection', 'vaccination', 'pregnancy_check'];

const DEFAULT_MEDICAL_RATIOS = {
  checkup: { doctors: 20, technicians: 0, workers: 10 },
  ai: { doctors: 0, technicians: 10, workers: 5 },
  injection: { doctors: 0, technicians: 15, workers: 7 },
  vaccination: { doctors: 0, technicians: 12, workers: 6 },
  pregnancy_check: { doctors: 15, technicians: 0, workers: 8 }
} as const;

export interface WorkforceRequirement {
  date: Date;
  workers: number;
  technicians: number;
  doctors: number;
  tasks: {
    reminderTitle: string;
    type: string;
    cowCount: number;
    workers: number;
    technicians: number;
    doctors: number;
  }[];
}

export class WorkforceService {
  private static remindersByDate: Map<string, Reminder[]> = new Map();
  private static syncMethods: SyncMethod[] = [];

  static async initialize() {
    try {
      const [reminders, rawSyncMethods] = await Promise.all([
        prisma.reminder.findMany({
          where: {
            completed: false,
            type: {
              in: MEDICAL_TASK_TYPES as any // Cast to ReminderType[] for Prisma compatibility
            }
          }
        }),
        prisma.syncMethod.findMany({
          include: {
            steps: true
          }
        })
      ]);

      // Parse workforceRequirements JSON for each step and ensure type safety
      this.syncMethods = rawSyncMethods.map(method => {
        const processedMethod: SyncMethod = {
          id: method.id,
          name: method.name,
          description: method.description,
          duration: method.duration,
          isCustom: method.isCustom,
          hasWorkforceSettings: method.hasWorkforceSettings,
          createdAt: method.createdAt,
          updatedAt: method.updatedAt,
          steps: method.steps.map(step => ({
            id: step.id,
            title: step.title,
            description: step.description || '',
            notes: step.notes || '',
            hormoneType: step.hormoneType || '',
            day: step.day,
            syncMethodId: step.syncMethodId,
            workforceRequirements: step.workforceRequirements
              ? typeof step.workforceRequirements === 'string'
                ? JSON.parse(step.workforceRequirements)
                : step.workforceRequirements
              : undefined,
            createdAt: step.createdAt,
            updatedAt: step.updatedAt
          }))
        };
        return processedMethod;
      });

      this.remindersByDate = new Map();
      reminders.forEach(reminder => {
        const dateKey = startOfDay(new Date(reminder.dueDate)).toISOString();
        if (!this.remindersByDate.has(dateKey)) {
          this.remindersByDate.set(dateKey, []);
        }
        this.remindersByDate.get(dateKey)?.push({
          ...reminder,
          dueDate: reminder.dueDate instanceof Date ? reminder.dueDate.toISOString() : reminder.dueDate,
          workforceSnapshot: reminder.workforceSnapshot
            ? typeof reminder.workforceSnapshot === 'string'
              ? JSON.parse(reminder.workforceSnapshot)
              : reminder.workforceSnapshot
            : undefined
        });
      });
    } catch (error) {
      console.error('Failed to initialize WorkforceService:', error);
      throw error;
    }
  }

  static async getForecastForNextDays(days: number): Promise<WorkforceRequirement[]> {
    try {
      // Initialize if not already done
      if (this.syncMethods.length === 0) {
        await this.initialize();
      }

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

        for (const reminder of reminders) {
          if (reminder.completed || !MEDICAL_TASK_TYPES.includes(reminder.type)) continue;

          const cowCount = reminder.estimatedCowCount || 1;
          let workers = 0, technicians = 0, doctors = 0;

          // Check sync method requirements first
          if (reminder.syncMethodId && reminder.syncStepId) {
            const syncMethod = this.syncMethods.find(m => m.id === reminder.syncMethodId);
            const step = syncMethod?.steps.find(s => s.id === reminder.syncStepId);

            if (step?.workforceRequirements) {
              const { worker_per_cows = 0, technician_per_cows = 0, doctor_per_cows = 0 } = step.workforceRequirements;
              
              workers = Math.ceil(cowCount / (worker_per_cows || Infinity));
              technicians = Math.ceil(cowCount / (technician_per_cows || Infinity));
              doctors = Math.ceil(cowCount / (doctor_per_cows || Infinity));
            }
          }

          // If no sync method requirements, use defaults based on task type
          if (workers === 0 && technicians === 0 && doctors === 0) {
            const defaultRatios = DEFAULT_MEDICAL_RATIOS[reminder.type as keyof typeof DEFAULT_MEDICAL_RATIOS];
            if (defaultRatios) {
              workers = Math.ceil(cowCount / defaultRatios.workers);
              technicians = defaultRatios.technicians > 0 ? Math.ceil(cowCount / defaultRatios.technicians) : 0;
              doctors = defaultRatios.doctors > 0 ? Math.ceil(cowCount / defaultRatios.doctors) : 0;
            }
          }

          requirement.workers += workers;
          requirement.technicians += technicians;
          requirement.doctors += doctors;

          requirement.tasks.push({
            reminderTitle: reminder.title,
            type: reminder.type,
            cowCount,
            workers,
            technicians,
            doctors
          });
        }

        // Ensure minimum staffing levels
        requirement.workers = Math.max(2, requirement.workers);
        requirement.technicians = Math.max(1, requirement.technicians);
        requirement.doctors = Math.max(1, requirement.doctors);

        forecast.push(requirement);
      }

      return forecast;
    } catch (error) {
      console.error('Failed to generate workforce forecast:', error);
      throw error;
    }
  }

  static async getRequirementsByDate(date: Date): Promise<WorkforceRequirement | null> {
    const forecast = await this.getForecastForNextDays(14);
    return forecast.find(req => isSameDay(req.date, date)) || null;
  }
}