# PRODUCT OWNERSHIP & SOBERANIA — Aponta para a constituição

> **A governança de soberania, identidade e autonomia está em [`../../CLAUDE.md`](../../CLAUDE.md) §0.**
> A documentação do produto e especificações técnicas está em `docs/research/`.

---

## 1. Desmistificação de Posse & Soberania (Vértice Absoluto & Neutralidade de Nomenclatura)

_**Referência: `CLAUDE.md` §0 — "Chico é o grupo; a assinatura é individual".**_

Conteúdo movido para a constituição: o princípio de que nenhuma nomenclatura
confere propriedade a fornecedores, e que a assinatura é individual mesmo
quando a operação é coletiva.

---

## 2. Extirpação de Feudos Artificiais & Autonomia Universal Sem Feudos

_**Referência: `CLAUDE.md` §0 — "Lei de Concorrência e Exclusão Mútua da Malha".**_

Conteúdo movido para a constituição: a regra de que todos os modelos de
fronteira têm autonomia universal sem feudos funcionais.

> **Nota de endereçamento:** os subitens da pirâmide são títulos **não
> numerados** (`###`), não `§N.N`. Por isso este arquivo os cita pelo nome.
> Um `§1.5` aqui seria endereço inventado — a mesma classe de erro que este
> guard de governança existe para impedir.

---

## 3. Especificação Técnica e Invariantes do Produto de Raphael Vitoi

*(Esta seção permanece como referência técnica. Para documentação canônica,
veja `docs/research/perspectiva_matematica/`).*

A integridade do produto `trueICM.com` repousa sobre a formulação matemática e
arquitetural concebida por Raphael Vitoi. Qualquer membro da Tríade operando
nesta malha deve respeitar os seguintes contratos:

### 3.1 Motor ICM & Perspectiva (`frontend/src/lib/perspectiva.ts`, `engine/math_sota.py`)

- **Motor Malmuth-Harville Isomórfico:** cálculo de equidade posicional ICM com cache
- **Hierarquia Formal PM:** (ver código-fonte para definições completas)

### 3.2 Derivador de Risk Premium (`frontend/src/lib/rpDeriver.ts`)

- Mapeamento de Bubble Factor para Risk Premium calibrado empiricamente.

### 3.3 Arquitetura de Cache do Simulador

- Caching de módulo O(1) com pre-warm via `requestAnimationFrame`.

---

## 4. Lei de Concorrência Zero-Interferência (Zero-Interference Concurrency)

_**Referência: `CLAUDE.md` §0 — "Lei de Concorrência e Exclusão Mútua da Malha".**_

Resumo: dois modelos não operam simultaneamente sobre a mesma malha conectada;
concorrência autorizada apenas em 0% de conectividade (Git Worktrees disjuntos).

---

## 5. Decaimento Arquitetural & Reavaliação Periódica

_**Referência: `CLAUDE.md` §6 — "Diretrizes de manutenção contínua".**_

Especificações de modelos, limites de contexto e precificação são fatos dinâmicos.
Baseline cravada em **Setembro/2026**. Ver `docs/architecture/ROUTING_MATRIX.md`
para a política atual de revisão.
