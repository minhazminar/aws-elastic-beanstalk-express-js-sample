// ------------------------------------------------------------------
// Minimal smoke test for the CI pipeline's "Run Unit Tests" stage.

const assert = require('assert');
const path = require('path');

const pkg = require(path.join(__dirname, '..', 'package.json'));

assert.strictEqual(
  pkg.name,
  'aws-elastic-beanstalk-express-js-sample',
  'package.json name should match the expected app name'
);

assert.ok(
  pkg.dependencies && pkg.dependencies.express,
  'express should be declared as a dependency in package.json'
);

// Confirms `npm install` actually resolved the express package
require('express');

console.log('All smoke tests passed.');
