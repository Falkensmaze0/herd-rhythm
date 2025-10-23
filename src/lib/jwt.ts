import { createSecretKey } from 'crypto';
import * as jwt from 'jsonwebtoken';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

export const signToken = (payload: jwt.JwtPayload, options?: jwt.SignOptions): string => {
  const secret = getSecretKey();
  return jwt.sign(payload, secret, options);
};

export const verifyToken = <T extends jwt.JwtPayload>(token: string): T | null => {
  try {
    const secret = getSecretKey();
    return jwt.verify(token, secret) as T;
  } catch (error) {
    console.error('JWT Verification failed:', error);
    return null;
  }
};