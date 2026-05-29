# Padrao Ouro SOTA: Aprofundamento do Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar o ecossistema frontend ao Padrao Ouro SOTA, consolidando seguranca de ambiente, unificacao de versao e calibracao dinamica da fisica de decisao.

**Architecture:** Implementacao de Resiliencia de Ambiente (Safe Mock) para segredos de autenticacao, transicao para Marginal Zone dinamica (Axioma Lipe Piv) e modularizacao da telemetria WASM.

**Tech Stack:** Next.js 15, Auth.js v5, TypeScript Estrito, Tailwind CSS 4, Web Workers.

---

### Task 1: Blindagem de Ambiente e Mock de Seguranca (Auth.js)

**Files:**
- Modify: `frontend/src/auth.ts`

- [ ] **Step 1: Implementar validador de segredos e injecao de Mock**

```typescript
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

// SOTA Gold: Verificador de Integridade de Ambiente
const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[SOTA ALERT] AUTH_SECRET ausente. Injetando Mock Secret para Desenvolvimento Local.",
      );
      return "sota-gold-dev-mock-secret-2026-128bit-alpha-v6";
    }
    throw new Error(
      "[FATAL] AUTH_SECRET nao configurado. Abortando em modo Producao (Insolvencia de Ambiente).",
    );
  }
  return secret;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: getAuthSecret(),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
    Discord,
  ],
  pages: { signIn: "/login" },
  trustHost: true,
});
```

- [ ] **Step 2: Verificar integridade de tipos**

Run: `npm run typecheck:audit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/auth.ts
git commit -m "sec: implement sota gold environment shielding for auth"
```

### Task 2: Unificacao de Versao e Marginal Zone Dinamica (PerspectivePanel)

**Files:**
- Modify: `frontend/src/components/simulator/panels/PerspectivePanel.tsx`

- [ ] **Step 1: Atualizar Identidade Visual e Logica da Marginal Zone**

```typescript
// Localizar e substituir a renderizacao da Zona Marginal
{/* ... dentro do return do PerspectivePanel ... */}
{Math.abs(result.perspectivaPct) <= (10 * (1 - kappa)) && (
  <div className="mt-2 p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[0.8rem] text-accent-pink-light font-medium leading-relaxed flex flex-col gap-3 shadow-2xl relative overflow-hidden group/marginal">
    {/* ... manter o conteudo interno igual, atualizando apenas a logica de exibicao ... */}
  </div>
)}

// Atualizar o cabecalho para v4.6 GOLD
<h3 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.3em] m-0 flex items-center gap-3">
  <div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)]" />
  Perspectiva Matematica &middot;{" "}
  <span className="text-text-muted">v4.6 GOLD</span>
</h3>
```

- [ ] **Step 2: Sincronizar Logs do Motor WASM**

```typescript
// Atualizar o estado inicial do wasmLogs
const [wasmLogs] = useState<string[]>([
  "> [SOTA ENGINE] Inicializando calculo de cenario: GOLD_STANDARD",
  "> [SOLVER] Mapeando topologia via WASM FFI (RIO Exponencial)...",
  "> [MATH] Invocando FFI: solve_unified_equation_v4_6(stacks, prizes, kappa)",
  "> [INFO] Colapso de Edge detectado. Convergencia estavel.",
]);
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/simulator/panels/PerspectivePanel.tsx
git commit -m "feat: upgrade perspective panel to v4.6 gold with dynamic marginal zone"
```

### Task 3: Modularizacao da Telemetria WASM

**Files:**
- Modify: `frontend/src/components/simulator/panels/PerspectivePanel.tsx`
- Import: `WasmTelemetryWidget` de `./WasmTelemetryWidget`

- [ ] **Step 1: Substituir implementacao inline pelo Widget modular**

```typescript
// Remover a implementacao inline de telemetria e substituir por:
<WasmTelemetryWidget 
  wasmLogs={wasmLogs} 
  resultCi={result.ci} 
/>
```

- [ ] **Step 2: Validar imports e renderizacao**

Run: `npm run typecheck:audit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/simulator/panels/PerspectivePanel.tsx
git commit -m "refactor: modularize wasm telemetry widget in perspective panel"
```
