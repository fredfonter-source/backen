import { Router } from 'express';
import { z } from 'zod';

import { settingsController } from '../controllers/settings.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const settingsSchema = z.object({
  tmdbApiKey: z.string().optional().nullable(),
  applovinSdkKey: z.string().optional().nullable(),
  applovinBannerAdUnitId: z.string().optional().nullable(),
  applovinRewardedAdUnitId: z.string().optional().nullable(),
  applovinInterstitialAdUnitId: z.string().optional().nullable(),
  notificationsEnabled: z.boolean().optional(),
  generalJson: z.unknown().optional().nullable(),
});

export const settingsRoutes = Router();

settingsRoutes.get('/', requireAuth, requireRole(['ADMIN']), settingsController.get);
settingsRoutes.put(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  validateBody(settingsSchema),
  settingsController.update,
);

