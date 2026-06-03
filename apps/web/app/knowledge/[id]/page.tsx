"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { AppShell } from "../../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";

export default function KnowledgeDetailPage() {
    const params = useParams();
    const id = params.id as Id<"knowledge">;

    const item = useQuery(api.knowledge.getKnowledge, { id });
    const agents = useQuery(api.agents.listAgents, {
        organizationId: DEFAULT_ORG_ID,
    });

    const auditLogs = useQuery(api.knowledge.listAuditLogsForKnowledge, {
        knowledgeId: id,
        organizationId: DEFAULT_ORG_ID,
    });

    return (
        <AppShell>
            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <Link
                        href="/knowledge"
                        className="text-sm text-neutral-400 hover:text-white"
                    >
                        ← Back to Knowledge
                    </Link>
                </div>

                {item === undefined ? (
                    <p className="text-neutral-400">Loading...</p>
                ) : item === null ? (
                    <p className="text-neutral-400">Knowledge item not found.</p>
                ) : (
                    <>
                        <header className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-neutral-400">{item.category}</p>
                                    <h1 className="mt-2 text-3xl font-bold">{item.title}</h1>
                                </div>

                                <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                                    {item.status}
                                </span>
                            </div>
                        </header>

                        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                            <h2 className="text-lg font-semibold">Content</h2>
                            <p className="mt-4 whitespace-pre-wrap text-neutral-200">
                                {item.content}
                            </p>
                        </section>

                        <section className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                                <p className="text-sm text-neutral-400">Can answer</p>
                                <p className="mt-2 text-xl font-semibold">
                                    {item.canUseToAnswer ? "Yes" : "No"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                                <p className="text-sm text-neutral-400">Can act</p>
                                <p className="mt-2 text-xl font-semibold">
                                    {item.canUseToAct ? "Yes" : "No"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                                <p className="text-sm text-neutral-400">Approval required</p>
                                <p className="mt-2 text-xl font-semibold">
                                    {item.requiresApproval ? "Yes" : "No"}
                                </p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                            <h2 className="text-lg font-semibold">Allowed agents</h2>

                            {!item.allowedAgentIds || item.allowedAgentIds.length === 0 ? (
                                <p className="mt-3 text-neutral-400">
                                    No agents are assigned to this knowledge item.
                                </p>
                            ) : (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {item.allowedAgentIds.map((agentId) => {
                                        const agent = agents?.find((a) => a._id === agentId);

                                        return (
                                            <span
                                                key={agentId}
                                                className="rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-300"
                                            >
                                                {agent?.name ?? "Unknown agent"}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                            <h2 className="text-lg font-semibold">Trust metadata</h2>

                            <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                                <h2 className="text-lg font-semibold">Audit history</h2>

                                {auditLogs === undefined ? (
                                    <p className="mt-3 text-neutral-400">Loading audit history...</p>
                                ) : auditLogs.length === 0 ? (
                                    <p className="mt-3 text-neutral-400">
                                        No audit history found for this item.
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {auditLogs.map((log) => (
                                            <div
                                                key={log._id}
                                                className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                                            >
                                                <p className="font-medium">
                                                    {log.action === "seed.demo_created" ? "created" : log.action}
                                                </p>

                                                <p className="mt-1 text-sm text-neutral-400">
                                                    {log.actorEmail ?? log.actorId ?? log.actorUserId ?? "demo-user"}{" "}
                                                    {log.action === "seed.demo_created" ? "created" : log.action} this knowledge item
                                                </p>

                                                <p className="mt-1 text-sm text-neutral-500">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <div className="mt-4 space-y-3 text-sm text-neutral-300">
                                <p>
                                    Owner:{" "}
                                    {item.ownerEmail ? (
                                        item.ownerEmail
                                    ) : (
                                        <span className="text-neutral-500">Unknown owner</span>
                                    )}
                                </p>

                                <p>
                                    Source:{" "}
                                    {item.sourceUrl ? (
                                        <a
                                            href={item.sourceUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline"
                                        >
                                            {item.sourceUrl}
                                        </a>
                                    ) : (
                                        <span className="text-neutral-500">No source URL</span>
                                    )}
                                </p>

                                <p>
                                    Last reviewed:{" "}
                                    {item.lastReviewedAt ? (
                                        new Date(item.lastReviewedAt).toLocaleDateString()
                                    ) : (
                                        <span className="text-neutral-500">Not reviewed</span>
                                    )}
                                </p>

                                <p>
                                    Updated: {new Date(item.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </AppShell>
    );
}