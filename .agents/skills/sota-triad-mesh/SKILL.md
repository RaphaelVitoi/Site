---
name: sota-triad-mesh
description: Use para planejar uma investigação que combine pesquisa com Exa, prototipagem com Stitch e trabalho assíncrono com Google Jules, somente quando as ferramentas necessárias estiverem registradas, prontas e autorizadas.
metadata:
  id: skill-sota-triad-mesh
  tipo: skill
  escopo: Site
  ecossistema: nexus-sota
  autor: chico@v8-gold
  criado_em: 2026-08-29T17:58-03:00
  verificado: motor sota_triad_mesh.py implementado e validado por testes unitarios
  nao_verificado: chamadas reais de rede durante testes unitarios
---

# SKILL: SOTA TRIAD MESH (EXA + STITCH + GOOGLE JULES)

> **Protocolo Chico SOTA v8.0 GOLD · Superagentes Integrados**  
> **Escopo:** Orquestracao de Pesquisa Semantica, UI Generativa e Engenharia Cloud Assincrona.

---

## 1. Pré-condições e topologia da tríade

Antes de delegar, verificar para cada capacidade: ferramenta registrada,
autenticação disponível, escopo de dados, custo, destino do artefato e critério
de parada. Catálogo instalado não prova ferramenta carregada; ferramenta
carregada não autoriza ações remotas.

A tríade opera em fases sequenciais e complementares:

1. **Exa (Neural Research & Knowledge Extraction):**
   * Ferramentas: usar apenas os identificadores que estiverem expostos na sessão.
   * Quando usar: Pesquisar papers em Teoria dos Jogos (CFR+, ICM dinamico, subgame solving), recuperar formulas em KaTeX/LaTeX, e buscar breaking changes de Next.js, Supabase ou Prisma.
   * Modulo de Suporte: `engine/sota_triad_mesh.py -> ExaKnowledgeBridge`.

2. **Stitch (Generative UI & Design System):**
   * Ferramentas: usar apenas os identificadores que estiverem expostos na sessão.
   * Quando usar: Congelar ou atualizar o Design System com `design/DESIGN_SYSTEM_SOTA.md`, prototipar telas escuras com acentos dourados (`#D4AF37`), gerar 3 variantes visuais antes de codificar.
   * Modulo de Suporte: `engine/sota_triad_mesh.py -> StitchDesignBridge`.

3. **Google Jules (Cloud Asynchronous Agent):**
   * Ferramentas / CLI: confirmar disponibilidade e comandos via `--help` antes
     de uso; não presumir MCP, CLI, credenciais nem sintaxe.
   * Quando usar: tarefas pesadas com escopo isolado, plano revisável e retorno
     verificável. Aplicar um diff remoto exige autorização específica.
   * Modulo de Suporte: `engine/sota_triad_mesh.py -> JulesCloudBridge`.

4. **Antigravity (Convergência local e quality gate):**
   * Recebe artefatos para revisão, executa os gates locais aplicáveis e separa
     resultado medido de alegação. Não aplica diff, não realiza commit e não
     faz push sem autorização explícita e verificação do hash final.

---

## 2. Operação local

```powershell
# Descobrir comandos realmente instalados antes de usá-los
uv run nexus --help
uv run nexus triad --help
```

---

## 3. Diretrizes de Qualidade SOTA v8.0

* **Integridade de evidência:** declarar o que foi executado, o que apenas foi
  configurado e o que não pôde ser verificado nesta sessão.
* **Mudanças reversíveis:** pesquisar e prototipar não autoriza escrever em
  repositório, ambiente remoto ou serviços externos.
* **Qualidade web:** contraste, semântica, responsividade e fluxo de teclado
  requerem validação apropriada; design gerado não substitui testes de A11y.
