import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';

interface LogoutResponse {
  success: boolean;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get session token from cookie or header
    const sessionToken = req.cookies.sessionToken || 
                        req.headers.authorization?.replace('Bearer ', '');

    if (sessionToken) {
      // Revoke the session
      await AuthService.revokeSession(sessionToken);
    }

    // Clear the session cookie
    res.setHeader('Set-Cookie', [
      'sessionToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
    ]);

    return res.status(200).json({
      success: true,
      message: 'Successfully logged out'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Even if there's an error, we should still clear the cookie
    res.setHeader('Set-Cookie', [
      'sessionToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
    ]);
    
    return res.status(200).json({
      success: true,
      message: 'Logged out'
    });
  }
}