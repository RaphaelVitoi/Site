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
module.exports = async () => {
    const config = await createJestConfig(customJestConfig)();

    config.transform = {
        "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
        ...config.transform,
    };

    return config;
};
