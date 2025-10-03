import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import prisma from '@/lib/prisma';
import { serializeSyncMethod } from '@/lib/serializers';
import { syncMethodInputSchema } from '@/lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid sync method id' });
  }

  if (req.method === 'GET') {
    try {
      const method = await prisma.syncMethod.findUnique({
        where: { id },
        include: { steps: true },
      });

      if (!method) {
        return res.status(404).json({ error: 'Sync method not found' });
      }

      return res.status(200).json(serializeSyncMethod(method));
    } catch (error) {
      console.error('Failed to fetch sync method', error);
      return res.status(500).json({ error: 'Failed to fetch sync method' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const payload = syncMethodInputSchema.parse(req.body);

      const method = await prisma.syncMethod.update({
        where: { id },
        data: {
          name: payload.name,
          description: payload.description,
          duration: payload.duration,
          isCustom: payload.isCustom,
          hasWorkforceSettings: payload.hasWorkforceSettings ?? false,
          steps: {
            deleteMany: {},
            create: payload.steps.map((step) => ({
              day: step.day,
              title: step.title,
              description: step.description,
              hormoneType: step.hormoneType,
              notes: step.notes,
              workforceRequirements: step.workforceRequirements
                ? (step.workforceRequirements as unknown as Prisma.JsonObject)
                : Prisma.JsonNull,
            })),
          },
        },
        include: { steps: true },
      });

      return res.status(200).json(serializeSyncMethod(method));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.flatten() });
      }
      console.error('Failed to update sync method', error);
      return res.status(500).json({ error: 'Failed to update sync method' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.syncMethod.delete({ where: { id } });
      return res.status(204).end();
    } catch (error) {
      console.error('Failed to delete sync method', error);
      return res.status(500).json({ error: 'Failed to delete sync method' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
