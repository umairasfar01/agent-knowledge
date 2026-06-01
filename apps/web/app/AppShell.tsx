import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
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
            
          </nav>
        </aside>

        <section className="px-6 py-10">{children}</section>
      </div>
    </main>
  );
}