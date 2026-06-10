"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AppShell } from "../AppShell";
import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { canManageKnowledge } from "@/lib/role";
import { useCurrentRole } from "@/lib/useCurrentRole";

export default function KnowledgePage() {

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "verified">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState("all");

  const knowledgeItems = useQuery(api.knowledge.listKnowledge, {
    organizationId: DEFAULT_ORG_ID,
    search,
    status: statusFilter,
    category: categoryFilter,
  });
  const agents = useQuery(api.agents.listAgents, {
    organizationId: DEFAULT_ORG_ID,
  });
  const { user } = useAuth();

  const createKnowledge = useMutation(api.knowledge.createKnowledge);
  const deleteKnowledge = useMutation(api.knowledge.deleteKnowledge);
  const updateKnowledge = useMutation(api.knowledge.updateKnowledge);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Company Policy");
  const [status, setStatus] = useState<"draft" | "verified">("draft");
  const [editingId, setEditingId] = useState<Id<"knowledge"> | null>(null);

  const [canUseToAnswer, setCanUseToAnswer] = useState(true);
  const [canUseToAct, setCanUseToAct] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const [sourceUrl, setSourceUrl] = useState("");
  const [lastReviewedAt, setLastReviewedAt] = useState("");
  const [allowedAgentIds, setAllowedAgentIds] = useState<Id<"agents">[]>([]);

  const currentRole = useCurrentRole();
  const canManage = canManageKnowledge(currentRole);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    const payload = {
      title,
      content,
      category,
      status,
      canUseToAnswer,
      canUseToAct,
      requiresApproval,
      sourceUrl: sourceUrl.trim() || undefined,
      lastReviewedAt: lastReviewedAt
        ? new Date(lastReviewedAt).getTime()
        : undefined,
      allowedAgentIds,
      actorEmail: user?.email ?? "unknown-user",
      ownerEmail: user?.email ?? "unknown-user",
      organizationId: DEFAULT_ORG_ID,
      workosUserId: user?.id ?? "",
    };


    if (editingId) {
      await updateKnowledge({
        id: editingId,
        ...payload,
      });


    } else {
      await createKnowledge(payload);
    }

    resetForm();
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("Company Policy");
    setStatus("draft");
    setCanUseToAnswer(true);
    setCanUseToAct(false);
    setRequiresApproval(false);
    setSourceUrl("");
    setLastReviewedAt("");
    setAllowedAgentIds([]);
  }

  function handleEdit(item: {
    _id: Id<"knowledge">;
    title: string;
    content: string;
    category: string;
    status: "draft" | "verified";
    canUseToAnswer?: boolean;
    canUseToAct?: boolean;
    requiresApproval?: boolean;
    sourceUrl?: string;
    lastReviewedAt?: number;
    allowedAgentIds?: Id<"agents">[];
  }) {
    setEditingId(item._id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category);
    setStatus(item.status);
    setCanUseToAnswer(item.canUseToAnswer ?? true);
    setCanUseToAct(item.canUseToAct ?? false);
    setRequiresApproval(item.requiresApproval ?? false);
    setSourceUrl(item.sourceUrl ?? "");
    setLastReviewedAt(
      item.lastReviewedAt
        ? new Date(item.lastReviewedAt).toISOString().split("T")[0]
        : ""
    );
    setAllowedAgentIds(item.allowedAgentIds ?? []);
  }


  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-medium text-neutral-400">
            Knowledge Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Trusted knowledge records
          </h1>
          <p className="mt-2 text-neutral-400">
            Create knowledge that agents can later retrieve, follow, and act on.
          </p>
        </header>

        {canManage && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
          >

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-300">
                Title
              </label>
              <input
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none placeholder:text-neutral-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Refund policy"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-300">
                Content
              </label>
              <textarea
                className="min-h-32 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none placeholder:text-neutral-500"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the knowledge agents should use..."
              />
            </div>


            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-300">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Company Policy</option>
                  <option>Product Documentation</option>
                  <option>Runbook</option>
                  <option>Agent Instruction</option>
                  <option>Tool Usage Rule</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-300">
                  Status
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "verified")
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-medium text-neutral-300">
                Agent usage rules
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={canUseToAnswer}
                    onChange={(e) => setCanUseToAnswer(e.target.checked)}
                  />
                  Can use to answer
                </label>

                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={canUseToAct}
                    onChange={(e) => setCanUseToAct(e.target.checked)}
                  />
                  Can use to take action
                </label>

                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                  />
                  Requires approval
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-medium text-neutral-300">
                Allowed agents
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Choose which agents can use this knowledge record.
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {agents === undefined ? (
                  <p className="text-sm text-neutral-400">Loading agents...</p>
                ) : agents.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    No agents yet. Create agents first.
                  </p>
                ) : (
                  agents.map((agent) => (
                    <label
                      key={agent._id}
                      className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300"
                    >
                      <input
                        type="checkbox"
                        checked={allowedAgentIds.includes(agent._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAllowedAgentIds([...allowedAgentIds, agent._id]);
                          } else {
                            setAllowedAgentIds(
                              allowedAgentIds.filter((id) => id !== agent._id)
                            );
                          }
                        }}
                      />
                      {agent.name}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-300">
                  Source URL
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none placeholder:text-neutral-500"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://company.com/policy"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-300">
                  Last reviewed date
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none"
                  value={lastReviewedAt}
                  onChange={(e) => setLastReviewedAt(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="w-fit rounded-lg bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200"
              >
                {editingId ? "Update Knowledge" : "Create Knowledge"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                  className="w-fit rounded-lg border border-neutral-700 px-4 py-2 font-medium text-neutral-200 hover:bg-neutral-800"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        )}

        <section className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Knowledge Items</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 md:w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or content..."
              />

              <select
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "draft" | "verified"
                  )
                }
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="verified">Verified</option>
              </select>

              <select
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All categories</option>
                <option>Company Policy</option>
                <option>Product Documentation</option>
                <option>Runbook</option>
                <option>Agent Instruction</option>
                <option>Tool Usage Rule</option>
              </select>
            </div>
          </div>

          {knowledgeItems === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
                >
                  <div className="h-5 w-1/3 rounded bg-neutral-800" />
                  <div className="mt-3 h-4 w-1/4 rounded bg-neutral-800" />
                  <div className="mt-5 space-y-2">
                    <div className="h-4 w-full rounded bg-neutral-800" />
                    <div className="h-4 w-2/3 rounded bg-neutral-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : knowledgeItems.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="font-medium text-neutral-200">
                No matching knowledge found.
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Try changing your search, status, or category filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {knowledgeItems.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">{item.title}</h3>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                        {item.status}
                      </span>

                      <Link
                        href={`/knowledge/${item._id}`}
                        className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                      >
                        Open
                      </Link>

                      {canManage && (
                        <>

                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteKnowledge({
                                id: item._id,
                                actorEmail: user?.email ?? "unknown-user",
                                organizationId: "default-org",
                                workosUserId: user?.id ?? "",
                              })
                            }
                            className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-300 hover:bg-red-950"
                          >
                            Delete
                          </button>
                        </>
                      )}

                    </div>
                  </div>

                  <p className="mt-1 text-sm text-neutral-400">
                    {item.category}
                  </p>

                  <p className="mt-4 text-neutral-200">{item.content}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.canUseToAnswer && (
                      <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                        Can answer
                      </span>
                    )}

                    {item.canUseToAct && (
                      <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                        Can act
                      </span>
                    )}

                    {item.requiresApproval && (
                      <span className="rounded-full border border-yellow-900/60 px-3 py-1 text-xs text-yellow-300">
                        Approval required
                      </span>
                    )}
                  </div>

                  {item.sourceUrl && (
                    <p className="mt-4 text-sm text-neutral-400">
                      Source:{" "}
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-200 underline"
                      >
                        {item.sourceUrl}
                      </a>
                    </p>
                  )}

                  {item.lastReviewedAt && (
                    <p className="mt-1 text-sm text-neutral-400">
                      Last reviewed:{" "}
                      {new Date(item.lastReviewedAt).toLocaleDateString()}
                    </p>
                  )}

                  {item.allowedAgentIds && item.allowedAgentIds.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-neutral-400">
                        Allowed agents:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.allowedAgentIds.map((agentId) => {
                          const agent = agents?.find((a) => a._id === agentId);

                          return (
                            <span
                              key={agentId}
                              className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300"
                            >
                              {agent?.name ?? "Unknown agent"}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}