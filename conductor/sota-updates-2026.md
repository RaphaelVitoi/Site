# Plano de Modernizacao SOTA: Dependencias & Updates (Maio 2026)

## 1. Objetivo
Elevar todas as dependencias do ecossistema para o "Estado da Arte" (SOTA) de meados de 2026, eliminando o drift tecnico e garantindo acesso as ultimas otimizacoes de performance e seguranca.

## 2. Arquivos Chave & Contexto
- `requirements.txt`: Manifesto de dependencias Python.
- `pyproject.toml`: Configuracao de build e linting (Ruff/Pyright).
- `frontend/package.json`: Nucleo React/Next.js.
- `package.json` (root): Orquestracao Monorepo.

## 3. Solucao Proposta
Atualizar os manifestos para as versoes "Gold" de 2026 e validar a integridade matematica e funcional do sistema apos a migracao.

### Alvos SOTA 2026 (Estimados):
- **FastAPI:** 0.140.0+
- **Pydantic:** 2.15.0+
- **OpenAI:** 2.45.0+
- **Next.js:** 16.3.0+
- **React:** 19.3.0+
- **TailwindCSS:** 4.4.0+

## 4. Plano de Implementacao

### Fase 1: Preparacao & Backup
- [ ] Criar backups dos manifestos atuais (`.backups/manifests_pre_sota/`).

### Fase 2: Atualizacao Python (Backend)
- [ ] Atualizar `requirements.txt` com as versoes alvo.
- [ ] Sincronizar `pyproject.toml` (secao `dependencies`).
- [ ] Executar `pip install -r requirements.txt --upgrade`.
- [ ] Validar com `python -m pytest tests/`.

### Fase 3: Atualizacao Node.js (Frontend)
- [ ] Atualizar `frontend/package.json` com as versoes alvo.
- [ ] Limpar pacotes extraneous no `package.json` raiz.
- [ ] Executar `npm install`.
- [ ] Validar com `npm test` no workspace frontend.

### Fase 4: Refinamento de Settings & Docs
- [ ] Revisar `.claude/settings.json` e `.vscode/settings.json`.
- [ ] Atualizar `docs/INDEX_MESTRE.md` com as novas versoes de referencia.
- [ ] Verificar integridade da `uv.lock` (se presente) ou `package-lock.json`.

## 5. Verificacao & Testes
- **Backend:** `pytest tests/test_math_rio.py tests/test_math_sota.py`.
- **Frontend:** `npm run build` (para garantir compatibilidade do Next.js 16.3).
- **Integridade:** `/sota:audit` (via scripts/quality-gate.ps1).

## 6. Migracao & Rollback
- **Rollback:** Restaurar backups da Fase 1 e re-instalar versoes anteriores.
- **Migracao:** Sem necessidade de mudancas estruturais no banco de dados (Prisma seed sera testado).
