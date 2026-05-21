const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // Aponta para a raiz do projeto Next.js para injetar o SWC Compiler e variáveis .env
    dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        // Resolve o alias @/ (Simetria de Imports SOTA)
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    watchPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/../\\.pytest_tmp/', // Blindagem SOTA contra EPERM (Vazamento de Escopo do Watcher)
    ],
};

module.exports = createJestConfig(customJestConfig);
