import type {
  Cow as PrismaCow,
  Reminder as PrismaReminder,
  SyncMethod as PrismaSyncMethod,
  SyncStep as PrismaSyncStep,
  Prisma,
} from '@prisma/client';
import type { Cow, Reminder, SyncMethod, SyncStep } from '@/types';

type ReminderWithRelations = PrismaReminder & {
  syncMethod?: PrismaSyncMethod | null;
  syncStep?: PrismaSyncStep | null;
};

type CowWithRelations = PrismaCow & {
  reminders?: ReminderWithRelations[];
};

type SyncMethodWithRelations = PrismaSyncMethod & {
  steps: PrismaSyncStep[];
};

const parseWorkforceSnapshot = (
  value: Prisma.JsonValue | null | undefined,
): Reminder['workforceSnapshot'] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const snapshot = value as Record<string, unknown>;
  const workers = typeof snapshot.workers === 'number' ? snapshot.workers : undefined;
  const technicians = typeof snapshot.technicians === 'number' ? snapshot.technicians : undefined;
  const doctors = typeof snapshot.doctors === 'number' ? snapshot.doctors : undefined;

  if (workers === undefined && technicians === undefined && doctors === undefined) {
    return undefined;
  }

  return {
    workers,
    technicians,
    doctors,
  };
};

const parseWorkforceRequirements = (
  value: Prisma.JsonValue | null | undefined,
): SyncStep['workforceRequirements'] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const requirements = value as Record<string, unknown>;
  const worker_per_cows = typeof requirements.worker_per_cows === 'number'
    ? requirements.worker_per_cows
    : undefined;
  const technician_per_cows = typeof requirements.technician_per_cows === 'number'
    ? requirements.technician_per_cows
    : undefined;
  const doctor_per_cows = typeof requirements.doctor_per_cows === 'number'
    ? requirements.doctor_per_cows
    : undefined;

  if (
    worker_per_cows === undefined &&
    technician_per_cows === undefined &&
    doctor_per_cows === undefined
  ) {
    return undefined;
  }

  return {
    worker_per_cows,
    technician_per_cows,
    doctor_per_cows,
  };
};

export const serializeReminder = (reminder: ReminderWithRelations): Reminder => ({
  id: reminder.id,
  cowId: reminder.cowId,
  title: reminder.title,
  description: reminder.description ?? '',
  dueDate: reminder.dueDate.toISOString(),
  completed: reminder.completed,
  priority: reminder.priority,
  type: reminder.type,
  syncMethodId: reminder.syncMethodId ?? undefined,
  syncStepId: reminder.syncStepId ?? undefined,
  estimatedCowCount: reminder.estimatedCowCount ?? undefined,
  workforceSnapshot: parseWorkforceSnapshot(reminder.workforceSnapshot),
});

export const serializeCow = (cow: CowWithRelations): Cow => ({
  id: cow.id,
  name: cow.name,
  breed: cow.breed,
  age: cow.age,
  lastSyncDate: cow.lastSyncDate.toISOString(),
  healthNotes: cow.healthNotes ?? '',
  status: cow.status,
  reminders: (cow.reminders ?? []).map(serializeReminder),
});

export const serializeSyncStep = (step: PrismaSyncStep): SyncStep => ({
  id: step.id,
  day: step.day,
  title: step.title,
  description: step.description ?? '',
  hormoneType: step.hormoneType ?? undefined,
  notes: step.notes ?? undefined,
  workforceRequirements: parseWorkforceRequirements(step.workforceRequirements),
});

export const serializeSyncMethod = (method: SyncMethodWithRelations): SyncMethod => ({
  id: method.id,
  name: method.name,
  description: method.description ?? '',
  duration: method.duration,
  isCustom: method.isCustom,
  hasWorkforceSettings: method.hasWorkforceSettings,
  steps: method.steps
    .slice()
    .sort((a, b) => a.day - b.day)
    .map(serializeSyncStep),
});
