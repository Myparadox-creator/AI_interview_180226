
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Testing DB Read...');
    try {
        const interviews = await prisma.interview.findMany();
        console.log('Successfully read interviews:', interviews.length);
    } catch (e) {
        console.error('Failed to read interviews:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
