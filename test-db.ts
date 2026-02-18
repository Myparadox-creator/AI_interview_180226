import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "mongodb://localhost:27017/interview-prep?directConnection=true"
        }
    }
});

async function main() {
    try {
        console.log("Attempting to create interview...");
        const id = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        console.log("Generated ID:", id);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await prisma.$runCommandRaw({
            insert: "Interview",
            documents: [{
                _id: { "$oid": id },
                topic: "test-topic",
                score: 100,
                feedback: { message: "test" },
                date: { "$date": new Date().toISOString() },
                createdAt: { "$date": new Date().toISOString() },
                updatedAt: { "$date": new Date().toISOString() }
            }]
        });
        console.log("Success with runCommandRaw:", result);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
