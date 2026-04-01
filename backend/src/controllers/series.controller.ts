import type { RequestHandler } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError, assertHttpsUrl } from '../utils/http.js';

export const seriesController: Record<string, RequestHandler> = {
  list: async (_req, res, next) => {
    try {
      const series = await prisma.series.findMany({
        orderBy: { createdAt: 'desc' },
        include: { seasons: { include: { episodes: true } } },
      });
      return res.json(series);
    } catch (e) {
      return next(e);
    }
  },
  get: async (req, res, next) => {
    try {
      const series = await prisma.series.findUnique({
        where: { id: req.params.id },
        include: {
          seasons: {
            orderBy: { seasonNumber: 'asc' },
            include: {
              episodes: {
                orderBy: { episodeNumber: 'asc' },
                include: { qualities: true, subtitles: true },
              },
            },
          },
        },
      });
      if (!series) throw new HttpError(404, 'Series not found');
      return res.json(series);
    } catch (e) {
      return next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const body = req.body as any;
      if (body.trailerUrl) assertHttpsUrl(body.trailerUrl);
      const created = await prisma.series.create({
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
          maturityRating: body.maturityRating ?? null,
          status: body.status,
          access: body.access,
          seoTitle: body.seoTitle ?? null,
          seoDescription: body.seoDescription ?? null,
          seoKeywords: body.seoKeywords ?? null,
        },
      });
      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const id = req.params.id;
      const body = req.body as any;
      if (body.trailerUrl) assertHttpsUrl(body.trailerUrl);
      const exists = await prisma.series.findUnique({ where: { id } });
      if (!exists) throw new HttpError(404, 'Series not found');
      const updated = await prisma.series.update({
        where: { id },
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
          maturityRating: body.maturityRating ?? null,
          status: body.status,
          access: body.access,
          seoTitle: body.seoTitle ?? null,
          seoDescription: body.seoDescription ?? null,
          seoKeywords: body.seoKeywords ?? null,
        },
      });
      return res.json(updated);
    } catch (e) {
      return next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      await prisma.series.delete({ where: { id: req.params.id } });
      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  },

  addSeason: async (req, res, next) => {
    try {
      const { seriesId } = req.params;
      const body = req.body as any;
      const created = await prisma.season.create({
        data: {
          seriesId,
          seasonNumber: body.seasonNumber,
          title: body.title ?? null,
        },
      });
      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  },

  addEpisode: async (req, res, next) => {
    try {
      const { seasonId } = req.params;
      const body = req.body as any;
      for (const q of body.qualities ?? []) assertHttpsUrl(q.hlsUrl);
      for (const s of body.subtitles ?? []) assertHttpsUrl(s.url);
      const created = await prisma.episode.create({
        data: {
          seasonId,
          episodeNumber: body.episodeNumber,
          title: body.title,
          description: body.description ?? null,
          thumbnailUrl: body.thumbnailUrl ?? null,
          durationMinutes: body.durationMinutes ?? null,
          status: body.status,
          access: body.access,
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

  updateEpisode: async (req, res, next) => {
    try {
      const { episodeId } = req.params;
      const body = req.body as any;
      for (const q of body.qualities ?? []) assertHttpsUrl(q.hlsUrl);
      for (const s of body.subtitles ?? []) assertHttpsUrl(s.url);
      const exists = await prisma.episode.findUnique({ where: { id: episodeId } });
      if (!exists) throw new HttpError(404, 'Episode not found');

      await prisma.episode.update({
        where: { id: episodeId },
        data: {
          episodeNumber: body.episodeNumber,
          title: body.title,
          description: body.description ?? null,
          thumbnailUrl: body.thumbnailUrl ?? null,
          durationMinutes: body.durationMinutes ?? null,
          status: body.status,
          access: body.access,
        },
      });

      await prisma.episodeQuality.deleteMany({ where: { episodeId } });
      await prisma.episodeSubtitle.deleteMany({ where: { episodeId } });
      if (body.qualities?.length) {
        await prisma.episodeQuality.createMany({
          data: body.qualities.map((q: any) => ({
            episodeId,
            label: q.label,
            hlsUrl: q.hlsUrl,
          })),
        });
      }
      if (body.subtitles?.length) {
        await prisma.episodeSubtitle.createMany({
          data: body.subtitles.map((s: any) => ({
            episodeId,
            language: s.language,
            url: s.url,
          })),
        });
      }

      const reloaded = await prisma.episode.findUnique({
        where: { id: episodeId },
        include: { qualities: true, subtitles: true },
      });
      return res.json(reloaded);
    } catch (e) {
      return next(e);
    }
  },

  removeEpisode: async (req, res, next) => {
    try {
      await prisma.episode.delete({ where: { id: req.params.episodeId } });
      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  },
};

