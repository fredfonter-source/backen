import path from 'node:path';
import { env } from './env.js';

export const uploadDirAbsolute = path.resolve(process.cwd(), env.UPLOAD_DIR);

export function publicFileUrl(relativePath: string) {
  const base = env.PUBLIC_BASE_URL.replace(/\/+$/, '');
  const rel = relativePath.replace(/^\/+/, '');
  return `${base}/${rel}`;
}

