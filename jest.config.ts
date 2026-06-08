import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,ts}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/*.test.{js,jsx,ts,tsx}",
  ],
  coverageReporters: ["html", ["text", { skipFull: true }], "text-summary"],
  projects: [
    {
      displayName: "client",
      testEnvironment: "jsdom",
      clearMocks: true,
      testMatch: [
        "**/tests/unit/**/*.+(test|spec).[jt]s?(x)",
        "**/tests/integration/**/*.client.+(test|spec).[jt]s?(x)",
        "**/*.client.+(test|spec).[jt]s?(x)",
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      transform: {
        "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
      },
      transformIgnorePatterns: [
        "node_modules/(?!(@faker-js/faker|better-auth)/)",
      ],
    },
    {
      displayName: "server",
      testEnvironment: "node",
      clearMocks: true,
      testMatch: [
        "**/tests/integration/**/*.server.+(test|spec).[jt]s?(x)",
        "**/*.server.+(test|spec).[jt]s?(x)",
      ],
      testPathIgnorePatterns: [".*\\.client\\.(test|spec)\\.[jt]s?(x)?$"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.server.setup.ts"],
      transform: {
        "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
      },
      transformIgnorePatterns: [
        "node_modules/(?!(@faker-js/faker|better-auth)/)",
      ],
    },
  ],
};

export default createJestConfig(config);
