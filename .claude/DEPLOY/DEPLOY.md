# Guia de Deploy Estatico (SOTA 2026)

**Objetivo:** Publicar a versao v1.0 do site "Raphael Vitoi | Poker & Mindset".
**Stack:** HTML5 + CSS3 (Sem Build Step).

---

## Opcao A: GitHub Pages (Recomendado - Longo Prazo)
*Ideal para versionamento e historico profissional.*

1.  **Inicialize o Git (se ainda nao fez):**
    ```powershell
    git init
    git add .
    git commit -m "feat: initial release v1.0"
    ```

2.  **Crie o Repositorio no GitHub:**
    *   Va em [github.new](https://github.new).
    *   Nome sugerido: `raphaelvitoi-poker` (ou `seu-usuario.github.io` para site principal).

3.  **Conecte e Suba:**
    ```powershell
    git branch -M main
    git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git
    git push -u origin main
    ```

4.  **Ative o Pages:**
    *   Va em **Settings > Pages**.
    *   Em "Build and deployment", selecione **Source: Deploy from a branch**.
    *   Branch: `main` / Folder: `/(root)`.
    *   Clique em **Save**.

---

## Opcao B: Netlify Drop (Imediato - Teste Rapido)
*Ideal para validar visualmente em < 30 segundos.*

1.  Acesse app.netlify.com/drop.
2.  Arraste a pasta `Site` inteira para a area pontilhada.
3.  O site estara online instantaneamente com uma URL temporaria (ex: `vitoi-poker-xyz.netlify.app`).
4.  (Opcional) Conecte seu dominio depois.

---

## Checklist Pos-Deploy

- [ ] Verificar carregamento de `style.css` (caminhos relativos).
- [ ] Testar responsividade mobile no navegador real.
- [ ] Validar meta-tags (SEO basico).
- [ ] Atualizar link na bio do Instagram/Twitter.
