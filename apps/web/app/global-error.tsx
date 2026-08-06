"use client";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 py-16 text-white">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0b0b0b] p-6 shadow-2xl shadow-black/40">
            <div className="mb-5 h-1 w-14 rounded-full bg-red-400/80" />

            <h1 className="text-xl font-semibold tracking-tight">
              The application failed to load
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              {error.message ||
                "An unexpected error occurred while starting the workspace."}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-neutral-600">
                Reference: {error.digest}
              </p>
            )}

            <button
              type="button"
              onClick={() => unstable_retry()}
              className="mt-6 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
