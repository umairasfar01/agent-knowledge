"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";

export default function DashboardPage() {
  const knowledgeItems = useQuery(api.knowledge.listKnowledge, {
    organizationId: DEFAULT_ORG_ID,
  });
  const agents = useQuery(api.agents.listAgents, {
    organizationId: DEFAULT_ORG_ID,
  });

  const total = knowledgeItems?.length ?? 0;
  const drafts = knowledgeItems?.filter((item) => item.status === "draft").length ?? 0;
  const verified =
    knowledgeItems?.filter((item) => item.status === "verified").length ?? 0;

  const totalAgents = agents?.length ?? 0;
  const activeAgents =
    agents?.filter((agent) => agent.status === "active").length ?? 0;

  const requiresApproval =
    knowledgeItems?.filter((item) => item.requiresApproval).length ?? 0;

  const canAct =
    knowledgeItems?.filter((item) => item.canUseToAct).length ?? 0;

  return (
    <AppShell>
      <div className="ak-page">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="ak-header-eyebrow">
              Agent Knowledge
            </p>
            <h1 className="ak-header-title">Dashboard</h1>
            <p className="ak-header-description">
              Overview of your company knowledge workspace.
            </p>
          </div>

          <Link
            href="/knowledge"
            className="ak-button-primary w-fit"
          >
            Manage Knowledge
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="ak-card">
            <p className="ak-muted">Total knowledge</p>
            <p className="mt-3 text-4xl font-bold">{total}</p>
          </div>

          <div className="ak-card">
            <p className="ak-muted">Draft items</p>
            <p className="mt-3 text-4xl font-bold">{drafts}</p>
          </div>

          <div className="ak-card">
            <p className="ak-muted">Verified items</p>
            <p className="mt-3 text-4xl font-bold">{verified}</p>
          </div>

          <div className="ak-card">
            <p className="ak-muted">Total agents</p>
            <p className="mt-3 text-4xl font-bold">{totalAgents}</p>
          </div>

          <div className="ak-card">
            <p className="ak-muted">Active agents</p>
            <p className="mt-3 text-4xl font-bold">{activeAgents}</p>
          </div>

          <div className="ak-card">
            <p className="ak-muted">Needs approval</p>
            <p className="mt-3 text-4xl font-bold">{requiresApproval}</p>
          </div>

          <div className="ak-card">
            <p className="ak-muted">Can take action</p>
            <p className="mt-3 text-4xl font-bold">{canAct}</p>
          </div>
        </section>

        <section className="ak-card">
          <h2 className="text-xl font-semibold">Next product areas</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ak-panel">
              <h3 className="font-medium">Agent permissions</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Decide which agents can use each knowledge item.
              </p>
            </div>

            <div className="ak-panel">
              <h3 className="font-medium">Approval rules</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Mark whether knowledge can be used to answer or take action.
              </p>
            </div>

            <div className="ak-panel">
              <h3 className="font-medium">Sources</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Track where each knowledge record came from.
              </p>
            </div>

            <div className="ak-panel">
              <h3 className="font-medium">Audit trail</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Record who changed knowledge and when.
              </p>
            </div>
          </div>
        </section>

        <section className="ak-card">
          <div>
            <h2 className="text-xl font-semibold">Quick actions</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Jump into the most important workspace areas.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/knowledge"
              className="ak-panel transition hover:border-neutral-700 hover:bg-neutral-900"
            >
              <h3 className="font-medium">Manage Knowledge</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Create, review, and organize trusted agent knowledge.
              </p>
            </Link>

            <Link
              href="/agents"
              className="ak-panel transition hover:border-neutral-700 hover:bg-neutral-900"
            >
              <h3 className="font-medium">Manage Agents</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Create agents and control which knowledge they can access.
              </p>
            </Link>

            <Link
              href="/approvals"
              className="ak-panel transition hover:border-neutral-700 hover:bg-neutral-900"
            >
              <h3 className="font-medium">Review Approvals</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Review knowledge that requires approval before agents act.
              </p>
            </Link>

            <Link
              href="/audit"
              className="ak-panel transition hover:border-neutral-700 hover:bg-neutral-900"
            >
              <h3 className="font-medium">View Audit Logs</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Track changes made to knowledge and agents.
              </p>
            </Link>

            <Link
              href="/settings"
              className="ak-panel transition hover:border-neutral-700 hover:bg-neutral-900"
            >
              <h3 className="font-medium">Workspace Settings</h3>
              <p className="mt-1 text-sm text-neutral-400">
                View organization, user, role, and auth details.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
