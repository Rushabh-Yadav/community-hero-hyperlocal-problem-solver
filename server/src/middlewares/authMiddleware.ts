import { Request, Response, NextFunction } from 'express';
import { auth, isMock } from '../config/firebase.js';

// Extend Express Request object to hold user details
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: 'citizen' | 'moderator' | 'officer' | 'admin';
    name: string;
    department?: string;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized. Missing or malformed token.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (isMock) {
      if (token.startsWith('mock-token-')) {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
        return;
      }
      res.status(401).json({ error: 'Invalid mock token provided.' });
      return;
    }

    // Real Firebase ID Token Verification
    const decodedToken = await auth.verifyIdToken(token);
    
    // Fetch custom claims for role validation
    const userRecord = await auth.getUser(decodedToken.uid);
    const role = userRecord.customClaims?.role || 'citizen';
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: role as 'citizen' | 'moderator' | 'officer' | 'admin',
      name: decodedToken.name || userRecord.displayName || 'Anonymous Citizen',
      department: userRecord.customClaims?.department
    };

    next();
  } catch (error: any) {
    console.error('Authentication Error:', error.message || error);
    res.status(401).json({ error: 'Unauthorized. Token verification failed.' });
  }
};

export const requireRole = (allowedRoles: ('citizen' | 'moderator' | 'officer' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. User authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: `Forbidden. Requires one of the following roles: ${allowedRoles.join(', ')}` });
      return;
    }

    next();
  };
};
