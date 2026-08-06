"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { type ReactNode, useCallback } from "react";
import {
  useAccessToken,
  useAuth as useWorkOSAuth,
} from "@workos-inc/authkit-nextjs/components";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Bridges WorkOS AuthKit's auth state to the { isLoading, isAuthenticated,
// fetchAccessToken } shape ConvexProviderWithAuth expects, so ctx.auth.getUserIdentity()
// in Convex functions resolves to the signed-in WorkOS user. See convex/auth.config.ts
// for the corresponding JWT verification setup.
function useAuthForConvex() {
  const { user, loading } = useWorkOSAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) return null;
      const token = forceRefreshToken
        ? await refresh()
        : await getAccessToken();
      return token ?? null;
    },
    [user, getAccessToken, refresh]
  );

  return {
    isLoading: loading,
    isAuthenticated: !loading && user !== null,
    fetchAccessToken,
  };
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthForConvex}>
      {children}
    </ConvexProviderWithAuth>
  );
}
