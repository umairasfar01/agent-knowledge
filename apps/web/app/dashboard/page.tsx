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
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-400">
              Agent Knowledge
            </p>
            <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-neutral-400">
              Overview of your company knowledge workspace.
            </p>
          </div>

          <Link
            href="/knowledge"
            className="rounded-lg bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200"
          >
            Manage Knowledge
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Total Knowledge</p>
            <p className="mt-3 text-4xl font-bold">{total}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Draft Items</p>
            <p className="mt-3 text-4xl font-bold">{drafts}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Verified Items</p>
            <p className="mt-3 text-4xl font-bold">{verified}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Total Agents</p>
            <p className="mt-3 text-4xl font-bold">{totalAgents}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Active Agents</p>
            <p className="mt-3 text-4xl font-bold">{activeAgents}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Needs Approval</p>
            <p className="mt-3 text-4xl font-bold">{requiresApproval}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Can Take Action</p>
            <p className="mt-3 text-4xl font-bold">{canAct}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-xl font-semibold">Next product areas</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <h3 className="font-medium">Agent permissions</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Decide which agents can use each knowledge item.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <h3 className="font-medium">Approval rules</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Mark whether knowledge can be used to answer or take action.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <h3 className="font-medium">Sources</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Track where each knowledge record came from.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <h3 className="font-medium">Audit trail</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Record who changed knowledge and when.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
