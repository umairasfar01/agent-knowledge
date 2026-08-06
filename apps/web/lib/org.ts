import { DEFAULT_ORG_ID as SHARED_DEFAULT_ORG_ID } from "@agent-knowledge/shared";

export const WORKOS_ORG_ID = SHARED_DEFAULT_ORG_ID;

export const DEFAULT_ORG_ID = WORKOS_ORG_ID;

export function getCurrentOrgId(organizationId?: string) {
  return organizationId ?? WORKOS_ORG_ID;
}