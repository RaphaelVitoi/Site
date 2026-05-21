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
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

// Assinatura SOTA: Subjugação total do transformador do Next.js
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();

  // Varredura cirúrgica: Remove a regex gulosa do Next.js que sequestra os arquivos TS/TSX
  const originalKeys = Object.keys(config.transform);
  for (const key of originalKeys) {
    if (
      key.includes("ts") ||
      key.includes("tsx") ||
      key.includes("j|t") ||
      key.includes("sx")
    ) {
      const swc = config.transform[key];
      delete config.transform[key];
      // Restringe o SWC nativo apenas a JavaScript puro
      config.transform["^.+\\.(js|jsx|mjs|cjs)$"] = swc;
    }
  }

  // Blinda o ts-jest como autoridade exclusiva para a compilação tipada
  config.transform["^.+\\.(ts|tsx)$"] = [
    "ts-jest",
    { tsconfig: "tsconfig.json", isolatedModules: true },
  ];

  return config;
};
