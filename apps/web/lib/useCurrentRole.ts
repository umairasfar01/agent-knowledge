"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getCurrentOrgId } from "@/lib/org";

export function useCurrentRole() {
  const auth = useAuth();
  const { user } = auth;

  const organizationId =
    "organizationId" in auth ? auth.organizationId : undefined;

  const currentOrgId = getCurrentOrgId(organizationId);

  const membershipData = useQuery(
    api.users.getMembershipByWorkosUser,
    user?.id
      ? {
          workosUserId: user.id,
          organizationId: currentOrgId,
        }
      : "skip"
  );

  return membershipData?.membership.role ?? "member";
}