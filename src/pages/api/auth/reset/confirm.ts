import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';

interface ResetConfirmResponse {
  success: boolean;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetConfirmResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password required' });
    }

    await AuthService.resetPassword(token, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error: any) {
    console.error('Password reset confirm error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired token, or error resetting password'
    });
  }
}