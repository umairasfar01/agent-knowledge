import { WorkOS } from "@workos-inc/node";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { WORKOS_ORG_ID } from "@/lib/org";

type InviteRole = "owner" | "admin" | "member";

function mapRoleToWorkOSRoleSlug(role: InviteRole) {
  if (role === "owner") return "admin";
  if (role === "admin") return "admin";
  return "member";
}

export async function POST(request: Request) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });

    if (!user?.id || !user.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const role = String(body.role ?? "member") as InviteRole;
    const organizationId = String(body.organizationId ?? WORKOS_ORG_ID);

    if (!email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    if (!["owner", "admin", "member"].includes(role)) {
      return Response.json({ error: "Invalid role." }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      return Response.json(
        { error: "Convex URL is not configured." },
        { status: 500 }
      );
    }

    const convex = new ConvexHttpClient(convexUrl);

    const membershipData = await convex.query(
      api.users.getMembershipByWorkosUser,
      {
        workosUserId: user.id,
        organizationId,
      }
    );

    const currentRole = membershipData?.membership.role;

    if (currentRole !== "owner" && currentRole !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const workosApiKey = process.env.WORKOS_API_KEY;

    if (!workosApiKey) {
      return Response.json(
        { error: "WORKOS_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const workos = new WorkOS(workosApiKey);

    const invitation = await workos.userManagement.sendInvitation({
      email,
      organizationId,
      roleSlug: mapRoleToWorkOSRoleSlug(role),
      inviterUserId: user.id,
    });

    await convex.mutation(api.users.inviteMember, {
      email,
      name: name || undefined,
      role,
      organizationId,
      workosUserId: user.id,
      actorEmail: user.email,
    });

    return Response.json({
      invitationId: invitation.id,
      email: invitation.email,
      state: invitation.state,
    });
  } catch (error) {
    console.error("WorkOS invite error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to send invitation.";

    return Response.json({ error: message }, { status: 500 });
  }
}