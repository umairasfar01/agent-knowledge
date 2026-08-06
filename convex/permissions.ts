import type { QueryCtx, MutationCtx } from "./_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function getMembershipForWorkosUser(
  ctx: Ctx,
  workosUserId: string,
  organizationId: string
) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q) => q.eq("workosUserId", workosUserId))
    .first();

  if (!user) return null;

  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_user_org", (q) =>
      q.eq("userId", user._id).eq("organizationId", organizationId)
    )
    .first();

  return membership;
}

export async function requireAdminForWorkosUser(
  ctx: Ctx,
  workosUserId: string,
  organizationId: string
) {
  const membership = await getMembershipForWorkosUser(
    ctx,
    workosUserId,
    organizationId
  );

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error("Unauthorized");
  }

  return membership;
}

// Prefers ctx.auth's server-verified identity over the caller-supplied
// workosUserId, same fallback pattern as writeAuditLog in audit.ts: the
// client-supplied value is only used when ctx.auth has no verified identity
// for the request (e.g. no JWT reached Convex yet).
export async function requireAdminForIdentity(
  ctx: Ctx,
  organizationId: string,
  fallbackWorkosUserId: string
) {
  const identity = await ctx.auth.getUserIdentity();

  return await requireAdminForWorkosUser(
    ctx,
    identity?.subject ?? fallbackWorkosUserId,
    organizationId
  );
}
