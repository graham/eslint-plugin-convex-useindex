module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['convex-performance'],
  rules: {
    'convex-performance/no-unindexed-queries': ['error', {
      allowedTables: ['namespaces'], // Small admin tables
      maxTakeSize: 1, // Allow .take(1) without index
      allowFirst: true // Allow .first() without index
    }]
  }
};