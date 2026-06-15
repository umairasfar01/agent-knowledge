import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminForWorkosUser } from "./permissions";

export const createAgent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    role: v.string(),
    status: v.union(v.literal("active"), v.literal("disabled")),
    organizationId: v.string(),
    actorEmail: v.optional(v.string()),
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {

    await requireAdminForWorkosUser(ctx, args.workosUserId, args.organizationId);

    const now = Date.now();

    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      description: args.description,
      role: args.role,
      status: args.status,
      organizationId: args.organizationId,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("auditLogs", {
      action: "agent.created",
      agentId,
      agentName: args.name,
      actorEmail: args.actorEmail,
      actorId: "demo-user",
      organizationId: args.organizationId,
      createdAt: now,
    });

    return agentId;

  },
});

export const listAgents = query({
  args: {
    organizationId: v.string(),
    search: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("all"), v.literal("active"), v.literal("disabled"))
    ),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("agents").order("desc").collect();

    const search = args.search?.toLowerCase().trim() ?? "";
    const status = args.status ?? "all";
    const role = args.role ?? "all";

    return agents.filter((agent) => {
      const matchesOrganization =
        agent.organizationId === args.organizationId ||
        agent.organizationId === undefined;

      const matchesSearch =
        !search ||
        agent.name.toLowerCase().includes(search) ||
        agent.description.toLowerCase().includes(search);

      const matchesStatus = status === "all" || agent.status === status;

      const matchesRole = role === "all" || agent.role === role;

      return matchesOrganization && matchesSearch && matchesStatus && matchesRole;
    });
  },
});

export const updateAgent = mutation({
  args: {
    id: v.id("agents"),
    name: v.string(),
    description: v.string(),
    role: v.string(),
    status: v.union(v.literal("active"), v.literal("disabled")),
    organizationId: v.string(),
    actorEmail: v.optional(v.string()),
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminForWorkosUser(ctx, args.workosUserId, args.organizationId);
    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      role: args.role,
      status: args.status,
      updatedAt: Date.now(),
      organizationId: args.organizationId,
    });

    await ctx.db.insert("auditLogs", {
      action: "agent.updated",
      agentId: args.id,
      agentName: args.name,
      actorEmail: args.actorEmail,
      actorId: "demo-user",
      organizationId: args.organizationId,
      createdAt: Date.now(),
    });
  },
});

export const deleteAgent = mutation({
  args: {
    id: v.id("agents"),
    actorEmail: v.optional(v.string()),
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);

    if (!agent) {
      throw new Error("Agent not found");
    }

    if (!agent.organizationId) {
      throw new Error("Agent is missing organizationId");
    }

    await requireAdminForWorkosUser(ctx, args.workosUserId, agent.organizationId);

    await ctx.db.delete(args.id);

    await ctx.db.insert("auditLogs", {
      action: "agent.deleted",
      agentId: undefined,
      agentName: agent?.name ?? "Unknown agent",
      actorId: "demo-user",
      actorEmail: args.actorEmail,
      organizationId: agent?.organizationId,
      createdAt: Date.now(),
    });
  },
});

export const getAgent = query({
  args: {
    id: v.id("agents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listAuditLogsForAgent = query({
  args: {
    agentId: v.id("agents"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("auditLogs").order("desc").collect();

    return logs
      .filter(
        (log) =>
          log.agentId === args.agentId &&
          (log.organizationId === args.organizationId ||
            log.organizationId === undefined)
      )
      .slice(0, 10);
  },
});

export const listAuditLogs = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("auditLogs").order("desc").collect();

    return logs
      .filter((log) => log.organizationId === args.organizationId)
      .slice(0, 50);
  },
});