import type { RequestHandler } from 'express';
import { prisma } from '../db/prisma.js';

export const settingsController: Record<string, RequestHandler> = {
  get: async (_req, res, next) => {
    try {
      const settings = await prisma.appSettings.upsert({
        where: { id: 'global' },
        create: { id: 'global' },
        update: {},
      });
      return res.json(settings);
    } catch (e) {
      return next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const body = req.body as any;
      const updated = await prisma.appSettings.upsert({
        where: { id: 'global' },
        create: {
          id: 'global',
          tmdbApiKey: body.tmdbApiKey ?? null,
          applovinSdkKey: body.applovinSdkKey ?? null,
          applovinBannerAdUnitId: body.applovinBannerAdUnitId ?? null,
          applovinRewardedAdUnitId: body.applovinRewardedAdUnitId ?? null,
          applovinInterstitialAdUnitId: body.applovinInterstitialAdUnitId ?? null,
          notificationsEnabled: body.notificationsEnabled ?? true,
          generalJson: body.generalJson ?? null,
        },
        update: {
          tmdbApiKey: body.tmdbApiKey ?? null,
          applovinSdkKey: body.applovinSdkKey ?? null,
          applovinBannerAdUnitId: body.applovinBannerAdUnitId ?? null,
          applovinRewardedAdUnitId: body.applovinRewardedAdUnitId ?? null,
          applovinInterstitialAdUnitId: body.applovinInterstitialAdUnitId ?? null,
          notificationsEnabled: body.notificationsEnabled ?? true,
          generalJson: body.generalJson ?? null,
        },
      });
      return res.json(updated);
    } catch (e) {
      return next(e);
    }
  },
};

