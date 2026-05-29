const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Fornece o caminho para o app Next.js. O uso de __dirname garante o carregamento do
  // transpiler SWC mesmo quando o comando jest é invocado pela raiz do monorepo.
  dir: __dirname,
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist-workers/'],
  testPathIgnorePatterns: ['<rootDir>/dist-workers/'],
};

module.exports = createJestConfig(customJestConfig);
