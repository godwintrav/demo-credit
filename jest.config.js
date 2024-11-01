/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  setupFiles: ['./jest.setup.ts'],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};
