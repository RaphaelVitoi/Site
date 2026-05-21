import { defineConfig } from "prisma-define-config";
import path from "node:path";

const getDatabaseUrl = () => {
  // O caminho é relativo à raiz do projeto `frontend` onde `npx prisma` é executado.
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  return `file:${dbPath}`;
};

export const databaseUrl = getDatabaseUrl();

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});
