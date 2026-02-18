# Architecture Overview

This document explains the technical architecture of the Interview Prep application.

## 1. High-Level Tech Stack

-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
    -   Handles both Frontend (UI) and Backend (API/Server Actions).
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Database**: MongoDB
-   **ORM**: Prisma
-   **Authentication**: Clerk
-   **Deployment**: Vercel (Recommended)

## 2. Database & Data Access

### Database: MongoDB
We use **MongoDB** as our primary database. It is a NoSQL document database, well-suited for storing flexible data structures like interview transcripts and feedback JSON.

### Schema & ORM: Prisma
We use **Prisma ORM** to interact with the database. This provides type-safety and auto-completion.

**Key Models (`prisma/schema.prisma`):**
-   **Interview**: Stores the core data for each session.
    -   `id`: Unique identifier (MongoDB ObjectId).
    -   `userId`: The Clerk User ID (links data to the specific user).
    -   `topic`: The interview topic (e.g., "React", "Node.js").
    -   `feedback`: JSON object storing the detailed scores and analysis.
    -   `createdAt`: Timestamp.

**Data Access Layer (`lib/prisma.ts`):**
-   A singleton `PrismaClient` instance is created here.
-   Used in Server Actions to run queries like `prisma.interview.create()` or `prisma.interview.findMany()`.

## 3. Authentication & User Management

### Provider: Clerk
We use **Clerk** for secure user management.

-   **Middleware (`middleware.ts`)**: Intercepts every request.
    -   Protects sensitive routes (`/dashboard`, `/interview/*`).
    -   Redirects unauthenticated users to `/sign-in`.
    -   Allows public access to the landing page.
-   **Client-Side**: `<UserButton />` and `useUser()` hooks provide UI elements.
-   **Server-Side**: `auth()` helper validates requests in Server Actions (`app/actions.ts`).

### Roles (Admin vs. User)
-   **User**: Standard access. Can create interviews and see their own history.
-   **Admin**: Special access to Global Stats (`/admin/dashboard`).
    -   Currently implemented via a simple email check against `ADMIN_EMAIL` env var.

## 4. Backend Logic (Server Actions)

We use **Next.js Server Actions** (`app/actions.ts`) instead of traditional API routes. This allows frontend components to call backend functions directly.

**Key Actions:**
-   `createInterview(data)`:
    1.  Authenticates the user (`auth()`).
    2.  Validates input.
    3.  Writes to MongoDB via Prisma.
-   `getInterviews()`:
    1.  Authenticates the user.
    2.  Fetches ONLY interviews where `userId` matches the current user.

## 5. Interview Logic (Current vs. Future)

### Current: Simulation Engine (`lib/simulation.ts`)
-   Currently, the interview logic is deterministic (Mock Data).
-   `QUESTIONS`: A predefined list of questions for topics like React, Node.js, etc.
-   `calculateFeedback()`: A heuristic algorithm that checks for keywords in your answer to generate a score (0-100).

### Future: AI Integration (Planned)
-   We will replace `lib/simulation.ts` with **Google Gemini AI**.
-   **Dynamic Questions**: The AI will generate unique questions based on any topic.
-   **Smart Feedback**: The AI will analyze the *meaning* of your answer, not just keywords, providing human-like advice.
