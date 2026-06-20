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

  const organizationSettings = useQuery(
    api.organizations.getOrganizationSettings,
    {
      organizationId: DEFAULT_ORG_ID,
    }
  );

  const defaultKnowledgeCategory =
    organizationSettings?.defaultKnowledgeCategory ?? "Company Policy";

  const defaultKnowledgeStatus =
    organizationSettings?.defaultKnowledgeStatus ?? "draft";

  const defaultCanUseToAnswer =
    organizationSettings?.defaultCanUseToAnswer ?? true;

  const defaultCanUseToAct =
    organizationSettings?.defaultCanUseToAct ?? false;

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

  const [importText, setImportText] = useState("");
  const [importCategory, setImportCategory] = useState("");
  const [importStatus, setImportStatus] = useState<"draft" | "verified" | "">("");

  const effectiveImportCategory =
    importCategory || defaultKnowledgeCategory;

  const effectiveImportStatus =
    importStatus || defaultKnowledgeStatus;

  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  const [importAllowedAgentIds, setImportAllowedAgentIds] = useState<Id<"agents">[]>([]);

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

  function splitImportedKnowledge(rawText: string) {
    const text = rawText.trim();

    if (!text) return [];

    const sections = text
      .split(/\n(?=#{1,3}\s+)/g)
      .map((section) => section.trim())
      .filter(Boolean);

    if (sections.length === 0) {
      return [];
    }

    return sections.map((section, index) => {
      const lines = section.split("\n");
      const firstLine = lines[0]?.trim() ?? "";

      const headingMatch = firstLine.match(/^#{1,3}\s+(.+)$/);

      const title = headingMatch
        ? headingMatch[1].trim()
        : `Imported Knowledge ${index + 1}`;

      const content = headingMatch
        ? lines.slice(1).join("\n").trim()
        : section;

      return {
        title,
        content: content || section,
      };
    });
  }

  const importPreview = splitImportedKnowledge(importText);

  function toggleImportAgent(agentId: Id<"agents">) {
    setImportAllowedAgentIds((current) =>
      current.includes(agentId)
        ? current.filter((id) => id !== agentId)
        : [...current, agentId]
    );
  }

  async function handleImportKnowledge(e: React.FormEvent) {
    e.preventDefault();

    setImportError("");
    setImportSuccess("");

    const items = importPreview;

    if (items.length === 0) {
      setImportError("Paste some Markdown or text to import.");
      return;
    }

    try {
      for (const item of items) {
        await createKnowledge({
          title: item.title,
          content: item.content,
          category: effectiveImportCategory,
          status: effectiveImportStatus,
          canUseToAnswer: defaultCanUseToAnswer,
          canUseToAct: defaultCanUseToAct,
          requiresApproval: effectiveImportStatus === "draft",
          sourceUrl: "",
          lastReviewedAt: undefined,
          allowedAgentIds: importAllowedAgentIds,
          organizationId: DEFAULT_ORG_ID,
          workosUserId: user?.id ?? "",
          actorEmail: user?.email ?? "unknown-user",
        });
      }

      setImportSuccess(`Imported ${items.length} knowledge item${items.length === 1 ? "" : "s"}.`);
      setImportAllowedAgentIds([]);
      setImportText("");
      setImportCategory("");
      setImportStatus("");
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Failed to import knowledge."
      );
    }
  }


  return (
    <AppShell>
      <div className="ak-page">
        <header>
          <p className="ak-header-eyebrow">
            Knowledge Workspace
          </p>
          <h1 className="ak-header-title">
            Trusted knowledge records
          </h1>
          <p className="ak-header-description">
            Create knowledge that agents can later retrieve, follow, and act on.
          </p>
        </header>

        {canManage && (
          <section className="ak-card">
            <div>
              <p className="ak-header-eyebrow">Import</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Import knowledge from Markdown
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Paste Markdown or plain text. Headings become separate knowledge items.
              </p>
            </div>

            <form onSubmit={handleImportKnowledge} className="mt-6 space-y-5">
              <div>
                <label className="ak-label">Markdown or text</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="ak-textarea mt-2 min-h-48"
                  placeholder={`# Refund Policy\nCustomers can request a refund within 7 days.\n\n# Email Rules\nAgents may draft emails for review.`}
                />

                {importText.trim() && (
                  <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">Import preview</p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {importPreview.length} item{importPreview.length === 1 ? "" : "s"} will be created.
                        </p>
                      </div>

                      <span className="ak-status-neutral">
                        Preview only
                      </span>
                    </div>

                    {importPreview.length === 0 ? (
                      <p className="mt-4 text-sm text-neutral-500">
                        No valid knowledge items found yet.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {importPreview.map((item, index) => (
                          <div
                            key={`${item.title}-${index}`}
                            className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4"
                          >
                            <p className="text-sm font-medium text-white">
                              {index + 1}. {item.title}
                            </p>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">
                              {item.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="ak-label">Category</label>
                  <input
                    value={effectiveImportCategory}
                    onChange={(e) => setImportCategory(e.target.value)}
                    className="ak-input mt-2"
                    placeholder="Company Policy"
                  />
                </div>

                <div>
                  <label className="ak-label">Status</label>
                  <select
                    value={effectiveImportStatus}
                    onChange={(e) =>
                      setImportStatus(e.target.value as "draft" | "verified")
                    }
                    className="ak-select mt-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>

                <div>
                  <label className="ak-label">Assign to agents</label>

                  <div className="mt-2 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    {agents === undefined ? (
                      <p className="text-sm text-neutral-500">Loading agents...</p>
                    ) : agents.length === 0 ? (
                      <p className="text-sm text-neutral-500">
                        No agents yet. Create an agent before importing assigned knowledge.
                      </p>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        {agents.map((agent) => (
                          <label
                            key={agent._id}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 text-sm text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-900"
                          >
                            <input
                              type="checkbox"
                              checked={importAllowedAgentIds.includes(agent._id)}
                              onChange={() => toggleImportAgent(agent._id)}
                              className="h-4 w-4 rounded border-neutral-700 bg-neutral-950"
                            />
                            <span>
                              <span className="block font-medium text-white">{agent.name}</span>
                              <span className="block text-xs text-neutral-500">{agent.role}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-neutral-500">
                    Imported items will be assigned to {importAllowedAgentIds.length} agent
                    {importAllowedAgentIds.length === 1 ? "" : "s"}.
                  </p>
                </div>

              </div>

              {importError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-sm text-red-300">{importError}</p>
                </div>
              )}

              {importSuccess && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-300">{importSuccess}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={importPreview.length === 0}
                  className="ak-button-primary"
                >
                  Import {importPreview.length > 0 ? importPreview.length : ""} knowledge item
                  {importPreview.length === 1 ? "" : "s"}
                </button>
              </div>
            </form>
          </section>
        )}

        {canManage && (
          <form
            onSubmit={handleSubmit}
            className="ak-card flex flex-col gap-5"
          >

            <div className="flex flex-col gap-2">
              <label className="ak-label">
                Title
              </label>
              <input
                className="ak-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Refund policy"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="ak-label">
                Content
              </label>
              <textarea
                className="ak-textarea min-h-32"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the knowledge agents should use..."
              />
            </div>


            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="ak-label">
                  Category
                </label>
                <select
                  className="ak-select"
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
                <label className="ak-label">
                  Status
                </label>
                <select
                  className="ak-select"
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

            <div className="ak-panel">
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

            <div className="ak-panel">
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
                      className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-700"
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
                <label className="ak-label">
                  Source URL
                </label>
                <input
                  className="ak-input"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://company.com/policy"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="ak-label">
                  Last reviewed date
                </label>
                <input
                  type="date"
                  className="ak-input"
                  value={lastReviewedAt}
                  onChange={(e) => setLastReviewedAt(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="ak-button-primary w-fit"
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
                  className="ak-button-secondary w-fit"
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
                className="ak-input md:w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or content..."
              />

              <select
                className="ak-select"
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
                className="ak-select"
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
                  className="ak-card"
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
            <div className="ak-card">
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
                  className="ak-card-hover"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="min-w-0 break-words text-lg font-semibold">{item.title}</h3>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={
                          item.status === "verified"
                            ? "ak-status-success"
                            : "ak-status-warning"
                        }
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-neutral-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                        Status
                      </span>

                      <span
                        className={
                          item.status === "verified"
                            ? "ak-status-success"
                            : "ak-status-warning"
                        }
                      >
                        <span
                          className={
                            item.status === "verified"
                              ? "mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-300"
                              : "mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-300"
                          }
                        />
                        {item.status === "verified" ? "Verified" : "Draft"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                      <Link
                        href={`/knowledge/${item._id}`}
                        className="ak-button-primary col-span-2 px-3.5 py-2 sm:col-span-1"
                      >
                        Open
                      </Link>

                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="ak-button-secondary px-3.5 py-2"
                        >
                          Edit
                        </button>
                      )}

                      {canManage && (
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
                          className="ak-button-danger px-3.5 py-2"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-1 text-sm text-neutral-400">
                    {item.category}
                  </p>

                  <p className="mt-4 text-neutral-200">{item.content}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.canUseToAnswer && (
                      <span className="ak-status-neutral">
                        Can answer
                      </span>
                    )}

                    {item.canUseToAct && (
                      <span className="ak-status-neutral">
                        Can act
                      </span>
                    )}

                    {item.requiresApproval && (
                      <span className="ak-status-warning">
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
                              className="ak-status-neutral"
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
