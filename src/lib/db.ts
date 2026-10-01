import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function resolveDatabaseUrl(): string {
  // If user configured remote PostgreSQL / Supabase / Neon, respect it
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  const isServerless =
    process.env.VERCEL === '1' ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.LAMBDA_TASK_ROOT);

  if (isServerless) {
    const tmpDbPath = '/tmp/careerpilot.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.resolve('prisma/dev.db'),
      ];
      for (const cand of candidates) {
        try {
          if (fs.existsSync(/*turbopackIgnore: true*/ cand)) {
            fs.copyFileSync(cand, tmpDbPath);
            break;
          }
        } catch {
          // continue checking other candidates
        }
      }
    }
    const resolved = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = resolved;
    return resolved;
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db';
  }
  return process.env.DATABASE_URL;
}

resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
