import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/tests/**/*.spec.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/index.ts", "!src/Infrastructure/Persistence/Prisma/PrismaClientInstance.ts"],
  moduleNameMapper: {
    "^dotnet-node-core$": "<rootDir>/node_modules/dotnet-node-core/src/index.ts"
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(dotnet-node-core)/)"
  ]
};

export default config;
