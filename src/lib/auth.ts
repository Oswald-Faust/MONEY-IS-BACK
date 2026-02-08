import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface AuthResult {
  success: boolean;
  userId?: string;
  email?: string;
  role?: string;
  error?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Token manquant' };
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return { success: false, error: 'Token invalide' };
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'default-secret'
    ) as { userId: string; email: string; role: string };

    return {
      success: true,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'Token expiré' };
    }
    return { success: false, error: 'Token invalide' };
  }
}

export function getAuthHeader(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
