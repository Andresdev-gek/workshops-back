import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string(),
  MONGODB_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('1h'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;
