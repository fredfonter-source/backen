import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';

import { env } from './config/env.js';
import { uploadDirAbsolute } from './config/uploads.js';
import { errorHandler } from './middleware/error_handler.js';
import { routes } from './routes/index.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

app.use('/uploads', express.static(path.resolve(uploadDirAbsolute)));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', routes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${env.PORT}`);
});

