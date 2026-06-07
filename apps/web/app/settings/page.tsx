"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { CURRENT_USER_ROLE } from "@/lib/role";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <p className="text-sm font-medium text-neutral-400">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-neutral-400">
            View current workspace, organization, and authentication details.
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-xl font-semibold">Workspace details</h2>

          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-neutral-500">Organization ID</p>
              <p className="mt-1 font-mono text-neutral-200">
                {DEFAULT_ORG_ID}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-neutral-500">Current user</p>
              <p className="mt-1 text-neutral-200">
                {user?.email ?? "Unknown user"}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-neutral-500">Current role</p>
              <p className="mt-1 text-neutral-200">{CURRENT_USER_ROLE}</p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-neutral-500">Authentication provider</p>
              <p className="mt-1 text-neutral-200">WorkOS AuthKit</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
