import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { ExportData } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = req.body as ExportData;

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Clear existing data
      await tx.reminder.deleteMany({});
      await tx.cow.deleteMany({});
      await tx.syncMethod.deleteMany({});

      // Import new data
      await tx.cow.createMany({ data: data.cows });
      await tx.syncMethod.createMany({ data: data.syncMethods });
      await tx.reminder.createMany({ data: data.reminders });
    });

    res.status(200).json({ message: 'Data imported successfully' });
  } catch (error) {
    console.error('Import failed:', error);
    res.status(500).json({ message: 'Failed to import data' });
  }
}