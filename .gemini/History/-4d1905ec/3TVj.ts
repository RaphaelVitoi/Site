import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Aponta para a raiz do projeto Next.js para carregar next.config.ts e .env no ambiente de testes
  dir: "./",
});

const customJestConfig: Config = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
};

export default createJestConfig(customJestConfig);
