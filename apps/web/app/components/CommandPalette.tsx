"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const commands = [
  {
    group: "Workspace",
    label: "Dashboard",
    description: "View workspace metrics and activity",
    href: "/dashboard",
  },
  {
    group: "Workspace",
    label: "Ask",
    description: "Ask an agent using verified knowledge",
    href: "/ask",
  },
  {
    group: "Workspace",
    label: "Retrieval History",
    description: "Review previous agent retrievals",
    href: "/retrieval-history",
  },
  {
    group: "Knowledge",
    label: "Knowledge Base",
    description: "Create, import, edit, and export knowledge",
    href: "/knowledge",
  },
  {
    group: "Knowledge",
    label: "Agents",
    description: "Manage agents and their roles",
    href: "/agents",
  },
  {
    group: "Governance",
    label: "Approvals",
    description: "Approve or reject draft knowledge",
    href: "/approvals",
  },
  {
    group: "Governance",
    label: "Reviews",
    description: "Review stale knowledge",
    href: "/reviews",
  },
  {
    group: "Governance",
    label: "Audit Logs",
    description: "Track workspace activity",
    href: "/audit",
  },
  {
    group: "Admin",
    label: "Members",
    description: "Invite and manage team members",
    href: "/members",
  },
  {
    group: "Admin",
    label: "Settings",
    description: "Manage organization defaults",
    href: "/settings",
  },
];

export function CommandPalette() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCommandK =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (isCommandK) {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return commands;

    return commands.filter((command) => {
      return (
        command.label.toLowerCase().includes(normalizedQuery) ||
        command.description.toLowerCase().includes(normalizedQuery) ||
        command.group.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  function runCommand(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 px-4 py-20 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="border-b border-neutral-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Command palette
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                Search pages and workspace actions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-sm text-neutral-500 transition hover:bg-neutral-900 hover:text-white"
            >
              Esc
            </button>
          </div>

          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-4 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-600"
            placeholder="Search dashboard, ask, members, settings..."
          />
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="rounded-xl p-6 text-center">
              <p className="text-sm font-medium text-white">
                No commands found.
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Try searching for Ask, Knowledge, Members, or Settings.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((command) => (
                <button
                  key={command.href}
                  type="button"
                  onClick={() => runCommand(command.href)}
                  className="flex w-full items-start justify-between gap-4 rounded-xl px-4 py-3 text-left transition hover:bg-neutral-900"
                >
                  <span>
                    <span className="block text-sm font-medium text-white">
                      {command.label}
                    </span>
                    <span className="mt-1 block text-sm text-neutral-500">
                      {command.description}
                    </span>
                  </span>

                  <span className="shrink-0 rounded-md border border-neutral-800 px-2 py-1 text-xs text-neutral-500">
                    {command.group}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}