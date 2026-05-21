/** @type {import('jest').Config} */
module.exports = {
  // Orquestração SOTA de Monorepo: Redireciona execuções da raiz para o ambiente Next.js
  projects: ["<rootDir>/frontend"],
};
