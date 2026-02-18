"use client";

import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Mic, Square, Send, Video as VideoIcon, VideoOff, MessageSquare, Loader2 } from "lucide-react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { createInterview } from "@/app/actions";
import { generateQuestions, evaluateInterview, GeneratedQuestion } from "@/lib/gemini";

// Helper for Speech Recognition type
interface IWindow extends Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
}

export default function InterviewRoom() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const topic = searchParams.get("topic") || "behavioral";
    const totalQuestions = parseInt(searchParams.get("count") || "5");

    const [isRecording, setIsRecording] = useState(false);
    const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState("");

    // AI State
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [questionIndex, setQuestionIndex] = useState(0);

    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per question
    const [isMounted, setIsMounted] = useState(false);

    // References
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const webcamRef = useRef<Webcam>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Refs to hold latest values — avoids stale closures in callbacks
    const questionsRef = useRef<GeneratedQuestion[]>([]);
    const questionIndexRef = useRef(0);
    const messagesRef = useRef<{ role: "ai" | "user"; text: string }[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUserResponseRef = useRef<(text: string) => void>(() => { });
    const endInterviewRef = useRef<() => void>(() => { });

    // Prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initialize Interview (Generate Questions)
    useEffect(() => {
        const initInterview = async () => {
            try {
                const generated = await generateQuestions(topic, totalQuestions);
                setQuestions(generated);
                questionsRef.current = generated; // keep ref in sync
                setIsLoading(false);

                // Start with first question
                if (generated.length > 0) {
                    const firstQ = `Hello! I'm your AI interviewer. We will focus on ${topic} today. Let's begin. ${generated[0].text}`;
                    addMessage("ai", firstQ);
                    speak(firstQ);
                }
            } catch (err) {
                console.error("Failed to generate questions:", err);
                setError("Failed to generate interview questions. Please try again.");
                setIsLoading(false);
            }
        };

        if (topic) {
            initInterview();
        }
    }, [topic, totalQuestions]);

    // Timer Logic
    useEffect(() => {
        if (!isProcessing && !isLoading && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isProcessing && !isLoading) {
            handleUserResponse("Time expired. I did not provide an answer.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, isProcessing, isLoading]);

    // Reset timer when question changes
    useEffect(() => {
        setTimeLeft(60);
    }, [questionIndex]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Speech Recognition Setup
    useEffect(() => {
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        // Use ref to avoid stale closure — always calls latest version
                        handleUserResponseRef.current(event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setCurrentTranscript(interimTranscript);
                setError(null);
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
                if (event.error === 'network') {
                    setError("Network error detected. Please check connection.");
                } else if (event.error === 'not-allowed') {
                    setError("Microphone access denied.");
                } else if (event.error === 'no-speech') {
                    return;
                }
            };

            recognitionRef.current = recognition;
        } else {
            setError("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addMessage = (role: "ai" | "user", text: string) => {
        const newMsg = { role, text };
        messagesRef.current = [...messagesRef.current, newMsg];
        setMessages((prev) => [...prev, newMsg]);
    };

    const speak = (text: string) => {
        if (!isMounted) return;
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            if (currentTranscript.trim()) {
                handleUserResponse(currentTranscript);
                setCurrentTranscript("");
            }
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleUserResponse = (text: string) => {
        if (!text.trim()) return;

        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        }

        addMessage("user", text);
        setIsProcessing(true);

        // Read from refs so setTimeout always has fresh values (no stale closure)
        const currentIndex = questionIndexRef.current;
        const currentQuestions = questionsRef.current;
        const nextIndex = currentIndex + 1;

        // Simulate "Thinking" time and move to next question
        setTimeout(() => {
            questionIndexRef.current = nextIndex;
            setQuestionIndex(nextIndex);

            if (nextIndex < currentQuestions.length) {
                const nextQuestion = currentQuestions[nextIndex].text;
                const filler = ["Thank you.", "Noted.", "Interesting.", "Okay."][Math.floor(Math.random() * 4)];
                const fullResponse = `${filler} ${nextQuestion}`;

                addMessage("ai", fullResponse);
                speak(fullResponse);
            } else {
                const endMsg = "Thank you for your responses. The interview is now complete. I am generating your feedback now...";
                addMessage("ai", endMsg);
                speak(endMsg);
                setTimeout(() => endInterviewRef.current(), 3000);
            }
            setIsProcessing(false);
        }, 1500);
    };

    // Keep refs up-to-date every render so callbacks always call the latest version
    handleUserResponseRef.current = handleUserResponse;

    const endInterview = async () => {
        window.speechSynthesis.cancel();
        setIsProcessing(true);

        // Read from ref to get the latest messages (avoids stale closure)
        const latestMessages = messagesRef.current;
        const transcriptPairs: { question: string; answer: string }[] = [];
        let currentQ = "";
        let isFirstAiMessage = true;

        latestMessages.forEach(msg => {
            if (msg.role === 'ai') {
                let questionText = msg.text;

                if (isFirstAiMessage) {
                    // First message has greeting prefix — extract just the question part
                    // Format: "Hello! I'm your AI interviewer. We will focus on X today. Let's begin. <QUESTION>"
                    const beginMarker = "Let's begin. ";
                    const markerIdx = questionText.indexOf(beginMarker);
                    if (markerIdx !== -1) {
                        questionText = questionText.substring(markerIdx + beginMarker.length).trim();
                    }
                    isFirstAiMessage = false;
                } else {
                    // Subsequent messages have filler prefix — strip it
                    const fillers = ["Thank you. ", "Noted. ", "Interesting. ", "Okay. "];
                    for (const filler of fillers) {
                        if (questionText.startsWith(filler)) {
                            questionText = questionText.substring(filler.length).trim();
                            break;
                        }
                    }
                }

                currentQ = questionText;
            } else if (msg.role === 'user' && currentQ) {
                transcriptPairs.push({ question: currentQ, answer: msg.text });
                currentQ = "";
            }
        });

        console.log("Evaluating pairs:", transcriptPairs);

        try {
            const feedback = await evaluateInterview(transcriptPairs, topic);
            const result = await createInterview({
                date: new Date().toISOString(),
                topic: topic,
                feedback: feedback
            });

            if (result.success) {
                router.push(`/feedback/${result.id}`);
            } else {
                setError("Failed to save interview: " + result.error);
                setIsProcessing(false);
            }
        } catch (err) {
            console.error("Evaluation error:", err);
            setError("Failed to generate feedback. Please try again.");
            setIsProcessing(false);
        }
    };

    // Keep endInterviewRef up-to-date so setTimeout always calls the latest version
    endInterviewRef.current = endInterview;

    // Anti-Cheating: end interview if user switches tabs
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isLoading && messagesRef.current.length > 0) {
                console.warn("User switched tabs — ending interview");
                endInterviewRef.current();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h2 className="text-xl font-semibold">Generating Your Interview...</h2>
                <p className="text-gray-400">Preparing questions for {topic}...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row h-screen overflow-hidden">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-6 left-6 z-10 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-4">
                    <div>
                        <h2 className="font-semibold text-lg text-white/90 capitalize">
                            {topic.replace(/_/g, " ")} Interview
                        </h2>
                        <span className="text-sm text-gray-400">Question {Math.min(questionIndex + 1, totalQuestions)} of {totalQuestions}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-bold text-xl ${timeLeft < 10 ? "bg-red-500 text-white animate-pulse" : "bg-gray-800 text-white"}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                {error && (
                    <div className="absolute top-20 left-6 z-20 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg max-w-md animate-bounce">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                    {/* Webcam */}
                    {isMounted && isVideoEnabled ? (
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            className="w-full h-full object-cover mirror"
                            mirrored={true}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                            <VideoOff className="w-16 h-16" />
                        </div>
                    )}

                    {/* AI Avatar */}
                    <div className="absolute top-4 right-4 w-32 h-40 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center shadow-lg">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs text-blue-200 font-medium">AI Interviewer</span>
                        </div>
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>

                    {/* Transcript Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 pt-20">
                        <p className="text-xl font-medium text-white/90 text-center transition-all duration-300">
                            {currentTranscript || (isProcessing ? "Processing..." : isRecording ? "Listening..." : "Microphone is off")}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-8 flex items-center gap-6">
                    <button
                        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                        className={`p-4 rounded-full transition-colors ${isVideoEnabled ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30"}`}
                    >
                        {isVideoEnabled ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={toggleRecording}
                        disabled={isProcessing}
                        className={`p-6 rounded-full transition-all transform hover:scale-105 shadow-xl ${isRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/30"
                            : "bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-600/30"
                            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                    </button>

                    <button
                        onClick={() => endInterview()}
                        className="p-4 rounded-full bg-gray-800 hover:bg-red-900/50 hover:text-red-400 text-gray-400 transition-colors"
                    >
                        <span className="font-bold text-sm">END</span>
                    </button>
                </div>
            </div>

            {/* Side Chat Panel */}
            <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-full hidden lg:flex">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Transcript</h3>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Live</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={isProcessing ? "Please wait..." : "Type your answer..."}
                            disabled={isProcessing}
                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-400 disabled:opacity-50"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleUserResponse(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 p-1 hover:bg-blue-50 rounded-lg" disabled={isProcessing}>
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
