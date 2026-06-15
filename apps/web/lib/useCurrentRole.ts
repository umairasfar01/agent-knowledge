"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getCurrentOrgId } from "@/lib/org";

export type CurrentRole = "loading" | "owner" | "admin" | "member";

export function useCurrentRole(): CurrentRole {
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

  if (!user?.id) return "loading";
  if (membershipData === undefined) return "loading";

  return membershipData?.membership.role ?? "member";
}