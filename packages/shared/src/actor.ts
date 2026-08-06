import type { OrganizationId } from "./tenancy";

// TRANSITIONAL. These three fields are currently sent from the browser on every
// mutation, which is why the backend's authorization is client-assertable. They are
// grouped into one type so tasks #4 (server-verified auth via ctx.auth) and #20 (real
// actor identity) can drop workosUserId and actorEmail in one place, letting the
// compiler point at every call site that still passes them. organizationId survives
// as a client-supplied arg the server validates against membership, so ActorArgs
// collapses to a single field rather than disappearing.
// Do not add new identity fields here; new code should assume the server derives
// identity itself.
export type ActorArgs = {
  organizationId: OrganizationId;
  workosUserId: string;
  actorEmail: string;
};

// Structural, so the shared package stays free of a @workos-inc dependency.
export type ActorSource = {
  id?: string | null;
  email?: string | null;
};

// Fallbacks reproduce the existing per-page literals ("" and "unknown-user") exactly.
// An empty workosUserId fails authorization server-side; tasks #4 and #20 replace
// both fallbacks with real identity rather than papering over them here.
export function buildActorArgs(
  user: ActorSource | null | undefined,
  organizationId: OrganizationId
): ActorArgs {
  return {
    organizationId,
    workosUserId: user?.id ?? "",
    actorEmail: user?.email ?? "unknown-user",
  };
}
