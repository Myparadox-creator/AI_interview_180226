
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Testing DB Create...');
    const feedbackData = {
        score: 85,
        metrics: [
            { id: "clarity", label: "Clarity", value: 90, color: "green", feedback: "Clear" }
        ],
        summary: "Good job",
        questionFeedback: []
    };

    try {
        const interview = await prisma.interview.create({
            data: {
                topic: "behavioral",
                score: 85,
                feedback: feedbackData,
            },
        });
        console.log('Successfully created interview:', interview.id);
    } catch (e) {
        console.error('Failed to create interview:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
