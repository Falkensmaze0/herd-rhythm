import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import prisma from '@/lib/prisma';
import { serializeReminder } from '@/lib/serializers';
import { reminderInputSchema, reminderUpdateSchema } from '@/lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid reminder id' });
  }

  if (req.method === 'GET') {
    try {
      const reminder = await prisma.reminder.findUnique({
        where: { id },
        include: {
          syncMethod: true,
          syncStep: true,
        },
      });

      if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      return res.status(200).json(serializeReminder(reminder));
    } catch (error) {
      console.error('Failed to fetch reminder', error);
      return res.status(500).json({ error: 'Failed to fetch reminder' });
    }
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const schema = req.method === 'PUT' ? reminderInputSchema : reminderUpdateSchema;
      const payload = schema.parse(req.body);

      const reminder = await prisma.reminder.update({
        where: { id },
        data: {
          cowId: payload.cowId ?? undefined,
          title: payload.title ?? undefined,
          description: payload.description,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
          completed: payload.completed ?? undefined,
          priority: payload.priority ?? undefined,
          type: payload.type ?? undefined,
          syncMethodId:
            payload.syncMethodId === undefined
              ? undefined
              : payload.syncMethodId ?? null,
          syncStepId:
            payload.syncStepId === undefined
              ? undefined
              : payload.syncStepId ?? null,
          estimatedCowCount: payload.estimatedCowCount ?? undefined,
          workforceSnapshot: payload.workforceSnapshot
            ? (payload.workforceSnapshot as unknown as Prisma.JsonObject)
            : payload.workforceSnapshot === undefined
              ? undefined
              : Prisma.JsonNull,
        },
        include: {
          syncMethod: true,
          syncStep: true,
        },
      });

      return res.status(200).json(serializeReminder(reminder));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.flatten() });
      }
      console.error('Failed to update reminder', error);
      return res.status(500).json({ error: 'Failed to update reminder' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.reminder.delete({ where: { id } });
      return res.status(204).end();
    } catch (error) {
      console.error('Failed to delete reminder', error);
      return res.status(500).json({ error: 'Failed to delete reminder' });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
