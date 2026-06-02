"use client";

import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <aside className="border-r border-neutral-800 bg-neutral-900 p-6">
          <div>
            <p className="text-sm font-medium text-neutral-400">
              Agent Knowledge
            </p>
            <h1 className="mt-1 text-xl font-bold">Company Brain</h1>
          </div>

          <nav className="mt-8 space-y-2">
            <Link
              href="/dashboard"
              className="block rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/knowledge"
              className="block rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Knowledge
            </Link>

            <Link
              href="/audit"
              className="block rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Audit Logs
            </Link>

            <Link
              href="/agents"
              className="block rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Agents
            </Link>

            <Link
              href="/approvals"
              className="block rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Approvals
            </Link>

            <div className="mt-8 border-t border-neutral-800 pt-6">
              <p className="text-xs text-neutral-500">Signed in as</p>
              <p className="mt-1 truncate text-sm text-neutral-300">
                {user?.email ?? "Unknown user"}
              </p>

              <button
                type="button"
                onClick={() => signOut()}
                className="mt-4 w-full rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                Sign out
              </button>
            </div>
            
          </nav>
        </aside>

        <section className="px-6 py-10">{children}</section>
      </div>
    </main>
  );
}