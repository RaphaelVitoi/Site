# SPEC: Modulo 6 - Simulador Interativo de Toy-Games

**Autor:** @planner | **Data:** 2026-03-11 | **PRD:** `PRD_M6_Interativo.md`

---

## 1. Resumo da Investigacao

A funcionalidade e inteiramente nova. Sera um componente web autocontido, sem dependencias de backend ou de outros componentes da aplicacao. A implementacao sera feita com HTML, CSS e JavaScript puros ("vanilla") para garantir maxima portabilidade e minima sobrecarga.

O componente sera servido como um arquivo HTML estatico e integrado ao documento principal (`aula-icm-rp.md`) via `<iframe>`.

---

## 2. Estrutura Detalhada do Componente

### 2.1 Estrutura de Arquivos

1.  Sera criada uma nova pasta: `components/interactive/`.
2.  O componente sera um arquivo unico: `components/interactive/icm_toy_game_simulator.html`.

### 2.2. `icm_toy_game_simulator.html`

O arquivo contera tres secoes principais: HTML para a estrutura, CSS para o estilo e JavaScript para a logica.

#### 2.2.1. Estrutura HTML

```html
<div class="simulator-container">
    <div class="controls">
        <div class="slider-group">
            <label for="rp-ip">Risk Premium do Agressor (IP): <span id="rp-ip-value">3%</span></label>
            <input type="range" id="rp-ip" min="0" max="25" value="3" step="1">
        </div>
        <div class="slider-group">
            <label for="rp-oop">Risk Premium do Defensor (OOP): <span id="rp-oop-value">9%</span></label>
            <input type="range" id="rp-oop" min="0" max="25" value="9" step="1">
        </div>
    </div>
    <div class="outputs">
        <div class="chart">
            <div class="bar-group">
                <label>Freq. de Bluff do Agressor</label>
                <div class="bar-container">
                    <div class="bar" id="bluff-bar" style="width: 50%;"></div>
                </div>
                <span id="bluff-value">50%</span>
            </div>
            <div class="bar-group">
                <label>Freq. de Defesa do Defensor</label>
                <div class="bar-container">
                    <div class="bar" id="defense-bar" style="width: 45%;"></div>
                </div>
                <span id="defense-value">45%</span>
            </div>
        </div>
    </div>
    <div class="notes">
        <p><small>Nota: Esta e uma ferramenta didatica para ilustrar os conceitos do Modulo 2. Os valores sao interpolacoes baseadas nos 8 "Toy-Games" e nao substituem a analise de um solver GTO.</small></p>
    </div>
</div>
```

#### 2.2.2. Estilizacao CSS (dentro de `<style>`)

-   **Layout:** Usara Flexbox para organizar os controles e os outputs.
-   **Design:** Minimalista. Fundo claro, texto escuro, cores de destaque para as barras (ex: azul para bluff, cinza para defesa).
-   **Responsividade:** Media queries para empilhar os elementos em telas menores.

#### 2.2.3. Logica JavaScript (dentro de `<script>`)

-   **Selecao de Elementos:** Pegar referencias para os sliders, spans de valor e barras de grafico.
-   **Listeners de Evento:** Adicionar um listener de `input` a ambos os sliders que chamara uma funcao `updateSimulator()`.
-   **Funcao Principal: `updateSimulator()`**
    1.  Le os valores atuais dos sliders `rp_ip` e `rp_oop`.
    2.  Chama uma funcao `calculateOutputs(rp_ip, rp_oop)` para obter as frequencias de bluff e defesa.
    3.  Atualiza os textos (`<span id="...">`) com os novos valores.
    4.  Atualiza a largura (`style.width`) das barras do grafico.

-   **Funcao de Calculo: `calculateOutputs(rp_ip, rp_oop)`**
    *   **ALERTA DE IMPLEMENTACAO:** Esta e a parte mais critica. Como nao temos a formula exata do solver, esta funcao implementara um **modelo de interpolacao linear** baseado nos pontos de dados conhecidos dos 8 Toy-Games.
    *   **Exemplo de Logica (Simplificado):**
        *   Definir os pontos conhecidos: `const dataPoints = [{ip: 0, oop: 0, bluff: X, defense: Y}, {ip: 3, oop: 6, bluff: A, defense: B}, ...]`. **Os valores X, Y, A, B, etc., devem ser extraidos do documento `aula-icm-rp.md` apos a sua correcao (Tarefa 1).**
        *   A funcao encontrara os dois pontos de dados mais proximos da combinacao `(rp_ip, rp_oop)` atual.
        *   Ela realizara uma interpolacao linear entre esses dois pontos para estimar os valores de bluff e defesa.
        *   Deve conter logica especial para o "Teto do RP" (a defesa para de cair apos um certo ponto) e o cenario invertido.
    *   **Esta simplificacao deve ser documentada no codigo como um comentario e na UI atraves da nota de rodape.**

---

## 3. Integracao com `aula-icm-rp.md`

-   Ao final do Modulo 2 do arquivo `aula-icm-rp.md`, o seguinte trecho de HTML sera adicionado:

```html
<h3>Laboratorio Interativo</h3>
<p>Use o simulador abaixo para explorar ativamente os conceitos discutidos nos Toy-Games. Manipule os valores de Risk Premium para construir uma intuicao sobre as dinamicas de pressao em ICM.</p>
<iframe src="../../components/interactive/icm_toy_game_simulator.html" style="width: 100%; height: 400px; border: 1px solid #ccc; border-radius: 5px;"></iframe>
```
*A altura (`height`) pode precisar de ajuste.*

---

## 4. Ordem de Implementacao

1.  Criar a estrutura de diretorios: `components/interactive/`.
2.  Criar o arquivo `icm_toy_game_simulator.html` com a estrutura HTML e o CSS basico.
3.  Implementar a logica JavaScript com dados *mockados* ou *placeholders* para a funcao `calculateOutputs()`. O objetivo nesta fase e fazer a UI funcionar.
4.  Substituir a logica mockada pela funcao de interpolacao real, usando os dados corrigidos da Tarefa 1 (quando disponiveis).
5.  Testar o componente de forma isolada, verificando todos os cenarios dos Toy-Games.
6.  Adicionar o `<iframe>` no arquivo `aula-icm-rp.md` para a integracao final.

---

## 5. Casos de Teste

| Cenario de Teste | Inputs | Output Esperado | Conceito Validado |
| :--- | :--- | :--- | :--- |
| Baseline ChipEV | IP RP=0, OOP RP=0 | Frequencias de bluff/defesa base. | Equilibrio de Nash em ChipEV |
| Pressao no OOP | IP RP=3, OOP RP=9 | Frequencia de bluff do IP aumenta; frequencia de defesa do OOP diminui, mas estabiliza. | Vantagem de Risco e Teto do RP |
| Pressao Invertida | IP RP=18, OOP RP=3 | Frequencia de bluff do IP e moderada; frequencia de defesa do OOP e *muito baixa*. | Dinamica contraintuitiva da Parte II |
| Interpolacao | IP RP=5, OOP RP=12 | Os valores de output devem estar logicamente entre os pontos de dados conhecidos mais proximos. | Validade do modelo de interpolacao |


