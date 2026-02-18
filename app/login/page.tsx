"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Shield, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";
import { validateAdminLogin } from "@/app/admin/actions";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (activeTab === "admin") {
            const isValid = await validateAdminLogin(email, password);
            if (isValid) {
                router.push("/admin/dashboard");
            } else {
                setError("Invalid admin credentials. Access denied.");
                setIsLoading(false);
            }
        } else {
            // Regular user — redirect to Clerk sign-in
            setTimeout(() => {
                setIsLoading(false);
                router.push("/sign-in");
            }, 500);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
            {/* Background blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex justify-center items-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">InterView</span>
                </div>

                <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors w-fit mx-auto">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                {/* Tab Switcher */}
                <div className="flex bg-white/5 border border-white/8 rounded-xl p-1 mb-6">
                    <button
                        onClick={() => setActiveTab("user")}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "user"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        User Login
                    </button>
                    <button
                        onClick={() => setActiveTab("admin")}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === "admin"
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        Admin Access
                    </button>
                </div>

                {/* Card */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                    {activeTab === "admin" && (
                        <div className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-amber-300 text-sm font-semibold">Admin Access</p>
                                <p className="text-amber-400/70 text-xs mt-0.5">Sign in with your admin credentials to access the dashboard.</p>
                            </div>
                        </div>
                    )}

                    <h2 className="text-2xl font-bold text-white mb-1">
                        {activeTab === "admin" ? "Admin Sign In" : "Welcome back"}
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                        {activeTab === "admin"
                            ? "Access the admin control panel"
                            : "Sign in to continue your interview practice"}
                    </p>

                    {/* Error message */}
                    {error && (
                        <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-600" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
                                    placeholder={activeTab === "admin" ? "admin@example.com" : "you@example.com"}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-600" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500" />
                                <span className="text-sm text-gray-400">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 ${activeTab === "admin"
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-orange-900/30"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-900/30"
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {activeTab === "admin" ? <Shield className="w-4 h-4" /> : null}
                                    {isLoading ? "Signing in..." : activeTab === "admin" ? "Access Admin Panel" : "Sign In"}
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {activeTab === "user" && (
                        <p className="mt-6 text-center text-sm text-gray-500">
                            Don&apos;t have an account?{" "}
                            <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Sign up free
                            </Link>
                        </p>
                    )}

                    {activeTab === "admin" && (
                        <p className="mt-6 text-center text-xs text-gray-600">
                            Admin access is restricted. Contact your system administrator if you need access.
                        </p>
                    )}
                </div>

                {/* Quick admin link */}
                {activeTab === "user" && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setActiveTab("admin")}
                            className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1 mx-auto"
                        >
                            <Shield className="w-3 h-3" />
                            Admin? Click here
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
