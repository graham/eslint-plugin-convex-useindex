# Testing Module for Convex ESLint Plugin

This directory contains a complete npm module for testing the `eslint-plugin-convex-performance` ESLint rule.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run ESLint on the test files:
   ```bash
   npm run lint
   ```

3. To see ESLint fix suggestions:
   ```bash
   npm run lint:fix
   ```

## What Gets Tested

The `convex/queries.js` file contains both valid and invalid Convex query patterns:

### Should Trigger ESLint Errors (BAD):
- `getAllMembers` - `.collect()` without index
- `paginateUsers` - `.paginate()` without index
- `getManyMessages` - `.take(10)` without index (exceeds limit)
- `getPublishedPosts` - Complex query chain without index

### Should NOT Trigger ESLint Errors (GOOD):
- `getMembersByNamespace` - Proper index usage
- `getUserById` - Direct ID lookup
- `getLatestMessage` - Small `.take(1)` operation
- `getAllNamespaces` - Query on allowed table
- `getFirstConfig` - `.first()` usage (when allowed)
- `paginateUsersByEmail` - Paginated query with index

## Configuration

The ESLint configuration in `.eslintrc.js` includes:
- `allowedTables: ['namespaces']` - Allow unindexed queries on small admin tables
- `maxTakeSize: 1` - Allow `.take(1)` without requiring an index
- `allowFirst: true` - Allow `.first()` without requiring an index

## Expected Output

When you run `npm run lint`, you should see ESLint errors for the BAD patterns and no errors for the GOOD patterns.