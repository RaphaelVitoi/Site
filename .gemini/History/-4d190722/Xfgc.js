const nextJest = require("next/jest");

const createJestConfig = nextJest({
    // Diretorio base da topologia Next.js (necessario para leitura de .env e next.config)
    dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
    // Ambiente mandatorio para simular interacoes e montagem de componentes React
    testEnvironment: "jest-environment-jsdom",
    // Replicacao da malha de caminhos virtuais do seu tsconfig.json (aliases)
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    }
};

// Assinatura SOTA: Engatilha o SWC Compiler e intercepta a pipeline
// injetando ts-jest para erradicar fraturas de AST em arquivos TypeScript.
module.exports = async function makeJestConfig() {
    const config = await createJestConfig(customJestConfig)();

    // Erradica o fallback silencioso do babel e força a transição pura de TS para o ts-jest,
    // utilizando // NOSONAR para ignorar alertas S7780 sobre Regex literals de forma segura.
    const originalTransform = config.transform["^.+\\.(t|j)sx?$"]; // NOSONAR

    config.transform = {
        "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json", isolatedModules: true }], // NOSONAR
        "^.+\\.(js|jsx)$": originalTransform // NOSONAR
    };

    return config;
};
