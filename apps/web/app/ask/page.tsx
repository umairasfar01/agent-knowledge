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
    const [aiAnswer, setAiAnswer] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState("");

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
                organizationId: DEFAULT_ORG_ID,
                agentId: selectedAgentId,
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

    async function generateAiAnswer() {
        if (!results || results.length === 0) return;

        setIsGenerating(true);
        setAiError("");
        setAiAnswer("");

        try {
            const response = await fetch("/api/answer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question,
                    sources: results.slice(0, 5).map((item) => ({
                        title: item.title,
                        content: item.content,
                        category: item.category,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error ?? "Failed to generate answer.");
            }

            setAiAnswer(data.answer ?? "");
        } catch (error) {
            setAiError(
                error instanceof Error ? error.message : "Failed to generate answer."
            );
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-5xl space-y-8">
                <header>
                    <p className="text-sm font-medium text-neutral-400">
                        Agent Retrieval
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">Ask Agent Knowledge</h1>
                    <p className="mt-2 text-neutral-400">
                        Select an agent and search only the knowledge that agent is allowed
                        to use.
                    </p>
                </header>

                <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-neutral-300">
                                Agent
                            </label>

                            <select
                                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none"
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
                            <label className="text-sm font-medium text-neutral-300">
                                Question
                            </label>

                            <input
                                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none placeholder:text-neutral-500"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Example: refund policy"
                            />
                        </div>

                        <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
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
                        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <h2 className="text-xl font-semibold">Draft answer</h2>

                                <button
                                    type="button"
                                    onClick={copyDraftAnswer}
                                    className="w-fit rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                >
                                    {copied ? "Copied!" : "Copy draft"}
                                </button>

                                <button
                                    type="button"
                                    disabled
                                    className="w-fit cursor-not-allowed rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-500 opacity-60"
                                >
                                    AI answer coming soon
                                </button>
                            </div>

                            {results.some((item) => item.requiresApproval) && (
                                <div className="mt-4 rounded-xl border border-yellow-900/60 bg-yellow-950/20 p-4">
                                    <p className="text-sm font-medium text-yellow-300">
                                        Approval warning
                                    </p>
                                    <p className="mt-1 text-sm text-yellow-200/80">
                                        Some retrieved knowledge requires approval before action. The agent may
                                        use approved answerable knowledge to respond, but should not take action
                                        without approval.
                                    </p>
                                </div>
                            )}

                            {results.some((item) => item.canUseToAct === false) && (
                                <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
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

                            {aiError && (
                                <div className="mt-5 rounded-xl border border-red-900/60 bg-red-950/20 p-4">
                                    <p className="text-sm text-red-300">{aiError}</p>
                                </div>
                            )}

                            {aiAnswer && (
                                <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                                    <p className="text-sm font-medium text-neutral-300">AI answer</p>
                                    <p className="mt-3 whitespace-pre-wrap text-neutral-200">{aiAnswer}</p>
                                </div>
                            )}

                            <p className="mt-4 text-sm text-neutral-500">
                                This is a retrieval-based draft. AI generation can be added next.
                            </p>
                        </section>
                    )}

                    {!selectedAgentId ? (
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                            <p className="text-neutral-300">Select an agent first.</p>
                            <p className="mt-1 text-sm text-neutral-500">
                                Results will only include knowledge assigned to that agent.
                            </p>
                        </div>
                    ) : !question.trim() ? (
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
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
                    ) : results.length === 0 ? (
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
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
                                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-neutral-400">
                                                {item.category}
                                            </p>
                                            <h3 className="mt-1 text-lg font-semibold">
                                                {item.title}
                                            </h3>
                                        </div>

                                        <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                                            {item.status}
                                        </span>
                                    </div>

                                    <p className="mt-4 line-clamp-3 text-neutral-300">
                                        {item.content}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                                            Can answer
                                        </span>

                                        {item.requiresApproval && (
                                            <span className="rounded-full border border-yellow-900/60 px-3 py-1 text-xs text-yellow-300">
                                                Approval required
                                            </span>
                                        )}

                                        <Link
                                            href={`/knowledge/${item._id}`}
                                            className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
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