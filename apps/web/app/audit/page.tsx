"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";

export default function AuditPage() {
    const auditLogs = useQuery(api.knowledge.listAuditLogs, {
        organizationId: DEFAULT_ORG_ID,
    });

    return (
        <AppShell>
            <div className="mx-auto max-w-6xl space-y-8">
                <header>
                    <p className="text-sm font-medium text-neutral-400">
                        Governance
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">Audit Logs</h1>
                    <p className="mt-2 text-neutral-400">
                        Track knowledge changes made inside the workspace.
                    </p>
                </header>

                <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                    {auditLogs === undefined ? (
                        <p className="text-neutral-400">Loading...</p>
                    ) : auditLogs.length === 0 ? (
                        <p className="text-neutral-400">No audit logs yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {auditLogs.map((log) => (
                                <div
                                    key={log._id}
                                    className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {log.knowledgeTitle ??
                                                log.agentName ??
                                                log.metadata?.title ??
                                                "Unknown item"}
                                        </p>
                                        <p className="text-sm text-neutral-400">
                                            {log.actorEmail ?? log.actorId ?? log.actorUserId ?? "demo-user"}{" "}
                                            {log.action === "seed.demo_created"
                                                ? "created this knowledge item"
                                                : log.action === "agent.created"
                                                    ? "created this agent"
                                                    : log.action === "agent.updated"
                                                        ? "updated this agent"
                                                        : log.action === "agent.deleted"
                                                            ? "deleted this agent"
                                                            : `${log.action} this knowledge item`}
                                        </p>
                                    </div>

                                    <div className="text-sm text-neutral-400">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppShell>
    );
}