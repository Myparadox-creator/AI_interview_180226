import Link from "next/link";
import { Plus, BarChart, Clock, Calendar, ChevronRight } from "lucide-react";
import { getInterviews } from "@/app/actions";
import { UserButton } from "@clerk/nextjs";

export default async function Dashboard() {
    const interviews = await getInterviews();

    // Calculate Stats
    const totalInterviews = interviews.length;
    const avgScore = totalInterviews > 0
        ? Math.round(interviews.reduce((acc, curr) => acc + curr.feedback.score, 0) / totalInterviews)
        : 0;

    // Mock time practiced (e.g. 5 mins per interview)
    const timePracticedMinutes = totalInterviews * 5;
    const hours = Math.floor(timePracticedMinutes / 60);
    const minutes = timePracticedMinutes % 60;
    const timeDisplay = `${hours}h ${minutes}m`;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl text-blue-600">InterView</div>
                <div className="flex items-center gap-4">
                    <UserButton />
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <Link
                        href="/interview/setup"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Start New Interview
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Interviews Completed"
                        value={totalInterviews.toString()}
                        icon={<Calendar className="w-6 h-6 text-blue-600" />}
                        trend={totalInterviews > 0 ? "Keep it up!" : "Start your first!"}
                    />
                    <StatCard
                        title="Average Score"
                        value={`${avgScore}%`}
                        icon={<BarChart className="w-6 h-6 text-green-600" />}
                        trend={avgScore > 70 ? "Excellent" : "Needs Practice"}
                    />
                    <StatCard
                        title="Time Practiced"
                        value={timeDisplay}
                        icon={<Clock className="w-6 h-6 text-purple-600" />}
                        trend="Total Time"
                    />
                </div>

                {/* Recent Interviews */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="font-semibold text-gray-900">Recent Interviews</h2>
                        <span className="text-sm text-gray-500">{totalInterviews} saved</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {interviews.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No interviews yet. Start one to see your progress!
                            </div>
                        ) : (
                            interviews.map((interview) => (
                                <Link key={interview.id} href={`/feedback/${interview.id}`} className="block">
                                    <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <Calendar className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 capitalize">{interview.topic} Interview</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(interview.date).toLocaleDateString()} • {new Date(interview.date).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">{Math.round(interview.feedback.score)}%</div>
                                                <div className={`text-xs font-medium ${interview.feedback.score >= 70 ? "text-green-600" : "text-amber-600"}`}>
                                                    {interview.feedback.score >= 70 ? "Passed" : "Improve"}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
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

function StatCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">{icon}</div>
            </div>
            <p className="text-sm text-green-600 font-medium">{trend}</p>
        </div>
    );
}
