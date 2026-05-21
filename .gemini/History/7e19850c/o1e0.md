# Guia de Deploy SOTA v4.3 Gold

**Objetivo:** Publicar o Ecossistema Nexus (Frontend & Backend) com integridade matemática e alta fidelidade visual.
**Stack:** Next.js 14.2.4 (Turbopack), Tailwind v4, Prisma (SQLite/PostgreSQL), Python (FastAPI).

---

## 1. Frontend (Next.js)

### Pré-requisitos

- Node.js >= 22.0.0
- npm ou bun

### Build de Produção

```bash
cd frontend
npm install
npm run build
```

### Opções de Hospedagem

- **Vercel (Recomendado):** Deploy nativo com suporte a Server Components e Edge Functions. Conecte o repositório e configure a `Root Directory` para `frontend`.
- **Docker:** Utilize o `Dockerfile` na raiz do projeto para subir o container unificado.

---

## 2. Backend (Nexus Engine)

### Requisitos

- Python 3.11+
- Pip/Conda

### Instalação

```bash
pip install -r requirements.txt
```

### Execução (Produção)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 3. Variáveis de Ambiente (.env)

Certifique-se de configurar as seguintes chaves no ambiente de produção:

```env
# Frontend
NEXTAUTH_SECRET=sua_chave_secreta
DATABASE_URL="file:./dev.db" # Ou connection string Postgres

# Backend
API_SECRET_TOKEN=seu_token_de_seguranca
GEMINI_API_KEY=sua_chave_google_ai
```

---

## Checklist de Verificação SOTA

- [ ] Executar `npm run typecheck:audit` no frontend.
- [ ] Validar integridade matemática com `pytest tests/test_math_sota.py`.
- [ ] Verificar se o `SOTA Grain` está ativo no layout (CSS opacity).
- [ ] Confirmar se o `Quantum Engine` está apontando para a URL de produção correta.
