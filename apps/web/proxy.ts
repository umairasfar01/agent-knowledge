import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/", "/login", "/callback"],
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/knowledge/:path*",
    "/agents/:path*",
    "/audit/:path*",
    "/approvals/:path*",
  ],
};