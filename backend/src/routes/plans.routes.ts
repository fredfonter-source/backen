import { Router } from 'express';
import { z } from 'zod';

import { plansController } from '../controllers/plans.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const planSchema = z.object({
  name: z.string().min(1).max(200),
  durationDays: z.number().int().positive(),
  priceCents: z.number().int().min(0),
  deviceLimit: z.number().int().min(1).max(20),
  adsEnabled: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});

export const planRoutes = Router();

planRoutes.get('/', requireAuth, requireRole(['ADMIN']), plansController.list);
planRoutes.get('/:id', requireAuth, requireRole(['ADMIN']), plansController.get);
planRoutes.post(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  validateBody(planSchema),
  plansController.create,
);
planRoutes.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN']),
  validateBody(planSchema),
  plansController.update,
);
planRoutes.delete('/:id', requireAuth, requireRole(['ADMIN']), plansController.remove);

