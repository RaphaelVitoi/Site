"""Guarda da procedencia de solve extraida pelo importador do HRC Pro.

MOTIVO DESTE ARQUIVO
`detect_format` reconhecia `hrc_version` desde sempre -- e a usava apenas para
identificar o formato, descartando o valor. O ledger de evidencia PMev
(`docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md`) exige versao de solver e
e-Nash antes de aceitar um par como reproduzivel. O campo era reconhecido e
jogado fora no mesmo arquivo.

e-Nash e o CONCEITO -- distancia da solucao ao equilibrio. Cada solver lhe da
nome proprio: `CI` no HRC, `MES` no PioSOLVER (Tier 0, 2026-09-03). Por isso o
rotulo nativo e guardado junto com o numero.

Todos os testes sao hermeticos: nenhuma chamada a provedor, nenhum solver real.
"""

import io

from engine.solver_importers.hrc_pro import HRCProImporter

SAMPLE = "data/sample_hrc_export_mtt_bubble.hrc"


def _importer() -> HRCProImporter:
    return HRCProImporter()


def test_build_e_lido_do_cabecalho_do_export_real():
    """A versao esta na PRIMEIRA linha do export; antes era descartada."""
    raw = io.open(SAMPLE, encoding="utf-8").read()
    tree = _importer().parse_tree(raw)
    assert tree.provenance is not None
    assert tree.provenance.build == "v2.4.1"


def test_o_sample_nao_traz_e_nash_e_isso_e_declarado_nao_suposto():
    raw = io.open(SAMPLE, encoding="utf-8").read()
    proc = _importer().parse_tree(raw).provenance
    assert proc.e_nash is None
    assert proc.e_nash_unit is None
    assert proc.e_nash_label is None
    assert proc.esta_completa() is False


def test_hrc_version_do_json_deixa_de_ser_descartada():
    """Guarda de regressao do defeito: detectar por um campo e nao o ler."""
    imp = _importer()
    bruto = '{"hrc_version": "3.1.2", "pot": 3.0, "strategy": {"FOLD": 0.4, "ALLIN": 0.6}}'
    assert imp.detect_format(bruto) is True
    assert imp.parse_tree(bruto).provenance.build == "3.1.2"


def test_o_rotulo_do_hrc_e_ci_e_e_preservado():
    """O HRC nao escreve `e-Nash`; escreve `CI`. Buscar so o conceito nao acharia nada."""
    proc = _importer().extrair_procedencia("HRC Pro Export v2.4.1\nCI: 0.28%\n")
    assert proc.e_nash == 0.28
    assert proc.e_nash_label == "CI"
    assert proc.esta_completa() is True


def test_o_rotulo_do_pio_e_mes_e_tambem_e_preservado():
    proc = _importer().extrair_procedencia("Solver export\nMES: 0.11 bb\n")
    assert proc.e_nash == 0.11
    assert proc.e_nash_label == "MES"
    assert proc.e_nash_unit == "bb"


def test_rotulo_curto_exige_separador_e_fronteira_de_palavra():
    """`CI` solto casaria com qualquer par de letras seguido de numero."""
    sem_separador = _importer().extrair_procedencia("CI 0.35 players ready\n")
    assert sem_separador.e_nash is None

    dentro_de_outra_palavra = _importer().extrair_procedencia("DECIMAL: 0.35\n")
    assert dentro_de_outra_palavra.e_nash is None


def test_porcentagem_vira_pct_e_nunca_pct_of_pot():
    """`%` autoriza dizer que a grandeza e percentual, e nada alem.

    "Por cento de que" e decidido pelo atalho de convergencia do solver, que no
    HRC nao e publico. Escrever pctOfPot afirmaria um referente a partir de um
    simbolo de exibicao.
    """
    proc = _importer().extrair_procedencia("HRC Pro Export v2.4.1\nCI: 0.35%\n")
    assert proc.e_nash_unit == "pct"
    assert proc.e_nash_unit != "pctOfPot"


def test_pct_of_pot_so_entra_quando_o_export_o_declara():
    proc = _importer().extrair_procedencia("{}", {"hrc_version": "2.4.1", "ci": 0.35, "e_nash_unit": "pctOfPot"})
    assert proc.e_nash_unit == "pctOfPot"
    assert proc.e_nash_label == "ci"
    assert proc.esta_completa() is True


def test_e_nash_sem_unidade_nao_conta_como_completo():
    """0.42 e "0,42% do pote" ou "0,42bb"? Sem unidade nao se interpreta."""
    proc = _importer().extrair_procedencia('{"x": 1}', {"hrc_version": "3.1.2", "exploitability": 0.42})
    assert proc.e_nash == 0.42
    assert proc.e_nash_unit is None
    assert proc.esta_completa() is False


def test_e_nash_zero_e_convergencia_e_nao_ausencia():
    """0.0 e a afirmacao MAIS forte sobre um solve; ausencia e ignorancia."""
    proc = _importer().extrair_procedencia("HRC v2.4.1\nCI: 0.0 bb\n")
    assert proc.e_nash == 0.0
    assert proc.e_nash_unit == "bb"
    assert proc.esta_completa() is True

    ausente = _importer().extrair_procedencia("HRC v2.4.1\n")
    assert ausente.e_nash is None
    assert ausente.esta_completa() is False


def test_conteudo_sem_procedencia_nao_inventa_nada():
    proc = _importer().extrair_procedencia("PUSH 55.0%\nFOLD 45.0%\n")
    assert proc.build is None
    assert proc.e_nash is None
    assert proc.e_nash_unit is None
    assert proc.e_nash_label is None
    assert proc.esta_completa() is False


def test_booleano_nao_e_lido_como_e_nash():
    """`True` e instancia de int em Python; sem o guard viraria e_nash = 1.0."""
    proc = _importer().extrair_procedencia("{}", {"hrc_version": "1", "exploitability": True})
    assert proc.e_nash is None


def test_o_rotulo_nao_entra_na_completude():
    """Rotulo e derivavel do solver, que `build` ja ancora. Existe para auditoria."""
    proc = _importer().extrair_procedencia("{}", {"hrc_version": "2.4.1", "ci": 0.2, "e_nash_unit": "bb"})
    assert proc.e_nash_label == "ci"
    assert proc.esta_completa() is True


def test_engine_e_distinto_do_produto_e_nao_entra_na_completude():
    """Produto nao e motor: um numero lido no GTO Wizard pode vir do HRC.

    A disputa em estudo e ChipEV x ICMev. O motor e variavel a CONTROLAR, nao o
    objeto -- e por isso `engine` e declarado, nunca inferido, e sua ausencia nao
    reprova um solve cujo build e CI ja estao completos.
    """
    from core.perspective_schemas import SolverProvenance

    sem_engine = SolverProvenance(build="v2.4.1", e_nash=0.2, e_nash_unit="bb")
    assert sem_engine.engine is None
    assert sem_engine.esta_completa() is True

    declarado = SolverProvenance(build="v2.4.1", engine="HRC", e_nash=0.2, e_nash_unit="bb")
    assert declarado.engine == "HRC"


def test_o_importador_nunca_infere_engine_sozinho():
    """Inferir motor a partir de indicio e o mesmo defeito que redistribuir frequencia."""
    proc = _importer().extrair_procedencia("HRC Pro Export v2.4.1\nCI: 0.28%\n")
    assert proc.engine is None


def test_rotulos_do_gto_wizard_sao_reconhecidos():
    """`Nash Distance` e `dEV` sao os nomes do GTO Wizard (fonte: blog/help GTO Wizard).

    Definidos como maxima perda de EV em bb DIVIDIDA PELO POTE. Nome diferente do
    CI do HRC, e grandeza diferente: indicador de convergencia de amostragem nao
    e EV-loss maximo relativo ao pote.
    """
    proc = _importer().extrair_procedencia("Solve report\nNash Distance: 0.1%\n")
    assert proc.e_nash == 0.1
    assert proc.e_nash_label == "Nash Distance"

    curto = _importer().extrair_procedencia("dEV: 0.12%\n")
    assert curto.e_nash == 0.12
    assert curto.e_nash_label == "dEV"


def test_o_referente_do_percentual_nao_e_promovido_por_rotulo():
    """Mesmo com o GTO Wizard documentando bb/pote, o importador nao infere pctOfPot.

    Promover por rotulo seria o importador decidindo semantica. Quem transcreve
    declara, com o fundamento documental na mao.
    """
    proc = _importer().extrair_procedencia("Nash Distance: 0.1%\n")
    assert proc.e_nash_unit == "pct"
    assert proc.e_nash_unit != "pctOfPot"
