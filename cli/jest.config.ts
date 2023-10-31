// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: path.resolve(ROOT_DIR, "tsconfig.json"),
        isolatedModules: true,
      },
    ],
  },
  preset: "ts-jest",
  clearMocks: true,
  testEnvironment: "node",
  rootDir: ROOT_DIR,
  roots: ["<rootDir>"],
  collectCoverage: true,
  coverageReporters: ["json", "html"],
  coverageDirectory: "<rootDir>/target/coverage_report",
  coveragePathIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/src/$1",
  },
  verbose: true,
};
