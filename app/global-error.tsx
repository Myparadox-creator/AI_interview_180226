'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
                    <p className="text-gray-600 mb-8 max-w-md text-center">
                        We apologize for the inconvenience. An unexpected error has occurred.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Try again
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-red-50 text-red-900 rounded-lg max-w-2xl overflow-auto">
                            <p className="font-mono text-sm whitespace-pre-wrap">{error.message}</p>
                            {error.digest && <p className="text-xs mt-2 text-red-700">Digest: {error.digest}</p>}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
