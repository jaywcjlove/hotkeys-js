/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

describe('Build output regression tests', () => {
  test('ESM build should not contain CommonJS export mutation', () => {
    const esmPath = path.resolve(__dirname, '../dist/hotkeys-js.js');
    const esmOutput = fs.readFileSync(esmPath, 'utf8');

    expect(esmOutput).not.toContain('module.exports = hotkeys');
    expect(esmOutput).not.toContain('module.exports.default = hotkeys');
  });
});
