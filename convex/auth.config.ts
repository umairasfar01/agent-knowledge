// Wires WorkOS AuthKit access tokens up to ctx.auth.getUserIdentity() in Convex
// functions. WorkOS's JWKS lives at /sso/jwks/{client_id} rather than under a
// {issuer}/.well-known/jwks.json discovery document, so this uses the "customJwt"
// provider type to point Convex at the issuer, JWKS, and algorithm explicitly
// instead of the discovery-based { applicationID, domain } shorthand.
//
// Requires WORKOS_CLIENT_ID to be set as a Convex environment variable (separate
// from apps/web's .env.local): `npx convex env set WORKOS_CLIENT_ID <client_id>`.
export default {
  providers: [
    {
      type: "customJwt",
      applicationID: process.env.WORKOS_CLIENT_ID ?? null,
      issuer: `https://api.workos.com/user_management/${process.env.WORKOS_CLIENT_ID}`,
      jwks: `https://api.workos.com/sso/jwks/${process.env.WORKOS_CLIENT_ID}`,
      algorithm: "RS256",
    },
  ],
};
