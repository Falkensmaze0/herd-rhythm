import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import prisma from '@/lib/prisma';
import { serializeReminder } from '@/lib/serializers';
import { reminderInputSchema } from '@/lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const reminders = await prisma.reminder.findMany({
        include: {
          syncMethod: true,
          syncStep: true,
        },
        orderBy: {
          dueDate: 'asc',
        },
      });

      return res.status(200).json(reminders.map(serializeReminder));
    } catch (error) {
      console.error('Failed to fetch reminders', error);
      return res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = reminderInputSchema.parse(req.body);

      const reminder = await prisma.reminder.create({
        data: {
          cowId: payload.cowId,
          title: payload.title,
          description: payload.description,
          dueDate: new Date(payload.dueDate),
          completed: payload.completed ?? false,
          priority: payload.priority,
          type: payload.type,
          syncMethodId: payload.syncMethodId,
          syncStepId: payload.syncStepId,
          estimatedCowCount: payload.estimatedCowCount,
          workforceSnapshot: payload.workforceSnapshot
            ? (payload.workforceSnapshot as unknown as Prisma.JsonObject)
            : Prisma.JsonNull,
        },
        include: {
          syncMethod: true,
          syncStep: true,
        },
      });

      return res.status(201).json(serializeReminder(reminder));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.flatten() });
      }
      console.error('Failed to create reminder', error);
      return res.status(500).json({ error: 'Failed to create reminder' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
