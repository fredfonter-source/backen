import type { RequestHandler } from 'express';
import { prisma } from '../db/prisma.js';

export const publicController: Record<string, RequestHandler> = {
  trendingMovies: async (_req, res, next) => {
    try {
      const movies = await prisma.movie.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 40,
        include: { qualities: true, subtitles: true },
      });
      return res.json(movies);
    } catch (e) {
      return next(e);
    }
  },

  liveChannels: async (_req, res, next) => {
    try {
      const channels = await prisma.liveChannel.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 60,
      });
      return res.json(channels);
    } catch (e) {
      return next(e);
    }
  },

  liveMatches: async (_req, res, next) => {
    try {
      const matches = await prisma.footballMatch.findMany({
        orderBy: { startsAt: 'asc' },
        take: 60,
        include: { servers: true },
      });
      return res.json(matches);
    } catch (e) {
      return next(e);
    }
  },

  movieDetails: async (req, res, next) => {
    try {
      const movie = await prisma.movie.findUnique({
        where: { id: req.params.id },
        include: { qualities: true, subtitles: true },
      });
      if (!movie || movie.status !== 'PUBLISHED') return res.status(404).json({ error: 'Not found' });
      return res.json(movie);
    } catch (e) {
      return next(e);
    }
  },

  searchMovies: async (req, res, next) => {
    try {
      const q = String(req.query.query ?? '').trim();
      if (!q) return res.json([]);
      if (q.length > 80) return res.json([]);

      const movies = await prisma.movie.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { genres: { has: q } },
            { language: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 40,
        include: { qualities: true, subtitles: true },
      });
      return res.json(movies);
    } catch (e) {
      return next(e);
    }
  },
};

