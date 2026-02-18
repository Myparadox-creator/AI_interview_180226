# Implementation Plan - AI Interviewer Integration

The goal is to replace the hardcoded/mock interview logic with dynamic AI generation using **Google Gemini**.

## User Review Required
> [!IMPORTANT]
> **Gemini API Key**: You will need a Google Gemini API Key. I will add `NEXT_PUBLIC_GEMINI_API_KEY` to your `.env` file. You need to get a key from [Google AI Studio](https://aistudio.google.com/).

## Proposed Changes

### Dependencies
- Install `@google/generative-ai`

### Configuration
#### [MODIFY] [.env](file:///c:/Users/ASUS/OneDrive/Desktop/prototype/interview-prep/.env)
- Add `GEMINI_API_KEY=your_api_key_here` (Note: Keep it server-side only if possible, or use `NEXT_PUBLIC` if calling from client, though server actions are preferred for security).

### Logic Layer
#### [NEW] [lib/gemini.ts](file:///c:/Users/ASUS/OneDrive/Desktop/prototype/interview-prep/lib/gemini.ts)
- Initialize GoogleGenerativeAI client.
- `generateQuestions(topic: string, count: number)`: Returns a JSON array of questions.
- `evaluateInterview(questions: string[], answers: string[])`: Returns a JSON object with scores, feedback, and ideal answers.

### UI Integration
#### [MODIFY] [app/interview/setup/page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/prototype/interview-prep/app/interview/setup/page.tsx)
- Call `generateQuestions` when starting an interview.
- Store the generated questions in the database or pass them to the interview page state.

#### [MODIFY] [app/interview/[id]/page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/prototype/interview-prep/app/interview/[id]/page.tsx)
- Replace local evaluation logic with `evaluateInterview`.

## Verification Plan
1.  **Question Generation**: Start a new interview on a unique topic (e.g., "Underwater Basket Weaving"). Verify the questions are relevant.
2.  **Feedback Quality**: Give a "bad" answer intentionally. Verify the AI gives constructive feedback and a low score.
