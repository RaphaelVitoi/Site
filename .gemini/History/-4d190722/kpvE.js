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

    // Captura o transformer nativo do Next.js (SWC) iterando sobre as chaves existentes
    const nextKeys = Object.keys(config.transform);
    const swcTransformer = nextKeys.length > 0 ? config.transform[nextKeys[0]] : null;

    // Limpeza rigorosa: Erradica todas as chaves dinâmicas do Next.js para evitar overlapping de Regex
    config.transform = {};

    // Mapeamento Estrito: TypeScript vai exclusivamente para ts-jest, imune a fallback do Babel.
    config.transform["^.+\\.(ts|tsx)$"] = ["ts-jest", { tsconfig: { jsx: "react-jsx" }, isolatedModules: true }]; // NOSONAR

    // Mapeamento Estrito: JavaScript continua usando o SWC ultrarrápido do Next.js.
    if (swcTransformer) {
        config.transform["^.+\\.(js|jsx|mjs)$"] = swcTransformer; // NOSONAR
    }

    return config;
};
