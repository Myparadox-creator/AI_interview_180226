import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

console.log('DEBUG: lib/prisma.ts initializing');
console.log('DEBUG: DATABASE_URL is', process.env.DATABASE_URL ? 'DEFINED' : 'MISSING');

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
