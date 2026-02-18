'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

// Type definition matching the one in simulation.ts
export interface FeedbackResult {
    score: number;
    metrics: {
        id: string;
        label: string;
        value: number;
        color: string;
        feedback: string;
    }[];
    summary: string;
    questionFeedback: {
        question: string;
        userAnswer: string;
        score: number;
        feedback: string;
        idealAnswer: string;
    }[];
}

export interface InterviewSession {
    id?: string; // Optional for creation
    date: string;
    topic: string;
    feedback: FeedbackResult;
    score?: number; // Optional because it might be derived or missing in some contexts
}

export type ServerActionResult =
    | { success: true; id: string }
    | { success: false; error: string };

export async function createInterview(data: InterviewSession): Promise<ServerActionResult> {
    console.log('Server Action: createInterview called with topic:', data.topic);
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Generate a MongoDB-compatible ObjectId (Timestamp + Random)
        const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
        const random = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const objectId = timestamp + random;

        const now = new Date().toISOString();

        // Use runCommandRaw to bypass implicit transactions in single-node MongoDB
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$runCommandRaw({
            insert: "Interview",
            documents: [{
                _id: { "$oid": objectId },
                topic: data.topic,
                score: data.feedback.score,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                feedback: data.feedback as any,
                date: { "$date": now },
                createdAt: { "$date": now },
                updatedAt: { "$date": now },
                userId: userId
            }]
        });

        const interview = { id: objectId }; // Mock the return object needed

        console.log('Interview saved successfully:', interview.id);
        revalidatePath('/dashboard');
        return { success: true, id: interview.id };
    } catch (error) {
        console.error('Failed to create interview. Full error:', error);
        // Log environment variable presence
        console.error('DATABASE_URL present:', !!process.env.DATABASE_URL);
        return { success: false, error: 'Failed to save interview: ' + (error instanceof Error ? error.message : String(error)) };
    }
}

export async function getInterviews(): Promise<InterviewSession[]> {
    try {
        const { userId } = await auth();
        if (!userId) return [];

        const interviews = await prisma.interview.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return interviews.map((interview: any) => ({
            id: interview.id,
            date: interview.createdAt.toISOString(),
            topic: interview.topic,
            feedback: interview.feedback as unknown as FeedbackResult,
            score: interview.score
        }));
    } catch (error) {
        console.error('Failed to get interviews:', error);
        return [];
    }
}

export async function getInterview(id: string) {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        const interview = await prisma.interview.findUnique({
            where: { id },
        });

        if (!interview) return null;

        // Optional: strict check to ensure user owns this interview
        if (interview.userId !== userId) {
            console.log('Unauthorized access to interview', id);
            return null;
        }

        return {
            id: interview.id,
            date: interview.createdAt.toISOString(),
            topic: interview.topic,
            feedback: interview.feedback as unknown as FeedbackResult,
            score: interview.score
        };
    } catch (error) {
        console.error('Failed to get interview:', error);
        return null;
    }
}
