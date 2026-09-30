const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Fornece o caminho para o app Next.js. O uso de __dirname garante o carregamento do
  // transpiler SWC mesmo quando o comando jest é invocado pela raiz do monorepo.
  dir: __dirname,
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // FASE 6 / opção C (2026-09-30): `nexus-proxy.ts` passou a importar
  // `next-auth/jwt`, que e ESM puro, e o jest nao converte modulo de
  // `node_modules` — o erro e "Must use import to load ES Module", e a suite
  // inteira `proxy-routes.test.ts` nao carrega.
  //
  // MEDIDO: declarar `transformIgnorePatterns` aqui NAO resolve. O
  // `next/jest` (linha 3)_constrói a config final e sobrescreve a chave, entao
  // a lista deste arquivo nunca chega ao runner. Foi por isso que a correcao
  // ficou no TESTE, e nao aqui: o que o runner honra e o que o teste declara.
  //
  // A alternativa — `require(esm)` nativo do Node — exige Node >= 24.9, e o
  // `package.json` declara `engines.node >= 22`. Baixar o piso do projeto para
  // consertar um import de teste seria o custo certo errado.
  modulePathIgnorePatterns: ['<rootDir>/dist-workers/'],
  testPathIgnorePatterns: ['<rootDir>/dist-workers/'],
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  reporters: ['default', '<rootDir>/jest.reporter.sota.js'],
};

module.exports = createJestConfig(customJestConfig);
