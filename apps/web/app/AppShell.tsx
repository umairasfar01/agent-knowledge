"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { usePathname } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getCurrentOrgId } from "@/lib/org";


export function AppShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, signOut } = auth;

  const pathname = usePathname();
  const upsertCurrentUser = useMutation(api.users.upsertCurrentUser);

  const organizationId =
    "organizationId" in auth ? auth.organizationId : undefined;

  const switchToOrganization =
    "switchToOrganization" in auth ? auth.switchToOrganization : undefined;

  const currentOrgId = getCurrentOrgId(organizationId);

  const membershipData = useQuery(
    api.users.getMembershipByWorkosUser,
    user?.id
      ? {
        workosUserId: user.id,
        organizationId: currentOrgId,
      }
      : "skip"
  );

  const currentRole = membershipData?.membership.role ?? "member";

  useEffect(() => {
    if (!user?.id || !user?.email || !currentOrgId) return;

    void upsertCurrentUser({
      workosUserId: user.id,
      email: user.email,
      name: user.firstName ?? undefined,
      organizationId: currentOrgId,
    });
  }, [user?.id, user?.email, user?.firstName, currentOrgId, upsertCurrentUser]);

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

            <Link href="/settings" className={navClass("/settings")}>
              Settings
            </Link>


            <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">Organization</p>
              <p className="mt-1 text-sm font-medium text-neutral-300">
                {currentOrgId}
              </p>

              {switchToOrganization && (
                <button
                  type="button"
                  onClick={() => switchToOrganization(currentOrgId)}
                  className="mt-3 rounded-lg border border-neutral-700 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  Use WorkOS organization
                </button>
              )}
            </div>

            <div className="mt-8 border-t border-neutral-800 pt-6">
              <p className="text-xs text-neutral-500">Signed in as</p>
              <p className="mt-1 truncate text-sm text-neutral-300">
                {user?.email ?? "Loading user..."}
              </p>

              <p className="mt-3 text-xs text-neutral-500">Role</p>
              <p className="mt-1 text-sm text-neutral-300">{currentRole}</p>

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