/**
 * Test queries for the Convex ESLint rule
 * This file contains both valid and invalid patterns to test the rule
 */

import { query } from "./_generated/server";

// BAD: Query without index using collect() - should trigger ESLint error
export const getAllMembers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("members").collect();
  },
});

// BAD: Query without index using paginate() - should trigger ESLint error
export const paginateUsers = query({
  args: { paginationOpts: {} },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").paginate(args.paginationOpts);
  },
});

// BAD: Large take operation without index - should trigger ESLint error
export const getManyMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").take(10);
  },
});

// BAD: Complex query chain without index - should trigger ESLint error
export const getPublishedPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("published"), true))
      .order("desc")
      .collect();
  },
});

// GOOD: Query with proper index - should NOT trigger ESLint error
export const getMembersByNamespace = query({
  args: { namespace: "" },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("byNamespace", (q) => q.eq("namespace", args.namespace))
      .collect();
  },
});

// GOOD: Direct ID lookup - should NOT trigger ESLint error
export const getUserById = query({
  args: { id: "" },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// GOOD: Small take operation (within limit) - should NOT trigger ESLint error
export const getLatestMessage = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").take(1);
  },
});

// GOOD: Query on allowed table - should NOT trigger ESLint error
export const getAllNamespaces = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("namespaces").collect();
  },
});

// GOOD: First() without index (when allowed) - should NOT trigger ESLint error
export const getFirstConfig = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("config").first();
  },
});

// GOOD: Paginated query with index - should NOT trigger ESLint error
export const paginateUsersByEmail = query({
  args: { email: "", paginationOpts: {} },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .paginate(args.paginationOpts);
  },
});