import type { RequestHandler } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError, assertHttpsUrl } from '../utils/http.js';

export const liveChannelsController: Record<string, RequestHandler> = {
  list: async (_req, res, next) => {
    try {
      const channels = await prisma.liveChannel.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.json(channels);
    } catch (e) {
      return next(e);
    }
  },
  get: async (req, res, next) => {
    try {
      const channel = await prisma.liveChannel.findUnique({
        where: { id: req.params.id },
      });
      if (!channel) throw new HttpError(404, 'Channel not found');
      return res.json(channel);
    } catch (e) {
      return next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const body = req.body as any;
      assertHttpsUrl(body.streamUrl);
      const created = await prisma.liveChannel.create({
        data: {
          name: body.name,
          logoUrl: body.logoUrl ?? null,
          streamUrl: body.streamUrl,
          category: body.category,
          status: body.status,
        },
      });
      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const body = req.body as any;
      assertHttpsUrl(body.streamUrl);
      const id = req.params.id;
      const exists = await prisma.liveChannel.findUnique({ where: { id } });
      if (!exists) throw new HttpError(404, 'Channel not found');
      const updated = await prisma.liveChannel.update({
        where: { id },
        data: {
          name: body.name,
          logoUrl: body.logoUrl ?? null,
          streamUrl: body.streamUrl,
          category: body.category,
          status: body.status,
        },
      });
      return res.json(updated);
    } catch (e) {
      return next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      await prisma.liveChannel.delete({ where: { id: req.params.id } });
      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  },
};

