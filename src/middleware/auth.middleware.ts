import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.util';
import { UserRole } from '../types/user.types';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: UserRole;
    kebeleId?: number;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = JwtUtil.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

export const roleGuard = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};
