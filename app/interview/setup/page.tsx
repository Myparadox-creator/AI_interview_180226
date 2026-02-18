"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Settings, Target, Layers, FileText, Upload, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const TOPICS = [
    { id: "react", label: "React & Frontend", emoji: "⚛️" },
    { id: "javascript", label: "JavaScript Core", emoji: "🟨" },
    { id: "behavioral", label: "Behavioral", emoji: "🧠" },
    { id: "system_design", label: "System Design", emoji: "🏗️" },
    { id: "backend", label: "Node.js & Backend", emoji: "🔧" },
    { id: "resume", label: "Resume Based", emoji: "📄" },
];

const DIFFICULTIES = [
    { id: "junior", label: "Junior", sub: "Entry Level" },
    { id: "mid", label: "Mid-Level", sub: "2-4 years" },
    { id: "senior", label: "Senior", sub: "5+ years" },
    { id: "lead", label: "Lead", sub: "Manager" },
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
        const interviewId = Math.random().toString(36).substring(7);
        if (topic === "resume" && resumeFile) {
            localStorage.setItem("current_resume_name", resumeFile.name);
        }
        router.push(`/interview/${interviewId}?topic=${topic}&difficulty=${difficulty}&count=${questionCount}`);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
            </div>

            <nav className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-xl px-6 py-4 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-lg text-white">Interview Setup</span>
                </div>
            </nav>

            <main className="relative z-10 flex-1 flex justify-center items-center p-6">
                <div className="bg-white/3 border border-white/8 rounded-2xl p-8 max-w-2xl w-full backdrop-blur-sm">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Configure Your Session</h1>
                        <p className="text-gray-400">Customize the interview to match your career goals.</p>
                    </div>

                    <div className="space-y-8">
                        {/* Topic */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-400" /> Select Topic
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {TOPICS.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTopic(t.id)}
                                        className={`p-4 rounded-xl border text-sm font-medium transition-all text-left ${topic === t.id
                                            ? "border-blue-500/50 bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/30"
                                            : "border-white/8 hover:border-white/15 hover:bg-white/5 text-gray-400 hover:text-gray-200"
                                            }`}
                                    >
                                        <span className="block text-lg mb-1">{t.emoji}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resume Upload */}
                        {topic === "resume" && (
                            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                                <label className="block text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Upload Your Resume
                                </label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-500/30 rounded-xl p-6 bg-blue-600/5 cursor-pointer hover:bg-blue-600/10 transition-colors relative">
                                    <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <Upload className="w-8 h-8 text-blue-400 mb-2" />
                                    <p className="text-sm text-center text-blue-300 font-medium">
                                        {resumeFile ? resumeFile.name : "Click to upload or drag and drop"}
                                    </p>
                                    <p className="text-xs text-blue-500 mt-1">PDF, DOCX, or TXT (Max 5MB)</p>
                                </div>
                            </div>
                        )}

                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-400" /> Select Difficulty
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {DIFFICULTIES.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => setDifficulty(d.id)}
                                        className={`p-4 rounded-xl border text-sm font-medium transition-all text-left ${difficulty === d.id
                                            ? "border-purple-500/50 bg-purple-600/15 text-purple-300 ring-1 ring-purple-500/30"
                                            : "border-white/8 hover:border-white/15 hover:bg-white/5 text-gray-400 hover:text-gray-200"
                                            }`}
                                    >
                                        <span className="block font-bold text-base">{d.label}</span>
                                        <span className="text-xs opacity-70">{d.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-cyan-400" /> Number of Questions
                                <span className="ml-auto font-bold text-white bg-white/10 px-3 py-1 rounded-lg">{questionCount}</span>
                            </label>
                            <div className="bg-white/3 border border-white/8 p-4 rounded-xl">
                                <input
                                    type="range" min="3" max="10" step="1"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between text-xs text-gray-600 mt-2">
                                    <span>3 (Quick)</span><span>10 (Full)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            onClick={handleStart}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-0.5"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Start Interview
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
