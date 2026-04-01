import type { RequestHandler } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError, assertHttpsUrl } from '../utils/http.js';

export const footballMatchesController: Record<string, RequestHandler> = {
  list: async (_req, res, next) => {
    try {
      const matches = await prisma.footballMatch.findMany({
        orderBy: { startsAt: 'desc' },
        include: { servers: true },
      });
      return res.json(matches);
    } catch (e) {
      return next(e);
    }
  },
  get: async (req, res, next) => {
    try {
      const match = await prisma.footballMatch.findUnique({
        where: { id: req.params.id },
        include: { servers: true },
      });
      if (!match) throw new HttpError(404, 'Match not found');
      return res.json(match);
    } catch (e) {
      return next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const body = req.body as any;
      for (const s of body.servers ?? []) assertHttpsUrl(s.hlsUrl);
      const created = await prisma.footballMatch.create({
        data: {
          league: body.league,
          team1Name: body.team1Name,
          team1LogoUrl: body.team1LogoUrl ?? null,
          team2Name: body.team2Name,
          team2LogoUrl: body.team2LogoUrl ?? null,
          startsAt: new Date(body.startsAt),
          bannerUrl: body.bannerUrl ?? null,
          description: body.description ?? null,
          status: body.status,
          servers: {
            create: (body.servers ?? []).map((s: any) => ({
              name: s.name,
              hlsUrl: s.hlsUrl,
            })),
          },
        },
        include: { servers: true },
      });
      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const body = req.body as any;
      for (const s of body.servers ?? []) assertHttpsUrl(s.hlsUrl);
      const matchId = req.params.id;
      const exists = await prisma.footballMatch.findUnique({
        where: { id: matchId },
      });
      if (!exists) throw new HttpError(404, 'Match not found');

      await prisma.footballMatch.update({
        where: { id: matchId },
        data: {
          league: body.league,
          team1Name: body.team1Name,
          team1LogoUrl: body.team1LogoUrl ?? null,
          team2Name: body.team2Name,
          team2LogoUrl: body.team2LogoUrl ?? null,
          startsAt: new Date(body.startsAt),
          bannerUrl: body.bannerUrl ?? null,
          description: body.description ?? null,
          status: body.status,
        },
      });

      await prisma.matchServer.deleteMany({ where: { matchId } });
      if (body.servers?.length) {
        await prisma.matchServer.createMany({
          data: body.servers.map((s: any) => ({
            matchId,
            name: s.name,
            hlsUrl: s.hlsUrl,
          })),
        });
      }

      const reloaded = await prisma.footballMatch.findUnique({
        where: { id: matchId },
        include: { servers: true },
      });
      return res.json(reloaded);
    } catch (e) {
      return next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      await prisma.footballMatch.delete({ where: { id: req.params.id } });
      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  },
};

