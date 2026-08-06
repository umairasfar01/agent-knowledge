"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
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
    <div className="ak-page">
      <header className="border-b border-neutral-800/80 pb-6">
        <p className="ak-header-eyebrow">Something went wrong</p>
        <h1 className="ak-header-title">This page could not load</h1>
        <p className="ak-header-description">
          The workspace is still signed in. You can retry this page or move to
          another section.
        </p>
      </header>

      <section className="ak-card space-y-5">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-red-300/70">
              Reference: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="ak-button-primary justify-center"
          >
            Try again
          </button>
          <Link href="/dashboard" className="ak-button-secondary justify-center">
            Back to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
