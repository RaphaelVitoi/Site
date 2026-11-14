"""Testes unitarios e de contrato para `scripts/ops/avaliar_impacto_sessao.py`."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import patch

import scripts.ops.avaliar_impacto_sessao as mod


def _payload_base_sintetico(tmp_path: Path) -> dict[str, object]:
    return {
        "timestamp": "2026-11-14T06:00:00+00:00",
        "pendencias": {
            "abertas": 1,
            "vencidas": 0,
            "inicio_declarado": 1,
            "reducao_pct": 0.0,
            "itens_abertos": [
                {
                    "id": "pend-teste-01",
                    "prazo": "2026-12-01",
                    "dono": "gemini-4-hydrogen",
                    "o_que": "Coletar mais feedback",
                    "vencida": False,
                }
            ],
        },
        "ledger": {
            "total_registros": 91,
            "tail_hash": "bfb330709122",
            "ultimo_tipo": "feedback",
            "data_referencia": "2026-11-13",
            "sessoes_acumuladas": 1,
            "sessoes_faltantes": 2,
            "eligible_feedback_count": 1,
            "excluded_feedback_count": 0,
            "gate_passed": False,
            "calibracao_pendente": False,
            "timesfm_status": "INSUFFICIENT_HISTORY",
            "timesfm_available_points": 1,
            "timesfm_required_points": 4,
            "score_mean": 9.5,
        },
        "fila_tarefas": {
            "pending": 0,
            "running": 0,
            "completed": 3,
            "failed": 0,
            "total_tarefas": 3,
            "taxa_resolucao_pct": 100.0,
        },
        "interceptador_mcp": {
            "fonte": "telemetria_real",
            "total_eventos": 12,
            "economia_media_tokens_pct": 62.5,
            "overhead_latencia_us": 280.0,
            "status": "Telemetria viva da sessao (12 chamadas reais)",
        },
        "ingress_fast_path": {
            "latencia_s1_ms": 0.42,
            "latencia_s1_us": 420.0,
        },
        "pools_openrouter": {
            "total_chaves": 21,
            "tier1_count": 4,
            "tier2_count": 7,
            "tier3_count": 5,
            "tier4_count": 5,
            "ativas": 21,
            "bloqueadas": 0,
            "revogadas": 0,
            "score_medio": 80.0,
        },
        "eficiencia_economica_infra": {
            "modelos_cloud_zero_ram_count": 0,
            "modelos_locais_quantizados_count": 16,
            "identidades_canonicas": {"total": 17, "tier_1": 16, "tier_2": 1},
        },
        "memoria_agentica_devin": {
            "total_notas_md": 50,
            "superficies": {"site_memory": {"notas_md": 47}},
            "memoria_repo_git": {"e_repo_git": True, "dirty_files": 0, "ultimo_commit": "2026-11-13"},
            "devin_insights": None,
        },
        "atividade_git": {
            "janela_horas": 12.0,
            "branch_atual": "master",
            "head_sha": "545fdbdf",
            "working_tree_dirty": 0,
            "commits_count": 2,
            "autores": ["Gemini 4 Hydrogen <noreply@google.com>"],
            "arquivos_unicos_tocados": 4,
            "insercoes": 120,
            "delecoes": 18,
            "areas_impactadas": {"scripts": 2, "tests": 2},
            "marcos_commits": [
                "[aaaaaaaa] docs(governance): registra identidade canonica",
                "[545fdbdf] feat(ops): evolui avaliador de sessao",
            ],
        },
        "qualidade_cwv": {
            "cwv_report": {
                "disponivel": True,
                "timestamp_relatorio": "2026-11-14 05:44:00",
                "aprovado": True,
                "lcp_ms": 274.015,
                "cls": 0.000215,
                "tbt_ms": 32.496,
                "ttfb_ms": 56.06,
                "max_heap_mb": 19.8,
                "axe_violations": 0,
                "axe_incomplete": 1,
                "critical_cve": 0,
                "high_cve": 0,
                "total_cve": 0,
                "py_cve_abertas": 0,
            },
            "suite_verde": {
                "disponivel": True,
                "atualizado_no_head": True,
                "em": "2026-11-14T05:50:00-03:00",
                "head_na_medicao": "545fdbdf",
            },
        },
        "saude_malha": {
            "status": "alerta",
            "total_sinais": 1,
            "graves": 1,
            "infos": 0,
            "sinais": [
                {
                    "grave": True,
                    "titulo": "Auditoria de calibracao parada",
                    "detalhe": "2 dias sem auditoria.",
                    "acao": "Rodar auditoria",
                }
            ],
        },
    }


def test_ledger_calibration_fallback_to_latest_daily(tmp_path: Path) -> None:
    """Quando o snapshot de hoje nao existe, faz fallback para o daily mais recente."""
    reports_dir = tmp_path / "reports" / "agent-calibration"
    daily_dir = reports_dir / "daily"
    daily_dir.mkdir(parents=True)
    ledger_path = reports_dir / "feedback-ledger.jsonl"
    ledger_path.write_text(
        json.dumps({"record_hash": "abc123456789", "record_type": "feedback"}) + "\n",
        encoding="utf-8",
    )
    (daily_dir / "2020-01-02.json").write_text(
        json.dumps(
            {
                "sessoes_com_feedback_count": 2,
                "sessoes_faltantes": 1,
                "eligible_feedback_count": 2,
                "excluded_feedback_count": 0,
                "calibration_planning_permitted": False,
                "calibration_pending": True,
                "score_mean": 9.25,
                "timesfm_forecast": {
                    "status": "INSUFFICIENT_HISTORY",
                    "available_points": 2,
                    "required_points": 4,
                },
            }
        ),
        encoding="utf-8",
    )

    with patch.object(mod, "SITE_ROOT", tmp_path):
        ledger = mod.medir_ledger_calibracao()

    assert ledger["total_registros"] == 1
    assert ledger["data_referencia"] == "2020-01-02"
    assert ledger["sessoes_acumuladas"] == 2
    assert ledger["sessoes_faltantes"] == 1
    assert ledger["timesfm_status"] == "INSUFFICIENT_HISTORY"
    assert ledger["timesfm_available_points"] == 2
    assert ledger["calibracao_pendente"] is True


def test_parse_git_log_numstat_and_cwv_parser() -> None:
    """Extrai metricas git numstat e relatorio CWV Markdown com precisao."""
    git_raw = "\n".join(
        [
            "__COMMIT__11111111abcdef|Gemini 4 Hydrogen|noreply@google.com|2026-11-14T05:00:00-03:00|feat: etapa 1",
            "10\t2\tscripts/ops/avaliar_impacto_sessao.py",
            "5\t0\ttests/test_session_impact_evaluator.py",
            "__COMMIT__22222222abcdef|Gemini 4 Hydrogen|noreply@google.com|2026-11-14T05:30:00-03:00|docs: etapa 2",
            "3\t1\t.agents/skills/session-impact-evaluator/SKILL.md",
        ]
    )
    git_res = mod._parse_git_log_numstat(git_raw)
    assert git_res["commits_count"] == 2
    assert git_res["arquivos_unicos_tocados"] == 3
    assert git_res["insercoes"] == 18
    assert git_res["delecoes"] == 3
    assert git_res["marcos_commits"] == [
        "[22222222] docs: etapa 2",
        "[11111111] feat: etapa 1",
    ]

    cwv_md = "\n".join(
        [
            "**Timestamp:** 2026-11-14 05:44:00",
            "**Status:** ✅ **APPROVED (SOTA GOLD)**",
            "| **LCP_MS** | 274.015 ms | <= 2500 ms | ✅ PASS | - |",
            "| **CLS** | 0.000215 | <= 0.1 | ✅ PASS | - |",
            "| **AXE_VIOLATIONS** | 0 | <= 0 | OK | - |",
            "| **CRITICAL_CVE_COUNT** | 0 | <= 0 | OK | - |",
        ]
    )
    cwv_res = mod._extrair_metricas_cwv(cwv_md)
    assert cwv_res["aprovado"] is True
    assert cwv_res["lcp_ms"] == 274.015
    assert cwv_res["axe_violations"] == 0
    assert cwv_res["critical_cve"] == 0


def test_qualitativo_narrativa_e_markdown_completo(tmp_path: Path) -> None:
    """Valida geracao de diagnostico qualitativo, prosa narrativa e tabela Markdown limpa."""
    r = _payload_base_sintetico(tmp_path)
    r["qualitativo"] = mod.analisar_sinais_qualitativos(r)
    r["narrativa"] = mod.gerar_resumo_escrito_sessao(
        r,
        marcos_manuais=["Entrega de evoluicao da skill"],
        dificuldades_manuais=["Janela curta sem novo snapshot diario"],
        conclusoes_manuais=["Pronto para commit"],
    )

    qual = mod._como_dict(r["qualitativo"])
    assert qual["saude_geral"] == "ATENCAO"
    atritos = mod._como_lista_strs(qual["dificuldades_detectadas"])
    assert any("pendencia `pend-teste-01`" in a for a in atritos)
    assert any("Auditoria de calibracao parada" in a for a in atritos)

    narr = mod._como_dict(r["narrativa"])
    assert "2 commit(s)" in str(narr["sintese_executiva"])
    assert "[Declarado] Entrega de evoluicao da skill" in mod._como_lista_strs(narr["marcos"])
    assert "[Declarado] Janela curta sem novo snapshot diario" in mod._como_lista_strs(narr["dificuldades"])
    assert "[Declarado] Pronto para commit" in mod._como_lista_strs(narr["conclusoes"])

    md_completo = mod.gerar_tabela_markdown(r, incluir_narrativa=True)
    assert "### Painel de Avaliacao de Impacto da Sessao" in md_completo
    assert "### Diagnostico Qualitativo por Eixo" in md_completo
    assert "### Resumo Escrito da Sessao" in md_completo
    assert "#### Marcos e Entregas" in md_completo
    assert "#### Dificuldades e Atritos" in md_completo
    assert "#### Conclusoes e Proximos Passos" in md_completo

    md_so_tabela = mod.gerar_tabela_markdown(r, incluir_narrativa=False)
    assert "### Painel de Avaliacao de Impacto da Sessao" in md_so_tabela
    assert "### Resumo Escrito da Sessao" not in md_so_tabela


def test_marcador_suite_verde_valida_por_arvore(tmp_path: Path) -> None:
    """Marcador .git/sota-suite-verde valida pelo SHA da arvore mesmo apos commit novo."""
    git_dir = tmp_path / ".git"
    git_dir.mkdir(parents=True)
    (git_dir / "sota-suite-verde").write_text(
        json.dumps(
            {
                "contrato": 1,
                "arvore": "tree12345678",
                "head_na_medicao": "oldhead0000",
                "em": "2026-11-14T06:07:02-03:00",
            }
        ),
        encoding="utf-8",
    )

    with (
        patch.object(mod, "SITE_ROOT", tmp_path),
        patch.object(mod, "_arvore_atual_site", return_value="tree12345678"),
        patch.object(mod, "_git_cmd", return_value="newhead1111"),
    ):
        res = mod._ler_marcador_suite_verde()

    assert res["disponivel"] is True
    assert res["atualizado_no_head"] is True
    assert res["arvore"] == "tree1234"


def test_medir_atividade_git_usa_cutoff_iso_utc() -> None:
    """Passa timestamp ISO-8601 ao git log --since em vez de float em 'hours ago'."""
    chamadas: list[tuple[str, ...]] = []

    def fake_git(*args: str, timeout: float = 10.0) -> str:
        del timeout
        chamadas.append(args)
        if args and args[0] == "branch":
            return "master\n"
        if args and args[0] == "rev-parse":
            return "57402261\n"
        return ""

    with patch.object(mod, "_git_cmd", side_effect=fake_git):
        res = mod.medir_atividade_git_sessao(horas=14.0, max_commits=10)

    assert res["janela_horas"] == 14.0
    log_calls = [c for c in chamadas if c and c[0] == "log"]
    assert len(log_calls) == 1
    since_arg = next(a for a in log_calls[0] if a.startswith("--since="))
    assert "hours ago" not in since_arg
    assert "+00:00" in since_arg or "Z" in since_arg
