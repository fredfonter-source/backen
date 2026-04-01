import { Router } from 'express';
import { z } from 'zod';

import { footballMatchesController } from '../controllers/football_matches.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const serverSchema = z.object({
  name: z.string().min(1).max(64),
  hlsUrl: z.string().url(),
});

const matchSchema = z.object({
  league: z.string().min(1).max(128),
  team1Name: z.string().min(1).max(128),
  team1LogoUrl: z.string().url().optional().nullable(),
  team2Name: z.string().min(1).max(128),
  team2LogoUrl: z.string().url().optional().nullable(),
  startsAt: z.string().datetime(),
  bannerUrl: z.string().url().optional().nullable(),
  description: z.string().max(8000).optional().nullable(),
  status: z.enum(['UPCOMING', 'LIVE', 'FINISHED']).default('UPCOMING'),
  servers: z.array(serverSchema).default([]),
});

export const footballMatchRoutes = Router();

footballMatchRoutes.get(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  footballMatchesController.list,
);
footballMatchRoutes.get(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  footballMatchesController.get,
);
footballMatchRoutes.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(matchSchema),
  footballMatchesController.create,
);
footballMatchRoutes.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(matchSchema),
  footballMatchesController.update,
);
footballMatchRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  footballMatchesController.remove,
);

