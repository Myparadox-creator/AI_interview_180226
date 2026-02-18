import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
    console.error("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export interface GeneratedQuestion {
    text: string;
    keywords: string[];
    idealAnswer: string;
}

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

// Fallback questions used when API quota is exceeded
const FALLBACK_QUESTIONS: Record<string, GeneratedQuestion[]> = {
    react: [
        { text: "What is the difference between state and props in React?", keywords: ["immutable", "mutable", "parent", "component"], idealAnswer: "Props are immutable and passed from parent to child. State is mutable and managed within the component." },
        { text: "What are React Hooks and why were they introduced?", keywords: ["functional", "class", "useState", "useEffect"], idealAnswer: "Hooks let functional components use state and lifecycle features without writing class components." },
        { text: "How does the Virtual DOM work in React?", keywords: ["diffing", "reconciliation", "real DOM", "update"], idealAnswer: "React keeps a virtual copy of the DOM, diffs it with the previous version, and only updates changed elements in the real DOM." },
        { text: "Explain the useEffect hook and when you would use it.", keywords: ["side effects", "cleanup", "dependency array", "mount"], idealAnswer: "useEffect runs side effects after render. The dependency array controls when it re-runs. Return a cleanup function to avoid memory leaks." },
        { text: "What is the Context API and when should you use it?", keywords: ["global state", "prop drilling", "provider", "consumer"], idealAnswer: "Context API provides a way to share values between components without prop drilling. Use it for global state like themes or user auth." },
    ],
    javascript: [
        { text: "Explain closures in JavaScript.", keywords: ["scope", "outer function", "lexical", "access"], idealAnswer: "A closure is a function that retains access to variables from its outer scope even after the outer function has finished executing." },
        { text: "What is the difference between == and ===?", keywords: ["type coercion", "strict", "value", "type check"], idealAnswer: "== performs type coercion before comparison. === checks both value and type strictly without coercion." },
        { text: "Explain the JavaScript event loop.", keywords: ["call stack", "callback queue", "async", "non-blocking"], idealAnswer: "The event loop monitors the call stack and callback queue, pushing async callbacks to the stack only when it's empty." },
        { text: "What are Promises and how do they work?", keywords: ["async", "resolve", "reject", "then", "catch"], idealAnswer: "Promises represent the eventual completion or failure of an async operation, allowing cleaner async handling via .then() and .catch()." },
        { text: "What is the difference between var, let, and const?", keywords: ["scope", "hoisting", "block", "reassign"], idealAnswer: "var is function-scoped and hoisted. let and const are block-scoped. const cannot be reassigned after declaration." },
    ],
    behavioral: [
        { text: "Tell me about a time you faced a challenge at work and how you overcame it.", keywords: ["situation", "action", "result", "STAR"], idealAnswer: "Use the STAR method: describe the Situation, Task, Action taken, and Result achieved." },
        { text: "Where do you see yourself in 5 years?", keywords: ["growth", "goals", "career", "skills"], idealAnswer: "Discuss career progression, skill development, and how your goals align with the company's vision." },
        { text: "Describe a conflict with a colleague and how you resolved it.", keywords: ["communication", "listen", "resolution", "professional"], idealAnswer: "Focus on listening to their perspective, communicating calmly, finding common ground, and maintaining professionalism." },
        { text: "What is your greatest strength?", keywords: ["example", "relevant", "impact", "skill"], idealAnswer: "Choose a strength relevant to the role and back it up with a specific example of its impact." },
        { text: "How do you handle tight deadlines and pressure?", keywords: ["prioritize", "organize", "communicate", "focus"], idealAnswer: "Explain how you prioritize tasks, communicate proactively with stakeholders, and stay focused under pressure." },
    ],
    system_design: [
        { text: "Design a URL shortening service like TinyURL.", keywords: ["hash", "database", "scaling", "redirect"], idealAnswer: "Generate unique keys via hashing, store mappings in a database, handle 301 redirects, and plan for high read/write scalability." },
        { text: "How would you design a scalable notification system?", keywords: ["queue", "pub/sub", "worker", "retry"], idealAnswer: "Use a message queue (Kafka/RabbitMQ) to decouple producers from consumers, with worker services handling retries." },
        { text: "Explain the difference between SQL and NoSQL databases.", keywords: ["schema", "relational", "flexible", "ACID"], idealAnswer: "SQL is relational with fixed schemas, good for structured data. NoSQL is flexible and scales horizontally for unstructured data." },
        { text: "What is load balancing and why is it important?", keywords: ["traffic", "distribute", "availability", "performance"], idealAnswer: "Load balancing distributes traffic across multiple servers to prevent overload, improving availability and performance." },
        { text: "How would you design a caching layer for a web application?", keywords: ["Redis", "TTL", "cache invalidation", "hit rate"], idealAnswer: "Use Redis or Memcached with appropriate TTLs. Handle cache invalidation carefully and monitor hit rates to optimize performance." },
    ],
    backend: [
        { text: "Explain the difference between GET and POST requests.", keywords: ["body", "URL", "idempotent", "cache"], idealAnswer: "GET retrieves data with params in the URL (cacheable). POST submits data in the request body (not cached, not idempotent)." },
        { text: "What is middleware in Express.js?", keywords: ["request", "response", "next", "pipeline"], idealAnswer: "Middleware functions have access to req, res, and next, allowing code execution in the request-response pipeline." },
        { text: "How do you handle authentication in a Node.js app?", keywords: ["JWT", "session", "bcrypt", "token"], idealAnswer: "Use JWT for stateless auth or sessions for stateful. Always hash passwords with bcrypt before storing." },
        { text: "Explain RESTful API design principles.", keywords: ["stateless", "resource", "HTTP verbs", "uniform interface"], idealAnswer: "REST uses stateless communication, standard HTTP methods, resource-based URIs, and a uniform interface." },
        { text: "What is the difference between authentication and authorization?", keywords: ["identity", "permissions", "who", "what"], idealAnswer: "Authentication verifies who you are (identity). Authorization determines what you are allowed to do (permissions)." },
    ],
};

function getFallbackQuestions(topic: string, count: number): GeneratedQuestion[] {
    const key = topic.toLowerCase().replace(/\s+/g, "_");
    const questions = FALLBACK_QUESTIONS[key] || FALLBACK_QUESTIONS.behavioral;
    return questions.slice(0, count);
}

/**
 * Generates interview questions based on the given topic.
 * Falls back to pre-written questions if the API quota is exceeded.
 */
export async function generateQuestions(topic: string, count: number = 5): Promise<GeneratedQuestion[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
            You are an expert technical interviewer.
            Generate ${count} interview questions for the topic: "${topic}".
            
            Return the response ONLY as a valid JSON array of objects. 
            Do not include any markdown formatting or code blocks.
            Each object must have:
            - "text": The question string.
            - "keywords": An array of important keywords to look for in the answer.
            - "idealAnswer": A concise summary of what a perfect answer looks like.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up markdown code blocks if present
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.warn("Gemini API unavailable, using fallback questions:", error);
        return getFallbackQuestions(topic, count);
    }
}

/**
 * Evaluates the interview answers and provides detailed feedback and scoring.
 * Falls back to keyword-based scoring if the API quota is exceeded.
 */
export async function evaluateInterview(transcript: { question: string; answer: string }[], topic: string): Promise<FeedbackResult> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
            You are an expert interviewer evaluating a candidate on the topic: "${topic}".
            Here is the transcript of the interview:
            ${JSON.stringify(transcript)}

            Evaluate the candidate's performance.
            Return the response ONLY as a valid JSON object.
            Do not include any markdown formatting.
            The JSON object must match this structure:
            {
                "score": number (0-100),
                "metrics": [
                    { "id": "clarity", "label": "Clarity", "value": number (0-100), "color": "bg-blue-500", "feedback": "string" },
                    { "id": "technical", "label": "Technical Accuracy", "value": number (0-100), "color": "bg-green-500", "feedback": "string" },
                    { "id": "completeness", "label": "Completeness", "value": number (0-100), "color": "bg-purple-500", "feedback": "string" }
                ],
                "summary": "string (overall summary of performance)",
                "questionFeedback": [
                    {
                        "question": "string (the original question)",
                        "userAnswer": "string (the user's answer)",
                        "score": number (0-100),
                        "feedback": "string (specific feedback on this answer)",
                        "idealAnswer": "string (what they should have said)"
                    }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.warn("Gemini evaluation unavailable, using keyword-based fallback:", error);

        // Keyword-based fallback scoring
        const questionFeedback = transcript.map(({ question, answer }) => {
            const wordCount = answer.trim().split(/\s+/).length;
            const score = answer.trim().length < 10 ? 20 : Math.min(100, 50 + wordCount);
            return {
                question,
                userAnswer: answer,
                score: Math.min(100, score),
                feedback: wordCount > 20 ? "Good detail in your answer." : "Try to elaborate more in your answers.",
                idealAnswer: "A strong answer covers the core concept with a specific example."
            };
        });

        const avgScore = questionFeedback.length > 0
            ? Math.round(questionFeedback.reduce((sum, q) => sum + q.score, 0) / questionFeedback.length)
            : 0;

        return {
            score: avgScore,
            metrics: [
                { id: "clarity", label: "Clarity", value: avgScore, color: "bg-blue-500", feedback: "Based on answer length and detail." },
                { id: "technical", label: "Technical Accuracy", value: avgScore, color: "bg-green-500", feedback: "AI evaluation unavailable — basic scoring applied." },
                { id: "completeness", label: "Completeness", value: Math.round((transcript.length / 5) * 100), color: "bg-purple-500", feedback: `You answered ${transcript.length} question(s).` }
            ],
            summary: avgScore > 60
                ? "Good effort! AI-powered detailed feedback is temporarily unavailable due to API limits."
                : "Keep practicing! AI-powered detailed feedback is temporarily unavailable due to API limits.",
            questionFeedback
        };
    }
}
