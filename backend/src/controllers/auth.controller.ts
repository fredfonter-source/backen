import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../db/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';

export const authController: Record<string, RequestHandler> = {
  signIn: async (req, res, next) => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new HttpError(401, 'Invalid credentials');

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) throw new HttpError(401, 'Invalid credentials');

      const token = jwt.sign(
        { sub: user.id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: '7d' },
      );

      return res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role, status: user.status },
      });
    } catch (e) {
      return next(e);
    }
  },
};

