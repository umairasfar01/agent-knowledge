"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { useCurrentRole } from "@/lib/useCurrentRole";

export default function SettingsPage() {
  const { user } = useAuth();
  const currentRole = useCurrentRole();

  return (
    <AppShell>
      <div className="ak-page">
        <header>
          <p className="ak-header-eyebrow">Workspace</p>
          <h1 className="ak-header-title">Settings</h1>
          <p className="ak-header-description">
            View current workspace, organization, and authentication details.
          </p>
        </header>

        <section className="ak-card">
          <h2 className="text-xl font-semibold">Workspace details</h2>

          <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
            <div className="ak-panel">
              <p className="text-neutral-500">Organization ID</p>
              <p className="mt-1 break-all font-mono text-neutral-200">
                {DEFAULT_ORG_ID}
              </p>
            </div>

            <div className="ak-panel">
              <p className="text-neutral-500">Current user</p>
              <p className="mt-1 text-neutral-200">
                {user?.email ?? "Loading user..."}
              </p>
            </div>

            <div className="ak-panel">
              <p className="text-neutral-500">Current role</p>
              <p className="mt-1 text-neutral-200">{currentRole}</p>
            </div>

            <div className="ak-panel">
              <p className="text-neutral-500">Authentication provider</p>
              <p className="mt-1 text-neutral-200">WorkOS AuthKit</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
