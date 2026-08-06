"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 py-16 text-white">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0b0b0b] p-6 shadow-2xl shadow-black/40">
        <div className="mb-5 h-1 w-14 rounded-full bg-red-400/80" />

        <h1 className="text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-neutral-600">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="ak-button-primary justify-center"
          >
            Try again
          </button>
          <Link href="/" className="ak-button-secondary justify-center">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
