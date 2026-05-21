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

    // Busca dinamicamente a chave do transformador nativo do Next.js (varia entre versões)
    const nextTransformKey = Object.keys(config.transform).find(key => key.includes("sx"));
    const originalTransform = nextTransformKey ? config.transform[nextTransformKey] : null;

    if (nextTransformKey) {
        delete config.transform[nextTransformKey];
    }

    // Força o ts-jest como autoridade absoluta sobre TypeScript e restaura Next.js para JS/JSX puro.
    config.transform = {
        ...config.transform,
        "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" }, isolatedModules: true }] // NOSONAR
    };

    if (originalTransform) {
        config.transform["^.+\\.(js|jsx)$"] = originalTransform; // NOSONAR
    }

    return config;
};
