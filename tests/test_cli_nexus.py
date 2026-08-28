"""Auditoria Estrita do Orquestrador SOTA (nexus.py)."""

from unittest.mock import AsyncMock, MagicMock, patch
from typer.testing import CliRunner

from scripts.cli.nexus import app

runner = CliRunner()


def test_nexus_root_help():
    """Valida a invocacao do gateway de comandos SOTA."""
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "NEXUS ORCHESTRATOR" in result.stdout


def test_nexus_db_subcommand_help():
    """Audita a presenca da sub-malha do Data Access Layer (DAL)."""
    result = runner.invoke(app, ["db", "--help"])
    assert result.exit_code == 0
    assert "Gestao e Otimizacao do DAL" in result.stdout


def test_nexus_ops_subcommand_help():
    """Audita a presenca da sub-malha de Infraestrutura SOTA."""
    result = runner.invoke(app, ["ops", "--help"])
    assert result.exit_code == 0
    assert "Operacoes de Infraestrutura" in result.stdout


def test_nexus_stats_subcommand_help():
    """Audita a presenca da sub-malha de Telemetria e Estatisticas."""
    result = runner.invoke(app, ["stats", "--help"])
    assert result.exit_code == 0
    assert "Telemetria Preditiva" in result.stdout


def test_nexus_agent_subcommand_help():
    """Audita a presenca da sub-malha de Sincronizacao de Agentes."""
    result = runner.invoke(app, ["agent", "--help"])
    assert result.exit_code == 0
    assert "Sincronizacao e Handoff" in result.stdout


def test_nexus_voice_subcommand_help():
    """Audita a presenca da sub-malha de Sintese Neural de Voz."""
    result = runner.invoke(app, ["voice", "--help"])
    assert result.exit_code == 0
    assert "Sintese Neural de Voz" in result.stdout


def test_nexus_task_enqueuing():
    """Valida a criacao e enfileiramento atomico de uma diretriz no DAL."""
    with patch("scripts.cli.nexus.QueueManager") as mock_qm_cls:
        mock_qm = MagicMock()
        mock_qm.add_task = AsyncMock(return_value=True)
        mock_qm.close = AsyncMock(return_value=None)
        mock_qm_cls.return_value = mock_qm

        result = runner.invoke(app, ["task", "Implementar Validacao SOTA", "--agent", "@chico"])
        assert result.exit_code == 0
        assert "TAREFA ENFILEIRADA SOTA" in result.stdout
        mock_qm.add_task.assert_called_once()


def test_nexus_task_null_byte_rejection():
    """Valida bloqueio de seguranca contra Null Byte Injection."""
    result = runner.invoke(app, ["task", "Payload com \x00 invalido"])
    assert result.exit_code == 1
    assert "Null Byte" in result.stdout


def test_nexus_list_tasks():
    """Valida a listagem de diretrizes no Orquestrador."""
    with (
        patch("scripts.cli.nexus._resolve_tasks_db_path") as mock_path,
        patch("scripts.cli.nexus.sqlite3.connect") as mock_connect,
    ):
        mock_path.return_value = MagicMock(exists=lambda: True, stat=lambda: MagicMock(st_size=1024))
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            ("TASK-001", "@chico", "completed", "Diretriz Alpha de Validacao"),
            ("TASK-002", "@dispatcher", "pending", "Diretriz Beta de Processamento"),
        ]
        mock_conn.cursor.return_value = mock_cursor
        mock_connect.return_value = mock_conn

        result = runner.invoke(app, ["list", "--limit", "2"])
        assert result.exit_code == 0
        assert "DIRETRIZES RECENTES" in result.stdout
        assert "TASK-001" in result.stdout


def test_nexus_autonomy_setting():
    """Valida alteracao controlada do nivel de autonomia."""
    with patch("scripts.cli.nexus.QueueManager") as mock_qm_cls:
        mock_qm = MagicMock()
        mock_qm.set_system_state = AsyncMock(return_value=True)
        mock_qm.close = AsyncMock(return_value=None)
        mock_qm_cls.return_value = mock_qm

        result = runner.invoke(app, ["autonomy", "partial"])
        assert result.exit_code == 0
        assert "Autonomia definida para: partial" in result.stdout


def test_nexus_autonomy_invalid():
    """Valida rejeicao de modo de autonomia inexistente."""
    result = runner.invoke(app, ["autonomy", "modo_invalido_xyz"])
    assert result.exit_code == 1
    assert "Modo de autonomia invalido" in result.stdout


def test_nexus_status_command():
    """Valida a telemetria dinamica do comando status."""
    with patch("scripts.cli.nexus.QueueManager") as mock_qm_cls:
        mock_qm = MagicMock()
        mock_qm.get_task_counts = AsyncMock(return_value={"pending": 2, "running": 1, "completed": 10})
        mock_qm.close = AsyncMock(return_value=None)
        mock_qm_cls.return_value = mock_qm

        result = runner.invoke(app, ["status"])
        assert result.exit_code == 0
        assert "STATUS VITAL" in result.stdout or "Orquestrador" in result.stdout


def test_nexus_db_vacuum():
    """Valida manutencao VACUUM no banco SQLite."""
    with (
        patch("scripts.cli.nexus._resolve_tasks_db_path") as mock_path,
        patch("scripts.cli.nexus.sqlite3.connect") as mock_connect,
    ):
        mock_path.return_value = MagicMock(exists=lambda: True, stat=lambda: MagicMock(st_size=2048))
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.execute.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_connect.return_value = mock_conn

        result = runner.invoke(app, ["db", "vacuum"])
        assert result.exit_code == 0
        assert "otimizado com sucesso" in result.stdout


def test_nexus_ops_check_ascii():
    """Valida o verificador de conformidade ASCII pura."""
    result = runner.invoke(app, ["ops", "check-ascii"])
    assert result.exit_code in (0, 1)


def test_nexus_agent_route():
    """Valida teste de roteamento semantico de tarefas."""
    with patch("task_executor.intelligent_route_task") as mock_route:
        mock_route.return_value = ("@chico", {"confidence": 0.98, "reasoning": "Axioma SOTA"})
        result = runner.invoke(app, ["agent", "route", "Refatorar kernel de poker"])
        assert result.exit_code == 0
        assert "@chico" in result.stdout


def test_nexus_voice_speak():
    """Valida sintese neural de voz com mock do backend."""
    with patch("scripts.cli.nexus_voice.speak_text") as mock_speak:
        result = runner.invoke(app, ["voice", "speak", "Teste de voz", "--no-play"])
        assert result.exit_code == 0
        mock_speak.assert_called_once()


def test_nexus_search():
    """Valida busca semantica no RAG."""
    with patch("scripts.cli.nexus.subprocess.run") as mock_sub:
        result = runner.invoke(app, ["search", "PMev equilibrium"])
        assert result.exit_code == 0
        assert "Pesquisando na Mente Coletiva" in result.stdout
        mock_sub.assert_called_once()


def test_nexus_graph():
    """Valida consulta do Grafo Causal."""
    with patch("scripts.cli.nexus.subprocess.run") as mock_sub:
        result = runner.invoke(app, ["graph", "Perspectiva Matematica"])
        assert result.exit_code == 0
        assert "Forjando Grafo Causal" in result.stdout
        mock_sub.assert_called_once()


def test_nexus_sync_consciousness():
    """Valida sincronizacao da Mente Coletiva."""
    with patch("scripts.cli.nexus.subprocess.run") as mock_sub:
        result = runner.invoke(app, ["sync-consciousness"])
        assert result.exit_code == 0
        assert "SINCRONIZACAO DE CONSCIENCIA SOTA" in result.stdout
        mock_sub.assert_called_once()


def test_nexus_dashboard_once():
    """Valida renderizacao do snapshot instantaneo do Dashboard SOTA."""
    with patch("scripts.cli.nexus.QueueManager") as mock_qm_cls:
        mock_qm = MagicMock()
        mock_qm.get_task_counts = AsyncMock(return_value={"pending": 0, "running": 0, "completed": 5})
        mock_qm.close = AsyncMock(return_value=None)
        mock_qm_cls.return_value = mock_qm

        result = runner.invoke(app, ["dashboard", "--once"])
        assert result.exit_code == 0
        assert "NEXUS SOTA GOD MODE DASHBOARD" in result.stdout


# ============================================================================
# Auditoria do dashboard, 2026-08-27: comando vazio devolvendo 0 gracioso.
#
# O vertice sinalizou que havia atalhos "vazios de funcao e devolvendo output
# gracioso de 0" plugados no dashboard. A varredura dos 18 botoes encontrou
# tres errados e um habilitador estrutural. Estes testes travam os quatro.
# ============================================================================


def test_warnings_declarados_distingue_zero_de_ausente():
    """"Declarou zero" e "nao declarou" NAO sao a mesma coisa.

    Confundir os dois foi o defeito: quatro resumos imprimiam " Total de
    Warnings: 0" fixo, inclusive o do QUALITY GATE, cuja fase cwv_gate.ps1
    declara 2 warnings e sai 0.
    """
    from scripts.cli.nexus import _warnings_declarados

    assert _warnings_declarados(" Total de Warnings: 0 (Teto Maximo Permitido: 2)") == 0
    assert _warnings_declarados(" Total de Warnings: 2 (Teto Maximo Permitido: 2)") == 2
    assert _warnings_declarados("saida qualquer sem contagem") is None
    assert _warnings_declarados("") is None


def test_resumo_tri_state_alcanca_fragil():
    """FRAGIL era inalcancavel: com warnings literalmente 0, o tri-state era bi-state."""
    from scripts.cli.nexus import _imprimir_resumo_tri_state

    assert _imprimir_resumo_tri_state("T", 0, {"a": 0, "b": 0}, "ok") == "SUCESSO (VERDE)"
    assert _imprimir_resumo_tri_state("T", 0, {"a": 2, "b": 0}, "ok") == "FRAGIL (AMARELO)"
    assert _imprimir_resumo_tri_state("T", 0, {"a": 3}, "ok") == "FALHOU (VERMELHO)"
    assert _imprimir_resumo_tri_state("T", 1, {"a": 0}, "ok") == "FALHOU (VERMELHO)"


def test_resumo_tri_state_reage_a_saida_real_do_cwv_gate():
    """A saida REAL que o resumo antigo ignorava agora tem que mover o veredito."""
    from scripts.cli.nexus import _imprimir_resumo_tri_state, _warnings_declarados

    saida_real_cwv = (
        " Total de Erros:    0 (Teto Maximo Permitido: 0 | Peso: CRITICO)\n"
        " Total de Warnings: 2 (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)\n"
        " Status da Bateria: [FRAGIL (AMARELO)] 0 Erros, mas detectados 2 warnings no Quality Gate."
    )
    assert _warnings_declarados(saida_real_cwv) == 2
    fases = {"CWV Gate": _warnings_declarados(saida_real_cwv), "Lint": 0}
    assert _imprimir_resumo_tri_state("QUALITY GATE", 0, fases, "ok") == "FRAGIL (AMARELO)"


def test_resumo_declara_piso_quando_a_fase_e_muda(capsys):
    """Fase que nao declara contagem nao pode ser arredondada para zero."""
    from scripts.cli.nexus import _imprimir_resumo_tri_state

    _imprimir_resumo_tri_state("T", 0, {"fala": 0, "muda": None}, "homeostase")
    saida = capsys.readouterr().out
    assert "PISO, NAO TETO" in saida
    assert "homeostase" not in saida, "nao pode declarar homeostase total com fase muda"


def test_maintenance_nao_invoca_comando_typer_como_funcao():
    """run_maintenance chamava optimize_ram(), cujos defaults viraram OptionInfo.

    bool(OptionInfo) e True, entao o passo 1 entrava no daemon --watch e morria
    em TypeError sem alcancar os passos 2 a 5. O teste prova que o protocolo
    atravessa as cinco etapas.
    """
    with (
        patch("scripts.cli.nexus._execute_ram_cleanse") as ram,
        patch("scripts.cli.nexus.vacuum_db") as vac,
        patch("scripts.cli.nexus.sanitize_system") as san,
        patch("scripts.cli.nexus.run_hygiene") as hyg,
    ):
        result = runner.invoke(app, ["ops", "maintenance"])
        assert result.exit_code == 0, result.stdout
        ram.assert_called_once()
        vac.assert_called_once()
        san.assert_called_once()
        hyg.assert_called_once()
        # O passo 5 deixou de invocar subprocesso: chamava `memory_rag.py
        # optimize`, subcomando que nunca existiu, e a etapa saia 0 sem fazer
        # nada. Hoje ele apenas declara que reindexar e manual.
        assert "sem operacao de otimizacao" in result.stdout


def test_maintenance_reprova_quando_uma_etapa_falha():
    """O veredito era '[SUCESSO ABSOLUTO]' incondicional sob quatro try/except."""
    with (
        patch("scripts.cli.nexus._execute_ram_cleanse"),
        patch("scripts.cli.nexus.vacuum_db", side_effect=RuntimeError("DB travado")),
        patch("scripts.cli.nexus.sanitize_system"),
        patch("scripts.cli.nexus.run_hygiene"),
        patch("scripts.cli.nexus.subprocess.run"),
    ):
        result = runner.invoke(app, ["ops", "maintenance"])
        assert result.exit_code == 1, "etapa falha nao pode sair 0"
        assert "FALHA PARCIAL" in result.stdout
        assert "VACUUM" in result.stdout


def test_handoff_recusa_gravar_contexto_vazio(tmp_path):
    """Handoff sem nenhuma fonte gravava arquivo VAZIO e dizia 'persistido com sucesso'."""
    with patch("scripts.cli.nexus.BASE_DIR", tmp_path):
        result = runner.invoke(app, ["agent", "handoff"])
        assert result.exit_code == 1
        assert "Handoff vazio NAO sera gravado" in result.stdout
        assert not list(tmp_path.rglob("HANDOFF_LATEST.md")), "gravou apesar de vazio"


def test_nexus_nao_reintroduz_contagem_literal_de_warnings():
    """Guarda de ligacao: os helpers podem estar certos e o call-site voltar ao literal.

    Quatro resumos do nexus.py imprimiam a contagem de warnings como digito
    fixo. Os testes dos helpers nao pegariam a reintroducao, porque testam o
    helper, nao quem o chama. Este pega: proibe o digito literal na fonte.
    """
    import re as _re
    from pathlib import Path

    import scripts.cli.nexus as nexus_mod

    fonte = Path(nexus_mod.__file__).read_text(encoding="utf-8")
    # Linha que e SO comentario nao imprime nada: a prosa que CITA o literal ao
    # documentar por que ele foi removido nao e o literal. Mesma distincao
    # estrutural que record_anchor_gate.ps1 precisou fazer para parar de
    # reprovar a si mesmo -- isentar por caminho criaria ponto cego onde ele
    # nao pode existir.
    ofensores = [
        linha
        for linha in fonte.splitlines()
        if _re.search(r"Total de Warnings:\s+\d", linha) and not linha.lstrip().startswith("#")
    ]
    assert not ofensores, f"contagem de warnings voltou a ser literal em {len(ofensores)} linha(s): {ofensores}"


def test_comando_desconhecido_do_worker_reprova():
    """O `else` do despacho legado imprimia e retornava: exit 0 para nome inexistente.

    Era o habilitador estrutural: atalho do dashboard apontando para um nome
    errado ficava indistinguivel de um que funciona, e check=True nao percebia.
    """
    import subprocess
    import sys
    from pathlib import Path

    raiz = Path(__file__).resolve().parent.parent
    res = subprocess.run(
        [sys.executable, str(raiz / "task_executor.py"), "comando-que-nao-existe-mesmo"],
        cwd=str(raiz),
        capture_output=True,
        text=True,
        check=False,
        timeout=180,
    )
    assert res.returncode != 0, "comando inexistente nao pode sair 0"
    assert "Comando desconhecido" in (res.stderr + res.stdout)


# ============================================================================
# Fechamento da auditoria do dashboard, 2026-08-27: os 7 achados que ficaram
# registrados e nao corrigidos na rodada anterior, mais o teclado e o turno
# unico do run_inference. Todos exercitam a direcao da FALHA -- e o defeito
# em todos era exatamente essa direcao devolver 0.
# ============================================================================

import sqlite3  # noqa: E402
import sys as _sys  # noqa: E402
from unittest.mock import Mock  # noqa: E402

import pytest  # noqa: E402


@pytest.mark.parametrize(
    ("comando", "trecho"),
    [
        (["ops", "sanitize"], "saneamento ausente"),
        (["ops", "purify-memories"], "purificacao ausente"),
        (["ops", "hygiene"], "higiene nao encontrado"),
    ],
)
def test_script_de_manutencao_ausente_reprova(tmp_path, comando, trecho):
    """Ferramenta ausente e falha, nao sucesso.

    `sanitize` e `purify-memories` nao tinham ramo de ausencia (no-op silencioso
    saindo 0); `hygiene` tinha o ramo, imprimia [ERRO] e ainda assim saia 0.
    """
    with patch("scripts.cli.nexus.BASE_DIR", tmp_path):
        result = runner.invoke(app, comando)
        assert result.exit_code == 1, f"{comando} saiu 0 com o script ausente"
        assert trecho in result.stdout


@pytest.mark.parametrize(
    "comando",
    [
        ["db", "purge-orphans"],
        ["db", "clear-pending", "--confirm"],
        ["db", "clear-failed", "--confirm"],
    ],
)
def test_erro_de_banco_reprova(tmp_path, comando):
    """Os irmaos `vacuum` e `audit-dag` sempre levantaram; estes tres nao.

    Erro de banco imprimia em vermelho e saia 0: o atalho reportava sucesso
    tendo aniquilado zero tarefas.
    """
    fake_db = tmp_path / "tasks.db"
    fake_db.touch()
    with (
        patch("scripts.cli.nexus._resolve_tasks_db_path", return_value=fake_db),
        patch("scripts.cli.nexus.sqlite3.connect", side_effect=sqlite3.Error("disco cheio")),
    ):
        result = runner.invoke(app, comando)
        assert result.exit_code == 1, f"{comando} saiu 0 apesar do erro de banco"


def test_route_com_malha_quebrada_reprova():
    """O atalho [6] existe para descobrir que o roteamento parou de funcionar.

    Ele capturava a excecao, imprimia em vermelho e saia 0 -- reportando
    sucesso exatamente quando tinha achado o problema que procurava.
    """
    import task_executor

    with patch.object(task_executor, "intelligent_route_task", side_effect=RuntimeError("malha morta")):
        result = runner.invoke(app, ["agent", "route", "qualquer coisa"])
        assert result.exit_code == 1
        assert "Erro de roteamento" in result.stdout


def test_worker_que_morre_na_ignicao_reprova():
    """Popen sucede quando o processo NASCE, nao quando ele sobrevive.

    Um worker que morre na ignicao produzia a mesma mensagem verde de um que
    subiu: "Orquestrador desperto e vigilante em background".
    """
    morto = Mock()
    morto.poll.return_value = 1
    morto.pid = 4242
    with (
        patch("scripts.cli.nexus.psutil.process_iter", return_value=[]),
        patch("scripts.cli.nexus.subprocess.Popen", return_value=morto),
        patch("scripts.cli.nexus.time.sleep"),
    ):
        result = runner.invoke(app, ["ops", "worker"])
        assert result.exit_code == 1
        assert "morreu na ignicao" in result.stdout


def test_worker_vivo_e_aprovado():
    """Controle: o caminho feliz nao pode ter sido reprovado junto."""
    vivo = Mock()
    vivo.poll.return_value = None
    vivo.pid = 4242
    with (
        patch("scripts.cli.nexus.psutil.process_iter", return_value=[]),
        patch("scripts.cli.nexus.subprocess.Popen", return_value=vivo),
        patch("scripts.cli.nexus.time.sleep"),
    ):
        result = runner.invoke(app, ["ops", "worker"])
        assert result.exit_code == 0
        assert "4242" in result.stdout


def test_proxy_que_nunca_sobe_reprova():
    """Esperava 20s e seguia adiante calado, abrindo o chat contra um proxy morto."""
    from scripts.cli import nexus as nx

    with (
        patch.object(nx, "_is_port_open", return_value=False),
        patch.object(nx, "start_gemma"),
        patch.object(nx.time, "sleep"),
        pytest.raises(Exception, match="1|Exit"),
    ):
        nx._ensure_active_model("12b")


def test_teclado_indisponivel_avisa_uma_vez_e_para(capsys):
    """Degradava em silencio para sempre: as teclas nao respondiam e nada dizia por que."""
    from scripts.cli import nexus as nx

    if hasattr(nx._get_key, "_indisponivel"):
        del nx._get_key._indisponivel
    try:
        with patch.object(nx.sys, "platform", "win32"), patch.dict("sys.modules", {"msvcrt": None}):
            assert nx._get_key() is None
            assert nx._get_key() is None
        assert getattr(nx._get_key, "_indisponivel", False) is True
    finally:
        if hasattr(nx._get_key, "_indisponivel"):
            del nx._get_key._indisponivel


def test_turno_unico_sem_resposta_reprova():
    """`main()` saia 0 com saida vazia: para do.ps1, indistinguivel de sucesso."""
    from scripts.llm_inference import run_inference as ri

    with (
        patch.object(ri, "query_gemma_proxy", return_value=""),
        patch.object(_sys, "argv", ["run_inference.py", "diga", "algo"]),
        pytest.raises(SystemExit) as exc,
    ):
        ri.main()
    assert exc.value.code == 1


def test_turno_unico_com_resposta_e_aprovado():
    """Controle: resposta valida nao pode ter passado a reprovar."""
    from scripts.llm_inference import run_inference as ri

    with (
        patch.object(ri, "query_gemma_proxy", return_value="resposta real"),
        patch.object(_sys, "argv", ["run_inference.py", "diga", "algo"]),
    ):
        ri.main()  # nao pode levantar
