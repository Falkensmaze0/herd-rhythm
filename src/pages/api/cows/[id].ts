import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';

import prisma from '@/lib/prisma';
import { serializeCow } from '@/lib/serializers';
import { cowInputSchema } from '@/lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid cow id' });
  }

  if (req.method === 'GET') {
    try {
      const cow = await prisma.cow.findUnique({
        where: { id },
        include: { reminders: true },
      });

      if (!cow) {
        return res.status(404).json({ error: 'Cow not found' });
      }

      return res.status(200).json(serializeCow(cow));
    } catch (error) {
      console.error('Failed to fetch cow', error);
      return res.status(500).json({ error: 'Failed to fetch cow' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const payload = cowInputSchema.parse(req.body);
      const cow = await prisma.cow.update({
        where: { id },
        data: {
          name: payload.name,
          breed: payload.breed,
          age: payload.age,
          lastSyncDate: new Date(payload.lastSyncDate),
          healthNotes: payload.healthNotes,
          status: payload.status,
        },
        include: { reminders: true },
      });

      return res.status(200).json(serializeCow(cow));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.flatten() });
      }
      console.error('Failed to update cow', error);
      return res.status(500).json({ error: 'Failed to update cow' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.cow.delete({ where: { id } });
      return res.status(204).end();
    } catch (error) {
      console.error('Failed to delete cow', error);
      return res.status(500).json({ error: 'Failed to delete cow' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
