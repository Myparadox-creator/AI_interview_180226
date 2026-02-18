import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "@/lib/prisma";
import { Users, FileText, Activity } from "lucide-react";

export default async function AdminDashboard() {
    const user = await currentUser();

    // 1. Security Check
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!user || user.emailAddresses[0].emailAddress !== adminEmail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow border border-red-100 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
                    <p className="text-sm text-gray-400">Current User: {user?.emailAddresses[0].emailAddress}</p>
                    <p className="text-sm text-gray-400">Expected Admin: {adminEmail}</p>
                </div>
            </div>
        );
    }

    // 2. Fetch Data
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    // Fetch user count (Note: getting full list might be slow for massive apps, using limit 1 for count if avail or just list)
    // For prototype, getting list length is fine.
    const userList = await clerk.users.getUserList({ limit: 100 });
    const totalUsers = await clerk.users.getCount();

    const totalInterviews = await prisma.interview.count();

    // Recent interviews
    const recentInterviews = await prisma.interview.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            topic: true,
            createdAt: true,
            score: true,
        }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl text-blue-600">InterView Admin</div>
                <div className="text-sm text-gray-500">Authorized: {user.emailAddresses[0].emailAddress}</div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Total Users"
                        value={totalUsers.toString()}
                        icon={<Users className="w-6 h-6 text-blue-600" />}
                    />
                    <StatCard
                        title="Total Interviews"
                        value={totalInterviews.toString()}
                        icon={<FileText className="w-6 h-6 text-green-600" />}
                    />
                    <StatCard
                        title="Avg Interviews/User"
                        value={totalUsers > 0 ? (totalInterviews / totalUsers).toFixed(1) : "0"}
                        icon={<Activity className="w-6 h-6 text-purple-600" />}
                    />
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Recent Interview Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentInterviews.map((interview) => (
                            <div key={interview.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50">
                                <div>
                                    <h3 className="font-medium text-gray-900 capitalize">{interview.topic}</h3>
                                    <p className="text-sm text-gray-500">{new Date(interview.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Score: {interview.score}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">{icon}</div>
            </div>
        </div>
    );
}
