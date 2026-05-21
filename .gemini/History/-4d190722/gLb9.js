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

    const newTransform = {
        // Resolve o aviso S7780 com String.raw e garante injeção absoluta do ts-jest
        [String.raw`^.+\.(ts|tsx)$`]: ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
    };

    // Varre os transformadores originais do Next.js para expurgar chaves conflitantes
    for (const [key, value] of Object.entries(config.transform)) {
        if (key.includes("ts") || key.includes("tsx") || key.includes("t|j")) {
            // Realoca o SWC/Babel nativo do Next apenas para arquivos JS/JSX puros
            newTransform[String.raw`^.+\.(js|jsx)$`] = value;
        } else {
            newTransform[key] = value;
        }
    }

    config.transform = newTransform;

    return config;
};
