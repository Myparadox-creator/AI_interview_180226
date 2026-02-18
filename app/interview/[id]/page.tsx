"use client";

import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Mic, Square, Send, Video as VideoIcon, VideoOff, MessageSquare } from "lucide-react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { getAIResponse, getFirstQuestion, calculateFeedback } from "@/lib/simulation";
import { createInterview } from "@/app/actions";

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
    // const interviewId = params.id as string; // Unused as DB generates new ID
    const router = useRouter();
    const topic = searchParams.get("topic") || "behavioral";
    const totalQuestions = parseInt(searchParams.get("count") || "5");

    const [isRecording, setIsRecording] = useState(false);
    const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState("");
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

    // Prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initialize Interview

    useEffect(() => {
        // Initial Greeting
        const initialQuestion = getFirstQuestion(topic);
        addMessage("ai", initialQuestion);
        speak(initialQuestion);
    }, [topic]);

    // Timer Logic
    useEffect(() => {
        if (!isProcessing && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isProcessing) {
            handleUserResponse("Time expired. I did not provide an answer.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, isProcessing]);

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
                        handleUserResponse(event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setCurrentTranscript(interimTranscript);
                setError(null); // Clear error on successful result
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
                if (event.error === 'network') {
                    setError("Network error detected. Please check your connection or try typing your response.");
                } else if (event.error === 'not-allowed') {
                    setError("Microphone access denied. Please allow permission.");
                } else if (event.error === 'no-speech') {
                    // Ignore no-speech errors, just stop recording or let it continue
                    return;
                } else {
                    setError(`Speech recognition error: ${event.error}`);
                }
            };

            recognitionRef.current = recognition;
        } else {
            setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const addMessage = (role: "ai" | "user", text: string) => {
        setMessages((prev) => [...prev, { role, text }]);
    };

    const speak = (text: string) => {
        if (!isMounted) return;
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel(); // Stop previous
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
            // If there is transcript that wasn't final, send it
            if (currentTranscript.trim()) {
                handleUserResponse(currentTranscript);
                setCurrentTranscript("");
            }
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleUserResponse = async (text: string) => {
        if (!text.trim()) return;

        // Stop recording while processing
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        }

        addMessage("user", text);
        setIsProcessing(true);

        // Get AI Response
        try {
            const response = await getAIResponse(text, topic, questionIndex, totalQuestions);
            setQuestionIndex((prev) => prev + 1);

            addMessage("ai", response);
            speak(response);

            if (response.includes("interview is now complete")) {
                // Handle end of interview logic if needed
            }

        } catch (error) {
            console.error("Error getting AI response:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const endInterview = () => {
        window.speechSynthesis.cancel();
        recognitionRef.current?.stop();

        // Calculate and Save Feedback
        console.log("Ending interview. Transcripts:", messages);
        const feedback = calculateFeedback(messages, topic);
        console.log("Calculated feedback:", feedback);

        // We can't await in a sync function, so we treat it as a promise or make endInterview async
        createInterview({
            date: new Date().toISOString(),
            topic: topic,
            feedback: feedback
        }).then((result) => {
            if (result.success) {
                router.push(`/feedback/${result.id}`);
            } else {
                console.error("Failed to save interview:", result.error);
                alert("Failed to save interview result. " + result.error);
            }
        });
    };

    // Keep latest endInterview in a ref to avoid stale closures in event listeners
    const endInterviewRef = useRef(endInterview);
    useEffect(() => {
        endInterviewRef.current = endInterview;
    });

    // Anti-Cheating: Tab Switch / Visibility Change Detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                alert("Cheating detected! You switched tabs. The interview will end now.");
                endInterviewRef.current();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row h-screen overflow-hidden">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-6 left-6 z-10 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-4">
                    <div>
                        <h2 className="font-semibold text-lg text-white/90">
                            {topic === 'behavioral' ? 'Behavioral Interview' : 'Technical Interview'}
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
                    {/* Hydration safe Webcam */}
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

                    {/* AI Overlay / Avatar Placeholder */}
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
                            {currentTranscript || (isRecording ? "Listening..." : "Microphone is off")}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-8 flex items-center gap-6">
                    <button
                        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                        className={`p-4 rounded-full transition-colors ${isVideoEnabled ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                            }`}
                    >
                        {isVideoEnabled ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={toggleRecording}
                        className={`p-6 rounded-full transition-all transform hover:scale-105 shadow-xl ${isRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/30"
                            : "bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-600/30"
                            }`}
                    >
                        {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                    </button>

                    <button
                        onClick={endInterview}
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
                            placeholder="Type your answer if mic fails..."
                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-400"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleUserResponse(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 p-1 hover:bg-blue-50 rounded-lg">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
