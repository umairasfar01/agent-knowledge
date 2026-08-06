export const MEMBERSHIP_ROLES = ["owner", "admin", "member"] as const;

export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export type CurrentRole = MembershipRole | "loading";

export function isMembershipRole(value: string): value is MembershipRole {
  return (MEMBERSHIP_ROLES as readonly string[]).includes(value);
}

export function canManageKnowledge(role: CurrentRole): boolean {
  return role === "owner" || role === "admin";
}
