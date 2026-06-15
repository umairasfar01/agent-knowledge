"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Id } from "../../../../convex/_generated/dataModel";

import { useCurrentRole } from "@/lib/useCurrentRole";
import { canManageKnowledge } from "@/lib/role";

export default function MembersPage() {
    const members = useQuery(api.users.listMembers, {
        organizationId: DEFAULT_ORG_ID,
    });

    const { user } = useAuth();
    const currentRole = useCurrentRole();
    const canManage = canManageKnowledge(currentRole);

    const updateMemberRole = useMutation(api.users.updateMemberRole);
    const removeMember = useMutation(api.users.removeMember);

    async function handleRoleChange(
        membershipId: Id<"memberships">,
        role: "owner" | "admin" | "member"
    ) {
        await updateMemberRole({
            membershipId,
            role,
            organizationId: DEFAULT_ORG_ID,
            workosUserId: user?.id ?? "",
        });
    }

    async function handleRemoveMember(membershipId: Id<"memberships">) {
        const confirmed = window.confirm(
            "Remove this member from the organization?"
        );

        if (!confirmed) return;

        await removeMember({
            membershipId,
            organizationId: DEFAULT_ORG_ID,
            workosUserId: user?.id ?? "",
        });
    }

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
                                        <th className="px-4 py-3 font-medium">Actions</th>
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
                                                {canManage ? (
                                                    <select
                                                        className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-300 outline-none"
                                                        value={member.role}
                                                        onChange={(e) =>
                                                            handleRoleChange(
                                                                member._id,
                                                                e.target.value as "owner" | "admin" | "member"
                                                            )
                                                        }
                                                    >
                                                        <option value="owner">owner</option>
                                                        <option value="admin">admin</option>
                                                        <option value="member">member</option>
                                                    </select>
                                                ) : (
                                                    <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                                                        {member.role}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                                                {member.organizationId}
                                            </td>

                                            <td className="px-4 py-3 text-neutral-400">
                                                {new Date(member.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 py-3">
                                                {canManage ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember(member._id)}
                                                        className="rounded-lg border border-red-900/60 px-3 py-2 text-xs text-red-300 hover:bg-red-950/30"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-neutral-500">—</span>
                                                )}
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