"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle, Award, Download } from "lucide-react";
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
                    setFeedbackData({
                        score: 0,
                        metrics: [],
                        summary: "Interview not found.",
                        questionFeedback: []
                    });
                }
            } catch (e) {
                console.error("Failed to load interview", e);
            }
        };
        loadFeedback();
    }, [interviewId]);

    if (!feedbackData) return <div className="p-10 text-center">Loading analysis...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Link>
                    <div className="font-bold text-xl text-gray-900">Performance Report</div>
                    <button className="flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6">
                {/* Overall Score Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Overall Performance</h1>
                        <p className="text-gray-500">Interview ID: #{interviewId.substring(0, 6)}</p>
                        <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">{feedbackData.score >= 70 ? "Passed" : "Needs Improvement"}</span>
                        </div>
                    </div>

                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="transparent"
                                stroke="#e5e7eb"
                                strokeWidth="10"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="transparent"
                                stroke="#2563eb"
                                strokeWidth="10"
                                strokeDasharray={440}
                                strokeDashoffset={440 - (440 * feedbackData.score) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-gray-900">{Math.round(feedbackData.score)}</span>
                            <span className="text-xs text-gray-500 uppercase font-semibold">Score</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {feedbackData.metrics.map((metric) => (
                        <div key={metric.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-700">{metric.label}</h3>
                                <span className="text-lg font-bold text-gray-900">{Math.round(metric.value)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                                <div
                                    className={`h-full ${metric.color}`}
                                    style={{ width: `${metric.value}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500">{metric.feedback}</p>
                        </div>
                    ))}
                </div>

                {/* Detailed Question Analysis */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Award className="w-6 h-6 text-blue-500" />
                        Detailed Question Analysis
                    </h2>
                    <div className="space-y-6">
                        {feedbackData.questionFeedback?.map((q, idx) => (
                            <div key={idx} className="border-b border-gray-100 pb-6 last:border-0">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-800 text-lg">Question {idx + 1}: {q.question}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${q.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {q.score}%
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                                    <p className="text-sm text-gray-500 font-semibold mb-1">Your Answer:</p>
                                    <p className="text-gray-700">{q.userAnswer || "No answer provided."}</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 font-semibold mb-1">Feedback:</p>
                                        <p className="text-sm text-gray-600">{q.feedback}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-semibold mb-1">Ideal Answer / Key Concepts:</p>
                                        <p className="text-sm text-gray-600 italic">{q.idealAnswer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Award className="w-6 h-6 text-yellow-500" />
                        AI Analysis & Recommendations
                    </h2>
                    <div className="prose prose-blue max-w-none">
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {feedbackData.summary}
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Key Strengths</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Demonstrated effort in answering questions.</li>
                            <li>Maintained engagement throughout the session.</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Areas for Improvement</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Focus on structuring your answers more clearly.</li>
                            <li>Ensure you address all parts of technical questions.</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
