import { Prisma, PrismaClient } from '@prisma/client';

import { mockCows, mockReminders, predefinedSyncMethods } from '../src/data/mockData';

const prisma = new PrismaClient();

type StepIdMap = Record<string, string>;

type SyncMethodSeedMap = Record<string, {
  id: string;
  stepIds: StepIdMap;
}>;

const toJson = (value: unknown): Prisma.JsonObject => value as Prisma.JsonObject;

async function seedSyncMethods(): Promise<SyncMethodSeedMap> {
  const map: SyncMethodSeedMap = {};

  for (const method of predefinedSyncMethods) {
    const created = await prisma.syncMethod.create({
      data: {
        id: method.id,
        name: method.name,
        description: method.description,
        duration: method.duration,
        isCustom: method.isCustom,
        hasWorkforceSettings: method.hasWorkforceSettings ?? false,
        steps: {
          create: method.steps.map((step, index) => ({
            id: `${method.id}-step-${index + 1}`,
            day: step.day,
            title: step.title,
            description: step.description,
            hormoneType: step.hormoneType,
            notes: step.notes,
            workforceRequirements: step.workforceRequirements
              ? toJson(step.workforceRequirements)
              : Prisma.JsonNull,
          })),
        },
      },
      include: {
        steps: true,
      },
    });

    map[method.id] = {
      id: created.id,
      stepIds: created.steps.reduce<StepIdMap>((acc, step, index) => {
        const original = method.steps[index];
        acc[original.id] = step.id;
        return acc;
      }, {}),
    };
  }

  return map;
}

async function seedCows() {
  for (const cow of mockCows) {
    await prisma.cow.create({
      data: {
        id: cow.id,
        name: cow.name,
        breed: cow.breed,
        age: cow.age,
        lastSyncDate: new Date(cow.lastSyncDate),
        healthNotes: cow.healthNotes,
        status: cow.status,
      },
    });
  }
}

async function seedReminders(methodMap: SyncMethodSeedMap) {
  for (const reminder of mockReminders) {
    const mappedMethod = reminder.syncMethodId ? methodMap[reminder.syncMethodId] : undefined;
    const syncStepId = reminder.syncStepId && mappedMethod
      ? mappedMethod.stepIds[reminder.syncStepId]
      : undefined;

    await prisma.reminder.create({
      data: {
        id: reminder.id,
        cowId: reminder.cowId,
        title: reminder.title,
        description: reminder.description,
        dueDate: new Date(reminder.dueDate),
        completed: reminder.completed,
        priority: reminder.priority,
        type: reminder.type,
        syncMethodId: mappedMethod?.id,
        syncStepId,
        estimatedCowCount: reminder.estimatedCowCount,
        workforceSnapshot: reminder.workforceSnapshot
          ? toJson(reminder.workforceSnapshot)
          : Prisma.JsonNull,
      },
    });
  }
}

async function main() {
  await prisma.reminder.deleteMany();
  await prisma.syncStep.deleteMany();
  await prisma.syncMethod.deleteMany();
  await prisma.cow.deleteMany();

  const syncMethodMap = await seedSyncMethods();
  await seedCows();
  await seedReminders(syncMethodMap);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seeding database failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });
