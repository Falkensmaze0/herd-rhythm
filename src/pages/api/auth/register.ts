import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';
import { RegisterData } from '@/types';

interface RegisterResponse {
  success: boolean;
  user?: any;
  message?: string;
}

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
    const { password, ...userResponse } = user;

    return res.status(201).json({
      success: true,
      user: userResponse,
      message: 'Registration successful',
    });
  } catch (error: any) {
    console.error('Register error:', error);

    if (error.message && error.message.includes('User already exists')) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
}