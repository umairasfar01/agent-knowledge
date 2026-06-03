export const CURRENT_USER_ROLE = "admin";

export function canManageKnowledge(role: string) {
  return role === "admin";
}