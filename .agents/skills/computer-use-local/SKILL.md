---
name: computer-use-local
description: "Computer Use local — controle de desktop medido no ecossistema (Chrome CDP :9222, Playwright, pyautogui, mss) como equivalente ao Computer Use do Devin Cloud. Use para interagir com GUIs, testar apps desktop, verificar visualmente telas, ou automatizar fluxos de UI sem nuvem."
argument-hint: "[app/janela alvo ou acao de UI a executar]"
allowed-tools:
  - read
  - grep
  - glob
  - exec
triggers:
  - user
  - model
metadata:
  hermes:
    tags: ["computer-use", "desktop", "gui", "automation", "cdp", "screenshot"]
    category: automation
    related_skills: ["e2e-video-proof", "debug-live", "preview-sota"]
---

# Computer Use Local — desktop automation medida

Referencia: docs.devin.ai/work-with-devin/computer-use. O Devin usa um
desktop Linux provisionado; **a maquina local JA E o desktop** — Windows,
Chrome real do usuario, sessao logada. Nao ha nada a provisionar.

## 0. Stack medida nesta sessao (2026-11-13)

| Camada | Ferramenta | Estado |
| :--- | :--- | :--- |
| Browser web | Chrome CDP `:9222` (Chrome/159) + `connect_over_cdp` | **vivo** |
| Browser MCP | `mcpbrowser` (sessao real, cookies intactos) | disponivel |
| Browser MCP | Playwright `127.0.0.1:8931` (video nativo) | disponivel |
| Desktop Windows | `pyautogui` (click/type/scroll/screenshot) | instalado |
| Captura tela | `mss` (screenshot rapido multi-monitor) | instalado |
| Debug de app | skill `debug-live` (breakpoints/inspect) | disponivel |

Interpretador: `Site/.venv/Scripts/python.exe` — nunca o python do sistema.

## 1. Decisor: qual camada usar

| Alvo | Camada | Por que |
| :--- | :--- | :--- |
| App web / login / SPA | **CDP `:9222`** ou mcpbrowser | estado real do usuario, cookies, sessao viva — igual ao truque do Devin na porta 29229 |
| Fluxo que precisa de video | Playwright :8931 | `browser_video` nativo → ver `e2e-video-proof` |
| App desktop nativo (Electron, WPF, TUI) | `pyautogui` + `mss` | unica camada que ve a tela inteira |
| Bug de runtime em app | `debug-live` primeiro | screenshot mostra sintoma; debug mostra causa |

## 2. Padrao de execucao (o loop screenshot→acao→screenshot)

O Devin faz: screenshot → identifica elemento → age → observa → repete.
Local, o mesmo loop com ferramentas deterministicas:

1. `mss` ou `pyautogui.screenshot()` → ver o estado real
2. Localizar o elemento (coordenada, OCR visual, ou CDP `DOM.querySelector`
   quando for browser)
3. `pyautogui.click/type` ou `page.click/fill` via CDP
4. Novo screenshot → verificar resultado antes do proximo passo
5. Repetir ate concluir ou falhar 2x no mesmo ponto → PARAR e reportar

**Nunca agir em tela sem screenshot previo** — e o equivalente local da
regra "observe antes de interagir". Em browser, prefira seletores
estaveis (`data-testid`, role) a coordenadas.

## 3. CDP :9222 — o equivalente do "port 29229" do Devin

O Chrome local ja expoe CDP. Script conecta, age e desconecta — cookies,
localStorage e tokens **persistem** porque e o browser real:

```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://localhost:9222")
    page = b.contexts[0].pages[0]
    page.goto("http://localhost:5173")
    page.screenshot(path="reports/e2e/prova.png")
```

- Chrome SOTA sobe com `Launch-ChromeSOTA.ps1` (portas 9222/9223 por
  profile). Se `connect_over_cdp` falhar, verificar se o Chrome certo
  esta no ar — `curl http://127.0.0.1:9222/json/version`.
- Estado de auth: scripts podem injetar localStorage/cookies via env
  vars — mesmo padrao do Devin (secrets → estado de browser).

## 4. pyautogui — desktop Windows

- Sempre `pyautogui.FAILSAFE = True` (mover mouse ao canto aborta).
- `locateOnScreen`/`locateCenterOnScreen` para elementos visuais;
  coordenada absoluta e ultimo recurso (janela pode ter mudado).
- Para apps Win32 com UI Automation de verdade, `pywinauto`/`uiautomation`
  NAO estao instalados — nao instalar sem instrucao; pyautogui cobre o
  caso medido.

## 5. Proibicoes

- Nao ampliar `--remote-allow-origins` nem abrir CDP para `*` — o CDP
  local e controle total do browser do usuario; exposicao e risco.
- Nao clicar em dialogos de sistema destrutivos (desinstalar, formatar,
  "sim" de UAC) — parar e escalar ao Tier 0.
- Screenshot pode conter dado sensivel — artefatos vao para `reports/`
  local, nunca para repo publico.
