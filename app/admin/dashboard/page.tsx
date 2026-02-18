import { checkAdminSession } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";
import { createClerkClient } from "@clerk/backend";
import { Users, FileText, Activity, Shield } from "lucide-react";
import { AdminCharts } from "./_components/AdminCharts";
import Link from "next/link";

export default async function AdminDashboard() {
    const isAdmin = await checkAdminSession();

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="bg-white/5 border border-red-500/20 p-8 rounded-2xl text-center max-w-md">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-6">You must be logged in as an admin to view this page.</p>
                    <Link href="/login" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:-translate-y-0.5 transition-all inline-block">
                        Go to Admin Login
                    </Link>
                </div>
            </div>
        );
    }

    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    // Fetch Stats
    const [totalUsers, totalInterviews, recentInterviews, interviewsByDateRaw, interviewsByTopicRaw] = await Promise.all([
        clerk.users.getCount(),
        prisma.interview.count(),
        prisma.interview.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, topic: true, createdAt: true, score: true }
        }),
        // Raw queries or aggregation for charts
        // Note: Prisma aggregation is limited for dates, so we might fetch and process in JS or use raw query
        // For prototype: Fetch last 100 and process in JS
        prisma.interview.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true, topic: true }
        }),
        prisma.interview.groupBy({
            by: ['topic'],
            _count: { topic: true }
        })
    ]);

    // Process Data for Charts
    const activityData = processActivityData(interviewsByDateRaw);
    const topicData = interviewsByTopicRaw.map(g => ({ name: g.topic, value: g._count.topic }));

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-20">
            <nav className="bg-black/30 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="font-bold text-xl flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Admin Console</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Administrator
                    </div>
                    <Link href="/login" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Sign out</Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Key Metrics */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={totalUsers.toString()}
                        icon={<Users className="w-5 h-5 text-blue-400" />}
                        iconBg="from-blue-600/20 to-blue-900/10 border-blue-500/20"
                        trend="+12% this week"
                        trendColor="text-blue-400"
                    />
                    <StatCard
                        title="Total Interviews"
                        value={totalInterviews.toString()}
                        icon={<FileText className="w-5 h-5 text-green-400" />}
                        iconBg="from-green-600/20 to-green-900/10 border-green-500/20"
                        trend="+5 today"
                        trendColor="text-green-400"
                    />
                    <StatCard
                        title="Avg Score"
                        value="78%"
                        icon={<Activity className="w-5 h-5 text-purple-400" />}
                        iconBg="from-purple-600/20 to-purple-900/10 border-purple-500/20"
                        trend="Stable"
                        trendColor="text-purple-400"
                    />
                </div>

                {/* Charts & Analytics */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/3 border border-white/8 p-6 rounded-2xl backdrop-blur-sm h-96">
                        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-amber-400" />
                            Interview Activity (Last 7 Days)
                        </h2>
                        <AdminCharts type="bar" data={activityData} />
                    </div>
                    <div className="bg-white/3 border border-white/8 p-6 rounded-2xl backdrop-blur-sm h-96">
                        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            Popular Topics
                        </h2>
                        <AdminCharts type="pie" data={topicData} />
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-400" />
                            Recent Interviews
                        </h2>
                        <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">{recentInterviews.length} records</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                    <th className="px-6 py-4">Topic</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentInterviews.map((interview) => (
                                    <tr key={interview.id} className="hover:bg-white/3 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white capitalize">{interview.topic.replace(/_/g, ' ')}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{new Date(interview.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${interview.score > 70
                                                    ? "bg-green-500/15 text-green-400 border border-green-500/20"
                                                    : interview.score > 40
                                                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                                        : "bg-red-500/15 text-red-400 border border-red-500/20"
                                                }`}>
                                                {interview.score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">Completed</span>
                                        </td>
                                    </tr>
                                ))}
                                {recentInterviews.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-600">No interviews found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                    <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                </div>
                <div className={`bg-gradient-to-br ${iconBg} border p-3 rounded-xl`}>{icon}</div>
            </div>
            <p className={`text-sm font-medium ${trendColor}`}>{trend}</p>
        </div>
    );
}

// Helper to Group Interviews by Day
function processActivityData(interviews: { createdAt: Date, topic: string }[]) {
    const days: Record<string, number> = {};
    const today = new Date();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days[d.toLocaleDateString()] = 0;
    }

    interviews.forEach(i => {
        const dateStr = new Date(i.createdAt).toLocaleDateString();
        if (days[dateStr] !== undefined) {
            days[dateStr]++;
        }
    });

    return Object.entries(days).map(([date, count]) => ({
        date: date.split('/')[0] + '/' + date.split('/')[1], // Short format DD/MM
        count
    }));
}
