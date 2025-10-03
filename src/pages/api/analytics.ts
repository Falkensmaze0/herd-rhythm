import type { NextApiRequest, NextApiResponse } from 'next';

import { getAnalyticsSnapshot } from '@/lib/analytics';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const analytics = await getAnalyticsSnapshot();
    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Failed to load analytics snapshot', error);
    return res.status(500).json({ error: 'Failed to load analytics snapshot' });
  }
}
