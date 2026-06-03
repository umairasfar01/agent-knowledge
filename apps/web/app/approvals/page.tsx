"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { useMutation, } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { CURRENT_USER_ROLE, canManageKnowledge } from "@/lib/role";

export default function ApprovalsPage() {
    const approvalItems = useQuery(api.knowledge.listApprovalQueue, {
  organizationId: DEFAULT_ORG_ID,
});
    const approveKnowledge = useMutation(api.knowledge.approveKnowledge);
    const { user } = useAuth();
    const canManage = canManageKnowledge(CURRENT_USER_ROLE);

    return (
        <AppShell>
            <div className="mx-auto max-w-6xl space-y-8">
                <header>
                    <p className="text-sm font-medium text-neutral-400">Governance</p>
                    <h1 className="mt-2 text-3xl font-bold">Approval Queue</h1>
                    <p className="mt-2 text-neutral-400">
                        Review knowledge records that require approval before agents can act.
                    </p>
                </header>

                <section className="space-y-4">
                    {approvalItems === undefined ? (
                        <p className="text-neutral-400">Loading approvals...</p>
                    ) : approvalItems.length === 0 ? (
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
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
                                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
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

                                        <span className="rounded-full border border-yellow-900/60 px-3 py-1 text-xs text-yellow-300">
                                            Approval required
                                        </span>
                                    </div>

                                    <p className="mt-4 line-clamp-3 text-neutral-300">
                                        {item.content}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                                            {item.status}
                                        </span>

                                        {item.canUseToAct && (
                                            <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                                                Can act
                                            </span>
                                        )}

                                        <Link
                                            href={`/knowledge/${item._id}`}
                                            className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
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
                                                })
                                            }
                                            className="rounded-full border border-green-900/60 px-3 py-1 text-xs text-green-300 hover:bg-green-950"
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