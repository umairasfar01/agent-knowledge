export type MembershipRole = "owner" | "admin" | "member";

export function canManageKnowledge(role: string) {
  return role === "owner" || role === "admin";
}