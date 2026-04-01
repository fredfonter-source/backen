import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';

import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/http.js';
import type { JwtUser } from '../middleware/auth.js';

function actor(req: any): JwtUser {
  return req.user as JwtUser;
}

export const usersController: Record<string, RequestHandler> = {
  list: async (req, res, next) => {
    try {
      const a = actor(req);
      const where =
        a.role === 'RESELLER' ? { resellerId: a.sub } : undefined;
      const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          expiresAt: true,
          planId: true,
          resellerId: true,
          createdAt: true,
        },
      });
      return res.json(users);
    } catch (e) {
      return next(e);
    }
  },

  create: async (req, res, next) => {
    try {
      const a = actor(req);
      const body = req.body as any;

      const role = body.role as 'USER' | 'RESELLER' | 'ADMIN';
      if (a.role === 'RESELLER' && role !== 'USER') {
        throw new HttpError(403, 'Resellers can only create USER accounts');
      }

      const passwordHash = await bcrypt.hash(body.password, 12);

      const created = await prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          name: body.name ?? null,
          role: role ?? 'USER',
          resellerId: a.role === 'RESELLER' ? a.sub : body.resellerId ?? null,
          status: body.status,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          planId: body.planId ?? null,
        },
        select: { id: true, email: true, role: true, status: true, expiresAt: true, planId: true },
      });

      return res.status(201).json(created);
    } catch (e) {
      return next(e);
    }
  },

  update: async (req, res, next) => {
    try {
      const a = actor(req);
      const id = req.params.id;
      const body = req.body as any;

      const target = await prisma.user.findUnique({ where: { id } });
      if (!target) throw new HttpError(404, 'User not found');

      if (a.role === 'RESELLER' && target.resellerId !== a.sub) {
        throw new HttpError(403, 'Forbidden');
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          name: body.name ?? null,
          status: body.status,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          planId: body.planId ?? null,
        },
        select: { id: true, email: true, role: true, status: true, expiresAt: true, planId: true },
      });
      return res.json(updated);
    } catch (e) {
      return next(e);
    }
  },

  remove: async (req, res, next) => {
    try {
      const a = actor(req);
      const id = req.params.id;
      const target = await prisma.user.findUnique({ where: { id } });
      if (!target) throw new HttpError(404, 'User not found');
      if (a.role === 'RESELLER' && target.resellerId !== a.sub) {
        throw new HttpError(403, 'Forbidden');
      }
      await prisma.user.delete({ where: { id } });
      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  },
};

