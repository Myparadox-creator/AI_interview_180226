"use client";

import Link from "next/link";
import { ArrowLeft, Award, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FeedbackResult } from "@/lib/simulation";
import { getInterview } from "@/app/actions";

export default function FeedbackAnalysis() {
    const params = useParams();
    const interviewId = params.id as string;
    const [feedbackData, setFeedbackData] = useState<FeedbackResult | null>(null);

    useEffect(() => {
        const loadFeedback = async () => {
            try {
                const session = await getInterview(interviewId);
                if (session) {
                    setFeedbackData(session.feedback);
                } else {
                    setFeedbackData({ score: 0, metrics: [], summary: "Interview not found.", questionFeedback: [] });
                }
            } catch (e) {
                console.error("Failed to load interview", e);
            }
        };
        loadFeedback();
    }, [interviewId]);

    if (!feedbackData) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading your report...</p>
            </div>
        </div>
    );

    const passed = feedbackData.score >= 70;
    const scoreColor = passed ? "from-green-500 to-emerald-600" : feedbackData.score >= 50 ? "from-amber-500 to-orange-600" : "from-red-500 to-rose-600";
    const scoreStroke = passed ? "#22c55e" : feedbackData.score >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-16">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
            </div>

            <nav className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-xl px-6 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Performance Report</span>
                    </div>
                    <div className="w-24" />
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-6 space-y-6">
                {/* Overall Score Card */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold text-white mb-2">Overall Performance</h1>
                        <p className="text-gray-500 text-sm mb-4">Session #{interviewId.substring(0, 6).toUpperCase()}</p>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${passed ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"}`}>
                            {passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {passed ? "Passed — Great Job!" : "Needs Improvement"}
                        </div>
                        <p className="text-gray-400 mt-4 max-w-sm leading-relaxed">{feedbackData.summary}</p>
                    </div>

                    {/* Score Ring */}
                    <div className="relative w-44 h-44 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="68" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                            <circle
                                cx="80" cy="80" r="68" fill="transparent"
                                stroke={scoreStroke} strokeWidth="12"
                                strokeDasharray={427}
                                strokeDashoffset={427 - (427 * feedbackData.score) / 100}
                                strokeLinecap="round"
                                style={{ filter: `drop-shadow(0 0 8px ${scoreStroke}60)` }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-5xl font-extrabold bg-gradient-to-b ${scoreColor} bg-clip-text text-transparent`}>
                                {Math.round(feedbackData.score)}
                            </span>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Score</span>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                {feedbackData.metrics.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-4">
                        {feedbackData.metrics.map((metric) => {
                            const colors: Record<string, { bar: string; text: string; glow: string }> = {
                                "bg-blue-500": { bar: "bg-blue-500", text: "text-blue-400", glow: "shadow-blue-500/30" },
                                "bg-green-500": { bar: "bg-green-500", text: "text-green-400", glow: "shadow-green-500/30" },
                                "bg-purple-500": { bar: "bg-purple-500", text: "text-purple-400", glow: "shadow-purple-500/30" },
                            };
                            const c = colors[metric.color] || colors["bg-blue-500"];
                            return (
                                <div key={metric.id} className="bg-white/3 border border-white/8 rounded-xl p-5 backdrop-blur-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold text-gray-300 text-sm">{metric.label}</h3>
                                        <span className={`text-lg font-bold ${c.text}`}>{Math.round(metric.value)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                                        <div className={`h-full ${c.bar} rounded-full shadow-lg ${c.glow}`} style={{ width: `${metric.value}%`, transition: "width 1s ease" }} />
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">{metric.feedback}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Question Analysis */}
                {feedbackData.questionFeedback && feedbackData.questionFeedback.length > 0 && (
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-8 backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-400" />
                            Detailed Question Analysis
                        </h2>
                        <div className="space-y-6">
                            {feedbackData.questionFeedback.map((q, idx) => (
                                <div key={idx} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-3 gap-4">
                                        <h3 className="font-semibold text-white text-base leading-snug">
                                            <span className="text-gray-500 mr-2">Q{idx + 1}.</span>{q.question}
                                        </h3>
                                        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-bold ${q.score >= 70 ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-amber-500/15 text-amber-400 border border-amber-500/20"}`}>
                                            {q.score}%
                                        </span>
                                    </div>
                                    <div className="bg-white/3 border border-white/5 p-4 rounded-xl mb-3">
                                        <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">Your Answer</p>
                                        <p className="text-gray-300 text-sm">{q.userAnswer || "No answer provided."}</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-blue-600/5 border border-blue-500/10 p-4 rounded-xl">
                                            <p className="text-xs text-blue-400 font-semibold mb-1 uppercase tracking-wide">Feedback</p>
                                            <p className="text-sm text-gray-400">{q.feedback}</p>
                                        </div>
                                        <div className="bg-purple-600/5 border border-purple-500/10 p-4 rounded-xl">
                                            <p className="text-xs text-purple-400 font-semibold mb-1 uppercase tracking-wide">Ideal Answer</p>
                                            <p className="text-sm text-gray-400 italic">{q.idealAnswer}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <Link href="/interview/setup" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl text-center transition-all shadow-lg shadow-blue-900/30 hover:-translate-y-0.5">
                        Practice Again
                    </Link>
                    <Link href="/dashboard" className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold py-4 rounded-xl text-center transition-all">
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        </div>
    );
}
