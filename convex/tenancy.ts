type OrgScoped = { organizationId?: string };

// Task #8 backfilled every row that used to store organizationId as `undefined`
// (see convex/migrations.ts), so a strict match is safe everywhere now.
export function inOrg(organizationId: string) {
  return <T extends OrgScoped>(row: T) => row.organizationId === organizationId;
}
