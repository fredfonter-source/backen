import { Router } from 'express';

import { authRoutes } from './auth.routes.js';
import { movieRoutes } from './movies.routes.js';
import { seriesRoutes } from './series.routes.js';
import { liveChannelRoutes } from './live_channels.routes.js';
import { footballMatchRoutes } from './football_matches.routes.js';
import { userRoutes } from './users.routes.js';
import { planRoutes } from './plans.routes.js';
import { settingsRoutes } from './settings.routes.js';
import { uploadRoutes } from './uploads.routes.js';
import { publicRoutes } from './public.routes.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/uploads', uploadRoutes);
routes.use('/public', publicRoutes);

routes.use('/movies', movieRoutes);
routes.use('/series', seriesRoutes);
routes.use('/live-channels', liveChannelRoutes);
routes.use('/football-matches', footballMatchRoutes);
routes.use('/users', userRoutes);
routes.use('/plans', planRoutes);
routes.use('/settings', settingsRoutes);

