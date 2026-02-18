import Link from "next/link";
import { Plus, BarChart, Clock, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { getInterviews } from "@/app/actions";
import { UserButton } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";

export default async function Dashboard() {
    const interviews = await getInterviews();

    const totalInterviews = interviews.length;
    const avgScore = totalInterviews > 0
        ? Math.round(interviews.reduce((acc, curr) => acc + curr.feedback.score, 0) / totalInterviews)
        : 0;

    const timePracticedMinutes = totalInterviews * 5;
    const hours = Math.floor(timePracticedMinutes / 60);
    const minutes = timePracticedMinutes % 60;
    const timeDisplay = `${hours}h ${minutes}m`;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Animated background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
            </div>

            <nav className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-xl px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">InterView</span>
                </div>
                <div className="flex items-center gap-4">
                    <UserButton />
                </div>
            </nav>

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-gray-400 mt-1">Track your interview performance</p>
                    </div>
                    <Link
                        href="/interview/setup"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/30 hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        New Interview
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-5 mb-10">
                    <StatCard
                        title="Interviews Completed"
                        value={totalInterviews.toString()}
                        icon={<Calendar className="w-5 h-5 text-blue-400" />}
                        iconBg="from-blue-600/20 to-blue-900/10 border-blue-500/20"
                        trend={totalInterviews > 0 ? "Keep it up!" : "Start your first!"}
                        trendColor="text-blue-400"
                    />
                    <StatCard
                        title="Average Score"
                        value={`${avgScore}%`}
                        icon={<BarChart className="w-5 h-5 text-purple-400" />}
                        iconBg="from-purple-600/20 to-purple-900/10 border-purple-500/20"
                        trend={avgScore > 70 ? "🎉 Excellent!" : "Keep practicing"}
                        trendColor={avgScore > 70 ? "text-green-400" : "text-amber-400"}
                    />
                    <StatCard
                        title="Time Practiced"
                        value={timeDisplay}
                        icon={<Clock className="w-5 h-5 text-cyan-400" />}
                        iconBg="from-cyan-600/20 to-cyan-900/10 border-cyan-500/20"
                        trend="Total practice time"
                        trendColor="text-cyan-400"
                    />
                </div>

                {/* Recent Interviews */}
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <h2 className="font-semibold text-white">Recent Interviews</h2>
                        </div>
                        <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full">{totalInterviews} saved</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {interviews.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-gray-600" />
                                </div>
                                <p className="text-gray-400 font-medium">No interviews yet</p>
                                <p className="text-gray-600 text-sm mt-1">Start your first interview to see your progress!</p>
                            </div>
                        ) : (
                            interviews.map((interview) => (
                                <Link key={interview.id} href={`/feedback/${interview.id}`} className="block group">
                                    <div className="p-5 flex items-center justify-between hover:bg-white/3 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 p-3 rounded-xl">
                                                <Calendar className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white capitalize">{interview.topic.replace(/_/g, " ")} Interview</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(interview.date).toLocaleDateString()} • {new Date(interview.date).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-white">{Math.round(interview.feedback.score)}%</div>
                                                <div className={`text-xs font-medium ${interview.feedback.score >= 70 ? "text-green-400" : "text-amber-400"}`}>
                                                    {interview.feedback.score >= 70 ? "Passed ✓" : "Needs Work"}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, iconBg, trend, trendColor }: {
    title: string; value: string; icon: React.ReactNode;
    iconBg: string; trend: string; trendColor: string;
}) {
    return (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/5 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white">{value}</h3>
                </div>
                <div className={`bg-gradient-to-br ${iconBg} border p-3 rounded-xl`}>{icon}</div>
            </div>
            <p className={`text-sm font-medium ${trendColor}`}>{trend}</p>
        </div>
    );
}
