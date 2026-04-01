import { Router } from 'express';
import { z } from 'zod';

import { liveChannelsController } from '../controllers/live_channels.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const channelSchema = z.object({
  name: z.string().min(1).max(200),
  logoUrl: z.string().url().optional().nullable(),
  streamUrl: z.string().url(),
  category: z.string().min(1).max(64),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});

export const liveChannelRoutes = Router();

liveChannelRoutes.get(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  liveChannelsController.list,
);
liveChannelRoutes.get(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  liveChannelsController.get,
);
liveChannelRoutes.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(channelSchema),
  liveChannelsController.create,
);
liveChannelRoutes.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(channelSchema),
  liveChannelsController.update,
);
liveChannelRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  liveChannelsController.remove,
);

