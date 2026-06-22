"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { AppShell } from "../../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useCurrentRole } from "@/lib/useCurrentRole";
import { canManageKnowledge } from "@/lib/role";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Breadcrumbs } from "../../components/Breadcrumbs";

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

    const versions = useQuery(api.knowledge.listVersionsForKnowledge, {
        knowledgeId: id,
        organizationId: DEFAULT_ORG_ID,
    });

    const { user } = useAuth();
    const currentRole = useCurrentRole();
    const canManage = canManageKnowledge(currentRole);
    const [restoreTargetId, setRestoreTargetId] =
        useState<Id<"knowledgeVersions"> | null>(null);

    const restoreKnowledgeVersion = useMutation(
        api.knowledge.restoreKnowledgeVersion
    );

    return (
        <AppShell>
            <div className="ak-page">
                <Breadcrumbs
                    items={[
                        { label: "Knowledge", href: "/knowledge" },
                        {
                            label:
                                item && item !== null ? item.title : "Knowledge item",
                        },
                    ]}
                />

                <div>
                    <Link
                        href="/knowledge"
                        className="ak-button-ghost px-0"
                    >
                        ← Back to Knowledge
                    </Link>
                </div>

                {item === undefined ? (
                    <div className="ak-card">
                        <div className="h-6 w-1/3 rounded bg-neutral-800" />
                        <div className="mt-4 h-4 w-2/3 rounded bg-neutral-800" />
                    </div>
                ) : item === null ? (
                    <div className="ak-card">
                        <p className="text-neutral-300">Knowledge item not found.</p>
                    </div>
                ) : (
                    <>
                        <header className="ak-card">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm text-neutral-400">{item.category}</p>
                                    <h1 className="mt-2 break-words text-3xl font-bold">{item.title}</h1>
                                </div>

                                <span className={`${item.status === "verified" ? "ak-status-success" : "ak-status-warning"} w-fit shrink-0`}>
                                    {item.status}
                                </span>
                            </div>
                        </header>

                        <section className="ak-card">
                            <h2 className="text-lg font-semibold">Content</h2>
                            <p className="mt-4 whitespace-pre-wrap text-neutral-200">
                                {item.content}
                            </p>
                        </section>

                        <section className="grid gap-4 md:grid-cols-3">
                            <div className="ak-card">
                                <p className="text-sm text-neutral-400">Can answer</p>
                                <p className="mt-2 text-xl font-semibold">
                                    {item.canUseToAnswer ? "Yes" : "No"}
                                </p>
                            </div>

                            <div className="ak-card">
                                <p className="text-sm text-neutral-400">Can act</p>
                                <p className="mt-2 text-xl font-semibold">
                                    {item.canUseToAct ? "Yes" : "No"}
                                </p>
                            </div>

                            <div className="ak-card">
                                <p className="text-sm text-neutral-400">Approval required</p>
                                <p className="mt-2 text-xl font-semibold">
                                    {item.requiresApproval ? "Yes" : "No"}
                                </p>
                            </div>
                        </section>

                        <section className="ak-card">
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
                                            className="ak-status-neutral"
                                            >
                                                {agent?.name ?? "Unknown agent"}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="ak-card">
                            <h2 className="text-lg font-semibold">Trust metadata</h2>

                            <section className="ak-panel">
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
                                                className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4"
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

                            <section className="ak-panel mt-4">
                                <h2 className="text-xl font-semibold">Version history</h2>

                                {versions === undefined ? (
                                    <p className="mt-3 text-neutral-400">Loading version history...</p>
                                ) : versions.length === 0 ? (
                                    <p className="mt-3 text-neutral-400">
                                        No versions found for this knowledge item.
                                    </p>
                                ) : (
                                    <div className="mt-5 space-y-3">
                                        {versions.map((version, index) => (
                                            <div
                                                key={version._id}
                                                className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4"
                                            >
                                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                    <div>
                                                        <p className="font-medium">
                                                            Version {versions.length - index}
                                                        </p>

                                                        <p className="mt-1 text-sm text-neutral-400">
                                                            {version.changedByEmail ?? "Unknown user"}
                                                        </p>
                                                    </div>

                                                    <p className="text-sm text-neutral-500">
                                                        {new Date(version.createdAt).toLocaleString()}
                                                    </p>

                                                    {canManage && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRestoreTargetId(version._id)}
                                                            className="ak-button-secondary w-fit px-3 py-2 text-xs"
                                                        >
                                                            Restore this version
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs text-neutral-500">Title</p>
                                                        <p className="mt-1 text-sm text-neutral-300">
                                                            {version.title}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-neutral-500">Status</p>
                                                        <p className="mt-1 text-sm text-neutral-300">
                                                            {version.status}
                                                        </p>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <p className="text-xs text-neutral-500">Content snapshot</p>
                                                        <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-300">
                                                            {version.content}
                                                        </p>
                                                    </div>
                                                </div>
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

                <ConfirmDialog
                    open={restoreTargetId !== null}
                    title="Restore this version?"
                    description="This will replace the current title, content, category, and status with the selected version."
                    confirmLabel="Restore version"
                    tone="default"
                    onConfirm={() => {
                        if (!restoreTargetId) return;
                        return handleRestoreVersion(restoreTargetId);
                    }}
                    onCancel={() => setRestoreTargetId(null)}
                />
            </div>
        </AppShell>
    );
    async function handleRestoreVersion(versionId: Id<"knowledgeVersions">) {
        await restoreKnowledgeVersion({
            versionId,
            actorEmail: user?.email ?? "unknown-user",
            organizationId: DEFAULT_ORG_ID,
            workosUserId: user?.id ?? "",
        });

        setRestoreTargetId(null);
    }
}
