import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';

interface ResetResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    await AuthService.requestPasswordReset(email);

    // Email is not confirmed for security
    return res.status(200).json({
      success: true,
      message: "If an account exists for this email, a reset link has been sent."
    });
  } catch (error: unknown) {
    console.error('Password reset request error:', error);
    const message = error instanceof Error ? error.message : undefined;
    return res.status(500).json({
      success: false,
      message: message || 'Failed to process password reset request'
    });
  }
}
