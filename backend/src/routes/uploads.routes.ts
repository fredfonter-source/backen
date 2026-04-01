import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { uploadDirAbsolute, publicFileUrl } from '../config/uploads.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { HttpError } from '../utils/http.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirAbsolute),
  filename: (_req, file, cb) => {
    const safeBase = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeBase}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const uploadRoutes = Router();

uploadRoutes.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'RESELLER']),
  upload.single('file'),
  (req, res, next) => {
    try {
      const file = req.file;
      if (!file) throw new HttpError(400, 'Missing file');
      const relative = `uploads/${file.filename}`;
      return res.json({
        path: relative,
        url: publicFileUrl(relative),
      });
    } catch (e) {
      return next(e);
    }
  },
);

