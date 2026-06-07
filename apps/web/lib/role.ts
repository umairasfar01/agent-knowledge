export type MembershipRole = "owner" | "admin" | "member";
export type CurrentRole = MembershipRole | "loading";

export function canManageKnowledge(role: string) {
  return role === "owner" || role === "admin";
}