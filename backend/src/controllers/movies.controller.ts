import type { RequestHandler } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError, assertHttpsUrl } from '../utils/http.js';

export const moviesController: Record<string, RequestHandler> = {
  list: async (_req, res, next) => {
    try {
      const movies = await prisma.movie.findMany({
        orderBy: { createdAt: 'desc' },
        include: { qualities: true, subtitles: true },
      });
      return res.json(movies);
    } catch (e) {
      return next(e);
    }
  },

  get: async (req, res, next) => {
    try {
      const movie = await prisma.movie.findUnique({
        where: { id: req.params.id },
        include: { qualities: true, subtitles: true },
      });
      if (!movie) throw new HttpError(404, 'Movie not found');
      return res.json(movie);
    } catch (e) {
      return next(e);
    }
  },

  create: async (req, res, next) => {
    try {
      const body = req.body as any;
      for (const q of body.qualities ?? []) assertHttpsUrl(q.hlsUrl);
      for (const s of body.subtitles ?? []) assertHttpsUrl(s.url);
      if (body.trailerUrl) assertHttpsUrl(body.trailerUrl);

      const created = await prisma.movie.create({
        data: {
          title: body.title,
          description: body.description,
          posterUrl: body.posterUrl ?? null,
          thumbnailUrl: body.thumbnailUrl ?? null,
          trailerUrl: body.trailerUrl ?? null,
          imdbId: body.imdbId ?? null,
          genres: body.genres ?? [],
          language: body.language,
          actors: body.actors ?? [],
          directors: body.directors ?? [],
          releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
          durationMinutes: body.durationMinutes ?? null,
          maturityRating: body.maturityRating ?? null,
          status: body.status,
          access: body.access,
          seoTitle: body.seoTitle ?? null,
          seoDescription: body.seoDescription ?? null,
          seoKeywords: body.seoKeywords ?? null,
          qualities: {
            create: (body.qualities ?? []).map((q: any) => ({
              label: q.label,
              hlsUrl: q.hlsUrl,
            })),
          },
          subtitles: {
            create: (body.subtitles ?? []).map((s: any) => ({
              language: s.language,
              url: s.url,
            })),
          },
        },
        include: { qualities: true, subtitles: true },
      });
      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  },

  update: async (req, res, next) => {
    try {
      const body = req.body as any;
      for (const q of body.qualities ?? []) assertHttpsUrl(q.hlsUrl);
      for (const s of body.subtitles ?? []) assertHttpsUrl(s.url);
      if (body.trailerUrl) assertHttpsUrl(body.trailerUrl);

      const movieId = req.params.id;
      const exists = await prisma.movie.findUnique({ where: { id: movieId } });
      if (!exists) throw new HttpError(404, 'Movie not found');

      const updated = await prisma.movie.update({
        where: { id: movieId },
        data: {
          title: body.title,
          description: body.description,
          posterUrl: body.posterUrl ?? null,
          thumbnailUrl: body.thumbnailUrl ?? null,
          trailerUrl: body.trailerUrl ?? null,
          imdbId: body.imdbId ?? null,
          genres: body.genres ?? [],
          language: body.language,
          actors: body.actors ?? [],
          directors: body.directors ?? [],
          releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
          durationMinutes: body.durationMinutes ?? null,
          maturityRating: body.maturityRating ?? null,
          status: body.status,
          access: body.access,
          seoTitle: body.seoTitle ?? null,
          seoDescription: body.seoDescription ?? null,
          seoKeywords: body.seoKeywords ?? null,
        },
        include: { qualities: true, subtitles: true },
      });

      // Replace qualities/subtitles by full overwrite (simpler for admin panel).
      await prisma.movieQuality.deleteMany({ where: { movieId } });
      await prisma.movieSubtitle.deleteMany({ where: { movieId } });
      if (body.qualities?.length) {
        await prisma.movieQuality.createMany({
          data: body.qualities.map((q: any) => ({
            movieId,
            label: q.label,
            hlsUrl: q.hlsUrl,
          })),
        });
      }
      if (body.subtitles?.length) {
        await prisma.movieSubtitle.createMany({
          data: body.subtitles.map((s: any) => ({
            movieId,
            language: s.language,
            url: s.url,
          })),
        });
      }

      const reloaded = await prisma.movie.findUnique({
        where: { id: movieId },
        include: { qualities: true, subtitles: true },
      });
      return res.json(reloaded);
    } catch (e) {
      return next(e);
    }
  },

  remove: async (req, res, next) => {
    try {
      await prisma.movie.delete({ where: { id: req.params.id } });
      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  },
};

