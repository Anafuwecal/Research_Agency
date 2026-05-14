import { Request, Response, NextFunction } from 'express';
import { auth, isFirebaseEnabled, requireFirebase } from '../config/firebase.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function verifyTokenFromString(token: string): Promise<string> {
  try {
    requireFirebase('Authentication');
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error: any) {
    console.error('Token verification error:', error);
    throw new Error('Invalid or expired token');
  }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!isFirebaseEnabled) {
      return res.status(503).json({ 
        error: 'Authentication service unavailable',
        message: 'Firebase is not configured. Please contact administrator.'
      });
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    const decodedToken = await auth.verifyIdToken(token);
    req.userId = decodedToken.uid;
    
    next();
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid token',
      details: error.message 
    });
  }
}

// Optional auth - doesn't fail if no token
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!isFirebaseEnabled) {
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      req.userId = decodedToken.uid;
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without userId
    next();
  }
}