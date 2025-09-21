# ESLint Plugin: Convex Performance

Custom ESLint plugin that enforces database query performance best practices for Convex applications.

This is an attempt at catching queries that have a high probability of being expensive or slow, it likely will not catch all of them, but it might help keep your usage down and your queries fast.

Have fun :)

## Rules

### `no-unindexed-queries`

Prevents Convex database queries without proper index usage to avoid expensive full-table scans.

**Good (Using Index):**
```typescript
// Properly indexed query
const members = await ctx.db
  .query("members")
  .withIndex("byFid", (q) => q.eq("namespace", args.namespace))
  .collect();

// Direct ID lookup (uses primary key)
const user = await ctx.db.get(args.id);
```

**Bad (No Index):**
```typescript
// Full table scan - causes performance issues!
const members = await ctx.db.query("members").collect();
```

## Configuration

```javascript
{
  "convex-performance/no-unindexed-queries": ["error", {
    "allowedTables": ["namespaces"],  // Small tables where full scan is OK
    "maxTakeSize": 5,                 // Allow .take(n) up to this limit
    "allowFirst": true                // Allow .first() without index
  }]
}
```

## Detected Patterns

The rule catches these expensive operations:
- `.collect()` without `.withIndex()`
- `.paginate()` without `.withIndex()`
- `.take(n)` where n > configured limit without `.withIndex()`
- `.first()` without `.withIndex()` (when configured)

## Benefits

1. **Performance Protection**: Prevents expensive full-table scans
2. **Developer Education**: Clear error messages teach Convex best practices
3. **CI/CD Integration**: Fails builds with unoptimized queries
4. **Bandwidth Savings**: Eliminates high-bandwidth query patterns
5. **Scalability**: Ensures queries perform well as data grows

## Error Messages

- **Primary**: "Convex query on 'tableName' without index may cause performance issues"
- **Context**: Suggests adding `.withIndex()` before the operation
- **Documentation**: Links to Convex indexing documentation

This rule immediately prevents the database performance anti-patterns that cause high bandwidth usage and slow queries in Convex applications.
