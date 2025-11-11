import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';
import { RegisterData, AuthUser } from '@/types';

interface RegisterResponse {
  success: boolean;
  user?: SanitizedAuthUser;
  message?: string;
}

type SanitizedAuthUser = Omit<AuthUser, 'password'>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const data: RegisterData = req.body;

    // Minimal validation
    if (!data.email || !data.password || !data.role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required',
      });
    }

    const user = await AuthService.register(data);
    const { password: _password, ...userResponse } = user;

    return res.status(201).json({
      success: true,
      user: userResponse,
      message: 'Registration successful',
    });
  } catch (error: unknown) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : undefined;

    if (message && message.includes('User already exists')) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    return res.status(500).json({
      success: false,
      message: message || 'Registration failed. Please try again.',
    });
  }
}
