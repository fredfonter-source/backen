import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';

export type JwtUser = {
  sub: string;
  role: 'ADMIN' | 'RESELLER' | 'USER';
};

declare global {
  // eslint-disable-next-line no-var
  var __jwtUser: JwtUser | undefined;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing Authorization header'));
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtUser;
    (req as any).user = payload;
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid token'));
  }
}

export function requireRole(roles: JwtUser['role'][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtUser | undefined;
    if (!user) return next(new HttpError(401, 'Unauthorized'));
    if (!roles.includes(user.role)) return next(new HttpError(403, 'Forbidden'));
    return next();
  };
}

