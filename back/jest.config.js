module.exports = {
  testEnvironment: "node",
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/__tests__/**/*.mjs", "**/?(*.)+(spec|test).mjs"],
  collectCoverageFrom: [
    "src/**/*.mjs",
    "!src/**/*.test.mjs",
    "!src/**/*.spec.mjs",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.mjs"],
};
