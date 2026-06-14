import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  knowledge: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.string(),
    status: v.union(v.literal("draft"), v.literal("verified")),
    ownerId: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    organizationId: v.optional(v.string()),

    sourceUrl: v.optional(v.string()),
    lastReviewedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),

    canUseToAct: v.optional(v.boolean()),
    canUseToAnswer: v.optional(v.boolean()),
    requiresApproval: v.optional(v.boolean()),
    allowedAgentIds: v.optional(v.array(v.id("agents"))),


  }),

  users: defineTable({
    workosUserId: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),

    // old seed fields
    organizationId: v.optional(v.string()),
    role: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  memberships: defineTable({
    userId: v.id("users"),
    organizationId: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  auditLogs: defineTable({
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("seed.demo_created"),
      v.literal("agent.created"),
      v.literal("agent.updated"),
      v.literal("agent.deleted")

    ),

    knowledgeId: v.optional(v.id("knowledge")),
    knowledgeTitle: v.optional(v.string()),
    actorId: v.optional(v.string()),
    actorEmail: v.optional(v.string()),
    actorUserId: v.optional(v.string()),

    organizationId: v.optional(v.string()),
    targetId: v.optional(v.string()),
    targetType: v.optional(v.string()),
    metadata: v.optional(v.any()),

    createdAt: v.number(),

    agentId: v.optional(v.id("agents")),
    agentName: v.optional(v.string()),

  }),

  agents: defineTable({
    name: v.string(),
    description: v.string(),
    role: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("disabled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  knowledgeVersions: defineTable({
    knowledgeId: v.id("knowledge"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    status: v.union(v.literal("draft"), v.literal("verified")),
    changedByEmail: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    createdAt: v.number(),
  }),

});