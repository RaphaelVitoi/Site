# Plano de Implementação da Auditoria SOTA

## Relatório de Auditoria Frontend: PokerRacional SOTA v4.2

## 1. Pilha Tecnológica e Arquitetura

  A aplicação utiliza o Estado da Arte (SOTA) em tecnologias modernas:

- Framework: Next.js 16.2 (App Router) com React 19.
- Linguagem: TypeScript 5.9 (Strict Mode Ativo).
- Estilização: Tailwind CSS 4.2 (via Engine @import "tailwindcss").
- Dados: Prisma 5.22 (SQLite local) + Server Actions.
- IA/RAG: Integração híbrida via SSE (Server-Sent Events) e fallback nativo para Python CLI.

## 2. Pontos Fortes (Conformidade SOTA)

- Hibridismo de Runtime: Uso estratégico de runtime = 'nodejs' em rotas que dependem de child_process e runtime = 'edge' para geração
     dinâmica de imagens (OG Image).
- Segurança Pró-ativa (Cortex Shield): Implementação de whitelist de domínios e sanitização de URLs nas rotas de API para prevenir ataques     de SSRF (Server-Side Request Forgery).
- Resiliência de Dados: Uso de sementes (seeds) diretamente em memória nas Server Actions (quizActions.ts) para garantir o funcionamento
     da UI mesmo em caso de falha no banco de dados.
- Performance: Carregamento cadenciado de streams SSE no frontend (OracleChat.tsx) para reduzir a percepção de latência e melhorar a
     experiência do usuário.
- Tipagem Estrita: Uso de Zod para validação de contratos de API no servidor, garantindo integridade dos dados antes do processamento.

## 3. Oportunidades de Melhoria e Riscos Detectados

### Complexidade Ciclomática (MasterSimulator.tsx)

  O componente MasterSimulator.tsx (~40KB, +680 linhas) é um monólito de estado.

- Risco: Dificuldade de manutenção e propensão a re-renders desnecessários.
- Recomendação: Decompor em componentes menores ou utilizar uma máquina de estados (XState) para gerenciar as transições complexas do
     motor ICM.

## Acessibilidade (A11y)

  A auditoria no globals.css e Button.tsx revelou a ausência de estilos de foco explícitos (:focus-visible).

- Risco: Navegação por teclado prejudicada para usuários com deficiência motora.
- Recomendação: Restaurar o outline-none apenas quando substituído por um anel de foco customizado de alto contraste (ex:
     focus-visible:ring-2 focus-visible:ring-indigo-500).

## Gestão de Dependências

  Identificado o uso simultâneo de @fortawesome/fontawesome-free, lucide-react e react-icons.

- Risco: Inchaço desnecessário do bundle final (Bundle Bloat).
- Recomendação: Padronizar em apenas uma biblioteca (preferencialmente lucide-react para Next.js devido ao tree-shaking superior).

## Configuração de Linting

  O .eslintrc.json está com regras relaxadas (react/no-unescaped-entities: off).

- Risco: Possível inconsistência na renderização de caracteres especiais entre diferentes browsers.
- Recomendação: Habilitar as regras e corrigir as entidades HTML via &apos;, &quot;, etc.

### 4. Conclusão da Auditoria

  O frontend está excepcionalmente bem estruturado, seguindo padrões de design sistêmico e arquitetura resiliente. A integração com o
  ecossistema Python (RAG/Knowledge Graph) via Next.js API Routes é elegante e eficiente.

  Veredito: APROVADO COM OBSERVAÇÕES.
  As recomendações focam em refinamento de UX (A11y) e manutenibilidade a longo prazo (Refatoração do Simulador).

## 🎯 Objective

 Implementar as recomendações críticas da auditoria frontend (SOTA v4.2) baseadas nos princípios de Acessibilidade de Fricção          ││     Zero, Economia de Shannon (linting) e Antevisão Arquitetural (desacoplamento).

## 📂 Key Files & Context

`frontend/src/app/globals.css`           `frontend/src/components/ui/Button.tsx`        `frontend/.eslintrc.json`
`frontend/src/components/simulator/MasterSimulator.tsx` `frontend/src/components/simulator/SotaContext.tsx`

## 🛠️ Implementation Steps

│ 1. Injetar `focus-visible` em `globals.css` e no componente `Button.tsx`.                                            2. Remover supressão de entidades não escapadas do `.eslintrc.json`.                                           3. Extrair a interface e o Provider `SotaEcosystemContext` do `MasterSimulator.tsx` para `SotaContext.tsx`.
