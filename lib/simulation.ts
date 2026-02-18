export const TOPICS = {
    react: "React & Frontend",
    javascript: "JavaScript Core",
    behavioral: "Behavioral & Soft Skills",
    system_design: "System Design",
    backend: "Node.js & Backend",
};

interface Question {
    text: string;
    keywords: string[];
    idealAnswer: string;
}

const QUESTIONS: Record<string, Question[]> = {
    react: [
        {
            text: "Can you explain the difference between state and props in React?",
            keywords: ["immutable", "mutable", "passed", "component", "parent", "manage"],
            idealAnswer: "Props are immutable and passed from parent to child, whereas State is mutable and managed within the component itself."
        },
        {
            text: "What are React Hooks and why were they introduced?",
            keywords: ["class", "functional", "state", "lifecycle", "logic", "reuse"],
            idealAnswer: "Hooks allow functional components to use state and lifecycle features without writing classes, promoting code reuse and cleaner logic."
        },
        {
            text: "How does the Virtual DOM work?",
            keywords: ["diffing", "reconciliation", "copy", "actual", "update", "fast"],
            idealAnswer: "The Virtual DOM is a lightweight copy of the real DOM. React compares it with the previous version (diffing) and effectively updates only changed elements in the real DOM."
        },
        {
            text: "Explain the concept of Lift State Up.",
            keywords: ["common", "ancestor", "share", "state", "parent", "sibling"],
            idealAnswer: "Lifting State Up resolves sharing state between siblings by moving the state to their closest common ancestor."
        },
    ],
    javascript: [
        {
            text: "Explain closures in JavaScript.",
            keywords: ["function", "scope", "outer", "access", "lexical", "memory"],
            idealAnswer: "A closure is a function that retains access to variables from its outer (lexical) scope even after the outer function has finished executing."
        },
        {
            text: "What is the difference between '==' and '==='?",
            keywords: ["type", "coercion", "strict", "value", "conversion", "check"],
            idealAnswer: "'==' performs type coercion before comparison, while '===' checks both value and type strictly."
        },
        {
            text: "Explain the event loop.",
            keywords: ["stack", "queue", "async", "callback", "blocking", "execute"],
            idealAnswer: "The event loop monitors the call stack and callback queue, pushing asynchronous callbacks to the stack only when it's empty, enabling non-blocking I/O."
        },
        {
            text: "What are promises and how do they work?",
            keywords: ["async", "resolve", "reject", "then", "catch", "future"],
            idealAnswer: "Promises represent the eventual completion (or failure) of an asynchronous operation, allowing cleaner handling of async results via .then() and .catch()."
        },
    ],
    behavioral: [
        {
            text: "Tell me about a time you faced a challenge at work.",
            keywords: ["situation", "task", "action", "result", "star", "outcome"],
            idealAnswer: "Use the STAR method: Describe the Situation, Task, Action you took, and the Result achieved, focusing on problem-solving and positive outcomes."
        },
        {
            text: "Where do you see yourself in 5 years?",
            keywords: ["growth", "goals", "company", "career", "skills", "align"],
            idealAnswer: "Discuss your career progression, skill growth, and how your goals align with the company's future, showing ambition and commitment."
        },
        {
            text: "Describe a conflict you had with a colleague and how you resolved it.",
            keywords: ["communication", "perspective", "listen", "resolution", "calm", "professional"],
            idealAnswer: "Focus on how you listened to their perspective, communicated calmly, found a middle ground, and maintained a professional relationship."
        },
        {
            text: "What is your greatest strength?",
            keywords: ["example", "relevant", "skill", "impact", "team", "work"],
            idealAnswer: "Choose a strength relevant to the role (e.g., problem-solving) and back it up with a specific example of how it benefited your team or project."
        },
    ],
    system_design: [
        {
            text: "Design a URL shortening service like TinyURL.",
            keywords: ["hash", "database", "scaling", "collision", "redirect", "key"],
            idealAnswer: "Key points: Generate unique keys (hashing/counters), store mapping in DB (NoSQL/SQL), handle redirects (301), and plan for high read/write scalability."
        },
        {
            text: "How would you design a scalable notification system?",
            keywords: ["queue", "worker", "pub/sub", "retry", "push", "service"],
            idealAnswer: "Use a message queue (Kafka/RabbitMQ) to decouple producers from consumers, worker services to send notifications (email/SMS), and handle retries/failures."
        },
        {
            text: "Explain the difference between SQL and NoSQL databases.",
            keywords: ["schema", "relational", "structure", "scale", "acid", "flexible"],
            idealAnswer: "SQL databases are relational and table-based with fixed schemas (good for structured data), while NoSQL are document/key-value based and flexible (good for unstructured/rapidly changing data)."
        },
        {
            text: "What is load balancing?",
            keywords: ["traffic", "distribute", "server", "availability", "performance", "reverse"],
            idealAnswer: "Load balancing distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed, improving availability and performance."
        },
    ],
    backend: [
        {
            text: "Explain the difference between GET and POST requests.",
            keywords: ["data", "url", "body", "secure", "cache", "server"],
            idealAnswer: "GET requests retrieve data and parameters are in the URL (cacheable, less secure). POST submits data to be processed, sending it in the request body (secure, not cached)."
        },
        {
            text: "What is middleware in Express.js?",
            keywords: ["request", "response", "next", "function", "process", "cycle"],
            idealAnswer: "Middleware functions have access to the request object (req), the response object (res), and the next function, allowing code execution between the request and response."
        },
        {
            text: "How do you handle authentication in a Node.js app?",
            keywords: ["jwt", "session", "bcrypt", "hash", "token", "password"],
            idealAnswer: "Commonly using JWT (JSON Web Tokens) for stateless authentication or Sessions. Passwords should always be hashed (e.g., using bcrypt) before storage."
        },
        {
            text: "Explain RESTful API design principles.",
            keywords: ["resource", "stateless", "http", "verb", "interface", "standard"],
            idealAnswer: "REST relies on stateless communication, standard HTTP methods (GET, POST, PUT, DELETE), resource-based URIs, and a uniform interface."
        },
    ],
};

// Simple scoring interface
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

export async function getAIResponse(userText: string, topic: string, questionIndex: number, maxQuestions: number = 5): Promise<string> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const topicKey = topic as keyof typeof QUESTIONS;
    const questions = topic === "resume" ? getResumeQuestions([]) : (QUESTIONS[topicKey] || QUESTIONS.behavioral);

    if (questionIndex >= Math.min(questions.length, maxQuestions)) {
        return "Thank you for your responses. The interview is now complete. Please click 'Finish Interview' to see your feedback.";
    }

    // Simple keyword matching for "analysis" (simulation)
    if (userText.length < 20) {
        return "Could you elaborate a bit more on that? " + questions[questionIndex].text;
    }

    return "Interesting point. " + questions[questionIndex].text;
}

export function getFirstQuestion(topic: string): string {
    if (topic === "resume") {
        return "Hello! I've reviewed your resume. Let's start by discussing your recent experience. Tell me about your most challenging project.";
    }
    const topicKey = topic as keyof typeof QUESTIONS;
    const questions = QUESTIONS[topicKey] || QUESTIONS.behavioral;
    return "Hello! Let's start the interview. " + questions[0].text;
}

// Helper to get questions for resume mode (mock implementation)
function getResumeQuestions(_transcript: { role: string; text: string }[]): Question[] {
    // In a real implementation, we would extract keywords from the resume (passed in context)
    // and dynamically select questions.
    // For this prototype, we will return a fixed set of "Resume" style questions
    // mixed with some technical ones if we detect keywords in previous answers (a bit complex for now)
    // OR just return a fixed "Resume" set.

    return [
        {
            text: "Tell me about your most challenging project listed on your resume.",
            keywords: ["project", "challenge", "solution", "result", "team", "role"],
            idealAnswer: "Describe a specific project, the technical challenges faced, your specific role, and the successful outcome using the STAR method."
        },
        {
            text: "I see you listed React. Can you describe how you handled state management in your last application?",
            keywords: ["redux", "context", "state", "management", "provider", "store"],
            idealAnswer: "Explain the state management library or pattern used (Context API, Redux, Zustand) and why it was chosen for that specific application architecture."
        },
        {
            text: "Your resume mentions backend experience. How do you ensure API security?",
            keywords: ["authentication", "authorization", "https", "token", "sanitize", "input"],
            idealAnswer: "Discuss using HTTPS, JWT/OAuth for auth, input validation/sanitization to prevent injection attacks, and rate limiting."
        },
        {
            text: "What is a technical skill listed on your resume that you are currently working to improve?",
            keywords: ["learning", "improvement", "course", "practice", "future", "growth"],
            idealAnswer: "Mention a specific skill, why it's valid to improve it, and the concrete steps (courses, side projects) you are taking to learn it."
        },
    ];
}

// New function to calculate score based on transcript
export function calculateFeedback(transcript: { role: string; text: string }[], topic: string): FeedbackResult {
    const userMessages = transcript.filter(m => m.role === 'user');
    const topicKey = topic as keyof typeof QUESTIONS;
    const questions = topic === "resume" ? getResumeQuestions(transcript) : (QUESTIONS[topicKey] || QUESTIONS.behavioral);

    let totalScore = 0;
    const questionFeedback = [];

    // Evaluate each answer against the corresponding question
    for (let i = 0; i < Math.min(userMessages.length, questions.length); i++) {
        const question = questions[i];
        const answer = userMessages[i].text;
        const lowerAnswer = answer.toLowerCase();

        // Keyword Matching
        const keywordsFound = question.keywords.filter(k => lowerAnswer.includes(k.toLowerCase()));
        const matchRatio = keywordsFound.length / question.keywords.length;

        // Scoring Logic for this question
        let questionScore = 0;
        if (answer.trim().length < 10) {
            questionScore = 10; // Very short/empty
        } else if (matchRatio === 0) {
            questionScore = 30; // Effort but no keywords
        } else {
            // Scale from 50 to 100 based on keywords
            questionScore = 50 + (matchRatio * 50);
        }

        // Bonus for length (up to a point)
        const wordCount = answer.trim().split(/\s+/).length;
        if (wordCount > 30) questionScore = Math.min(100, questionScore + 10);

        totalScore += questionScore;

        // Specific Feedback
        let specificFeedback = "";
        if (matchRatio === 1) {
            specificFeedback = "Excellent! You covered all key concepts.";
        } else if (matchRatio > 0.5) {
            specificFeedback = `Good job. You mentioned ${keywordsFound.join(", ")}.`;
        } else if (keywordsFound.length > 0) {
            specificFeedback = `You hit on some points (${keywordsFound.join(", ")}), but missed others.`;
        } else {
            specificFeedback = "You might have missed the core concepts. Try to include terms like: " + question.keywords.slice(0, 3).join(", ") + ".";
        }

        questionFeedback.push({
            question: question.text,
            userAnswer: answer,
            score: Math.round(questionScore),
            feedback: specificFeedback,
            idealAnswer: question.idealAnswer
        });
    }

    // Average Score
    const finalScore = userMessages.length > 0
        ? Math.round(totalScore / Math.max(userMessages.length, 1))
        : 0;

    return {
        score: finalScore,
        metrics: [
            {
                id: "clarity",
                label: "Concept Coverage",
                value: finalScore,
                color: finalScore > 70 ? "bg-green-500" : "bg-yellow-500",
                feedback: finalScore > 70 ? "Strong technical understanding." : "Review key concepts."
            },
            {
                id: "pace",
                label: "Communication",
                value: Math.min(100, finalScore + 10),
                color: "bg-blue-500",
                feedback: "Clear delivery."
            },
            {
                id: "confidence",
                label: "Completeness",
                value: Math.round((userMessages.length / questions.length) * 100),
                color: "bg-purple-500",
                feedback: userMessages.length === questions.length ? "Answered all questions." : "Missed some questions."
            },
            {
                id: "content",
                label: "Relevance",
                value: Math.min(100, finalScore + 5),
                color: "bg-indigo-500",
                feedback: " stayed on topic."
            },
        ],
        summary: finalScore > 70
            ? "Solid performance! You demonstrated good knowledge of the core concepts."
            : "Good effort. Focus on including specific technical keywords in your explanations to boost your score.",
        questionFeedback
    };
}
