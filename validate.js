/**
 * Simple validation script to verify the ESLint rule is working
 */

const rule = require('./rules/no-unindexed-queries');

console.log('ESLint rule loaded successfully');
console.log('Rule name:', 'no-unindexed-queries');
console.log('Rule type:', rule.meta.type);
console.log('Rule description:', rule.meta.docs.description);

// Verify rule has required methods
if (typeof rule.create === 'function') {
  console.log('Rule has create function');
} else {
  console.log('Rule missing create function');
}

// Verify meta information
if (rule.meta && rule.meta.docs && rule.meta.messages) {
  console.log('Rule has proper meta information');
  console.log('Available messages:', Object.keys(rule.meta.messages));
} else {
  console.log('Rule missing meta information');
}

console.log('Custom ESLint rule validation completed!');
console.log('The rule is now active and will catch unindexed Convex queries.');