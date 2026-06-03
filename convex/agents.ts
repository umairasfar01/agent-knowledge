import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAgent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    role: v.string(),
    status: v.union(v.literal("active"), v.literal("disabled")),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("agents", {
      name: args.name,
      description: args.description,
      role: args.role,
      status: args.status,
      organizationId: args.organizationId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listAgents = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").order("desc").collect();

    return agents.filter(
      (agent) =>
        agent.organizationId === "default-org" ||
        agent.organizationId === undefined
    );
  },
});

export const updateAgent = mutation({
  args: {
    id: v.id("agents"),
    name: v.string(),
    description: v.string(),
    role: v.string(),
    status: v.union(v.literal("active"), v.literal("disabled")),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      role: args.role,
      status: args.status,
      updatedAt: Date.now(),
      organizationId: args.organizationId,
    });
  },
});

export const deleteAgent = mutation({
  args: {
    id: v.id("agents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
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