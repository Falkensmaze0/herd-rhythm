import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';

interface SessionResponse {
  success: boolean;
  user?: any;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get session token from cookie or authorization header
    const sessionToken = req.cookies.sessionToken || 
                        req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'No session token provided'
      });
    }

    // Validate the session
    const user = await AuthService.validateSession(sessionToken);

    if (!user) {
      // Clear invalid session cookie
      res.setHeader('Set-Cookie', [
        'sessionToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
      ]);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Remove sensitive data from response
    const { password, ...userResponse } = user;

    return res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Session validation error:', error);
    
    // Clear potentially corrupted session cookie
    res.setHeader('Set-Cookie', [
      'sessionToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
    ]);
    
    return res.status(500).json({
      success: false,
      message: 'Session validation failed'
    });
  }
}