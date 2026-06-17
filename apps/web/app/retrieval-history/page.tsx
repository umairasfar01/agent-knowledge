"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";

export default function RetrievalHistoryPage() {
    const logs = useQuery(api.knowledge.listRetrievalLogs, {
        organizationId: DEFAULT_ORG_ID,
    });

    return (
        <AppShell>
            <div className="ak-page">
                <header>
                    <p className="ak-header-eyebrow">Agent Retrieval</p>
                    <h1 className="ak-header-title">Retrieval History</h1>
                    <p className="ak-header-description">
                        Review recent questions asked through agents and the sources that were retrieved.
                    </p>
                </header>

                <section className="ak-card">
                    {logs === undefined ? (
                        <p className="ak-muted">Loading retrieval history...</p>
                    ) : logs.length === 0 ? (
                        <div className="ak-panel">
                            <p className="font-medium text-white">No retrieval history yet.</p>
                            <p className="mt-2 text-sm text-neutral-500">
                                Searches from the Ask page will appear here after agents retrieve knowledge.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <article
                                    key={log._id}
                                    className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="min-w-0">
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
                                                    {log.resultCount} result{log.resultCount === 1 ? "" : "s"}
                                                </span>
                                            </div>

                                            <h2 className="mt-4 text-lg font-semibold text-white">
                                                {log.question}
                                            </h2>

                                            <p className="mt-2 text-sm text-neutral-500">
                                                Asked by {log.actorEmail ?? "Unknown user"}
                                            </p>

                                            {log.sourceTitles.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                                        Sources
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {log.sourceTitles.map((title, index) => (
                                                            <span
                                                                key={`${title}-${index}`}
                                                                className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300"
                                                            >
                                                                {title}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <p className="shrink-0 text-sm text-neutral-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppShell>
    );
}