import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 py-16 text-white">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0b0b0b] p-6 shadow-2xl shadow-black/40">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
          404
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          The page you are looking for does not exist or you may not have access
          to it.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            prefetch={false}
            className="ak-button-primary justify-center"
          >
            Go to dashboard
          </Link>
          <Link href="/" className="ak-button-secondary justify-center">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
