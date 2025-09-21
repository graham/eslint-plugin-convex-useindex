/**
 * Small testing module for the Convex ESLint rule
 * Tests basic functionality without requiring a full test framework
 */

const rule = require('./rules/no-unindexed-queries');

console.log('=== ESLint Rule Testing Module ===');

// Test 1: Rule structure validation
console.log('1. Testing rule structure...');
try {
  if (typeof rule.create === 'function') {
    console.log('   PASS: Rule has create function');
  } else {
    console.log('   FAIL: Rule missing create function');
    process.exit(1);
  }

  if (rule.meta && rule.meta.docs && rule.meta.messages) {
    console.log('   PASS: Rule has proper meta information');
  } else {
    console.log('   FAIL: Rule missing meta information');
    process.exit(1);
  }

  console.log('   Rule type:', rule.meta.type);
  console.log('   Rule description:', rule.meta.docs.description);
  console.log('   Available messages:', Object.keys(rule.meta.messages));
} catch (error) {
  console.log('   FAIL: Error loading rule -', error.message);
  process.exit(1);
}

// Test 2: Rule context creation
console.log('2. Testing rule context creation...');
try {
  const mockContext = {
    options: [{}],
    report: function(config) {
      console.log('   Mock report called with:', config.messageId, config.data);
    }
  };

  const ruleInstance = rule.create(mockContext);

  if (ruleInstance && typeof ruleInstance.CallExpression === 'function') {
    console.log('   PASS: Rule creates proper AST visitor');
  } else {
    console.log('   FAIL: Rule does not create CallExpression visitor');
    process.exit(1);
  }
} catch (error) {
  console.log('   FAIL: Error creating rule instance -', error.message);
  process.exit(1);
}

// Test 3: Basic configuration options
console.log('3. Testing configuration options...');
try {
  const configOptions = {
    allowedTables: ['test_table'],
    maxTakeSize: 5,
    allowFirst: false
  };

  const mockContextWithOptions = {
    options: [configOptions],
    report: function(config) {
      console.log('   Configuration test report:', config.messageId);
    }
  };

  const configuredRule = rule.create(mockContextWithOptions);
  console.log('   PASS: Rule accepts configuration options');
} catch (error) {
  console.log('   FAIL: Error with configuration -', error.message);
  process.exit(1);
}

// Test 4: Message validation
console.log('4. Testing error messages...');
const expectedMessages = ['noIndex', 'suggestion', 'performance'];
let messageTestPassed = true;

expectedMessages.forEach(msgId => {
  if (rule.meta.messages[msgId]) {
    console.log('   PASS: Message "' + msgId + '" exists');
  } else {
    console.log('   FAIL: Message "' + msgId + '" missing');
    messageTestPassed = false;
  }
});

if (!messageTestPassed) {
  process.exit(1);
}

// Test 5: Schema validation
console.log('5. Testing schema configuration...');
try {
  const schema = rule.meta.schema[0];
  if (schema && schema.properties) {
    const expectedProps = ['allowedTables', 'maxTakeSize', 'allowFirst'];
    expectedProps.forEach(prop => {
      if (schema.properties[prop]) {
        console.log('   PASS: Schema property "' + prop + '" defined');
      } else {
        console.log('   FAIL: Schema property "' + prop + '" missing');
        process.exit(1);
      }
    });
  } else {
    console.log('   FAIL: Schema structure invalid');
    process.exit(1);
  }
} catch (error) {
  console.log('   FAIL: Schema validation error -', error.message);
  process.exit(1);
}

console.log('=== All Tests Passed! ===');
console.log('The ESLint rule is properly structured and ready to use.');
console.log('You can now integrate it into your ESLint configuration.');
console.log('To run the full test suite, use: node tests/no-unindexed-queries.test.js');