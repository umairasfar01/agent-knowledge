"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "../AppShell";
import { DEFAULT_ORG_ID } from "@/lib/org";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";

import { useCurrentRole } from "@/lib/useCurrentRole";
import { canManageKnowledge } from "@/lib/role";
import { useToast } from "../components/ToastProvider";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SkeletonCard, SkeletonList } from "../components/Skeleton";

export default function MembersPage() {
    const { showToast } = useToast();

    const members = useQuery(api.users.listMembers, {
        organizationId: DEFAULT_ORG_ID,
    });

    const { user } = useAuth();
    const currentRole = useCurrentRole();
    const canManage =
        currentRole !== "loading" && canManageKnowledge(currentRole);

    const updateMemberRole = useMutation(api.users.updateMemberRole);
    const removeMember = useMutation(api.users.removeMember);

    const [memberError, setMemberError] = useState("");
    const [removeTargetId, setRemoveTargetId] =
        useState<Id<"memberships"> | null>(null);

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [inviteRole, setInviteRole] = useState<"owner" | "admin" | "member">(
        "member"
    );
    const [inviteError, setInviteError] = useState("");


    async function handleRoleChange(
        membershipId: Id<"memberships">,
        role: "owner" | "admin" | "member"
    ) {
        try {
            await updateMemberRole({
                membershipId,
                role,
                organizationId: DEFAULT_ORG_ID,
                workosUserId: user?.id ?? "",
                actorEmail: user?.email ?? "unknown-user",
            });

            showToast({
                type: "success",
                title: "Role changed",
                description: `Member role updated to ${role}.`,
            });
        } catch (error) {
            showToast({
                type: "error",
                title: "Role change failed",
                description:
                    error instanceof Error ? error.message : "Could not update the member role.",
            });
        }
    }

    async function handleRemoveMember(membershipId: Id<"memberships">) {
        setMemberError("");

        try {
            await removeMember({
                membershipId,
                organizationId: DEFAULT_ORG_ID,
                workosUserId: user?.id ?? "",
                actorEmail: user?.email ?? "unknown-user",
            });

            showToast({
                type: "success",
                title: "Member removed",
                description: "The member was removed from the workspace.",
            });
            setRemoveTargetId(null);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to remove member.";

            const cleanMessage = message.includes(
                "Cannot remove the last owner/admin from this organization"
            )
                ? "Cannot remove the last owner/admin from this organization."
                : "Failed to remove member.";

            setMemberError(cleanMessage);
            showToast({
                type: "error",
                title: "Remove failed",
                description: cleanMessage,
            });
            setRemoveTargetId(null);
        }
    }

    async function handleInviteMember(e: React.FormEvent) {
        e.preventDefault();

        setInviteError("");

        try {
            const response = await fetch("/api/workos/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: inviteEmail,
                    name: inviteName || undefined,
                    role: inviteRole,
                    organizationId: DEFAULT_ORG_ID,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error ?? "Failed to send invitation.");
            }

            showToast({
                type: "success",
                title: "Invitation sent",
                description: `${inviteEmail} was added as ${inviteRole}.`,
            });
            setInviteEmail("");
            setInviteName("");
            setInviteRole("member");
            
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to add member.";

            setInviteError(message);
            showToast({
                type: "error",
                title: "Invite failed",
                description: message,
            });
        }
    }

    return (
        <AppShell>
            <div className="ak-page">
                <header className="border-b border-neutral-800/80 pb-6">
                    <p className="ak-header-eyebrow">Workspace administration</p>
                    <h1 className="ak-header-title">Members</h1>
                    <p className="ak-header-description">
                        Invite teammates and manage roles for the current organization.
                    </p>
                </header>

                {currentRole === "loading" && (
                    <SkeletonCard lines={2} />
                )}

                {canManage && (
                    <section className="ak-card">
                        <div className="border-b border-neutral-800/80 pb-5">
                            <p className="ak-header-eyebrow">Invitation</p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                                Add member
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-neutral-400">
                            Add a teammate to this organization and assign their starting role.
                            </p>
                        </div>

                        <form onSubmit={handleInviteMember} className="mt-5 grid gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <label className="ak-label">Email</label>
                                <input
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="ak-input mt-2"
                                    placeholder="teammate@example.com"
                                />
                            </div>

                            <div>
                                <label className="ak-label">Name</label>
                                <input
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    className="ak-input mt-2"
                                    placeholder="Optional"
                                />
                            </div>

                            <div>
                                <label className="ak-label">Starting role</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) =>
                                        setInviteRole(e.target.value as "owner" | "admin" | "member")
                                    }
                                    className="ak-select mt-2"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                    <option value="owner">Owner</option>
                                </select>
                            </div>

                            <div className="md:col-span-4">
                                <button
                                    type="submit"
                                    className="ak-button-primary"
                                >
                                    Add member
                                </button>
                            </div>
                        </form>

                        {inviteError && (
                            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                                <p className="text-sm text-red-300">{inviteError}</p>
                            </div>
                        )}

                    </section>
                )}

                <section className="ak-card">
                    <p className="ak-header-eyebrow">Directory</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                        Organization members
                    </h2>

                    {memberError && (
                        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                            <p className="text-sm text-red-300">{memberError}</p>
                        </div>
                    )}

                    {members === undefined ? (
                        <SkeletonList count={4} className="mt-5 space-y-3" lines={2} />
                    ) : members.length === 0 ? (
                        <div className="ak-panel mt-5">
                            <p className="text-neutral-300">No members found.</p>
                            <p className="mt-1 text-sm text-neutral-500">
                                Members will appear here after they sign in and are synced.
                            </p>
                        </div>
                    ) : (
                        <div className="ak-table-wrap mt-5">
                            <table className="ak-table">
                                <thead className="ak-table-head">
                                    <tr>
                                        <th className="ak-table-th">User</th>
                                        <th className="ak-table-th">Role</th>
                                        <th className="ak-table-th">Organization</th>
                                        <th className="ak-table-th">Joined</th>
                                        <th className="ak-table-th">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member._id} className="ak-table-row">
                                            <td className="ak-table-td">
                                                <p className="font-medium text-neutral-200">
                                                    {member.userEmail}
                                                </p>
                                                {member.userName && (
                                                    <p className="mt-1 text-xs text-neutral-500">
                                                        {member.userName}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="ak-table-td">
                                                {canManage ? (
                                                    <select
                                                        aria-label={`Role for ${member.userEmail}`}
                                                        className="ak-select min-w-32 max-w-40 py-1.5 text-xs capitalize"
                                                        value={member.role}
                                                        onChange={(e) =>
                                                            handleRoleChange(
                                                                member._id,
                                                                e.target.value as "owner" | "admin" | "member"
                                                            )
                                                        }
                                                    >
                                                        <option value="owner">Owner</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="member">Member</option>
                                                    </select>
                                                ) : (
                                                    <span className="ak-status-neutral capitalize">
                                                        {member.role}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="ak-table-td font-mono text-xs text-neutral-400">
                                                {member.organizationId}
                                            </td>

                                            <td className="ak-table-td text-neutral-400">
                                                {new Date(member.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="ak-table-td">
                                                {canManage ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRemoveTargetId(member._id)}
                                                        className="ak-button-danger px-3 py-1.5 text-xs"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-neutral-500">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <ConfirmDialog
                    open={removeTargetId !== null}
                    title="Remove member?"
                    description="This removes the member from the workspace. Role protections still apply."
                    confirmLabel="Remove member"
                    tone="danger"
                    onConfirm={() => {
                        if (!removeTargetId) return;
                        return handleRemoveMember(removeTargetId);
                    }}
                    onCancel={() => setRemoveTargetId(null)}
                />
            </div>
        </AppShell>
    );
}
