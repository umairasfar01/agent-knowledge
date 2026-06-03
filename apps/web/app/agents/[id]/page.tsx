"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { AppShell } from "../../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";


export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as Id<"agents">;

  const agent = useQuery(api.agents.getAgent, { id });
  const knowledgeItems = useQuery(api.knowledge.listKnowledgeForAgent, {
    agentId: id,
    organizationId: DEFAULT_ORG_ID,
  });;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <Link
            href="/agents"
            className="text-sm text-neutral-400 hover:text-white"
          >
            ← Back to Agents
          </Link>
        </div>

        {agent === undefined ? (
          <p className="text-neutral-400">Loading...</p>
        ) : agent === null ? (
          <p className="text-neutral-400">Agent not found.</p>
        ) : (
          <>
            <header className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-400">
                    {agent.role ?? "Support Agent"}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold">{agent.name}</h1>
                  <p className="mt-3 max-w-2xl text-neutral-300">
                    {agent.description}
                  </p>
                </div>

                <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                  {agent.status}
                </span>
              </div>
            </header>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold">
                Knowledge this agent can access
              </h2>

              {knowledgeItems === undefined ? (
                <p className="mt-3 text-neutral-400">Loading knowledge...</p>
              ) : knowledgeItems.length === 0 ? (
                <p className="mt-3 text-neutral-400">
                  This agent has no assigned knowledge yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {knowledgeItems.map((item) => (
                    <Link
                      key={item._id}
                      href={`/knowledge/${item._id}`}
                      className="block rounded-xl border border-neutral-800 bg-neutral-950 p-4 hover:bg-neutral-900"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="mt-1 text-sm text-neutral-400">
                            {item.category}
                          </p>
                        </div>

                        <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm text-neutral-300">
                        {item.content}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}