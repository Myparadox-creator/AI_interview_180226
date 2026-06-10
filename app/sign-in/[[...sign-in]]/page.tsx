"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const { isSignedIn, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        // If the user is already signed in, redirect to dashboard
        if (isLoaded && isSignedIn) {
            router.replace("/dashboard");
        }
    }, [isLoaded, isSignedIn, router]);

    // Show loading state while Clerk loads
    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0a0f]">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If already signed in, show loading while redirecting
    if (isSignedIn) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0a0f]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Already signed in. Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    // Not signed in — show the Clerk sign-in component
    return (
        <div className="flex justify-center items-center h-screen bg-[#0a0a0f]">
            <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/dashboard"
            />
        </div>
    );
}
