import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';
import { LoginCredentials, AuthUser } from '@/types';

interface LoginResponse {
  success: boolean;
  user?: SanitizedAuthUser;
  sessionToken?: string;
  message?: string;
  requiresTwoFactor?: boolean;
}

type SanitizedAuthUser = Omit<AuthUser, 'password'>;

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
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const ipAddress =
      (typeof forwardedFor === 'string' && forwardedFor) ||
      (typeof realIp === 'string' && realIp) ||
      req.socket.remoteAddress ||
      undefined;
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Attempt login
    const { user, sessionToken } = await AuthService.login(
      credentials,
      ipAddress,
      userAgent
    );

    const isProduction = process.env.NODE_ENV === 'production';
    const baseFlags = ['HttpOnly', 'SameSite=Strict', 'Path=/'];
    if (isProduction) {
      baseFlags.splice(1, 0, 'Secure');
    }
    const sessionCookie = (maxAge?: number) => {
      const flags = [...baseFlags];
      if (typeof maxAge === 'number') {
        flags.push(`Max-Age=${maxAge}`);
      }
      return `sessionToken=${sessionToken}; ${flags.join('; ')}`;
    };

    // Set session cookie if remember me is enabled
    if (credentials.rememberMe) {
      res.setHeader('Set-Cookie', [sessionCookie(30 * 24 * 60 * 60)]);
    } else {
      res.setHeader('Set-Cookie', [sessionCookie()]);
    }

    // Remove sensitive data from response
    const { password: _password, ...userResponse } = user;

    return res.status(200).json({
      success: true,
      user: userResponse,
      sessionToken
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : undefined;
    
    // Handle specific error types
    if (message === 'Two-factor authentication required') {
      return res.status(200).json({
        success: false,
        requiresTwoFactor: true,
        message: 'Two-factor authentication code required'
      });
    }
    
    if (message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: message || 'An error occurred during login. Please try again.'
    });
  }
}
