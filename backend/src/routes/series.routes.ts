import { Router } from 'express';
import { z } from 'zod';

import { seriesController } from '../controllers/series.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const seriesSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(8000),
  posterUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  trailerUrl: z.string().url().optional().nullable(),
  imdbId: z.string().optional().nullable(),
  genres: z.array(z.string().min(1).max(64)).default([]),
  language: z.string().min(1).max(64),
  actors: z.array(z.string().min(1).max(128)).default([]),
  directors: z.array(z.string().min(1).max(128)).default([]),
  releaseDate: z.string().datetime().optional().nullable(),
  maturityRating: z.string().max(16).optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  access: z.enum(['FREE', 'PAID']).default('FREE'),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  seoKeywords: z.string().max(512).optional().nullable(),
});

const seasonSchema = z.object({
  seasonNumber: z.number().int().min(1).max(200),
  title: z.string().max(200).optional().nullable(),
});

const qualitySchema = z.object({
  label: z.string().min(2).max(16),
  hlsUrl: z.string().url(),
});

const subtitleSchema = z.object({
  language: z.string().min(2).max(16),
  url: z.string().url(),
});

const episodeSchema = z.object({
  episodeNumber: z.number().int().min(1).max(5000),
  title: z.string().min(1).max(200),
  description: z.string().max(8000).optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  durationMinutes: z.number().int().positive().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  access: z.enum(['FREE', 'PAID']).default('FREE'),
  qualities: z.array(qualitySchema).default([]),
  subtitles: z.array(subtitleSchema).default([]),
});

export const seriesRoutes = Router();

seriesRoutes.get(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  seriesController.list,
);
seriesRoutes.get(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  seriesController.get,
);
seriesRoutes.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(seriesSchema),
  seriesController.create,
);
seriesRoutes.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(seriesSchema),
  seriesController.update,
);
seriesRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  seriesController.remove,
);

// Seasons & episodes
seriesRoutes.post(
  '/:seriesId/seasons',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(seasonSchema),
  seriesController.addSeason,
);
seriesRoutes.post(
  '/seasons/:seasonId/episodes',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(episodeSchema),
  seriesController.addEpisode,
);
seriesRoutes.put(
  '/episodes/:episodeId',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(episodeSchema),
  seriesController.updateEpisode,
);
seriesRoutes.delete(
  '/episodes/:episodeId',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  seriesController.removeEpisode,
);

