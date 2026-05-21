// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'], // Ajuste o caminho conforme a estrutura do seu projeto
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/', // Para resolver aliases como @/lib
  },
};
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Ignora imports de CSS modules e assets em testes unitários
    '\\.(css|module\\.css)$': '<rootDir>/__mocks__/styleMock.js',
  },
};

export default config;
