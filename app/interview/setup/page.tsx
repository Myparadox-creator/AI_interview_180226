"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Settings, Target, Layers, FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

const TOPICS = [
    { id: "react", label: "React & Frontend" },
    { id: "javascript", label: "JavaScript Core" },
    { id: "behavioral", label: "Behavioral & Soft Skills" },
    { id: "system_design", label: "System Design" },
    { id: "backend", label: "Node.js & Backend" },
    { id: "resume", label: "Resume Based Interview" },
];

const DIFFICULTIES = [
    { id: "junior", label: "Junior / Entry Level" },
    { id: "mid", label: "Mid-Level" },
    { id: "senior", label: "Senior" },
    { id: "lead", label: "Lead / Manager" },
];

export default function InterviewSetup() {
    const router = useRouter();
    const [topic, setTopic] = useState(TOPICS[0].id);
    const [difficulty, setDifficulty] = useState(DIFFICULTIES[1].id);
    const [questionCount, setQuestionCount] = useState(5);
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleStart = () => {
        // In a real app, we'd save configuration here or pass via query params
        // generating a random ID for the interview session
        const interviewId = Math.random().toString(36).substring(7);

        // Mock saving resume context if provided
        if (topic === "resume" && resumeFile) {
            // In a real app, we would upload this file to a backend or process it here.
            // For this prototype, we'll just acknowledge it exists or store metadata.
            console.log("Resume attached:", resumeFile.name);
            localStorage.setItem("current_resume_name", resumeFile.name);
        }

        router.push(`/interview/${interviewId}?topic=${topic}&difficulty=${difficulty}&count=${questionCount}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <span className="font-semibold text-lg text-gray-900">New Interview Setup</span>
            </nav>

            <main className="flex-1 flex justify-center items-center p-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl w-full">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configure Your Session</h1>
                        <p className="text-gray-600">Customize the interview to match your career goals.</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Select Topic
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {TOPICS.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTopic(t.id)}
                                        className={`p-4 rounded-xl border text-sm font-medium transition-all ${topic === t.id
                                            ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600"
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {topic === "resume" && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                <label className="block text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Upload Your Resume
                                </label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-6 bg-white cursor-pointer hover:bg-blue-50 transition-colors relative">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload className="w-8 h-8 text-blue-500 mb-2" />
                                    <p className="text-sm text-center text-blue-700 font-medium">
                                        {resumeFile ? resumeFile.name : "Click to upload or drag and drop"}
                                    </p>
                                    <p className="text-xs text-blue-400 mt-1">PDF, DOCX, or TXT (Max 5MB)</p>
                                </div>
                            </div>
                        )}


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4" /> Select Difficulty
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {DIFFICULTIES.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => setDifficulty(d.id)}
                                        className={`p-4 rounded-xl border text-sm font-medium transition-all ${difficulty === d.id
                                            ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600"
                                            }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Number of Questions
                        </label>
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <input
                                type="range"
                                min="3"
                                max="10"
                                step="1"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="font-bold text-gray-900 border border-gray-200 bg-white px-4 py-2 rounded-lg min-w-[50px] text-center">
                                {questionCount}
                            </span>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleStart}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Start Simulation
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
