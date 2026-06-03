"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AppShell } from "../AppShell";
import Link from "next/link";
import { DEFAULT_ORG_ID } from "@/lib/org";

export default function AgentsPage() {
    const agents = useQuery(api.agents.listAgents, {
        organizationId: DEFAULT_ORG_ID,
    });
    const createAgent = useMutation(api.agents.createAgent);
    const updateAgent = useMutation(api.agents.updateAgent);
    const deleteAgent = useMutation(api.agents.deleteAgent);

    const [editingId, setEditingId] = useState<Id<"agents"> | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [role, setRole] = useState("Support Agent");
    const [status, setStatus] = useState<"active" | "disabled">("active");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name.trim() || !description.trim()) return;

        if (editingId) {
            await updateAgent({
                id: editingId,
                name,
                description,
                role,
                status,
                organizationId: DEFAULT_ORG_ID,
            });
            setEditingId(null);
        } else {
            await createAgent({
                name,
                description,
                role,
                status,
                organizationId: DEFAULT_ORG_ID,
            });
        }

        setName("");
        setDescription("");
        setRole("Support Agent");
        setStatus("active");
    }

    function handleEdit(agent: {
        _id: Id<"agents">;
        name: string;
        description: string;
        role?: string;
        status: "active" | "disabled";
    }) {
        setEditingId(agent._id);
        setName(agent.name);
        setDescription(agent.description);
        setRole(agent.role ?? "Support Agent");
        setStatus(agent.status);
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-6xl space-y-8">
                <header>
                    <p className="text-sm font-medium text-neutral-400">
                        Agent Registry
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">Agents</h1>
                    <p className="mt-2 text-neutral-400">
                        Create and manage the AI agents that will use your company
                        knowledge.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-neutral-300">
                                Agent name
                            </label>
                            <input
                                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none placeholder:text-neutral-500"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Customer Support Agent"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-neutral-300">
                                Role
                            </label>
                            <select
                                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option>Support Agent</option>
                                <option>Developer Agent</option>
                                <option>Sales Agent</option>
                                <option>Operations Agent</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-neutral-300">
                            Description
                        </label>
                        <textarea
                            className="min-h-28 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none placeholder:text-neutral-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Explain what this agent does..."
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-neutral-300">
                            Status
                        </label>
                        <select
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none md:w-72"
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as "active" | "disabled")
                            }
                        >
                            <option value="active">Active</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="w-fit rounded-lg bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200"
                        >
                            {editingId ? "Update Agent" : "Create Agent"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setName("");
                                    setDescription("");
                                    setRole("Support Agent");
                                    setStatus("active");
                                }}
                                className="w-fit rounded-lg border border-neutral-700 px-4 py-2 font-medium text-neutral-200 hover:bg-neutral-800"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Agent List</h2>

                    {agents === undefined ? (
                        <p className="text-neutral-400">Loading...</p>
                    ) : agents.length === 0 ? (
                        <p className="text-neutral-400">No agents yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {agents.map((agent) => (
                                <article
                                    key={agent._id}
                                    className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{agent.name}</h3>
                                            <p className="mt-1 text-sm text-neutral-400">
                                                {agent.role ?? "Support Agent"}
                                            </p>
                                        </div>

                                        <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                                            {agent.status}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-neutral-200">{agent.description}</p>



                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <Link
                                            href={`/agents/${agent._id}`}
                                            className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                                        >
                                            Open
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => handleEdit(agent)}
                                            className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => deleteAgent({ id: agent._id })}
                                            className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-300 hover:bg-red-950"
                                        >
                                            Delete
                                        </button>
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