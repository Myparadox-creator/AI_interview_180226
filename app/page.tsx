"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Video, MessageSquare, BarChart, MoreVertical, Sparkles, Shield, Zap } from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-xl py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">InterView</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-2 z-50">
                <Link href="/sign-in" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  User Login
                </Link>
                <Link href="/admin/dashboard" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Admin Dashboard
                </Link>
              </div>
            )}
          </div>
          <Link href="/login" className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-0.5">
            Login
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative flex-1 flex flex-col justify-center items-center text-center px-6 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-semibold backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            AI-Powered Interview Practice
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Ace Your Next</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Interview
            </span>
            <span className="text-white"> with AI</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Practice with a realistic AI interviewer. Get instant, structured feedback to
            build confidence and land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard" className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-1">
              Start Practicing Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all backdrop-blur-sm">
              Learn More
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-white/5">
            {[["500+", "Questions"], ["AI-Powered", "Feedback"], ["Real-time", "Analysis"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{val}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">InterView?</span></h2>
            <p className="text-gray-400 text-lg">Everything you need to ace your next technical or behavioral interview.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Video className="w-7 h-7 text-blue-400" />}
              iconBg="from-blue-600/20 to-blue-800/10 border-blue-500/20"
              title="Realistic Simulations"
              description="Practice in a realistic video interview environment that mimics actual remote interviews."
            />
            <FeatureCard
              icon={<Zap className="w-7 h-7 text-purple-400" />}
              iconBg="from-purple-600/20 to-purple-800/10 border-purple-500/20"
              title="Instant AI Feedback"
              description="Get detailed analysis on your clarity, pace, confidence, and answer quality immediately after finishing."
            />
            <FeatureCard
              icon={<BarChart className="w-7 h-7 text-cyan-400" />}
              iconBg="from-cyan-600/20 to-cyan-800/10 border-cyan-500/20"
              title="Track Progress"
              description="Monitor your improvement over time with detailed analytics and performance history."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-10 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-white" />
            </div>
            <p className="text-gray-500 text-sm">© 2025 InterView. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, iconBg, title, description }: { icon: React.ReactNode; iconBg: string; title: string; description: string }) {
  return (
    <div className="group relative bg-white/3 hover:bg-white/5 border border-white/8 hover:border-white/15 rounded-2xl p-8 transition-all duration-300 backdrop-blur-sm hover:-translate-y-1">
      <div className={`w-14 h-14 bg-gradient-to-br ${iconBg} border rounded-xl flex items-center justify-center mb-5`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
