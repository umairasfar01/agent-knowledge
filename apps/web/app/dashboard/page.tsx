"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";

export default function DashboardPage() {
  const metrics = useQuery(api.dashboard.getDashboardMetrics, {
    organizationId: DEFAULT_ORG_ID,
  });

  const statCards = metrics
    ? [
        {
          label: "Knowledge items",
          value: metrics.totalKnowledge,
          detail: `${metrics.verifiedKnowledge} verified · ${metrics.draftKnowledge} draft`,
          href: "/knowledge",
        },
        {
          label: "Answerable sources",
          value: metrics.answerableKnowledge,
          detail: "Allowed for agent answers",
          href: "/knowledge",
        },
        {
          label: "Agents",
          value: metrics.totalAgents,
          detail: `${metrics.activeAgents} active`,
          href: "/agents",
        },
        {
          label: "Members",
          value: metrics.totalMembers,
          detail: "Workspace users",
          href: "/members",
        },
        {
          label: "Retrievals",
          value: metrics.totalRetrievals,
          detail: `${metrics.retrievalsLast7Days} in the last 7 days`,
          href: "/retrieval-history",
        },
        {
          label: "Audit events",
          value: metrics.totalAuditEvents,
          detail: "Governance activity",
          href: "/audit",
        },
      ]
    : [];

  return (
    <AppShell>
      <div className="ak-page-wide">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ak-header-eyebrow">Workspace overview</p>
            <h1 className="ak-header-title">Dashboard</h1>
            <p className="ak-header-description">
              Monitor knowledge coverage, agent activity, retrieval usage, and governance signals.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/knowledge" className="ak-button-primary">
              Add knowledge
            </Link>
            <Link href="/ask" className="ak-button-secondary">
              Ask agent
            </Link>
          </div>
        </header>

        {metrics === undefined ? (
          <section className="ak-card">
            <p className="ak-muted">Loading dashboard metrics...</p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {statCards.map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="ak-card-hover block"
                >
                  <p className="text-sm font-medium text-neutral-400">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">{card.detail}</p>
                </Link>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="ak-card">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="ak-header-eyebrow">Recent retrievals</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Agent questions
                    </h2>
                  </div>

                  <Link href="/retrieval-history" className="ak-button-ghost">
                    View all
                  </Link>
                </div>

                {metrics.recentRetrievalLogs.length === 0 ? (
                  <div className="ak-panel mt-5">
                    <p className="text-sm text-neutral-400">
                      No retrieval searches yet. Use the Ask page to start building history.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {metrics.recentRetrievalLogs.map((log) => (
                      <article
                        key={log._id}
                        className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="ak-status-neutral">
                            {log.agentName ?? "Unknown agent"}
                          </span>
                          <span
                            className={
                              log.resultCount > 0
                                ? "ak-status-success"
                                : "ak-status-warning"
                            }
                          >
                            {log.resultCount} result
                            {log.resultCount === 1 ? "" : "s"}
                          </span>
                        </div>

                        <p className="mt-3 font-medium text-white">
                          {log.question}
                        </p>
                        <p className="mt-2 text-sm text-neutral-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className="ak-card">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="ak-header-eyebrow">Recent audit activity</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Governance events
                    </h2>
                  </div>

                  <Link href="/audit" className="ak-button-ghost">
                    View all
                  </Link>
                </div>

                {metrics.recentAuditLogs.length === 0 ? (
                  <div className="ak-panel mt-5">
                    <p className="text-sm text-neutral-400">
                      No audit activity yet.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {metrics.recentAuditLogs.map((log) => (
                      <article
                        key={log._id}
                        className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4"
                      >
                        <p className="font-medium text-white">
                          {log.knowledgeTitle ??
                            log.agentName ??
                            log.metadata?.title ??
                            "Workspace event"}
                        </p>

                        <p className="mt-2 text-sm text-neutral-500">
                          {log.actorEmail ?? log.actorId ?? "Unknown user"} ·{" "}
                          {log.action}
                        </p>

                        <p className="mt-2 text-sm text-neutral-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}