import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import prisma from '@/lib/prisma';
import { serializeSyncMethod } from '@/lib/serializers';
import { syncMethodInputSchema } from '@/lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const methods = await prisma.syncMethod.findMany({
        include: {
          steps: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return res.status(200).json(methods.map(serializeSyncMethod));
    } catch (error) {
      console.error('Failed to fetch sync methods', error);
      return res.status(500).json({ error: 'Failed to fetch sync methods' });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = syncMethodInputSchema.parse(req.body);

      const method = await prisma.syncMethod.create({
        data: {
          name: payload.name,
          description: payload.description,
          duration: payload.duration,
          isCustom: payload.isCustom,
          hasWorkforceSettings: payload.hasWorkforceSettings ?? false,
          steps: {
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
        include: {
          steps: true,
        },
      });

      return res.status(201).json(serializeSyncMethod(method));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.flatten() });
      }
      console.error('Failed to create sync method', error);
      return res.status(500).json({ error: 'Failed to create sync method' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
