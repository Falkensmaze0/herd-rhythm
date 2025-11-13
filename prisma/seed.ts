import { MailFolder, Prisma, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { mockCows, mockReminders, predefinedSyncMethods } from '../src/data/mockData';
import { mockUsers } from '../src/data/mockUsers';
import { mockMailMessages } from '../src/data/mockMail';
import { buildDefaultUserSettings } from '../src/lib/userSettings/defaultSettings';

const prisma = new PrismaClient();

interface SeededUser {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

async function seedUsers() {
  const createdUsers: SeededUser[] = [];
  for (const user of mockUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const created = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        password: hashedPassword,
        role: user.role,
        isActive: user.isActive,
        timezone: user.timezone,
        language: user.language,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    createdUsers.push({ id: created.id, role: created.role, email: created.email, name: created.name });
  }
  return createdUsers;
}

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
  // Clean up existing data
  await prisma.mailEvent.deleteMany();
  await prisma.mailAttachment.deleteMany();
  await prisma.mailMessage.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.syncStep.deleteMany();
  await prisma.syncMethod.deleteMany();
  await prisma.cow.deleteMany();
  await prisma.session.deleteMany();
  await prisma.userSetting.deleteMany();
  await prisma.user.deleteMany();

  // Seed all data
  const users = await seedUsers();
  await Promise.all(
    users.map(({ id, role }) =>
      prisma.userSetting.create({
        data: {
          userId: id,
          ...buildDefaultUserSettings(role),
        },
      })
    )
  );
  const syncMethodMap = await seedSyncMethods();
  await seedCows();
  await seedReminders(syncMethodMap);
  await seedMail(users);
}

async function seedMail(users: SeededUser[]) {
  const emailToId = users.reduce<Record<string, SeededUser>>((acc, user) => {
    acc[user.email.toLowerCase()] = user;
    return acc;
  }, {});

  for (const message of mockMailMessages) {
    const sender = emailToId[message.senderEmail.toLowerCase()];
    const recipient = emailToId[message.recipientEmail.toLowerCase()];
    if (!sender || !recipient) {
      console.warn('Skipping mail seed – sender or recipient missing', message.subject);
      continue;
    }

    const createdMessage = await prisma.mailMessage.create({
      data: {
        senderId: sender.id,
        recipientId: recipient.id,
        subject: message.subject,
        body: message.body,
        bodyHtml: message.bodyHtml,
        folder: message.folder ?? (message.direction === 'outbound' ? MailFolder.sent : MailFolder.inbox),
        direction: message.direction ?? 'internal',
        isRead: message.isRead ?? false,
        metadata: message.metadata ?? Prisma.JsonNull,
      },
    });

    if (message.attachments?.length) {
      await prisma.mailAttachment.createMany({
        data: message.attachments.map((attachment) => ({
          messageId: createdMessage.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          mimeType: attachment.mimeType,
          size: attachment.size,
        })),
      });
    }

    await prisma.mailEvent.create({
      data: {
        messageId: createdMessage.id,
        eventType: 'received',
        description: 'Message seeded for bootstrap data',
      },
    });
  }
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
