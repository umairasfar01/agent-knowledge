"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";

export default function MembersPage() {
  const members = useQuery(api.users.listMembers, {
    organizationId: DEFAULT_ORG_ID,
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-medium text-neutral-400">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold">Members</h1>
          <p className="mt-2 text-neutral-400">
            View users and roles for the current organization.
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-xl font-semibold">Organization members</h2>

          {members === undefined ? (
            <div className="mt-5 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                >
                  <div className="h-5 w-1/3 rounded bg-neutral-800" />
                  <div className="mt-3 h-4 w-1/4 rounded bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-neutral-300">No members found.</p>
              <p className="mt-1 text-sm text-neutral-500">
                Members will appear here after they sign in and are synced.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-neutral-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-950 text-neutral-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Organization</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800">
                  {members.map((member) => (
                    <tr key={member._id} className="bg-neutral-900">
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-200">
                          {member.userEmail}
                        </p>
                        {member.userName && (
                          <p className="mt-1 text-xs text-neutral-500">
                            {member.userName}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                          {member.role}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                        {member.organizationId}
                      </td>

                      <td className="px-4 py-3 text-neutral-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}