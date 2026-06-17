"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { useAuth } from "@workos-inc/authkit-nextjs/components";




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

    const { user } = useAuth();

    const selectedAgent = agents?.find((agent) => agent._id === selectedAgentId);

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

    const logRetrievalSearch = useMutation(api.knowledge.logRetrievalSearch);

    useEffect(() => {
        if (!selectedAgentId || !question.trim() || !results) return;

        const timeout = window.setTimeout(() => {
            void logRetrievalSearch({
                organizationId: DEFAULT_ORG_ID,
                agentId: selectedAgentId,
                agentName: selectedAgent?.name,
                question,
                resultCount: results.length,
                sourceTitles: Array.from(new Set(results.map((item) => item.title))).slice(0, 5),
                actorEmail: user?.email ?? undefined,
            });
        }, 800);

        return () => window.clearTimeout(timeout);
    }, [
        selectedAgentId,
        selectedAgent?.name,
        question,
        results,
        user?.email,
        logRetrievalSearch,
    ]);


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
                            <div className="flex flex-col gap-4 border-b border-neutral-800 pb-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="ak-header-eyebrow">Retrieval draft</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                                        Draft answer
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                                        Generated from verified knowledge assigned to the selected agent.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={copyDraftAnswer}
                                        className="ak-button-primary"
                                    >
                                        {copied ? "Copied" : "Copy draft"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled
                                        className="ak-button-secondary opacity-50"
                                    >
                                        AI answer coming soon
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_260px]">
                                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="ak-status-success">Source-grounded</span>
                                        <span className="ak-status-neutral">Agent-scoped</span>
                                        <span className="ak-status-neutral">Draft only</span>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        <p className="text-sm font-medium text-neutral-300">
                                            Based on the allowed knowledge for this agent, here are the most relevant points:
                                        </p>

                                        <ul className="space-y-4">
                                            {results.map((item) => (
                                                <li
                                                    key={item._id}
                                                    className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4"
                                                >
                                                    <p className="font-medium text-white">{item.title}</p>
                                                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                                                        {item.content}
                                                    </p>

                                                    <Link
                                                        href={`/knowledge/${item._id}`}
                                                        className="mt-3 inline-flex text-sm font-medium text-neutral-400 underline underline-offset-4 hover:text-white"
                                                    >
                                                        Source: {item.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <p className="mt-5 border-t border-neutral-800 pt-4 text-sm text-neutral-500">
                                        This is a retrieval-based draft. AI generation can be added later.
                                    </p>
                                </div>

                                <aside className="space-y-3">
                                    <div className="ak-panel">
                                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                            Answer policy
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-neutral-300">
                                            The agent should answer only from verified sources shown here.
                                        </p>
                                    </div>

                                    <div className="ak-panel">
                                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                            Action limitation
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-neutral-300">
                                            Some retrieved knowledge can be used to answer, but not to take action.
                                        </p>
                                    </div>

                                    <div className="ak-panel">
                                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                            Sources
                                        </p>
                                        <p className="mt-2 text-sm text-neutral-300">
                                            {results.length} verified source{results.length === 1 ? "" : "s"}
                                        </p>
                                    </div>
                                </aside>
                            </div>
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

                                        {"confidence" in item && item.confidence && (
                                            <span
                                                className={
                                                    item.confidence === "High"
                                                        ? "ak-status-success"
                                                        : item.confidence === "Medium"
                                                            ? "ak-status-warning"
                                                            : "ak-status-neutral"
                                                }
                                            >
                                                {item.confidence} confidence
                                            </span>
                                        )}

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
