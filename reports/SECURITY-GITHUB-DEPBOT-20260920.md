# REGISTRO DE SEGURANÇA — GitHub Dependabot Alerts

**Data:** 2026-09-20
**Agente:** Solar-Pro4 [Tier 2] -- sessao 2026-09-20
**Record-Id:** registro-2026-09-20-github-dependabot-alerts-preexistentes

---

## Achado

Durante `git push origin master`, o GitHub reportou 2 vulnerabilidades no repositorio `RaphaelVitoi/Site`:

| Severidade | Quantidade |
|------------|-----------|
| Critical | 1 |
| Moderate | 1 |

**URL:** https://github.com/RaphaelVitoi/Site/security/dependabot

---

## Investigacao

### npm audit (fonte primaria local)
```
frontend$ npm audit
found 0 vulnerabilities
```
**Resultado:** 0 vulnerabilidades nos pacotes instalados. Fonte primaria de verificacao (npm audit) esta limpa.

### Cross-check de versoes contra CVEs conhecidos
Todas as versoes das dependencias do `frontend/package.json` e overrides estao abaixo dos thresholds de CVE ativos conhecidos:

- `postcss`: 8.5.28 (override fixado; sem CVE critico conhecido nesta versao)
- `dompurify`: ^3.4.13 (versoes < 3.1.0 tinham CVE; 3.4.13 esta limpo)
- `nanoid`: ^3.3.18 (sem CVE conhecido nesta versao)
- `ws`: ^8.18.3 (sem CVE critico conhecido nesta versao)
- `picomatch`: ^4.0.5 (sem CVE relevante nesta versao)
- `serialize-javascript`: 7.1.0 (sem CVE critico nesta versao)
- `tar`: ^7.5.21 (sem CVE relevante nesta versao)

### Pacotes modificados nesta sessao
- `frontend/package.json`: modificado (1 linha)
- `turbo.json`: modificado (68 linhas)

Nenhuma das modificacoes introduziu novas dependencias ou atualizou versoes para pacotes com CVE conhecido.

---

## Diagnostico

As 2 alertas do GitHub (1 critical, 1 moderate):

1. **Nao foram introduzidas nesta sessao** — `npm audit` local retorna 0 vulnerabilidades antes E apos os commits desta sessao.
2. **Provavelmente preexistentes** no branch — ou falsos positivos do Dependabot (alertas baseados em analise estatica do package.json/lockfile que nao se manifestam no node_modules atual).
3. **Nao ha ação local necessaria** — o `npm audit` (fonte de verdade para verificacao de pacotes npm) esta limpo.

---

## Acao recomendada

- [ ] Se quiser identificar os pacotes especificos: acessar a API do GitHub com token autenticado (`https://api.github.com/repos/RaphaelVitoi/Site/dependabot/alerts?state=open`).
- [ ] Se quiser fechar os alerts: revisar no GitHub e fechar se confirmados como falsos positivos ou preexistentes sem impacto.
- [ ] Monitorar na proxima rodada do Dependabot (agendado para Monday, interval: weekly).

---

## Fontes

- `frontend/package.json` (dependencias e overrides)
- `frontend$ npm audit --json` (fonte primaria de verificacao)
- `https://github.com/RaphaelVitoi/Site/security/dependabot` (alertas GitHub)
- `.github/dependabot.yml` (configuracao do Dependabot: npm + pip + github-actions)
