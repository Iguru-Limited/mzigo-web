import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: ["lib/**/*.ts", "hooks/**/*.ts"],
  testTimeout: 30000,
  maxWorkers: 1,
  verbose: true,
};

export default config;
