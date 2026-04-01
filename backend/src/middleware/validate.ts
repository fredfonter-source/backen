import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { HttpError } from '../utils/http.js';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new HttpError(400, 'Validation error', parsed.error.flatten()));
    }
    req.body = parsed.data;
    return next();
  };
}

