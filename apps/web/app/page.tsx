"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
          <p className="text-sm font-medium text-neutral-400">
            Agent Knowledge
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Company brain for AI agents
          </h1>

          <p className="mt-4 max-w-2xl text-neutral-300">
            Store trusted company knowledge, development context, agent
            instructions, skills, and memory in one workspace.
          </p>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="rounded-lg bg-white px-4 py-2 font-medium text-black"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}