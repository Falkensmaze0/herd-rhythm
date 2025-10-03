import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .optional();

const workforceRequirementSchema = z
  .object({
    worker_per_cows: z.coerce.number().int().positive().optional(),
    technician_per_cows: z.coerce.number().int().positive().optional(),
    doctor_per_cows: z.coerce.number().int().positive().optional(),
  })
  .partial();

const workforceSnapshotSchema = z
  .object({
    workers: z.coerce.number().int().nonnegative().optional(),
    technicians: z.coerce.number().int().nonnegative().optional(),
    doctors: z.coerce.number().int().nonnegative().optional(),
  })
  .partial();

export const cowInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  breed: z.string().trim().min(1, 'Breed is required'),
  age: z.coerce.number().int().min(0, 'Age must be positive'),
  lastSyncDate: z.string().trim().min(1, 'Last sync date is required'),
  healthNotes: z.string().optional(),
  status: z.enum(['active', 'pregnant', 'sick', 'retired']),
});

export const syncStepSchema = z.object({
  id: optionalString,
  day: z.coerce.number().int().min(0),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().optional(),
  hormoneType: optionalString,
  notes: z.string().optional(),
  workforceRequirements: workforceRequirementSchema.optional(),
});

export const syncMethodInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  duration: z.coerce.number().int().min(1, 'Duration must be at least 1 day'),
  isCustom: z.boolean().default(true),
  hasWorkforceSettings: z.boolean().optional(),
  steps: z.array(syncStepSchema).default([]),
});

export const reminderInputSchema = z.object({
  cowId: z.string().trim().min(1, 'Cow ID is required'),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().trim().min(1, 'Due date is required'),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  type: z.enum(['injection', 'checkup', 'ai', 'custom']),
  syncMethodId: optionalString,
  syncStepId: optionalString,
  estimatedCowCount: z.coerce.number().int().nonnegative().optional(),
  workforceSnapshot: workforceSnapshotSchema.optional(),
});

export const reminderUpdateSchema = reminderInputSchema.partial();
