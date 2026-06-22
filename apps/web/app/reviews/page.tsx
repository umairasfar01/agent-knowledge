"use client";

import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { useToast } from "../components/ToastProvider";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useState } from "react";

export default function ReviewsPage() {
  const { showToast } = useToast();
  const { user } = useAuth({ ensureSignedIn: true });
  const [reviewTargetId, setReviewTargetId] = useState<Id<"knowledge"> | null>(
    null
  );

  const reviewItems = useQuery(api.knowledge.listKnowledgeDueForReview, {
    organizationId: DEFAULT_ORG_ID,
    reviewAfterDays: 90,
  });

  const markReviewed = useMutation(api.knowledge.markKnowledgeReviewed);

  async function handleMarkReviewed(id: Id<"knowledge">) {
    await markReviewed({
      id: id as never,
      organizationId: DEFAULT_ORG_ID,
      workosUserId: user?.id ?? "",
      actorEmail: user?.email ?? "unknown-user"
    });

    showToast({
      type: "success",
      title: "Marked reviewed",
      description: "The knowledge item review date was updated.",
    });

    setReviewTargetId(null);
  }

  return (
    <AppShell>
      <div className="ak-page">
        <header>
          <p className="ak-header-eyebrow">Governance</p>
          <h1 className="ak-header-title">Knowledge Reviews</h1>
          <p className="ak-header-description">
            Review knowledge that has not been checked recently.
          </p>
        </header>

        <section className="ak-card">
          {reviewItems === undefined ? (
            <p className="ak-muted">Loading review queue...</p>
          ) : reviewItems.length === 0 ? (
            <div className="ak-panel">
              <p className="font-medium text-white">Everything is up to date.</p>
              <p className="mt-2 text-sm text-neutral-500">
                No knowledge items currently need review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewItems.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            item.status === "verified"
                              ? "ak-status-success"
                              : "ak-status-warning"
                          }
                        >
                          {item.status}
                        </span>
                        <span className="ak-status-warning">Needs review</span>
                      </div>

                      <h2 className="mt-4 text-lg font-semibold text-white">
                        {item.title}
                      </h2>

                      <p className="mt-2 text-sm text-neutral-500">
                        {item.category}
                      </p>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-neutral-300">
                        {item.content}
                      </p>

                      <p className="mt-4 text-sm text-neutral-500">
                        Last reviewed:{" "}
                        {item.lastReviewedAt
                          ? new Date(item.lastReviewedAt).toLocaleString()
                          : "Never"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        href={`/knowledge/${item._id}`}
                        className="ak-button-secondary"
                      >
                        Open
                      </Link>

                      <button
                        type="button"
                        onClick={() => setReviewTargetId(item._id)}
                        className="ak-button-primary"
                      >
                        Mark reviewed
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <ConfirmDialog
          open={reviewTargetId !== null}
          title="Mark as reviewed?"
          description="This updates the knowledge item review date to today."
          confirmLabel="Mark reviewed"
          tone="default"
          onConfirm={() => {
            if (!reviewTargetId) return;
            return handleMarkReviewed(reviewTargetId);
          }}
          onCancel={() => setReviewTargetId(null)}
        />
      </div>
    </AppShell>
  );
}
