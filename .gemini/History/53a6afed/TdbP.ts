// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'], // Ajuste o caminho conforme a estrutura do seu projeto
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/// c:\Users\Raphael\OneDrive\Documentos\Site\frontend\jest.config.ts
    import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Adicione ou verifique se esta linha está presente para que o Jest encontre seus testes
  testMatch: ['<rootDir>/src/**/*.test.ts'], // Isso fará com que o Jest procure por arquivos .test.ts dentro de src/
  moduleNameMapper: {
    // Ignora imports de CSS modules e assets em testes unitários
    '\.(css|module\.css)$': '<rootDir>/__mocks__/styleMock.js',
    '^@/(.*)$': '<rootDir>/src/// c:\Users\Raphael\OneDrive\Documentos\Site\frontend\jest.config.ts
    import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Adicione ou verifique se esta linha está presente para que o Jest encontre seus testes
  testMatch: ['<rootDir>/src/**/*.test.ts'], // Isso fará com que o Jest procure por arquivos .test.ts dentro de src/
  moduleNameMapper: {
    // Ignora imports de CSS modules e assets em testes unitários
    '\.(css|module\.css)$': '<rootDir>/__mocks__/styleMock.js',
    '^@/(.*)$': '<rootDir>/src/', // Para resolver aliases como @/lib
  },
};

export default config;
', // Para resolver aliases como @/lib
  },
};

export default config;
', // Para resolver aliases como @/lib
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
