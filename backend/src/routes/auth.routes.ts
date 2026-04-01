import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authController } from '../controllers/auth.controller.js';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const authRoutes = Router();

authRoutes.post('/sign-in', validateBody(signInSchema), authController.signIn);

