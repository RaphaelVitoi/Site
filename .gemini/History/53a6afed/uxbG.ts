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
