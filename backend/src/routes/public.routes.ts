import { Router } from 'express';
import { publicController } from '../controllers/public.controller.js';

export const publicRoutes = Router();

// App-facing endpoints (read-only). Keep them fast and cacheable.
publicRoutes.get('/trending/movies', publicController.trendingMovies);
publicRoutes.get('/live/channels', publicController.liveChannels);
publicRoutes.get('/sports/live-matches', publicController.liveMatches);
publicRoutes.get('/movies/:id', publicController.movieDetails);
publicRoutes.get('/search', publicController.searchMovies);

