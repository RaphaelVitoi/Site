---
version: alpha
name: PokerRacional SOTA GOLD
description: Cockpit técnico de poker em navy profundo, acentos precisos e superfície editorial clara para leitura longa.
colors:
  primary: "hsl(222, 47%, 11%)"
  white: "#FFFFFF"
  deep: "hsl(224, 71%, 4%)"
  panel: "hsl(215, 25%, 27%)"
  elevated: "hsl(215, 25%, 27%)"
  text-main: "hsl(215, 25%, 90%)"
  text-bright: "hsl(210, 40%, 98%)"
  text-muted: "hsl(215, 22%, 82%)"
  text-dim: "hsl(215, 20%, 75%)"
  text-darker: "hsl(215, 18%, 70%)"
  light-canvas: "hsl(40, 20%, 95%)"
  light-surface: "hsl(60, 10%, 98%)"
  light-text-main: "hsl(30, 13%, 4%)"
  light-text-muted: "hsl(30, 6%, 34%)"
  light-text-accent: "hsl(40, 61%, 26%)"
  light-border: "hsl(30, 16%, 86%)"
  accent-indigo: "hsl(239, 84%, 67%)"
  accent-indigo-light: "hsl(233, 89%, 74%)"
  accent-indigo-surface: "hsl(239, 84%, 66%)"
  accent-indigo-surface-active: "hsl(239, 84%, 62%)"
  accent-emerald: "hsl(158, 82%, 39%)"
  accent-emerald-light: "hsl(159, 63%, 59%)"
  accent-emerald-surface: "hsl(158, 82%, 28%)"
  accent-emerald-surface-active: "hsl(158, 82%, 25%)"
  accent-rose: "hsl(349, 89%, 60%)"
  accent-rose-light: "hsl(351, 95%, 71%)"
  accent-rose-surface: "hsl(349, 89%, 48%)"
  accent-rose-surface-active: "hsl(349, 89%, 43%)"
  accent-danger: "hsl(0, 84%, 60%)"
  accent-danger-light: "hsl(0, 93%, 71%)"
  accent-danger-surface: "hsl(0, 84%, 49%)"
  accent-danger-surface-active: "hsl(0, 84%, 44%)"
  accent-amber: "hsl(38, 92%, 50%)"
  accent-amber-light: "hsl(38, 97%, 61%)"
  accent-amber-surface: "hsl(38, 92%, 33%)"
  accent-amber-surface-active: "hsl(38, 92%, 29%)"
  accent-gold: "hsl(43, 96%, 58%)"
  accent-gold-light: "hsl(43, 100%, 69%)"
  accent-violet: "hsl(262, 89%, 66%)"
  accent-violet-light: "hsl(262, 94%, 73%)"
  accent-violet-surface: "hsl(262, 89%, 63%)"
  accent-violet-surface-active: "hsl(262, 89%, 59%)"
  accent-sky: "hsl(199, 89%, 48%)"
  accent-sky-light: "hsl(199, 94%, 59%)"
  accent-sky-surface: "hsl(199, 89%, 36%)"
  accent-sky-surface-active: "hsl(199, 89%, 32%)"
  accent-cyan: "hsl(187, 92%, 69%)"
  accent-cyan-light: "hsl(187, 97%, 80%)"
  accent-pink: "hsl(330, 81%, 60%)"
  accent-pink-light: "hsl(330, 86%, 67%)"
typography:
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.625
  heading:
    fontFamily: Montserrat
    fontWeight: 900
    letterSpacing: "-0.05em"
  data:
    fontFamily: "JetBrains Mono"
  editorial-heading:
    fontFamily: "Playfair Display"
    fontWeight: 700
  editorial-body:
    fontFamily: "EB Garamond"
rounded:
  button: 1rem
  control: 0.75rem
  panel: 1.5rem
  glass: 2rem
  pill: 3rem
spacing:
  unit: 4px
  compact: 8px
  default: 16px
  section: 24px
  container-mobile: 24px
  container-sm: 40px
  container-lg: 64px
  container-max: 1600px
components:
  dark-canvas:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-main}"
  editorial-canvas:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-text-main}"
  button-primary:
    backgroundColor: "{colors.accent-indigo-surface}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "16px 48px"
  button-primary-hover:
    backgroundColor: "{colors.accent-indigo-surface-active}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "16px 48px"
  glass-panel:
    rounded: "{rounded.glass}"
    padding: "32px"
  scenario-atlas-summary:
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "8px 12px"
  scenario-atlas-card:
    rounded: "{rounded.control}"
    padding: "12px"
---

# Design System: PokerRacional SOTA GOLD

## Overview

**Creative North Star: "Cockpit Analítico SOTA GOLD"**

A interface trata o estudo de poker como um cockpit analítico: navy profundo organiza a informação, acentos semânticos codificam estados e tipografia compacta mantém métricas comparáveis sem sacrificar hierarquia. A superfície editorial clara oferece um modo distinto para leitura longa, sem dissolver a identidade principal.

**The Cockpit Clarity Rule.** Densidade profissional é organizada por prioridade e revelação progressiva; não se resolve removendo ferramentas nem reduzindo texto essencial.

Os tokens normativos vêm de `frontend/src/app/globals.css`; atualize esta especificação no mesmo patch quando a fonte mudar. A leitura de acessibilidade deve ser confirmada no DOM renderizado: valores de token, isoladamente, não certificam contraste em todo estado ou combinação.

**Key Characteristics:**
- Navy em camadas, com indigo como acento primário e cores semânticas complementares.
- Tipografia operacional Inter/Montserrat/JetBrains Mono; Playfair Display/EB Garamond na superfície editorial.
- Controles com estado ativo explícito, foco visível e alvos de toque generosos.
- Densidade resolvida com agrupamento e revelação progressiva, mantendo as 12 situações do Atlas.

## Colors

A paleta é escura por padrão e funcional: superfícies estáveis carregam conteúdo, enquanto os acentos preservam a identidade sem virar fundos de texto por conveniência.

### Primary
- `primary` é o canvas padrão; `deep`, `panel` e `elevated` criam profundidade tonal.
- Indigo é o acento primário da interface; emerald, rose, danger, amber, gold, violet, sky, cyan e pink permanecem disponíveis para os contextos semânticos já estabelecidos.

### Neutral
- `text-main` e `text-bright` carregam conteúdo; `text-muted`, `text-dim` e `text-darker` marcam hierarquia, não permissão para ilegibilidade.

### Editorial
- `light-canvas`, `light-surface`, os tokens de texto claro e `light-border` formam um tema separado para leitura, sem opacidade como mecanismo de contraste.

### Named Rules
**The Accent Is Not a Surface Rule.** Acentos puros são para texto, ícones, bordas, glow e gradientes; fundos que carregam texto usam o token `*-surface`.

**The Surface Contrast Rule.** Combine `*-surface` e `*-surface-active` com o token `white`, não com `text-bright`; em indigo, a medição é **4,663:1** com branco e **4,456:1** com o off-white. O estado ativo escurece em vez de clarear.

O CSS declara piso de **4,5:1** para texto normal nas combinações do tema escuro. A confirmação deve ocorrer no DOM renderizado, incluindo fundos reais; axe não avalia automaticamente pseudoclasses inativas como `:hover`.

## Typography

**Fontes operacionais:** Inter no corpo, Montserrat nos títulos do cockpit e JetBrains Mono nas métricas.
**Fontes editoriais:** Playfair Display nos títulos e EB Garamond na leitura longa.

**Caráter:** O par operacional prioriza leitura rápida e comparação numérica; o editorial favorece leitura sustentada sem trocar a identidade cromática.

### Hierarchy
- **Corpo** (400, 1rem, line-height 1.625): explicações e texto padrão da interface.
- **Título** (Montserrat, peso 900, letter spacing -0.05em): seções do cockpit e rótulos de alta prioridade; os tamanhos variam por componente.
- **Dados** (JetBrains Mono): índices, medidas e valores alinhados.
- **Editorial** (Playfair Display 700 / EB Garamond): títulos e texto longo sobre a superfície clara.

**The Instrument Readability Rule.** Use monoespaçada onde o alinhamento numérico importa; não use uma fonte de display para dados que precisem ser comparados rapidamente.

## Layout

- Mobile-first: reorganizar colunas antes de reduzir tipografia essencial e impedir rolagem horizontal.
- `.sota-container` centraliza o conteúdo com largura máxima de **1600px** e gutters de **24px / 40px / 64px** em base / `sm` / `lg`.
- Agrupar escolhas por família estratégica e revelar conjuntos secundários sob demanda; manter ferramentas avançadas no fluxo.
- Alvos interativos devem ter pelo menos **44 × 44px** quando o layout permitir; validar o simulador em viewport de **390px**.
- Separar navegação, configuração, estado ativo e resultado analítico por espaçamento, não apenas por bordas decorativas.

**The Progressive Disclosure Rule.** Reduza a carga inicial de escolhas agrupando opções; nunca remova uma ferramenta profissional apenas para simplificar visualmente a tela.

## Elevation & Depth

O sistema combina superfícies tonais e vidro; `.glass-panel` é estrutural, com gradiente vertical, blur forte, borda clara discreta e sombra em duas camadas (`inset 0 1px 0 rgba(255,255,255,.05)` e `0 40px 80px -20px rgba(0,0,0,.7)`). Não substitua essa composição por uma sombra genérica.

**The Glass Is Structural Rule.** Reserve blur e sombra ampla para painéis que organizam conteúdo; não empilhe glow, gradiente e elevação em cada card.

## Shapes

- `control` (12px): famílias do Atlas, cards compactos e chips.
- `button` (16px): CTA primário que compõe `rounded-2xl`.
- `panel` (24px): superfícies de conteúdo.
- `glass` (32px) e `pill` (48px): painéis estruturais e navegação cápsula, pelos tokens `--radius-4xl` e `--radius-5xl`.
- Preferir bordas suaves a contornos luminosos contínuos.

## Components

### Buttons
- `.btn-primary` combina a superfície indigo com texto branco e escurece no hover; a composição da chamada define raio e padding.
- `.btn-gold` é o CTA de destaque com gradiente amber, texto slate escuro, raio de 12px e padding 24px × 12px.

### Cards / Containers
- `.glass-panel` usa raio de **32px**, padding de **32px** (48px em `lg`), gradiente vertical, borda fina e blur forte.
- Cards de dados mantêm fundos escuros discretos e não recebem a elevação ampla do painel estrutural.

### Scenario Atlas
- As 12 situações ficam em `Referenciais`, `Casos clínicos` e `Toy games`; a família ativa abre por padrão e expansões manuais persistem em rerenders.
- O resumo da família tem alvo mínimo de **44px**, rótulo de **12px** e foco visível; o grid passa de 2 para 3 colunas em `sm` e 4 em `lg`.
- O cenário selecionado combina `aria-pressed`, fundo, borda e indicador; famílias secundárias são reveladas sob demanda.
- Indicadores animados devem desligar com `prefers-reduced-motion: reduce`.

**The Active-State Redundancy Rule.** Estado selecionado comunica-se por semântica, forma e cor; nunca dependa só de uma tonalidade.

**The Keyboard Parity Rule.** Resumos e cards precisam continuar operáveis por teclado, com foco visível equivalente ao estado de ponteiro.

## Do's and Don'ts

### Do:
- **Do** consumir os tokens de `frontend/src/app/globals.css` como fonte de verdade.
- **Do** usar `white` sobre fundos `*-surface` e testar contraste no estado renderizado.
- **Do** preservar foco visível, alvos táteis e hierarquia de dados nas três larguras do Atlas.
- **Do** agrupar opções profissionais antes de considerar ocultar ou remover uma ferramenta.

### Don't:
- **Don't** usar acento puro como superfície que carrega texto.
- **Don't** usar `text-bright` sobre `accent-indigo-surface` nem clarear o hover.
- **Don't** tornar animação necessária para compreender o estado ou os dados.
- **Don't** substituir a paleta SOTA GOLD por cores genéricas de dashboard ou reescrever tons aprovados sem medição.
