/**
 * ESLint rule to prevent Convex database queries without proper index usage
 * Prevents expensive full-table scans that cause high bandwidth and poor performance
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent Convex queries without proper index usage",
      category: "Performance",
      recommended: true,
      url: "https://docs.convex.dev/database/indexes"
    },
    fixable: null,
    schema: [{
      type: "object",
      properties: {
        allowedTables: {
          type: "array",
          items: { type: "string" },
          description: "Table names that are allowed to have unindexed queries (small admin tables)"
        },
        maxTakeSize: {
          type: "number",
          minimum: 1,
          description: "Maximum size for .take(n) without requiring an index"
        },
        allowFirst: {
          type: "boolean",
          description: "Whether to allow .first() without an index"
        }
      },
      additionalProperties: false
    }],
    messages: {
      noIndex: "Convex query on '{{tableName}}' without index may cause performance issues. Use .withIndex() before {{operation}}.",
      suggestion: "Consider adding .withIndex('indexName', (q) => q.eq('field', value)) before {{operation}}",
      performance: "Full table scans cause high bandwidth usage and slow queries as data grows."
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedTables = new Set(options.allowedTables || []);
    const maxTakeSize = options.maxTakeSize || 1;
    const allowFirst = options.allowFirst !== false; // Default to true

    /**
     * Check if a call expression chain includes .withIndex()
     */
    function hasWithIndex(node) {
      let current = node;

      while (current) {
        if (current.type === 'CallExpression' &&
            current.callee.type === 'MemberExpression' &&
            current.callee.property.name === 'withIndex') {
          return true;
        }

        // Traverse up the chain
        if (current.type === 'CallExpression' &&
            current.callee.type === 'MemberExpression') {
          current = current.callee.object;
        } else {
          break;
        }
      }

      return false;
    }

    /**
     * Extract table name from ctx.db.query("tableName") call
     */
    function getTableName(node) {
      if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property.name === 'query' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal') {
        return node.arguments[0].value;
      }
      return null;
    }

    /**
     * Check if a node is part of a ctx.db.query() chain
     */
    function isQueryChain(node) {
      let current = node;

      while (current) {
        if (current.type === 'CallExpression') {
          const tableName = getTableName(current);
          if (tableName) {
            return tableName;
          }

          // Traverse up the chain
          if (current.callee.type === 'MemberExpression') {
            current = current.callee.object;
          } else {
            break;
          }
        } else if (current.type === 'MemberExpression') {
          current = current.object;
        } else {
          break;
        }
      }

      return null;
    }

    /**
     * Get the size argument from .take(n) call
     */
    function getTakeSize(node) {
      if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property.name === 'take' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'number') {
        return node.arguments[0].value;
      }
      return null;
    }

    return {
      CallExpression(node) {
        // Check for terminal operations that require indexes
        const terminalOps = ['collect', 'paginate'];
        const methodName = node.callee.type === 'MemberExpression' ?
                          node.callee.property.name : null;

        if (!methodName) return;

        // Handle terminal operations
        if (terminalOps.includes(methodName)) {
          const tableName = isQueryChain(node);

          if (tableName && !allowedTables.has(tableName)) {
            if (!hasWithIndex(node)) {
              context.report({
                node,
                messageId: "noIndex",
                data: {
                  tableName,
                  operation: `.${methodName}()`
                }
              });
            }
          }
        }

        // Handle .take(n) operations
        if (methodName === 'take') {
          const tableName = isQueryChain(node);
          const takeSize = getTakeSize(node);

          if (tableName && takeSize && takeSize > maxTakeSize && !allowedTables.has(tableName)) {
            if (!hasWithIndex(node)) {
              context.report({
                node,
                messageId: "noIndex",
                data: {
                  tableName,
                  operation: `.take(${takeSize})`
                }
              });
            }
          }
        }

        // Handle .first() operations (optional)
        if (methodName === 'first' && !allowFirst) {
          const tableName = isQueryChain(node);

          if (tableName && !allowedTables.has(tableName)) {
            if (!hasWithIndex(node)) {
              context.report({
                node,
                messageId: "noIndex",
                data: {
                  tableName,
                  operation: `.first()`
                }
              });
            }
          }
        }
      }
    };
  }
};