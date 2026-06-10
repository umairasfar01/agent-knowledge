import type { QueryCtx, MutationCtx } from "./_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function getMembershipForWorkosUser(
  ctx: Ctx,
  workosUserId: string,
  organizationId: string
) {
  const user = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("workosUserId"), workosUserId))
    .first();

  if (!user) return null;

  const membership = await ctx.db
    .query("memberships")
    .filter((q) =>
      q.and(
        q.eq(q.field("userId"), user._id),
        q.eq(q.field("organizationId"), organizationId)
      )
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