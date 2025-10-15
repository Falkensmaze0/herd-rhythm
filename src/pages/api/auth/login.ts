import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';
import { LoginCredentials } from '@/types';

interface LoginResponse {
  success: boolean;
  user?: any;
  sessionToken?: string;
  message?: string;
  requiresTwoFactor?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const credentials: LoginCredentials = req.body;
    
    // Basic validation
    if (!credentials.email || !credentials.password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get client information
    const ipAddress = req.headers['x-forwarded-for'] as string || 
                     req.headers['x-real-ip'] as string || 
                     req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Attempt login
    const { user, sessionToken } = await AuthService.login(
      credentials,
      ipAddress,
      userAgent
    );

    // Set session cookie if remember me is enabled
    if (credentials.rememberMe) {
      res.setHeader('Set-Cookie', [
        `sessionToken=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Path=/`
      ]);
    } else {
      res.setHeader('Set-Cookie', [
        `sessionToken=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/`
      ]);
    }

    // Remove sensitive data from response
    const { password, ...userResponse } = user;

    return res.status(200).json({
      success: true,
      user: userResponse,
      sessionToken
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific error types
    if (error.message === 'Two-factor authentication required') {
      return res.status(200).json({
        success: false,
        requiresTwoFactor: true,
        message: 'Two-factor authentication code required'
      });
    }
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
}