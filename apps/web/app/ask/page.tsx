"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";

export default function AskPage() {
    const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | "">("");
    const [question, setQuestion] = useState("");
    const [copied, setCopied] = useState(false);

    const agents = useQuery(api.agents.listAgents, {
        organizationId: DEFAULT_ORG_ID,
        search: "",
        status: "all",
        role: "all",
    });

    const results = useQuery(
        api.knowledge.searchKnowledgeForAgent,
        selectedAgentId && question.trim()
            ? {
                agentId: selectedAgentId,
                organizationId: DEFAULT_ORG_ID,
                question,
            }
            : "skip"
    );

    function getDraftAnswerText() {
        if (!results || results.length === 0) return "";

        return [
            "Based on the allowed knowledge for this agent, here are the most relevant points:",
            "",
            ...results.slice(0, 3).map((item) => `${item.title}: ${item.content}`),
        ].join("\n");
    }

    async function copyDraftAnswer() {
        const text = getDraftAnswerText();

        if (!text) return;

        await navigator.clipboard.writeText(text);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }


    return (
        <AppShell>
            <div className="ak-page">
                <header>
                    <p className="ak-header-eyebrow">
                        Agent Retrieval
                    </p>
                    <h1 className="ak-header-title">Ask Agent Knowledge</h1>
                    <p className="ak-header-description">
                        Select an agent and search only the knowledge that agent is allowed
                        to use.
                    </p>
                </header>

                <section className="ak-card">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="ak-label">
                                Agent
                            </label>

                            <select
                                className="ak-select"
                                value={selectedAgentId}
                                onChange={(e) =>
                                    setSelectedAgentId(e.target.value as Id<"agents">)
                                }
                            >
                                <option value="">Select an agent</option>

                                {agents?.map((agent) => (
                                    <option key={agent._id} value={agent._id}>
                                        {agent.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="ak-label">
                                Question
                            </label>

                            <input
                                className="ak-input"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Example: refund policy"
                            />
                        </div>

                        <div className="ak-panel md:col-span-2">
                            <p className="text-sm font-medium text-neutral-300">
                                Retrieval policy
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                                This search only returns knowledge that is verified, assigned to the
                                selected agent, allowed for answers, and part of the current organization.
                            </p>
                        </div>

                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Matching knowledge</h2>

                    {results && results.length > 0 && (
                        <section className="ak-card">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <h2 className="text-xl font-semibold">Draft answer</h2>

                                <button
                                    type="button"
                                    onClick={copyDraftAnswer}
                                    className="ak-button-secondary w-fit"
                                >
                                    {copied ? "Copied!" : "Copy draft"}
                                </button>

                                {/* Future: enable this when OPENAI_API_KEY billing/quota is ready. */}
                                <button
                                    type="button"
                                    disabled
                                    className="ak-button-secondary w-fit opacity-60"
                                >
                                    AI answer coming soon
                                </button>
                            </div>

                            {results.some((item) => item.requiresApproval) && (
                                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                                    <p className="text-sm font-medium text-amber-300">
                                        Approval warning
                                    </p>
                                    <p className="mt-1 text-sm text-amber-200/80">
                                        Some retrieved knowledge requires approval before action. The agent may
                                        use approved answerable knowledge to respond, but should not take action
                                        without approval.
                                    </p>
                                </div>
                            )}

                            {results.some((item) => item.canUseToAct === false) && (
                                <div className="ak-panel mt-4">
                                    <p className="text-sm font-medium text-neutral-300">
                                        Action limitation
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        Some retrieved knowledge can be used to answer, but not to take action.
                                        The agent should not perform tool actions based on this knowledge.
                                    </p>
                                </div>
                            )}

                            <p className="mt-4 whitespace-pre-wrap text-neutral-300">
                                Based on the allowed knowledge for this agent, here are the most relevant
                                points:
                            </p>

                            <ul className="mt-4 list-disc space-y-3 pl-5 text-neutral-300">
                                {results.slice(0, 3).map((item) => (
                                    <li key={item._id}>
                                        <span className="font-medium">{item.title}:</span> {item.content}

                                        <div className="mt-1">
                                            <Link
                                                href={`/knowledge/${item._id}`}
                                                className="text-sm text-neutral-400 underline hover:text-white"
                                            >
                                                Source: {item.title}
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-4 text-sm text-neutral-500">
                                This is a retrieval-based draft. AI generation can be added next.
                            </p>
                        </section>
                    )}

                    {!selectedAgentId ? (
                        <div className="ak-card">
                            <p className="text-neutral-300">Select an agent first.</p>
                            <p className="mt-1 text-sm text-neutral-500">
                                Results will only include knowledge assigned to that agent.
                            </p>
                        </div>
                    ) : !question.trim() ? (
                        <div className="ak-card">
                            <p className="text-neutral-300">Type a question or keyword.</p>
                            <p className="mt-1 text-sm text-neutral-500">
                                Try searching for something like “refund”, “billing”, or
                                “support”.
                            </p>
                        </div>
                    ) : results === undefined ? (
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
                    ) : results.length === 0 ? (
                        <div className="ak-card">
                            <p className="font-medium text-neutral-200">
                                No answer can be drafted.
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                                No allowed, verified knowledge was found for this agent and question.
                                The agent should not answer without an approved source.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {results.map((item) => (
                                <article
                                    key={item._id}
                                    className="ak-card-hover"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm text-neutral-400">
                                                {item.category}
                                            </p>

                                            {"matchSummary" in item && item.matchSummary && (
                                                <p className="mt-2 text-xs text-neutral-500">
                                                    {item.matchSummary}
                                                </p>
                                            )}

                                            <h3 className="mt-1 break-words text-lg font-semibold">
                                                {item.title}
                                            </h3>
                                        </div>

                                        <span className={`${item.status === "verified" ? "ak-status-success" : "ak-status-warning"} w-fit shrink-0`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    <p className="mt-4 line-clamp-3 text-neutral-300">
                                        {item.content}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <span className="ak-status-neutral">
                                            Can answer
                                        </span>

                                        {item.requiresApproval && (
                                            <span className="ak-status-warning">
                                                Approval required
                                            </span>
                                        )}

                                        <Link
                                            href={`/knowledge/${item._id}`}
                                            className="ak-button-secondary px-3 py-1 text-xs"
                                        >
                                            Open
                                        </Link>
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
