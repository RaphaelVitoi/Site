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

    // Substitui a malha padrao para garantir que JSX seja transpilado (React 17+)
    // e erradica de vez os conflitos de sobreposicao com o fallback do Babel.
    config.transform = {
        "^.+\\.(ts|tsx)$": ["ts-jest", {
            tsconfig: {
                jsx: "react-jsx"
            }
        }],
        ...config.transform,
    };

    // Separa as responsabilidades isolando JS/JSX para o transformador nativo do Next
    if (config.transform["^.+\\.(t|j)sx?$"]) {
        const nextTransformer = config.transform["^.+\\.(t|j)sx?$"];
        delete config.transform["^.+\\.(t|j)sx?$"];
        config.transform["^.+\\.(js|jsx)$"] = nextTransformer;
    }

    return config;
};
