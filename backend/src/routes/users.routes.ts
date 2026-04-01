import { Router } from 'express';
import { z } from 'zod';

import { usersController } from '../controllers/users.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().max(200).optional().nullable(),
  role: z.enum(['ADMIN', 'RESELLER', 'USER']).default('USER'),
  resellerId: z.string().optional().nullable(),
  planId: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'EXPIRED']).default('ACTIVE'),
});

const updateUserSchema = z.object({
  name: z.string().max(200).optional().nullable(),
  planId: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'EXPIRED']).default('ACTIVE'),
});

export const userRoutes = Router();

userRoutes.get('/', requireAuth, requireRole(['ADMIN', 'RESELLER']), usersController.list);
userRoutes.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(createUserSchema),
  usersController.create,
);
userRoutes.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(updateUserSchema),
  usersController.update,
);
userRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  usersController.remove,
);

