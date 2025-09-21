/**
 * ESLint plugin for Convex database performance
 * Enforces best practices for database queries to prevent performance issues
 */

const noUnindexedQueries = require("./rules/no-unindexed-queries");

module.exports = {
  rules: {
    "no-unindexed-queries": noUnindexedQueries,
  },
  configs: {
    recommended: {
      plugins: ["convex-useindex"],
      rules: {
        "convex-useindex/no-unindexed-queries": "error",
      },
    },
  },
};
