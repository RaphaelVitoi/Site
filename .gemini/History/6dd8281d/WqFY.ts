import { PrismaClient } from "@prisma/client";
import { databaseUrl } from "../../prisma.config";

// SOTA: Previne a exaustão de conexões no modo de desenvolvimento (Fast Refresh do Next.js)
// Garantindo uma única instância global do PrismaClient no servidor.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// SOTA: A URL do banco de dados é agora injetada em tempo de execução para alinhar com a arquitetura Prisma v7+.
// Isso centraliza a configuração e remove a URL do `schema.prisma`.
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
