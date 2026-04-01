import type { RequestHandler } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/http.js';

export const plansController: Record<string, RequestHandler> = {
  list: async (_req, res, next) => {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.json(plans);
    } catch (e) {
      return next(e);
    }
  },
  get: async (req, res, next) => {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: req.params.id },
      });
      if (!plan) throw new HttpError(404, 'Plan not found');
      return res.json(plan);
    } catch (e) {
      return next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const body = req.body as any;
      const created = await prisma.subscriptionPlan.create({
        data: {
          name: body.name,
          durationDays: body.durationDays,
          priceCents: body.priceCents,
          deviceLimit: body.deviceLimit,
          adsEnabled: body.adsEnabled,
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
      const id = req.params.id;
      const exists = await prisma.subscriptionPlan.findUnique({ where: { id } });
      if (!exists) throw new HttpError(404, 'Plan not found');
      const updated = await prisma.subscriptionPlan.update({
        where: { id },
        data: {
          name: body.name,
          durationDays: body.durationDays,
          priceCents: body.priceCents,
          deviceLimit: body.deviceLimit,
          adsEnabled: body.adsEnabled,
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
      await prisma.subscriptionPlan.delete({ where: { id: req.params.id } });
      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  },
};

