"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Video, MessageSquare, BarChart, MoreVertical } from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm relative">
        <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <MessageSquare className="w-8 h-8" />
          <span>InterView</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 font-medium px-2 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-6 h-6" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <Link
                  href="/sign-in"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  User Login
                </Link>
                <Link
                  href="/admin/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
            Master Your Next Interview
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Practice Interviews with <span className="text-blue-600">AI-Powered</span> Feedback
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gain confidence and improve your communication skills with realistic mock interviews.
            Get instant, structured feedback to land your dream job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Start Practicing Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-lg px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose InterView?</h2>
            <p className="text-gray-600 text-lg">Everything you need to ace your next technical or behavioral interview.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Video className="w-10 h-10 text-blue-600" />}
              title="Realistic Simulations"
              description="Practice in a realistic video interview environment that mimics actual remote interviews."
            />
            <FeatureCard
              icon={<MessageSquare className="w-10 h-10 text-green-600" />}
              title="Instant AI Feedback"
              description="Get detailed analysis on your clarity, pace, confidence, and answer quality immediately after finishing."
            />
            <FeatureCard
              icon={<BarChart className="w-10 h-10 text-purple-600" />}
              title="Track Progress"
              description="Monitor your improvement over time with detailed analytics and performance history."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-500">© 2024 InterView. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4 bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
