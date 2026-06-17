"use client";

import { useState } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { useCurrentRole } from "@/lib/useCurrentRole";
import { canManageKnowledge } from "@/lib/role";

export default function SettingsPage() {
  const { user } = useAuth({ ensureSignedIn: true });
  const currentRole = useCurrentRole();
  const canManage = currentRole !== "loading" && canManageKnowledge(currentRole);

  const settings = useQuery(api.organizations.getOrganizationSettings, {
    organizationId: DEFAULT_ORG_ID,
  });

  const updateSettings = useMutation(
    api.organizations.updateOrganizationSettings
  );

  const [displayNameInput, setDisplayNameInput] = useState<string | null>(null);
  const [defaultCategoryInput, setDefaultCategoryInput] = useState<string | null>(
    null
  );
  const [defaultStatusInput, setDefaultStatusInput] = useState<
    "draft" | "verified" | null
  >(null);
  const [defaultCanAnswerInput, setDefaultCanAnswerInput] = useState<
    boolean | null
  >(null);
  const [defaultCanActInput, setDefaultCanActInput] = useState<boolean | null>(
    null
  );

  const displayName =
    displayNameInput ?? settings?.displayName ?? "Agent Knowledge Workspace";

  const defaultCategory =
    defaultCategoryInput ??
    settings?.defaultKnowledgeCategory ??
    "Company Policy";

  const defaultStatus =
    defaultStatusInput ?? settings?.defaultKnowledgeStatus ?? "draft";

  const defaultCanAnswer =
    defaultCanAnswerInput ?? settings?.defaultCanUseToAnswer ?? true;

  const defaultCanAct =
    defaultCanActInput ?? settings?.defaultCanUseToAct ?? false;


  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await updateSettings({
        organizationId: DEFAULT_ORG_ID,
        workosUserId: user?.id ?? "",
        actorEmail: user?.email ?? "unknown-user",
        displayName,
        defaultKnowledgeCategory: defaultCategory,
        defaultKnowledgeStatus: defaultStatus,
        defaultCanUseToAnswer: defaultCanAnswer,
        defaultCanUseToAct: defaultCanAct,
      });

      setMessage("Organization settings updated.");
      setDisplayNameInput(null);
      setDefaultCategoryInput(null);
      setDefaultStatusInput(null);
      setDefaultCanAnswerInput(null);
      setDefaultCanActInput(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update organization settings."
      );
    }
  }

  return (
    <AppShell>
      <div className="ak-page">
        <header>
          <p className="ak-header-eyebrow">Workspace</p>
          <h1 className="ak-header-title">Settings</h1>
          <p className="ak-header-description">
            Manage workspace identity and default knowledge behavior.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSaveSettings} className="ak-card space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Organization settings
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                These settings apply to the current organization.
              </p>
            </div>

            {settings === undefined ? (
              <p className="ak-muted">Loading settings...</p>
            ) : (
              <>
                <div>
                  <label className="ak-label">Workspace display name</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    className="ak-input mt-2"
                    placeholder="Agent Knowledge Workspace"
                    disabled={!canManage}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="ak-label">
                      Default knowledge category
                    </label>
                    <input
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategoryInput(e.target.value)}
                      className="ak-input mt-2"
                      placeholder="Company Policy"
                      disabled={!canManage}
                    />
                  </div>

                  <div>
                    <label className="ak-label">
                      Default knowledge status
                    </label>
                    <select
                      value={defaultStatus}
                      onChange={(e) =>
                        setDefaultStatusInput(e.target.value as "draft" | "verified")
                      }
                      className="ak-select mt-2"
                      disabled={!canManage}
                    >
                      <option value="draft">Draft</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <input
                      type="checkbox"
                      checked={defaultCanAnswer}
                      onChange={(e) => setDefaultCanAnswerInput(e.target.checked)}
                      disabled={!canManage}
                      className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-950"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">
                        Can use to answer
                      </span>
                      <span className="mt-1 block text-sm text-neutral-500">
                        New knowledge defaults to answerable.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <input
                      type="checkbox"
                      checked={defaultCanAct}
                      onChange={(e) => setDefaultCanActInput(e.target.checked)}
                      disabled={!canManage}
                      className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-950"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">
                        Can use to act
                      </span>
                      <span className="mt-1 block text-sm text-neutral-500">
                        New knowledge defaults to tool-action eligible.
                      </span>
                    </span>
                  </label>
                </div>

                {message && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="text-sm text-emerald-300">{message}</p>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canManage}
                  className="ak-button-primary"
                >
                  Save settings
                </button>
              </>
            )}
          </form>

          <aside className="space-y-4">
            <section className="ak-card">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Signed in user
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {user?.email ?? "Loading user..."}
              </p>
            </section>

            <section className="ak-card">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Current role
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {currentRole === "loading" ? "Loading..." : currentRole}
              </p>
            </section>

            <section className="ak-card">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Organization ID
              </p>
              <p className="mt-2 break-all font-mono text-xs text-neutral-300">
                {DEFAULT_ORG_ID}
              </p>
            </section>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}