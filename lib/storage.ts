/**
 * @deprecated This mock storage is replaced by Prisma + MongoDB. Use app/actions.ts instead.
 */
import { FeedbackResult } from "./simulation";

export interface InterviewSession {
    id: string;
    date: string;
    topic: string;
    feedback: FeedbackResult;
}

const STORAGE_KEY = "interview_sessions";

export function saveInterview(session: InterviewSession): void {
    if (typeof window === "undefined") return;

    const current = getInterviews();
    // Check if exists to avoid duplicates or update (though logic usually implies new ID)
    const existingIndex = current.findIndex(s => s.id === session.id);

    if (existingIndex >= 0) {
        current[existingIndex] = session;
    } else {
        current.unshift(session); // Add to beginning
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function getInterviews(): InterviewSession[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse interview sessions", e);
        return [];
    }
}

export function getInterview(id: string): InterviewSession | null {
    const sessions = getInterviews();
    return sessions.find(s => s.id === id) || null;
}

export function clearInterviews(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
}
