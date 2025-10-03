import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';

import prisma from '@/lib/prisma';
import { serializeCow } from '@/lib/serializers';
import { cowInputSchema } from '@/lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const cows = await prisma.cow.findMany({
        include: {
          reminders: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return res.status(200).json(cows.map(serializeCow));
    } catch (error) {
      console.error('Failed to fetch cows', error);
      return res.status(500).json({ error: 'Failed to fetch cows' });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = cowInputSchema.parse(req.body);

      const cow = await prisma.cow.create({
        data: {
          name: payload.name,
          breed: payload.breed,
          age: payload.age,
          lastSyncDate: new Date(payload.lastSyncDate),
          healthNotes: payload.healthNotes,
          status: payload.status,
        },
        include: {
          reminders: true,
        },
      });

      return res.status(201).json(serializeCow(cow));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.flatten() });
      }
      console.error('Failed to create cow', error);
      return res.status(500).json({ error: 'Failed to create cow' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
