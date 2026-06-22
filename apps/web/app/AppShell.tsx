"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getCurrentOrgId } from "@/lib/org";
import { useCurrentRole } from "@/lib/useCurrentRole";


export function AppShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth({ ensureSignedIn: true });
  const { user, signOut, loading } = auth;

  const pathname = usePathname();
  const upsertCurrentUser = useMutation(api.users.upsertCurrentUser);

  const organizationId =
    "organizationId" in auth ? auth.organizationId : undefined;

  const switchToOrganization =
    "switchToOrganization" in auth ? auth.switchToOrganization : undefined;

  const currentOrgId = getCurrentOrgId(organizationId);

  const currentRole = useCurrentRole();

  useEffect(() => {
    if (loading || !user?.id || !user?.email || !currentOrgId) return;

    void upsertCurrentUser({
      workosUserId: user.id,
      email: user.email,
      name: user.firstName ?? undefined,
      organizationId: currentOrgId,
    });
  }, [
    loading,
    user?.id,
    user?.email,
    user?.firstName,
    currentOrgId,
    upsertCurrentUser,
  ]);

  function navClass(href: string) {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return `block rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive
      ? "bg-white text-neutral-950 shadow-sm"
      : "text-neutral-400 hover:bg-neutral-900/80 hover:text-white"
      }`;
  }

  const navGroups = [
    {
      label: "Workspace",
      links: [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/ask", label: "Ask" },
        { href: "/retrieval-history", label: "Retrieval History" },
      ],
    },
    {
      label: "Knowledge",
      links: [
        { href: "/knowledge", label: "Knowledge" },
        { href: "/agents", label: "Agents" },
        { href: "/approvals", label: "Approvals" },
        { href: "/reviews", label: "Reviews" },
        { href: "/audit", label: "Audit Logs" },
      ],
    },
    {
      label: "Admin",
      links: [
        { href: "/members", label: "Members" },
        { href: "/settings", label: "Settings" },
      ],
    },
  ];


  return (
    <main className="min-h-screen bg-neutral-950 bg-[radial-gradient(circle_at_top_left,_rgba(64,64,64,0.24),_transparent_34%)] text-white">
      <div className="grid min-h-screen md:grid-cols-[280px_1fr]">
        <aside className="border-b border-neutral-800 bg-neutral-950/95 p-4 backdrop-blur md:sticky md:top-0 md:h-screen md:overflow-y-auto md:border-b-0 md:border-r md:p-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Agent Knowledge
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-white">
              Company Brain
            </h1>
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Trusted knowledge for agents
            </p>
          </div>

          <nav className="mt-6">
            <div className="grid grid-cols-2 gap-5 md:block">
              {navGroups.map((group, groupIndex) => (
                <div
                  key={group.label}
                  className={`col-span-2 ${groupIndex === 0 ? "md:mt-0" : "md:mt-5"}`}
                >
                  <p className="px-3 text-xs font-medium uppercase tracking-wide text-neutral-600">
                    {group.label}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 md:block md:space-y-1.5">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch={false}
                        className={navClass(link.href)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>


            <div className="col-span-2 mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm md:mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Organization
              </p>
              <p className="mt-2 break-all text-sm font-medium text-neutral-200">
                {currentOrgId}
              </p>

              {switchToOrganization && (
                <button
                  type="button"
                  onClick={() => switchToOrganization(currentOrgId)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:border-neutral-600 hover:bg-neutral-800 hover:text-white"
                >
                  Use WorkOS organization
                </button>
              )}
            </div>

            <div className="col-span-2 mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm md:mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Signed in as
              </p>
              <p className="mt-2 truncate text-sm font-medium text-neutral-200">
                {user?.email ?? "Loading user..."}
              </p>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Role
              </p>
              <p className="mt-2 text-sm text-neutral-300">
                {currentRole === "loading" ? "Loading..." : currentRole}
              </p>

              <button
                type="button"
                onClick={() => signOut()}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-600 hover:bg-neutral-800 hover:text-white"
              >
                Sign out
              </button>
            </div>

          </nav>
        </aside>

        <section className="min-w-0 px-4 py-6 sm:px-5 md:px-8 md:py-8 lg:px-10">
          {children}
        </section>
      </div>
    </main>
  );
}
