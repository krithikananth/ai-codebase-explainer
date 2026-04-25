/** @type {import('jest').Config} */
export default {
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/repos/"],
  modulePathIgnorePatterns: ["<rootDir>/repos/"],
  transform: {},
  // Enable native ESM support
  extensionsToTreatAsEsm: [],
};
