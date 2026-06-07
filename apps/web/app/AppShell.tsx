"use client";

import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

function navClass(href: string) {
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return `block rounded-lg px-3 py-2 text-sm ${isActive
    ? "bg-neutral-800 text-white"
    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
    }`;
}


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
            <Link href="/dashboard" className={navClass("/dashboard")}>
              Dashboard
            </Link>

            <Link href="/knowledge" className={navClass("/knowledge")}>
              Knowledge
            </Link>

            <Link href="/agents" className={navClass("/agents")}>
              Agents
            </Link>

            <Link href="/approvals" className={navClass("/approvals")}>
              Approvals
            </Link>

            <Link href="/audit" className={navClass("/audit")}>
              Audit Logs
            </Link>


            <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">Organization</p>
              <p className="mt-1 text-sm font-medium text-neutral-300">
                {DEFAULT_ORG_ID}
              </p>
            </div>

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