/** @type {import('jest').Config} */
module.exports = function createConfig() {
  // Carrega e aguarda a resolução do next/jest para o frontend
  return require("../frontend/jest.config.js")().then(function (frontendConfig) {
    // Atribui propriedades necessárias para o workspace do Jest
    frontendConfig.displayName = "Frontend";
    frontendConfig.rootDir = "<rootDir>/../frontend";

    return {
      // Orquestração SOTA de Monorepo: Redireciona execuções da raiz de forma síncrona
      projects: [frontendConfig]
    };
  });
};
