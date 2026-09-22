"""Testes da camada S1 (laya) no caminho de roteamento $ (orquestrador).

Certificam que a classificacao zero-download de Laya (Task.metadata["intencao_s1"],
populada por core/arbitrator::_registrar_intencao_s1) atua como fator ADVISORY de
reordenacao em llm.orchestrator._prepare_routing_pipeline -- "Ponto unico de
entrada da Cognicao SOTA":

  * texto NAO-LATINO (devanagari/han/non-latin) -> laya reordena gemma4:e4b
    (modelo LOCAL multi-script, zero $) para o inicio da fila, evitando cloud $$$
    para scripts que o modelo primario nao domina.
  * texto LATINO (PT/ES) ou sem intencao_s1 -> o pipeline segue a politica de
    fonte-unica (modelo_do_agente -> claude-opus-5). ZERO regressao.

A fonte-unica (modelo_do_agente / decidir / rotear) NAO e alterada; laya apenas
reordena `models_to_try`. Backward-compatible: sem intencao_s1, models_to_try e
designated_model sao idênticos ao comportamento original.
"""

import asyncio
from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

from core.schemas import Task
from llm.laya_bridge import HeuristicRouter, LayaRouter
from llm.orchestrator import _prepare_routing_pipeline


async def _health_gate_passthrough(models, _manager, _task):
    """Desacopla o teste do SQLite: health-gate devolve a lista inalterada."""
    return models


def _mk_task(metadata=None, description="tarefa probe S1"):
    return Task(
        id="s1-router",
        description=description,
        agent="@chico",
        status="running",
        timestamp=datetime.now(UTC).isoformat(),
        metadata=metadata or {},
    )


def _resolve(task):
    """Invoca o pipeline de roteamento (async) com o health-gate desativado."""
    with patch("llm.orchestrator._apply_model_health_gate", new=_health_gate_passthrough):
        return asyncio.run(_prepare_routing_pipeline(task, MagicMock()))


def test_laya_s1_nao_latin_reordena_para_gemma_local():
    # Devanagari (nao-latino): laya forca gemma4:e4b LOCAL (multi-script, zero $)
    # na frente do designado -- evita cloud $$$ para scripts nao-latinos.
    task = _mk_task(
        metadata={
            "intencao_s1": {
                "idioma": "multilingual",
                "script": "devanagari",
                "is_english": False,
                "modelo_sugerido": "multilingual",
                "nao_latin_fraction_pct": 62.4,
            },
            "priority": 1,
        }
    )
    models, _agent_type, _designated = _resolve(task)
    assert models[0] == "gemma4:e4b"


def test_laya_s1_latin_preserva_designado_da_fonte_unica():
    # Portugues/Spanish (latin, nao-latino False): a regra de reordencao NAO
    # dispara. O designado da fonte-unica (claude-opus-5 para @chico) permanece
    # em primeiro. Zero regressao na politica original.
    task = _mk_task(
        metadata={
            "intencao_s1": {
                "idioma": "multilingual",  # PT/ES: nao-ingles, mas LATIN
                "script": "latin",
                "is_english": False,
                "modelo_sugerido": "multilingual",
                "nao_latin_fraction_pct": 0.0,
            }
        }
    )
    models, _agent_type, designated = _resolve(task)
    assert models[0] == "claude-opus-5"
    assert designated == "claude-opus-5"
    assert models[0] != "gemma4:e4b"


def test_laya_s1_ausente_preserva_politica_fonte_unica():
    # Backward-compat: sem intencao_s1, o pipeline segue a politica original
    # (fonte-unica). models_to_try[0] == designated_model (sem reordencao S1).
    task = _mk_task(metadata=None)
    models, _agent_type, designated = _resolve(task)
    assert models[0] == "claude-opus-5"
    assert designated == "claude-opus-5"


def test_laya_s1_proveniancia_registrada_no_reason_codes():
    """Smoke: a telemetry de proveniancia S1 (reason_codes) e coletada em
    call_llm_api. Verifica a funcao auxiliar inline do bridge diretamente, ja que
    call_llm_api necessita de session de rede."""
    # Reaproveita a classe LayaIntent do bridge: a proveniancia fluindo do
    # arbitrator -> Task.metadata -> reason_codes e a mesma estrutura que
    # metadados_s1() produz (garante contrato §4 end-to-end).
    intencao = LayaRouter.classificar_intencao("namaste deployment error")
    md = intencao.metadados_s1()
    # Proveniancia SEMPRE carrega os campos do contrato §4.
    assert md["idioma"] in ("english", "multilingual")
    assert md["script"] in {"latin", "devanagari", "han", "non-latin", "unknown"}
    assert isinstance(md["nao_latin_fraction_pct"], float)
    # O pacote Laya pode estar ausente no runtime; nesse caso o bridge declara
    # explicitamente o fallback determinista, em vez de fingir engine ativo.
    if md["provenia"]["engine_id"] == "laya-s1":
        assert md["provenia"]["implementation_level"] == "primitive"
        assert md["provenia"]["fallback_used"] is False
    else:
        assert md["provenia"]["engine_id"] == "heuristic-script-detector"
        assert md["provenia"]["fallback_used"] is True
    # Reacao do fallback: HeuristicRouter tem proveniancia alternativa.
    fb = HeuristicRouter.classificar("hello world deployment error")
    fb_md = fb.metadados_s1()
    assert fb_md["provenia"]["fallback_used"] is True
    assert fb_md["provenia"]["engine_id"] == "heuristic-script-detector"
