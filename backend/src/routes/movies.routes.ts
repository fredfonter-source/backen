import { Router } from 'express';
import { z } from 'zod';

import { moviesController } from '../controllers/movies.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const qualitySchema = z.object({
  label: z.string().min(2).max(16),
  hlsUrl: z.string().url(),
});

const subtitleSchema = z.object({
  language: z.string().min(2).max(16),
  url: z.string().url(),
});

const movieSchema = z.object({
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
  durationMinutes: z.number().int().positive().optional().nullable(),
  maturityRating: z.string().max(16).optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  access: z.enum(['FREE', 'PAID']).default('FREE'),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  seoKeywords: z.string().max(512).optional().nullable(),
  qualities: z.array(qualitySchema).default([]),
  subtitles: z.array(subtitleSchema).default([]),
});

export const movieRoutes = Router();

movieRoutes.get('/', requireAuth, requireRole(['ADMIN', 'RESELLER']), moviesController.list);
movieRoutes.get('/:id', requireAuth, requireRole(['ADMIN', 'RESELLER']), moviesController.get);
movieRoutes.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(movieSchema),
  moviesController.create,
);
movieRoutes.put(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  validateBody(movieSchema),
  moviesController.update,
);
movieRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  moviesController.remove,
);

