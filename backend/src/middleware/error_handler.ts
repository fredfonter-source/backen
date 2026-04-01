import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/http.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.headers['x-request-id'];

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details ?? null,
      requestId: requestId ?? null,
    });
  }

  // Avoid leaking internals in production.
  return res.status(500).json({
    error: 'Internal server error',
    requestId: requestId ?? null,
  });
};

