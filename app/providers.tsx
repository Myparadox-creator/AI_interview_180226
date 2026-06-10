"use client";

import { ClerkProvider } from "@clerk/nextjs";

/**
 * Conditional ClerkProvider that only wraps children when the publishable key
 * is available. During `next build` static page generation (e.g. /_not-found),
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not present, which causes ClerkProvider
 * to throw and crash the build. This wrapper prevents that by rendering
 * children without Clerk when the key is missing.
 *
 * At runtime on Vercel, the env var is always present, so Clerk loads normally.
 */
export default function ConditionalClerkProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        // During build / static generation — render without Clerk
        return <>{children}</>;
    }

    return (
        <ClerkProvider publishableKey={publishableKey}>
            {children}
        </ClerkProvider>
    );
}
