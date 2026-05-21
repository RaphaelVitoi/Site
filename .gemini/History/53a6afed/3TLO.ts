import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'], // Isso fará com que o Jest procure por arquivos .test.ts dentro de src/
  moduleNameMapper: {
    // Ignora imports de CSS modules e assets em testes unitários
    '\\.(css|module\\.css)$': '<rootDir>/__mocks__/styleMock.js',
    '^@/(.*)$': '<rootDir>/src/$1', // Para resolver aliases como @/lib
  },
};

export default config;
