export const WORKOS_ORG_ID = "org_01KT22HVVQY3QQWQ7QV9KBPBKJ";

export const DEFAULT_ORG_ID = WORKOS_ORG_ID;

export function getCurrentOrgId(organizationId?: string) {
  return organizationId ?? WORKOS_ORG_ID;
}