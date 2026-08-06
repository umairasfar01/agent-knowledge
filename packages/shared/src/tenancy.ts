// Alias, not a brand: the backend stores organizationId as a bare string (a WorkOS
// org id) rather than a Convex document id. Routing every reference through this
// name keeps the eventual switch to Id<"organizations"> a single-line change.
export type OrganizationId = string;

// The app is single-tenant today: every client-side query and mutation scopes to
// this WorkOS org. Shared here (not just in apps/web) so convex/migrations.ts can
// backfill legacy rows to the same id the frontend already queries with.
export const DEFAULT_ORG_ID: OrganizationId = "org_01KT22HVVQY3QQWQ7QV9KBPBKJ";
