"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";

export default function AuditPage() {
    const auditLogs = useQuery(api.agents.listAuditLogs, {
        organizationId: DEFAULT_ORG_ID,
    });

    function getAuditDescription(log: {
        action: string;
        actorEmail?: string;
        actorId?: string;
        actorUserId?: string;
    }) {
        const actor =
            log.actorEmail ?? log.actorId ?? log.actorUserId ?? "Unknown user";

        if (log.action === "seed.demo_created") {
            return `${actor} created this knowledge item`;
        }

        if (log.action === "agent.created") {
            return `${actor} created this agent`;
        }

        if (log.action === "agent.updated") {
            return `${actor} updated this agent`;
        }

        if (log.action === "agent.deleted") {
            return `${actor} deleted this agent`;
        }

        if (log.action === "member_role_updated") {
            return `${actor} changed a member role`;
        }

        if (log.action === "member_removed") {
            return `${actor} removed a member`;
        }

        if (log.action === "member_invited") {
            return `${actor} added a member`;
        }

        return `${actor} ${log.action} this knowledge item`;
    }

    return (
        <AppShell>
            <div className="ak-page">
                <header>
                    <p className="ak-header-eyebrow">
                        Governance
                    </p>
                    <h1 className="ak-header-title">Audit Logs</h1>
                    <p className="ak-header-description">
                        Track knowledge changes made inside the workspace.
                    </p>
                </header>

                <section className="ak-card">
                    {auditLogs === undefined ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="ak-panel">
                                    <div className="h-4 w-1/3 rounded bg-neutral-800" />
                                    <div className="mt-3 h-3 w-1/2 rounded bg-neutral-800" />
                                </div>
                            ))}
                        </div>
                    ) : auditLogs.length === 0 ? (
                        <div className="ak-panel">
                            <p className="font-medium text-neutral-200">No audit logs yet.</p>
                            <p className="mt-1 text-sm text-neutral-500">
                                Changes to knowledge, agents, and members will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {auditLogs.map((log) => (
                                <div
                                    key={log._id}
                                    className="ak-panel flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {log.knowledgeTitle ??
                                                log.agentName ??
                                                log.metadata?.title ??
                                                "Unknown item"}
                                        </p>
                                        <p className="text-sm text-neutral-400">
                                            {getAuditDescription(log)}
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
