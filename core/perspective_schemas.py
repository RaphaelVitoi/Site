from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

SolverType = Literal["deep_solver", "gtowizard", "monker_solver", "hrc_pro", "pio_solver", "auto"]


class PerspectiveCalculationRequest(BaseModel):
    """Requisicao para calculo pontual da Perspectiva Matematica (PMev)."""

    model_config = ConfigDict(allow_inf_nan=False)

    equity: float = Field(..., ge=0.0, le=1.0, description="Equidade nominal de showdown [0.0 - 1.0]")
    realization_factor: float = Field(1.0, ge=0.1, le=2.5, description="Fator de Realizacao R de equidade")
    valuation_stack: float = Field(1.0, ge=0.01, description="Valuation marginal monetario")
    base_antes: float = Field(1.0, ge=0.0, description="Custo base da rodada em antes/blinds")
    time_to_blind_minutes: float = Field(10.0, ge=0.0, description="Minutos restantes ate o aumento dos blinds")
    payjump_proximity_factor: float = Field(0.5, ge=0.0, le=1.0, description="Proximidade do payjump [0.0 - 1.0]")
    position: str = Field("BTN", description="Posicao do Hero na mesa (ex: UTG, BTN, SB, BB)")
    multiway_opponents: int = Field(1, ge=1, le=9, description="Numero de oponentes ativos no pote")
    base_rio: float = Field(0.0, ge=0.0, description="Coeficiente base de Reverse Implied Odds")
    stack_depth_bb: float = Field(25.0, ge=0.1, description="Profundidade do stack efetivo em big blinds")
    edge_base: float = Field(0.05, ge=0.0, description="Edge base tecnico do jogador")
    aggression_factor: float = Field(1.5, ge=0.0, description="Fator de agressividade do cenario")
    loss_aversion_base: float = Field(2.25, ge=1.0, description="Coeficiente de aversao a perda de Kahneman")
    pot_size: float = Field(10.0, ge=0.1, description="Tamanho do pote em big blinds")
    hero_invested: float = Field(0.0, ge=0.0, description="Quantidade ja investida pelo Hero no pote")


class PerspectivaResult(BaseModel):
    """Resultado do calculo da Perspectiva Matematica PMev."""

    pmev: float = Field(..., description="Valor computado da Perspectiva Matematica")
    dynamic_ev_fold: float = Field(..., description="Custo dinamico de sobrevivencia (EV do fold)")
    structural_liability: float = Field(..., description="Passivo estrutural multiway N^2")
    amortized_edge: float = Field(..., description="Edge amortizado pela profundidade de stack")
    risk_advantage: float = Field(..., description="Risk Advantage em porcentagem")
    required_equity: float = Field(..., description="Equidade necessaria corrigida por ICM/PMev")
    bubble_factor: float = Field(..., description="Bubble Factor computado")
    utility_win: float = Field(..., description="Utilidade prospectiva em caso de vitoria")
    utility_lose: float = Field(..., description="Utilidade prospectiva em caso de derrota")
    optimal_action: str = Field(..., description="Acao recomendada pelo motor (FOLD, CALL, RAISE)")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Metadados adicionais de calculo")


class PerspectiveTreeRequest(BaseModel):
    """Requisicao para simulacao de arvore recursiva de decisao."""

    model_config = ConfigDict(allow_inf_nan=False)

    equity: float = Field(..., ge=0.0, le=1.0)
    pot_size: float = Field(..., ge=0.1)
    stack_eff: float = Field(..., ge=0.1)
    active_players: int = Field(2, ge=2, le=10)
    street_idx: int = Field(0, ge=0, le=3, description="0=Preflop/Flop, 1=Turn, 2=River")
    hero_invested: float = Field(0.0, ge=0.0)
    ev_fold_dynamic: float | None = Field(None, description="EV fold pre-calculado ou derivado")
    position: str = Field("BTN")
    realization_factor: float = Field(1.0)
    valuation_stack: float = Field(1.0)
    edge_base: float = Field(0.05)
    aggression_factor: float = Field(1.5)
    base_rio: float = Field(0.0)
    loss_aversion_base: float = Field(2.25)
    fgs_health: float = Field(1.0)
    rp_opp: float = Field(20.0)
    fold_equity: float = Field(0.30, ge=0.0, le=1.0)


class DecisionNodeResponse(BaseModel):
    """No individual da arvore de decisao recursiva."""

    node_id: str
    street: str
    pot_size: float
    stack_eff: float
    pm_fold: float
    pm_call: float
    pm_raise: float
    pm_best: float
    best_action: str
    p_best_outcome: float


class PerspectiveTreeResponse(BaseModel):
    """Resposta com arvore e ramificacoes computadas."""

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    tree_result: dict[str, Any]
    summary: dict[str, Any] = Field(default_factory=dict)


class SolverNode(BaseModel):
    """No normalizado de arvore de solver."""

    node_id: str
    player: str = Field(..., description="IP, OOP, SB, BB ou identificador da posicao")
    street: str = Field(..., description="preflop, flop, turn, river")
    pot: float
    actions: list[str] = Field(default_factory=list)
    strategy: dict[str, float] = Field(default_factory=dict, description="Frequencia por acao [0.0 - 1.0]")
    ev: dict[str, float] = Field(default_factory=dict, description="EV esperado por acao")
    range_equity: float | None = None
    children: list[str] = Field(default_factory=list, description="IDs dos nos filhos")


class SolverProvenance(BaseModel):
    """Procedencia computacional de um solve -- o que separa transcricao de medicao.

    Existe porque `NormalizedGameTree` declarava apenas `source_format`, texto
    livre. Versao de solver e e-Nash nao tinham onde pousar, e um export que os
    trouxesse perdia justamente os campos que o ledger de evidencia PMev exige
    antes de aceitar um par como reproduzivel.

    `None` significa NAO LIDO, jamais zero: e-Nash 0.0 e convergencia perfeita,
    a afirmacao mais forte possivel sobre um solve; ausencia e ignorancia.

    E-NASH E O CONCEITO, NAO O ROTULO. A distancia da solucao ao equilibrio de
    Nash tem nome proprio em cada solver: o HRC a chama de `CI`, o PioSOLVER de
    `MES`. Por isso `e_nash_label` guarda o rotulo NATIVO exatamente como lido.

    E por isso tambem os valores NAO sao comparaveis entre solvers: rotulos
    distintos podem ter definicoes operacionais distintas, e um `CI` de 0.3 nao
    e necessariamente o mesmo fato que um `MES` de 0.3. O campo qualifica quao
    convergido esta AQUELE solve, isoladamente -- nunca serve para dizer qual
    dos dois solvers convergiu mais. Isso vale com forca extra quando um dos
    lados usa rede neural: aproximacao de rede e CFR convergido nao produzem
    grandezas da mesma natureza.

    `engine` EXISTE PORQUE PRODUTO NAO E MOTOR (Tier 0, 2026-09-03). O GTO
    Wizard tem dois caminhos, e so um deles e dele:

    - biblioteca / tabelas estaticas: os spots pre-computados FORAM RODADOS NO
      HRC e apresentados como biblioteca, muitos em CIs suboptimais. E por isso
      que aquele painel tambem reporta `CI` -- e o rotulo do HRC.
    - GTO Wizard AI: depth-limited subgame solving com counterfactual value
      networks (linhagem DeepStack/ReBeL), rodando CFR so na street ativa e
      avaliando os terminais truncados por rede treinada em self-play.

    A diferenca nao e de rotulo, e de ESCOPO DO CALCULO. Exploitability de
    arvore completa e exploitability de subjogo truncado com terminais
    estimados por rede nao sao a mesma grandeza.

    Logo um numero lido na interface do GTO Wizard pode ter sido produzido pelo
    HRC, e nesse caso a versao que importa e a do HRC, nao a do produto.

    MOTOR COMUM NOS DOIS LADOS FORTALECE O PAR. O HRC calcula ChipEV alem de
    ICMev, entao um par ChipEV(HRC) x ICMev(HRC) roda o MESMO modelo dos dois
    lados, e a unica variavel que resta variando e o REGIME -- que e exatamente
    o que o par existe para isolar. Isso e controle experimental.

    O risco esta no contrario: motores diferentes misturam o efeito do regime
    com o efeito do motor, e nenhuma analise separa os dois depois. Declarar so
    o produto esconde qual dos dois casos se tem, e deixa um solve suboptimal
    passar por definitivo.
    """

    build: str | None = None
    engine: str | None = None
    e_nash: float | None = None
    e_nash_unit: Literal["pct", "pctOfPot", "bb", "bbPer100", "chips"] | None = None
    e_nash_label: str | None = None

    def esta_completa(self) -> bool:
        """Reproduzivel exige build E e-Nash com unidade. Sem unidade o numero nao se interpreta.

        `e_nash_label` NAO entra na completude: o rotulo e derivavel do solver, que
        `build` ja ancora. Ele e guardado para auditoria -- para que se saiba QUAL
        metrica foi lida --, nao como requisito adicional.
        """
        return self.build is not None and self.e_nash is not None and self.e_nash_unit is not None


class NormalizedGameTree(BaseModel):
    """Arvore de jogo normalizada universal."""

    solver_type: SolverType
    source_format: str
    game_type: str = "MTT"
    num_players: int = 2
    board: list[str] = Field(default_factory=list)
    starting_pot: float = 0.0
    stacks: dict[str, float] = Field(default_factory=dict)
    nodes: dict[str, SolverNode] = Field(default_factory=dict)
    root_node_id: str = "root"
    pmev_converted_nodes: dict[str, PerspectivaResult] = Field(default_factory=dict)
    provenance: SolverProvenance | None = None


class SolverImportRequest(BaseModel):
    """Requisicao para importacao de arvore de solver."""

    solver_type: SolverType = "auto"
    raw_content: str = Field(..., min_length=5, description="Conteudo bruto do solver (JSON, CSV ou texto formatado)")
    tournament_context: dict[str, Any] = Field(
        default_factory=dict, description="Parametros de torneio (prizes, stacks, antes)"
    )


class SolverImportResponse(BaseModel):
    """Resposta da importacao e normalizacao de solver."""

    status: Literal["SUCCESS", "ERROR"]
    solver_type: SolverType
    tree: NormalizedGameTree | None = None
    node_count: int = 0
    error: str | None = None


class PmevHeatmapRequest(BaseModel):
    """Requisicao para geracao de heatmap de range comparativo (DeepSolver/HRC vs PMev)."""

    deepsolver_range: Any = Field(..., description="Range do Solver (2D list 13x13, 1D array 169 ou dict de maos)")
    pmev_threshold: float | None = Field(None, ge=0.0, le=1.0, description="Limiar PMev explicito [0.0 - 1.0]")
    pot: float = Field(2.5, ge=0.1, description="Pote atual em big blinds ou unidades")
    call_amount: float = Field(1.0, ge=0.0, description="Valor do call em big blinds ou unidades")
    bubble_factor: float = Field(1.8, ge=1.0, description="Bubble factor do cenario")
    stack_bb: float = Field(25.0, ge=0.1, description="Stack efetivo em big blinds")
    position: str = Field("UTG", description="Posicao do Hero na mesa")
    time_to_blind_minutes: float = Field(5.0, ge=0.0, description="Minutos ate o aumento dos blinds")
    edge_base: float = Field(0.08, ge=0.0, description="Edge base tecnico")
    aggression: float = Field(0.7, ge=0.0, description="Fator de agressividade")
    loss_aversion_lambda: float = Field(2.25, ge=1.0, le=5.0, description="Coeficiente de aversao a perda lambda")
    ante_bb: float = Field(1.0, ge=0.0, le=5.0, description="Ante ou Big Blind Ante em BBs")
    players_behind: int | None = Field(None, ge=0, le=9, description="Numero de jogadores restantes atras")
    structure_speed: str = Field("REGULAR", description="Velocidade da estrutura: TURBO, REGULAR, HYPER, DEEP")


class PmevHeatmapResponse(BaseModel):
    """Resposta estruturada com matrizes, contagem de combos e visualizacao ASCII do heatmap."""

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    pmev_threshold: float
    deepsolver_matrix: list[list[float]]
    pmev_matrix: list[list[float]]
    delta_matrix: list[list[float]]
    total_deepsolver_combos: float
    total_pmev_combos: float
    combo_delta: float
    expanded_hands_count: int
    contracted_hands_count: int
    expanded_hands: list[str]
    contracted_hands: list[str]
    ev_fold_bb: float | None = None
    players_behind: int | None = None
    ascii_heatmap: str
    cells: list[dict[str, Any]]
    error: str | None = None
