"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { useMutation, } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { canManageKnowledge } from "@/lib/role";
import { useCurrentRole } from "@/lib/useCurrentRole";

export default function ApprovalsPage() {
    const approvalItems = useQuery(api.knowledge.listApprovalQueue, {
        organizationId: DEFAULT_ORG_ID,
    });
    const approveKnowledge = useMutation(api.knowledge.approveKnowledge);
    const { user } = useAuth();
    const currentRole = useCurrentRole();
    const canManage = canManageKnowledge(currentRole);

    return (
        <AppShell>
            <div className="ak-page">
                <header>
                    <p className="ak-header-eyebrow">Governance</p>
                    <h1 className="ak-header-title">Approval Queue</h1>
                    <p className="ak-header-description">
                        Review knowledge records that require approval before agents can act.
                    </p>
                </header>

                <section className="space-y-4">
                    {approvalItems === undefined ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="ak-card">
                                    <div className="h-5 w-1/3 rounded bg-neutral-800" />
                                    <div className="mt-4 h-4 w-full rounded bg-neutral-800" />
                                    <div className="mt-2 h-4 w-2/3 rounded bg-neutral-800" />
                                </div>
                            ))}
                        </div>
                    ) : approvalItems.length === 0 ? (
                        <div className="ak-card">
                            <p className="text-neutral-300">No approval items right now.</p>
                            <p className="mt-1 text-sm text-neutral-500">
                                Knowledge records marked “Requires approval” will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {approvalItems.map((item) => (
                                <article
                                    key={item._id}
                                    className="ak-card-hover"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-neutral-400">
                                                {item.category}
                                            </p>
                                            <h2 className="mt-1 text-xl font-semibold">
                                                {item.title}
                                            </h2>
                                        </div>

                                        <span className="ak-status-warning">
                                            Approval required
                                        </span>
                                    </div>

                                    <p className="mt-4 line-clamp-3 text-neutral-300">
                                        {item.content}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <span className={item.status === "verified" ? "ak-status-success" : "ak-status-warning"}>
                                            {item.status}
                                        </span>

                                        {item.canUseToAct && (
                                            <span className="ak-status-neutral">
                                                Can act
                                            </span>
                                        )}

                                        <Link
                                            href={`/knowledge/${item._id}`}
                                            className="ak-button-secondary px-3 py-1 text-xs"
                                        >
                                            Open
                                        </Link>

                                        {canManage && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    approveKnowledge({
                                                        id: item._id,
                                                        actorEmail: user?.email ?? "unknown-user",
                                                        organizationId: DEFAULT_ORG_ID,
                                                        workosUserId: user?.id ?? "",
                                                    })
                                                }
                                                className="ak-button-primary px-3 py-1 text-xs"
                                            >
                                                Mark as approved
                                            </button>

                                        )}

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
