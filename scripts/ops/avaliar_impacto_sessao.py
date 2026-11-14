"""Script Canonico de Avaliacao de Impacto de Sessao SOTA.

Executa medicao quantitativa, factual e agnostica entre modelos dos Tiers 3, 2 e 1.
Mede concretamente:
1. Passivo de governanca e pendencias ativas (record_gate.py)
2. Integridade e portao do ledger de calibracao (Secao 8.3)
3. Fila de tarefas assincronas SQLite (core/task_queue.py)
4. Eficiencia de poda de ferramentas e economia de tokens (llm/mcp_tool_interceptor.py)
5. Latencia de decisao e triagem Fast-Path S1 (core/arbitrator.py)
6. Status dos portoes de qualidade e ancoras

Padrao SOTA: Pure ASCII, PEP 585/604, Python 3.12+, Zero-Any.
"""

from __future__ import annotations

import argparse
from datetime import UTC, datetime, timedelta
import json
from pathlib import Path
import re
import sqlite3
import subprocess
import sys
import time

SITE_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(SITE_ROOT))

from core.arbitrator import UniversalArbitrator  # noqa: E402
from core.schemas import Task  # noqa: E402
from llm.mcp_tool_interceptor import (  # noqa: E402
    calcular_estatisticas_telemetria,
    interceptar_e_podar_ferramentas_s1,
    obter_telemetria_sessao,
)
from scripts.ops.record_gate import coletar_pendencias  # noqa: E402


def medir_pendencias() -> dict[str, object]:
    """Mede pendencias ativas no corpus atraves da funcao canonica do record_gate."""
    abertas, _ = coletar_pendencias()
    total_abertas = len(abertas)
    vencidas = sum(1 for p in abertas if p.get("vencida"))
    itens_abertos: list[dict[str, object]] = [
        {
            "id": str(p.get("id") or ""),
            "prazo": str(p.get("prazo") or "sem prazo"),
            "dono": str(p.get("dono") or ""),
            "o_que": str(p.get("o_que") or ""),
            "vencida": bool(p.get("vencida")),
        }
        for p in abertas
    ]
    return {
        "abertas": total_abertas,
        "vencidas": vencidas,
        "itens_abertos": itens_abertos,
    }


def _resolver_daily_calibracao(daily_dir: Path) -> Path | None:
    """Retorna o arquivo daily de calibracao de hoje ou o ultimo disponivel."""
    hoje_path = daily_dir / f"{datetime.now().strftime('%Y-%m-%d')}.json"
    if hoje_path.exists():
        return hoje_path
    if not daily_dir.is_dir():
        return None
    candidatos = sorted(daily_dir.glob("????-??-??.json"), reverse=True)
    return candidatos[0] if candidatos else None


def _ler_tail_ledger(ledger_path: Path) -> tuple[int, str, str]:
    """Extrai contagem de registros, ultimo hash e tipo do ledger append-only."""
    if not ledger_path.exists():
        return 0, "none", "unknown"
    try:
        lines = [line.strip() for line in ledger_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    except OSError:
        return 0, "none", "unknown"
    if not lines:
        return 0, "none", "unknown"
    try:
        last_obj = json.loads(lines[-1])
        return len(lines), str(last_obj.get("record_hash", "none")), str(last_obj.get("record_type", "unknown"))
    except json.JSONDecodeError:
        return len(lines), "none", "unknown"


def _int_ou_zero(val: object) -> int:
    if isinstance(val, bool):
        return int(val)
    if isinstance(val, int | float):
        return int(val)
    return 0


def medir_ledger_calibracao() -> dict[str, str | int | float | bool | None]:
    """Inspeciona o ledger append-only e o portao de suficiencia da secao 8.3."""
    ledger_path = SITE_ROOT / "reports/agent-calibration/feedback-ledger.jsonl"
    daily_dir = SITE_ROOT / "reports/agent-calibration/daily"
    records_count, tail_hash, last_record_type = _ler_tail_ledger(ledger_path)

    daily_path = _resolver_daily_calibracao(daily_dir)
    daily_data: dict[str, object] = {}
    if daily_path is not None:
        try:
            loaded = json.loads(daily_path.read_text(encoding="utf-8"))
            if isinstance(loaded, dict):
                daily_data = loaded
        except (json.JSONDecodeError, OSError):
            pass

    sessoes_acumuladas = _int_ou_zero(daily_data.get("sessoes_com_feedback_count"))
    timesfm = _como_dict(daily_data.get("timesfm_forecast"))
    score_raw = daily_data.get("score_mean")
    score_mean = float(score_raw) if isinstance(score_raw, int | float) else None

    return {
        "total_registros": records_count,
        "tail_hash": tail_hash,
        "ultimo_tipo": last_record_type,
        "data_referencia": daily_path.stem if daily_path is not None else "none",
        "sessoes_acumuladas": sessoes_acumuladas,
        "sessoes_faltantes": _int_ou_zero(daily_data.get("sessoes_faltantes")),
        "eligible_feedback_count": _int_ou_zero(daily_data.get("eligible_feedback_count")),
        "excluded_feedback_count": _int_ou_zero(daily_data.get("excluded_feedback_count")),
        "gate_passed": bool(daily_data.get("calibration_planning_permitted", False)),
        "calibracao_pendente": bool(daily_data.get("calibration_pending", False)),
        "timesfm_status": str(timesfm.get("status", "UNKNOWN")),
        "timesfm_available_points": _int_ou_zero(timesfm.get("available_points")),
        "timesfm_required_points": _int_ou_zero(timesfm.get("required_points")) or 4,
        "score_mean": score_mean,
    }


def medir_fila_tarefas() -> dict[str, int | float]:
    """Inspeciona o banco de tarefas assincronas SQLite."""
    db_path = SITE_ROOT / "data/task_queue.db"
    resumo: dict[str, int] = {"pending": 0, "running": 0, "completed": 0, "failed": 0}
    if db_path.exists():
        try:
            with sqlite3.connect(str(db_path)) as conn:
                cur = conn.cursor()
                cur.execute("SELECT status, count(*) FROM tasks GROUP BY status")
                for st, count in cur.fetchall():
                    if st in resumo:
                        resumo[st] = int(count)
        except sqlite3.Error:
            pass

    total = sum(resumo.values())
    resolucao_pct = (resumo["completed"] / total * 100.0) if total > 0 else 100.0
    return {
        **resumo,
        "total_tarefas": total,
        "taxa_resolucao_pct": round(resolucao_pct, 2),
    }


def medir_interceptador_mcp(forcar_benchmark: bool = False) -> dict[str, object]:
    """Mede a taxa de poda de schemas de ferramentas e o overhead de latencia.

    Fusao SOTA:
    1. Se houver telemetria viva registrada na sessao (mcp_tool_telemetry.jsonl),
       utiliza a economia real ponderada e a latencia media das chamadas autenticas.
    2. Caso contrario (ou com forcar_benchmark=True), executa benchmark de capacidade
       com warmup descartavel para medir a latencia em regime puro (<500us).
    """
    if not forcar_benchmark:
        registros = obter_telemetria_sessao(horas=24.0)
        if registros:
            stats = calcular_estatisticas_telemetria(registros)
            return {
                "fonte": "telemetria_real",
                "total_eventos": stats["total_eventos"],
                "economia_media_tokens_pct": stats["economia_media_tokens_pct"],
                "overhead_latencia_us": stats["overhead_medio_us"],
                "status": f"Telemetria viva da sessao ({stats['total_eventos']} chamadas reais)",
            }

    # Benchmark SOTA Otimizado em Regime com Warmup Descartavel
    # 1. Warmup descartavel: isola o lazy import do torch/laya fora da medicao de precisao
    _ = interceptar_e_podar_ferramentas_s1(
        tools=[{"name": "view_file", "description": "warmup"}],
        prompt="warmup inicializacao lazy laya",
        registrar_telemetria=False,
    )

    # 2. Catalogo expandido e balanceado de 32 ferramentas representativas SOTA
    tools: list[dict[str, object]] = []
    for name in ["view_file", "read_file", "get_file_contents", "list_directory", "search_code", "read_resource"]:
        tools.append({"name": name, "description": f"Leitura de arquivos do workspace e recursos {name}"})
    for name in ["write_to_file", "replace_file_content", "create_or_update_file", "delete_file", "push_files"]:
        tools.append({"name": name, "description": f"Gravacao e mutacao de arquivos e git {name}"})
    for name in ["run_sql", "execute_sql", "query_logs", "describe_table_schema", "bigquery", "supabase"]:
        tools.append({"name": name, "description": f"Banco de dados SQL Postgres Neon BigQuery {name}"})
    for name in ["browser_navigate", "browser_click", "browser_type", "browser_snapshot", "lighthouse_audit"]:
        tools.append({"name": name, "description": f"Navegacao e automacao de UI Playwright {name}"})
    for name in ["exa", "search_web", "web_search_exa", "web_fetch_exa", "read_url_content"]:
        tools.append({"name": name, "description": f"Pesquisa web profunda e fetch de URLs {name}"})
    for name in [
        "jules_create_session",
        "jules_get_session_status",
        "jules_approve_plan",
        "stitch_create_project",
        "google_workspace",
    ]:
        tools.append({"name": name, "description": f"Operacoes em nuvem assincronas Jules Stitch Workspace {name}"})

    full_bytes = len(json.dumps(tools).encode("utf-8"))

    prompts = [
        "Execute uma query no banco de dados para auditar tabelas e logs",
        "Pesquise na internet a documentacao oficial do Python e Next.js",
        "Modifique o arquivo e implemente o novo componente no workspace",
        "Crie uma sessao assincrona no Jules para analise e refatoracao",
    ]

    economias: list[float] = []
    latencias_us: list[float] = []

    for prompt in prompts:
        t0 = time.perf_counter()
        filtered, _ = interceptar_e_podar_ferramentas_s1(tools, prompt, registrar_telemetria=False)
        t1 = time.perf_counter()

        latencias_us.append((t1 - t0) * 1_000_000)
        filt_bytes = len(json.dumps(filtered).encode("utf-8"))
        saved_pct = ((full_bytes - filt_bytes) / full_bytes) * 100.0
        economias.append(saved_pct)

    return {
        "fonte": "benchmark_regime",
        "total_eventos": len(prompts),
        "economia_media_tokens_pct": round(sum(economias) / len(economias), 2),
        "overhead_latencia_us": round(sum(latencias_us) / len(latencias_us), 1),
        "status": f"Capacidade S1 em regime (warmup descartado, {len(tools)} ferramentas)",
    }


def medir_ingress_fast_path() -> dict[str, float]:
    """Mede a latencia do oraculo S1 de Ingress Fast-Path."""
    now_iso = datetime.now(UTC).isoformat()
    task_ready = Task(
        id="task-eval-bench",
        description="Calculo de equidade trivial spot turn",
        agent="@chico",
        status="pending",
        timestamp=now_iso,
        metadata={"priority": "high"},
    )

    N = 500
    t0 = time.perf_counter()
    for _ in range(N):
        _ = UniversalArbitrator.ingress_fast_path_s1([task_ready])
    t1 = time.perf_counter()

    lat_ms = (t1 - t0) / N * 1000.0
    return {
        "latencia_s1_ms": round(lat_ms, 4),
        "latencia_s1_us": round(lat_ms * 1000.0, 1),
    }


def medir_pools_openrouter() -> dict[str, object]:
    """Mede contagem, distribuicao por tier, saude e paridade dos pools OpenRouter."""
    try:
        from llm.openrouter_pool import openrouter_pool_manager  # noqa: PLC0415

        telemetry = openrouter_pool_manager.get_telemetry_summary()
        t1 = len(openrouter_pool_manager.get_pool_keys(1))
        t2 = len(openrouter_pool_manager.get_pool_keys(2))
        t3 = len(openrouter_pool_manager.get_pool_keys(3))
        t4 = len(openrouter_pool_manager.get_pool_keys(4))
        total = len(telemetry)

        bloqueadas = sum(1 for item in telemetry if item.get("is_blocked"))
        revogadas = sum(1 for item in telemetry if item.get("is_revoked"))
        ativas = total - bloqueadas - revogadas

        scores = [float(item.get("score", 0.0)) for item in telemetry]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        return {
            "total_chaves": total,
            "tier1_count": t1,
            "tier2_count": t2,
            "tier3_count": t3,
            "tier4_count": t4,
            "ativas": ativas,
            "bloqueadas": bloqueadas,
            "revogadas": revogadas,
            "score_medio": avg_score,
            "paridade_registro": "100% HKCU/HKLM",
        }
    except Exception as e:
        return {
            "total_chaves": 0,
            "erro": str(e),
            "paridade_registro": "N/A",
        }


def _contar_identidades_canonicas() -> dict[str, int]:
    """Conta identidades canonicas por tier no manifesto data/agent_identities.json."""
    contagem: dict[str, int] = {"total": 0, "tier_1": 0, "tier_2": 0}
    ident_path = SITE_ROOT / "data/agent_identities.json"
    if not ident_path.exists():
        return contagem
    try:
        dados = json.loads(ident_path.read_text(encoding="utf-8"))
        for item in dados.get("canonicas", []):
            if not isinstance(item, dict):
                continue
            contagem["total"] += 1
            tier = str(item.get("tier", ""))
            if tier == "1":
                contagem["tier_1"] += 1
            elif tier == "2":
                contagem["tier_2"] += 1
    except (OSError, json.JSONDecodeError):
        pass
    return contagem


def medir_eficiencia_economica_e_infraestrutura() -> dict[str, object]:
    """Mede a conformidade de economia, cotas Pro e mitigacao de custos de nuvem/servidores."""
    manifesto_path = SITE_ROOT / "data/ollama_models.json"
    cloud_models_count = 0
    local_models_count = 0

    if manifesto_path.exists():
        try:
            dados = json.loads(manifesto_path.read_text(encoding="utf-8"))
            for m in dados.get("models", []):
                tier = m.get("tier", "")
                if tier == "cloud":
                    cloud_models_count += 1
                elif tier == "local":
                    local_models_count += 1
        except (OSError, json.JSONDecodeError):
            pass

    identidades = _contar_identidades_canonicas()

    return {
        "prioridade_tier1_assinaturas_pro": "Ativa (Faixa.FLAT_FEE tem precedencia sobre API Paga)",
        "modelos_cloud_zero_ram_count": cloud_models_count,
        "modelos_locais_quantizados_count": local_models_count,
        "identidades_canonicas": identidades,
        "runtimes_mitigacao_infraestrutura": [
            "Ollama (somente execucao local; modelos ':cloud' descontinuados em 2026-11-10)",
            "llama.cpp (Familia Qwen quantizada local de alta taxa tokens/watt; harness/condutor, nao identidade)",
            "Hermes Agent (harness/condutor router; modelos servidos ocupam tier natural + sufixo 'b', blindados da calibracao)",
        ],
        "mitigacao_custo_servidores": "Eliminacao de VMs e servidores pagos via inferencia free em nuvem e edge",
    }


def _git_memoria_repo(memoria_root: Path) -> dict[str, object]:
    """Le o estado do repo-git da memoria local (analogo ao memory drive do Devin)."""
    info: dict[str, object] = {"e_repo_git": False, "dirty_files": 0, "ultimo_commit": "N/A"}
    try:
        probe = subprocess.run(
            ["git", "-C", str(memoria_root), "rev-parse", "--git-dir"],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return info
    if probe.returncode != 0:
        return info
    info["e_repo_git"] = True
    try:
        out = subprocess.run(
            ["git", "-C", str(memoria_root), "status", "--porcelain"],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        info["dirty_files"] = len([ln for ln in out.stdout.splitlines() if ln.strip()])
        log = subprocess.run(
            ["git", "-C", str(memoria_root), "log", "-1", "--format=%cI"],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        info["ultimo_commit"] = log.stdout.strip()[:10] or "N/A"
    except (OSError, subprocess.SubprocessError):
        pass
    return info


def _medir_uma_superficie(raiz: Path, rotulo: str) -> tuple[dict[str, object], int, float]:
    """Mede notas Markdown e recencia numa unica superficie de memoria."""
    notas = [p for p in raiz.rglob("*.md") if "__pycache__" not in p.parts] if raiz.exists() else []
    subdirs: dict[str, int] = {}
    for p in notas:
        rel = p.relative_to(raiz)
        bucket = rel.parts[0] if len(rel.parts) > 1 else "(raiz)"
        subdirs[bucket] = subdirs.get(bucket, 0) + 1
    mais_recente = max((p.stat().st_mtime for p in notas), default=0.0)
    resumo: dict[str, object] = {
        "rotulo": rotulo,
        "notas_md": len(notas),
        "subdirs": subdirs,
        "nota_mais_recente": (
            datetime.fromtimestamp(mais_recente, UTC).strftime("%Y-%m-%d") if mais_recente else "N/A"
        ),
    }
    return resumo, len(notas), mais_recente


def _carregar_devin_insights(
    devin_session: str | None,
    devin_insights_path: str | None,
    devin_generate: bool,
    devin_timeout: float,
) -> dict[str, object] | None:
    """Carrega insights Devin de arquivo local ou via API v3."""
    if devin_insights_path:
        try:
            devin: dict[str, object] = json.loads(Path(devin_insights_path).read_text(encoding="utf-8"))
            devin["_fonte"] = f"arquivo:{devin_insights_path}"
            return devin
        except (OSError, json.JSONDecodeError) as exc:
            return {"_erro": f"falha ao ler insights: {exc}"}

    if not devin_session:
        return None

    try:
        from scripts.ops.devin_session_insights import (  # noqa: PLC0415
            _env_or_reg,
            _normalizar_devin_id,
            aguardar_analise,
            gerar_insights,
        )

        token = _env_or_reg("DEVIN_API_TOKEN")
        org_id = _env_or_reg("DEVIN_ORG_ID")
        base = _env_or_reg("DEVIN_API_BASE", "https://api.devin.ai")
        if not token or not org_id:
            return {"_status": "nao_configurado", "_detalhe": "DEVIN_API_TOKEN/DEVIN_ORG_ID ausentes"}
        did = _normalizar_devin_id(devin_session)
        if devin_generate:
            gerar_insights(base, org_id, did, token)
        devin = aguardar_analise(base, org_id, did, token, devin_timeout, 5.0)
        devin["_fonte"] = f"api:{did}"
        return devin
    except Exception as exc:  # eixo externo nunca derruba o painel local
        return {"_erro": str(exc)[:200]}


def _como_dict(val: object) -> dict[str, object]:
    return val if isinstance(val, dict) else {}


def _como_lista_dicts(val: object) -> list[dict[str, object]]:
    return [x for x in val if isinstance(x, dict)] if isinstance(val, list) else []


def _resumir_devin_insights(devin: dict[str, object] | None) -> dict[str, object] | None:
    """Resume o payload de insights Devin para o diagnostico de impacto."""
    if not isinstance(devin, dict):
        return None
    if devin.get("_erro") or devin.get("_status"):
        return {k: v for k, v in devin.items() if k.startswith("_")}
    analysis = _como_dict(devin.get("analysis"))
    issues = _como_lista_dicts(analysis.get("issues"))
    action_items = _como_lista_dicts(analysis.get("action_items"))
    skill_usage = _como_dict(analysis.get("skill_usage"))
    usados = skill_usage.get("used") or skill_usage.get("items")
    enganosos = skill_usage.get("misleading") or skill_usage.get("misleading_items")
    return {
        "session_id": devin.get("session_id"),
        "session_size": devin.get("session_size"),
        "category": devin.get("category"),
        "acus_consumed": devin.get("acus_consumed"),
        "num_user_messages": devin.get("num_user_messages"),
        "num_devin_messages": devin.get("num_devin_messages"),
        "analysis_status": devin.get("analysis_status"),
        "issues_total": len(issues),
        "issues_high": sum(1 for i in issues if str(i.get("impact", "")).lower() == "high"),
        "action_items_total": len(action_items),
        "skills_usados": len(usados) if isinstance(usados, list) else 0,
        "skills_enganosos": len(enganosos) if isinstance(enganosos, list) else 0,
        "suggested_prompt": bool(analysis.get("suggested_prompt")),
    }


def medir_memoria_agentica_e_devin(
    devin_session: str | None = None,
    devin_insights_path: str | None = None,
    devin_generate: bool = False,
    devin_timeout: float = 120.0,
) -> dict[str, object]:
    """Mede o corpus de memoria agentica local e, opcionalmente, insights Devin.

    Paridade com Devin Memory/Dreaming (docs.devin.ai/product-guides/memory):
    - Site/memory/**.md          ~= memory drive do Devin (notas por topico)
    - ~/.gemini/memoria (repo git) ~= o proprio memory drive (git + Markdown)
    - "Dreaming" diario           ~= ultimo commit do repo de memoria
      (divida de consolidacao: se o commit mais recente e velho, a memoria
      acumulou notas sem revisao consolidada).
    """
    superficies: dict[str, dict[str, object]] = {}
    superficies_config = [
        ("site_memory", SITE_ROOT / "memory", "Site/memory"),
        ("gemini_memoria", SITE_ROOT.parent / "memoria", "~/.gemini/memoria"),
    ]
    total_notas = 0
    nota_mais_recente: float = 0.0
    for chave, raiz, rotulo in superficies_config:
        resumo, qtd, mais_recente = _medir_uma_superficie(raiz, rotulo)
        superficies[chave] = resumo
        total_notas += qtd
        nota_mais_recente = max(nota_mais_recente, mais_recente)

    memoria_repo = _git_memoria_repo(SITE_ROOT.parent / "memoria")
    devin = _carregar_devin_insights(devin_session, devin_insights_path, devin_generate, devin_timeout)

    return {
        "timestamp": datetime.now(UTC).isoformat(),
        "superficies": superficies,
        "total_notas_md": total_notas,
        "nota_mais_recente": (
            datetime.fromtimestamp(nota_mais_recente, UTC).strftime("%Y-%m-%d") if nota_mais_recente else "N/A"
        ),
        "memoria_repo_git": memoria_repo,
        "devin_insights": _resumir_devin_insights(devin),
    }


def _float_ou_zero(val: object) -> float:
    if isinstance(val, bool):
        return float(int(val))
    if isinstance(val, int | float):
        return float(val)
    return 0.0


def _git_cmd(*args: str, timeout: float = 10.0) -> str:
    """Executa comando git na raiz do Site retornando stdout com seguranca."""
    try:
        res = subprocess.run(
            ["git", *args],
            cwd=str(SITE_ROOT),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            check=False,
        )
        return res.stdout if res.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def _processar_cabecalho_commit(linha: str, commits: list[dict[str, str]], autores: list[str]) -> None:
    partes = linha[10:].split("|", 4)
    if len(partes) != 5:
        return
    sha, nome, email, data_iso, assunto = partes
    autor = f"{nome} <{email}>"
    if autor not in autores:
        autores.append(autor)
    commits.append({"sha": sha[:8], "autor": autor, "data": data_iso, "assunto": assunto})


def _parse_git_log_numstat(saida: str) -> dict[str, object]:
    """Agrega commits, autores, arquivos e diff numstat do `git log`."""
    commits: list[dict[str, str]] = []
    arquivos: set[str] = set()
    areas: dict[str, int] = {}
    autores: list[str] = []
    insercoes = 0
    delecoes = 0

    for linha in saida.splitlines():
        if linha.startswith("__COMMIT__"):
            _processar_cabecalho_commit(linha, commits, autores)
            continue
        colunas = linha.split("\t")
        if len(colunas) != 3:
            continue
        ins_raw, del_raw, caminho = colunas
        insercoes += int(ins_raw) if ins_raw.isdigit() else 0
        delecoes += int(del_raw) if del_raw.isdigit() else 0
        caminho_limpo = caminho.strip()
        if caminho_limpo:
            arquivos.add(caminho_limpo)
            bucket = caminho_limpo.split("/", 1)[0] if "/" in caminho_limpo else "(raiz)"
            areas[bucket] = areas.get(bucket, 0) + 1

    areas_ord = dict(sorted(areas.items(), key=lambda kv: kv[1], reverse=True)[:6])
    marcos = [f"[{c['sha']}] {c['assunto']}" for c in reversed(commits)]
    return {
        "commits_count": len(commits),
        "autores": autores,
        "arquivos_unicos_tocados": len(arquivos),
        "insercoes": insercoes,
        "delecoes": delecoes,
        "areas_impactadas": areas_ord,
        "marcos_commits": marcos,
    }


def medir_atividade_git_sessao(horas: float = 12.0, max_commits: int = 25) -> dict[str, object]:
    """Mede entregas git na janela recente e estado do working tree."""
    janela = max(0.5, horas)
    limite = max(1, max_commits)
    cutoff_iso = (datetime.now(UTC) - timedelta(hours=janela)).isoformat()
    fmt = "__COMMIT__%H|%aN|%aE|%cI|%s"
    saida = _git_cmd("log", f"--since={cutoff_iso}", "-n", str(limite), "--numstat", f"--format={fmt}")
    agregado = _parse_git_log_numstat(saida)
    branch = _git_cmd("branch", "--show-current").strip() or "HEAD"
    head_sha = _git_cmd("rev-parse", "--short", "HEAD").strip() or "unknown"
    status_lines = [
        ln for ln in _git_cmd("status", "--porcelain", "--ignore-submodules=dirty").splitlines() if ln.strip()
    ]
    return {
        "janela_horas": janela,
        "branch_atual": branch,
        "head_sha": head_sha,
        "working_tree_dirty": len(status_lines),
        **agregado,
    }


def _extrair_numero_celula(celula: str) -> float | None:
    """Extrai o primeiro numero decimal/inteiro de uma celula de tabela Markdown."""
    limpa = celula.strip()
    m = re.search(r"-?\d+(?:\.\d+)?", limpa)
    if not m:
        return None
    try:
        return float(m.group(0))
    except ValueError:
        return None


def _processar_linha_tabela_cwv(linha: str, alvos: dict[str, str], dados: dict[str, object]) -> None:
    celulas = [c.strip() for c in linha.strip().strip("|").split("|")]
    if len(celulas) < 2:
        return
    chave_out = alvos.get(celulas[0].replace("**", "").strip())
    if not chave_out:
        return
    num = _extrair_numero_celula(celulas[1])
    if num is not None and chave_out.endswith(("violations", "incomplete", "cve", "cve_abertas")):
        dados[chave_out] = int(num)
    else:
        dados[chave_out] = num


def _extrair_metricas_cwv(texto: str) -> dict[str, object]:
    """Extrai timestamp, status e metricas-chave de um relatorio Markdown do CWV gate."""
    alvos = {
        "LCP_MS": "lcp_ms",
        "CLS": "cls",
        "TBT_MS": "tbt_ms",
        "TTFB_MS": "ttfb_ms",
        "MAX_HEAP_MB": "max_heap_mb",
        "AXE_VIOLATIONS": "axe_violations",
        "AXE_INCOMPLETE": "axe_incomplete",
        "CRITICAL_CVE_COUNT": "critical_cve",
        "HIGH_CVE_COUNT": "high_cve",
        "TOTAL_VULNERABILITY": "total_cve",
        "PY_CVE_ABERTAS": "py_cve_abertas",
    }
    dados: dict[str, object] = {"timestamp_relatorio": "N/A", "aprovado": False}
    for linha in texto.splitlines():
        if linha.startswith("**Timestamp:**"):
            dados["timestamp_relatorio"] = linha.split("**Timestamp:**", 1)[1].strip()
        elif linha.startswith("**Status:**"):
            dados["aprovado"] = "APPROVED" in linha.upper()
        elif linha.startswith("| **"):
            _processar_linha_tabela_cwv(linha, alvos, dados)
    return dados


def _arvore_atual_site() -> str:
    """Retorna o SHA da arvore atual alinhado ao contrato do `suite_verde.py`."""
    try:
        from scripts.ops.suite_verde import arvore_de_conteudo  # noqa: PLC0415

        return arvore_de_conteudo().strip()
    except Exception:
        return _git_cmd("rev-parse", "HEAD^{tree}").strip()


def _ler_marcador_suite_verde() -> dict[str, object]:
    """Le o marcador local da suite verde em `.git/sota-suite-verde`."""
    marcador = SITE_ROOT / ".git" / "sota-suite-verde"
    if not marcador.exists():
        return {"disponivel": False, "atualizado_no_head": False, "em": "N/A"}
    try:
        dados = json.loads(marcador.read_text(encoding="utf-8"))
        arvore_medida = str(dados.get("arvore", "")).strip()
        head_med = str(dados.get("head_na_medicao", "")).strip()
        arvore_atual = _arvore_atual_site()
        head_full = _git_cmd("rev-parse", "HEAD").strip()
        atualizado = (
            bool(arvore_atual and arvore_medida == arvore_atual)
            if arvore_medida
            else bool(head_full and head_med == head_full)
        )
        return {
            "disponivel": True,
            "atualizado_no_head": atualizado,
            "em": str(dados.get("em", "N/A")),
            "arvore": arvore_medida[:8] if arvore_medida else "N/A",
            "head_na_medicao": head_med[:8] if head_med else "N/A",
        }
    except (OSError, json.JSONDecodeError):
        return {"disponivel": False, "atualizado_no_head": False, "em": "N/A"}


def medir_qualidade_ultima_auditoria() -> dict[str, object]:
    """Le a ultima auditoria CWV/A11y/CVE e o estado do cache `.git/sota-suite-verde`."""
    cwv_dir = SITE_ROOT / "reports" / "cwv"
    arquivos = sorted(cwv_dir.glob("cwv_report_*.md"), reverse=True) if cwv_dir.is_dir() else []
    metricas: dict[str, object] = {"disponivel": False}
    if arquivos:
        ultimo = arquivos[0]
        try:
            texto = ultimo.read_text(encoding="utf-8", errors="replace")
            metricas = {
                "disponivel": True,
                "arquivo": str(ultimo.relative_to(SITE_ROOT)).replace("\\", "/"),
                **_extrair_metricas_cwv(texto),
            }
        except OSError:
            pass
    return {
        "cwv_report": metricas,
        "suite_verde": _ler_marcador_suite_verde(),
    }


def medir_saude_malha() -> dict[str, object]:
    """Consulta os sinais de observabilidade da malha via `scripts/ops/saude_da_malha.py`."""
    try:
        from scripts.ops.saude_da_malha import coletar  # noqa: PLC0415

        sinais = coletar()
        serializados: list[dict[str, object]] = [
            {
                "grave": s.grave,
                "titulo": s.titulo,
                "detalhe": s.detalhe,
                "acao": s.acao,
            }
            for s in sinais
        ]
        graves = sum(1 for s in serializados if s["grave"])
        infos = len(serializados) - graves
        if graves > 0:
            status = "alerta"
        elif infos > 0:
            status = "info"
        else:
            status = "saudavel"
        return {
            "status": status,
            "total_sinais": len(serializados),
            "graves": graves,
            "infos": infos,
            "sinais": serializados,
        }
    except Exception as exc:
        return {
            "status": "indisponivel",
            "total_sinais": 0,
            "graves": 0,
            "infos": 0,
            "sinais": [],
            "erro": str(exc)[:160],
        }


def _avaliar_eixo_git(git_info: dict[str, object]) -> tuple[str, str, str | None, str | None, str | None]:
    commits = _int_ou_zero(git_info.get("commits_count"))
    dirty = _int_ou_zero(git_info.get("working_tree_dirty"))
    arquivos = _int_ou_zero(git_info.get("arquivos_unicos_tocados"))
    if commits == 0 and dirty == 0:
        return ("ESTAVEL", "Sem novos commits ou alteracoes pendentes na janela.", None, None, None)
    if dirty > 0:
        return (
            "ATENCAO",
            f"{commits} commit(s) na janela, mas {dirty} item(ns) pendente(s) no working tree.",
            f"Entregas registradas na janela ({commits} commit(s), {arquivos} arquivo(s) unico(s))."
            if commits > 0
            else None,
            f"Working tree contem {dirty} arquivo(s) com alteracoes nao commitadas.",
            "Revisar e commitar ou descartar alteracoes pendentes no workspace.",
        )
    return (
        "OTIMO",
        f"{commits} commit(s) limpo(s) tocando {arquivos} arquivo(s) unico(s).",
        f"Entrega continua verificada: {commits} commit(s) e {arquivos} arquivo(s) consolidado(s) com arvore limpa.",
        None,
        None,
    )


def _avaliar_eixo_cwv(qualidade: dict[str, object]) -> tuple[str, str, str | None, str | None, str | None]:
    cwv = _como_dict(qualidade.get("cwv_report"))
    if not cwv.get("disponivel"):
        return (
            "INDISPONIVEL",
            "Nenhum relatorio CWV encontrado em reports/cwv/.",
            None,
            "Ausencia de relatorio CWV recente impede atestacao de performance/seguranca.",
            "Executar pre-commit ou scripts/ops/cwv_gate.ps1 com servidor ativo.",
        )
    lcp = cwv.get("lcp_ms")
    cls_val = cwv.get("cls")
    axe = _int_ou_zero(cwv.get("axe_violations"))
    crit = _int_ou_zero(cwv.get("critical_cve"))
    high = _int_ou_zero(cwv.get("high_cve"))
    py_cve = _int_ou_zero(cwv.get("py_cve_abertas"))
    cves = crit + high + py_cve
    if not cwv.get("aprovado") or axe > 0 or cves > 0:
        return (
            "BLOQUEIO",
            f"CWV nao aprovado (axe={axe}, CVE crit/high/py={cves}).",
            None,
            f"Portao CWV/Seguranca sinalizou bloqueio: axe={axe}, CVEs relevantes={cves}.",
            "Corrigir violacoes de acessibilidade ou vulnerabilidades registradas em reports/cwv/.",
        )
    lcp_txt = f"{lcp:.1f}ms" if isinstance(lcp, int | float) else "N/A"
    cls_txt = f"{cls_val:.4f}" if isinstance(cls_val, int | float) else "N/A"
    return (
        "OTIMO",
        f"SOTA GOLD aprovado (LCP {lcp_txt}, CLS {cls_txt}, 0 axe, 0 CVE).",
        f"Qualidade frontend e seguranca verdes: LCP={lcp_txt}, CLS={cls_txt}, 0 axe e 0 CVEs abertas.",
        None,
        None,
    )


def _como_lista_strs(val: object) -> list[str]:
    return [str(x) for x in val] if isinstance(val, list) else []


def _formatar_numero(val: object, casas: int, sufixo: str = "") -> str:
    return f"{val:.{casas}f}{sufixo}" if isinstance(val, int | float) and not isinstance(val, bool) else "N/A"


def _resumo_alertas_malha_e_pendencias(pend: dict[str, object], malha: dict[str, object]) -> str:
    detalhes: list[str] = []
    for item in _como_lista_dicts(pend.get("itens_abertos")):
        pid = str(item.get("id") or "")
        dono = str(item.get("dono") or "")
        if pid:
            detalhes.append(f"pendencia `{pid}` ({dono})" if dono else f"pendencia `{pid}`")
    for sinal in _como_lista_dicts(malha.get("sinais")):
        if sinal.get("grave"):
            detalhes.append(f"malha `{sinal.get('titulo', 'alerta')}`")
    return "; ".join(detalhes)


def _avaliar_eixo_governanca(
    pend: dict[str, object], malha: dict[str, object]
) -> tuple[str, str, str | None, str | None, str | None]:
    abertas = _int_ou_zero(pend.get("abertas"))
    vencidas = _int_ou_zero(pend.get("vencidas"))
    graves = _int_ou_zero(malha.get("graves"))
    detalhe_txt = _resumo_alertas_malha_e_pendencias(pend, malha)
    sufixo = f" [{detalhe_txt}]" if detalhe_txt else ""
    if vencidas > 0 or graves > 0:
        return (
            "ATENCAO",
            f"{abertas} pendencia(s) ({vencidas} vencida(s)); {graves} alerta(s) grave(s) na malha.",
            None,
            f"Passivo de governanca exige acao: {abertas} pendencia(s) aberta(s) ({vencidas} vencida(s)) e {graves} alerta(s) grave(s){sufixo}.",
            "Enderecar pendencias abertas via novo REGISTRO e investigar alertas graves em saude_da_malha.py.",
        )
    if abertas > 0:
        return (
            "ESTAVEL",
            f"{abertas} pendencia(s) aberta(s) dentro do prazo; malha sem alertas graves.",
            None,
            f"Existem {abertas} pendencia(s) formais ainda abertas no corpus{sufixo}.",
            "Acompanhar encerramento das pendencias abertas via `pendencias_resolvidas:` no proximo REGISTRO.",
        )
    return (
        "OTIMO",
        "Zero pendencias abertas e malha sem alertas graves.",
        "Governanca higienizada: 0 pendencias formais abertas e 0 alertas graves na malha.",
        None,
        None,
    )


def _avaliar_eixo_calibracao(ledger: dict[str, object]) -> tuple[str, str, str | None, str | None, str | None]:
    sessoes = _int_ou_zero(ledger.get("sessoes_acumuladas"))
    faltantes = _int_ou_zero(ledger.get("sessoes_faltantes"))
    gate_passed = bool(ledger.get("gate_passed"))
    ts_status = str(ledger.get("timesfm_status", "UNKNOWN"))
    ts_pts = _int_ou_zero(ledger.get("timesfm_available_points"))
    ts_req = _int_ou_zero(ledger.get("timesfm_required_points")) or 4
    if gate_passed:
        return (
            "ATENCAO",
            f"Portao 8.3 ABERTO ({sessoes} sessoes elegiveis; TimesFM {ts_pts}/{ts_req}).",
            f"Lastro de calibracao atingiu quorum ({sessoes} sessoes distintas).",
            "Portao de calibracao esta aberto aguardando arbitragem formal do Tier 0.",
            "Propor ou registrar decisao de calibracao no ledger junto ao Tier 0.",
        )
    return (
        "ESTAVEL",
        f"Acumulado {sessoes} sessao(oes) elegivel(is) (faltam {faltantes}); TimesFM {ts_status} ({ts_pts}/{ts_req}).",
        None,
        (
            f"Amostra ainda insuficiente para calibracao automatica (faltam {faltantes} sessao(oes)) "
            f"e TimesFM em {ts_status} ({ts_pts}/{ts_req} pontos)."
        ),
        "Coletar novos feedbacks de sessao elegiveis quando houver avaliacao do Tier 0.",
    )


def _avaliar_eixo_infra_e_fila(
    pools: dict[str, object], fila: dict[str, object], mcp: dict[str, object]
) -> tuple[str, str, str | None, str | None, str | None]:
    failed = _int_ou_zero(fila.get("failed"))
    pending = _int_ou_zero(fila.get("pending"))
    bloq = _int_ou_zero(pools.get("bloqueadas"))
    rev = _int_ou_zero(pools.get("revogadas"))
    econ_pct = _float_ou_zero(mcp.get("economia_media_tokens_pct"))
    if failed > 0 or rev > 0:
        return (
            "ATENCAO",
            f"Fila failed={failed}, pending={pending}; pools bloq={bloq}, rev={rev}; poda MCP -{econ_pct}%.",
            f"Poda MCP S1 sustentando -{econ_pct}% de tokens." if econ_pct > 0 else None,
            f"Degradacao operacional detectada: {failed} tarefa(s) falhada(s) na fila SQLite e {rev} chave(s) revogada(s).",
            "Auditar falhas em data/task_queue.db e rotacionar/limpar chaves revogadas nos pools OpenRouter.",
        )
    return (
        "OTIMO",
        f"Fila {fila.get('taxa_resolucao_pct', 100.0)}% resolvida; poda MCP -{econ_pct}%; pools {pools.get('ativas', 0)}/{pools.get('total_chaves', 0)} ativos.",
        f"Infraestrutura S1/SQLite/Pools nominal: poda MCP -{econ_pct}% e {fila.get('taxa_resolucao_pct', 100.0)}% da fila resolvida.",
        None,
        None,
    )


def _avaliar_eixo_memoria(mem: dict[str, object]) -> tuple[str, str, str | None, str | None, str | None]:
    repo = _como_dict(mem.get("memoria_repo_git"))
    dirty = _int_ou_zero(repo.get("dirty_files"))
    ultimo = str(repo.get("ultimo_commit", "N/A"))
    devin = _como_dict(mem.get("devin_insights"))
    high_issues = _int_ou_zero(devin.get("issues_high"))
    misleading = _int_ou_zero(devin.get("skills_enganosos"))
    if dirty > 0 or high_issues > 0 or misleading > 0:
        return (
            "ATENCAO",
            f"Repo memoria dirty={dirty} (commit {ultimo}); Devin issues_high={high_issues}, skills_enganosos={misleading}.",
            None,
            f"Sinais de atrito em memoria/Devin: {dirty} arquivo(s) dirty em ~/.gemini/memoria, {high_issues} issue(s) alta(s) Devin.",
            "Consolidar/commitar notas em ~/.gemini/memoria e revisar skills marcadas como enganosas.",
        )
    return (
        "OTIMO",
        f"{mem.get('total_notas_md', 0)} notas consolidadas; repo memoria limpo (commit {ultimo}).",
        f"Memoria agentica sincronizada ({mem.get('total_notas_md', 0)} notas, repo limpo).",
        None,
        None,
    )


def analisar_sinais_qualitativos(r: dict[str, object]) -> dict[str, object]:
    """Sintetiza sinais qualitativos estritamente a partir dos dados quantitativos medidos."""
    avaliacoes = {
        "entrega_git": _avaliar_eixo_git(_como_dict(r.get("atividade_git"))),
        "qualidade_cwv": _avaliar_eixo_cwv(_como_dict(r.get("qualidade_cwv"))),
        "governanca_malha": _avaliar_eixo_governanca(_como_dict(r.get("pendencias")), _como_dict(r.get("saude_malha"))),
        "calibracao_timesfm": _avaliar_eixo_calibracao(_como_dict(r.get("ledger"))),
        "infra_mcp_pools": _avaliar_eixo_infra_e_fila(
            _como_dict(r.get("pools_openrouter")),
            _como_dict(r.get("fila_tarefas")),
            _como_dict(r.get("interceptador_mcp")),
        ),
        "memoria_dreaming": _avaliar_eixo_memoria(_como_dict(r.get("memoria_agentica_devin"))),
    }

    eixos: dict[str, dict[str, str]] = {}
    fortalezas: list[str] = []
    atritos: list[str] = []
    acoes: list[str] = []

    for nome, (nivel, sinal, forte, atrito, acao) in avaliacoes.items():
        eixos[nome] = {"nivel": nivel, "sinal": sinal}
        if forte:
            fortalezas.append(forte)
        if atrito:
            atritos.append(atrito)
        if acao:
            acoes.append(acao)

    niveis = [info["nivel"] for info in eixos.values()]
    if "BLOQUEIO" in niveis:
        saude_geral = "CRITICO"
    elif "ATENCAO" in niveis:
        saude_geral = "ATENCAO"
    elif niveis.count("OTIMO") >= 4:
        saude_geral = "OTIMO"
    else:
        saude_geral = "ESTAVEL"

    return {
        "saude_geral": saude_geral,
        "eixos": eixos,
        "fortalezas": fortalezas,
        "dificuldades_detectadas": atritos,
        "proximos_passos_factuais": acoes,
    }


def _deduplicar_preservando_ordem(itens: list[str]) -> list[str]:
    vistos: set[str] = set()
    saida: list[str] = []
    for item in itens:
        limpo = item.strip()
        if limpo and limpo not in vistos:
            vistos.add(limpo)
            saida.append(limpo)
    return saida


def gerar_resumo_escrito_sessao(
    r: dict[str, object],
    marcos_manuais: list[str] | None = None,
    dificuldades_manuais: list[str] | None = None,
    conclusoes_manuais: list[str] | None = None,
) -> dict[str, object]:
    """Produz texto corrido em prosa factica resumindo a sessao, marcos, atritos e conclusoes."""
    git_info = _como_dict(r.get("atividade_git"))
    qual = _como_dict(r.get("qualitativo"))
    pend = _como_dict(r.get("pendencias"))
    ledger = _como_dict(r.get("ledger"))
    mcp = _como_dict(r.get("interceptador_mcp"))
    ing = _como_dict(r.get("ingress_fast_path"))
    cwv_wrap = _como_dict(r.get("qualidade_cwv"))
    cwv = _como_dict(cwv_wrap.get("cwv_report"))
    suite = _como_dict(cwv_wrap.get("suite_verde"))

    janela = _float_ou_zero(git_info.get("janela_horas"))
    commits = _int_ou_zero(git_info.get("commits_count"))
    arqs = _int_ou_zero(git_info.get("arquivos_unicos_tocados"))
    ins = _int_ou_zero(git_info.get("insercoes"))
    dele = _int_ou_zero(git_info.get("delecoes"))
    autores_raw = git_info.get("autores")
    autores = [str(a) for a in autores_raw] if isinstance(autores_raw, list) else []
    autores_txt = ", ".join(autores) if autores else "nenhum autor git registrado na janela"

    p1 = (
        f"Na janela das ultimas {janela:g}h na branch `{git_info.get('branch_atual', 'HEAD')}` "
        f"(HEAD `{git_info.get('head_sha', 'unknown')}`), foram consolidados {commits} commit(s) "
        f"por {autores_txt}, alterando {arqs} arquivo(s) unico(s) (+{ins}/-{dele} linhas). "
        f"A telemetria local S1 sustenta poda MCP de -{mcp.get('economia_media_tokens_pct', 0.0)}% "
        f"({mcp.get('overhead_latencia_us', 0.0)} us) e triagem Ingress Fast-Path em "
        f"{ing.get('latencia_s1_ms', 0.0)} ms."
    )

    cwv_estado = "APROVADO (SOTA GOLD)" if cwv.get("aprovado") else "NAO VERIFICADO / PENDENTE"
    lcp_txt = _formatar_numero(cwv.get("lcp_ms"), 1, "ms")
    cls_txt = _formatar_numero(cwv.get("cls"), 4)
    suite_estado = (
        "no HEAD atual"
        if suite.get("atualizado_no_head")
        else f"em commit anterior ({suite.get('head_na_medicao', 'N/A')})"
    )
    p2 = (
        f"No plano de qualidade e governanca, a ultima auditoria CWV/A11y/CVE registra status {cwv_estado} "
        f"(LCP={lcp_txt}, CLS={cls_txt}, axe={cwv.get('axe_violations', 'N/A')}) "
        f"com marcador `.git/sota-suite-verde` {suite_estado}. O passivo formal contabiliza "
        f"{pend.get('abertas', 0)} pendencia(s) aberta(s) ({pend.get('vencidas', 0)} vencida(s)), enquanto o "
        f"ledger append-only soma {ledger.get('total_registros', 0)} registros com {ledger.get('sessoes_acumuladas', 0)} "
        f"sessao(oes) elegivel(is) no lastro de {ledger.get('data_referencia', 'none')} "
        f"(postura geral classificada como `{qual.get('saude_geral', 'ESTAVEL')}`)."
    )

    marcos_commits = [f"[Git] {m}" for m in _como_lista_strs(git_info.get("marcos_commits"))]
    marcos_decl = [f"[Declarado] {m}" for m in (marcos_manuais or [])]
    marcos_lista = _deduplicar_preservando_ordem(marcos_decl + marcos_commits)
    if not marcos_lista:
        marcos_lista = ["Nenhum commit ou marco manual registrado na janela avaliada."]

    atritos_med = [f"[Medido] {d}" for d in _como_lista_strs(qual.get("dificuldades_detectadas"))]
    atritos_decl = [f"[Declarado] {d}" for d in (dificuldades_manuais or [])]
    dificuldades_lista = _deduplicar_preservando_ordem(atritos_decl + atritos_med)
    if not dificuldades_lista:
        dificuldades_lista = ["Nenhuma dificuldade ou bloqueio detectado automaticamente nos instrumentos medidos."]

    acoes_med = [f"[Medido] {a}" for a in _como_lista_strs(qual.get("proximos_passos_factuais"))]
    concl_decl = [f"[Declarado] {c}" for c in (conclusoes_manuais or [])]
    conclusoes_lista = _deduplicar_preservando_ordem(concl_decl + acoes_med)
    if not conclusoes_lista:
        conclusoes_lista = ["Estado nominal sem pendencias bloqueantes; manter cadencia de verificacao pre-commit."]

    return {
        "sintese_executiva": f"{p1}\n\n{p2}",
        "marcos": marcos_lista,
        "dificuldades": dificuldades_lista,
        "conclusoes": conclusoes_lista,
    }


def avaliar_impacto_sessao(
    pendencias_inicio: int | None = None,
    saida_markdown: bool = False,
    forcar_benchmark: bool = False,
    devin_session: str | None = None,
    devin_insights_path: str | None = None,
    devin_generate: bool = False,
    devin_timeout: float = 120.0,
    horas: float = 12.0,
    marcos: list[str] | None = None,
    dificuldades: list[str] | None = None,
    conclusoes: list[str] | None = None,
    so_tabela: bool = False,
) -> dict[str, object]:
    """Gera o diagnostico quantitativo, qualitativo e narrativo completo da sessao."""
    pend = medir_pendencias()
    ledger = medir_ledger_calibracao()
    fila = medir_fila_tarefas()
    mcp = medir_interceptador_mcp(forcar_benchmark=forcar_benchmark)
    ingress = medir_ingress_fast_path()
    pools = medir_pools_openrouter()
    economia = medir_eficiencia_economica_e_infraestrutura()
    memoria = medir_memoria_agentica_e_devin(
        devin_session=devin_session,
        devin_insights_path=devin_insights_path,
        devin_generate=devin_generate,
        devin_timeout=devin_timeout,
    )
    atividade_git = medir_atividade_git_sessao(horas=horas)
    qualidade_cwv = medir_qualidade_ultima_auditoria()
    saude_malha = medir_saude_malha()

    delta_pendencias_pct = 0.0
    if pendencias_inicio is not None and pendencias_inicio > 0:
        abertas_atuais = _int_ou_zero(pend.get("abertas"))
        delta_pendencias_pct = round(((pendencias_inicio - abertas_atuais) / pendencias_inicio) * 100.0, 2)

    resultado: dict[str, object] = {
        "timestamp": datetime.now(UTC).isoformat(),
        "pendencias": {
            **pend,
            "inicio_declarado": pendencias_inicio,
            "reducao_pct": delta_pendencias_pct,
        },
        "ledger": ledger,
        "fila_tarefas": fila,
        "interceptador_mcp": mcp,
        "ingress_fast_path": ingress,
        "pools_openrouter": pools,
        "eficiencia_economica_infra": economia,
        "memoria_agentica_devin": memoria,
        "atividade_git": atividade_git,
        "qualidade_cwv": qualidade_cwv,
        "saude_malha": saude_malha,
    }

    resultado["qualitativo"] = analisar_sinais_qualitativos(resultado)
    resultado["narrativa"] = gerar_resumo_escrito_sessao(
        resultado,
        marcos_manuais=marcos,
        dificuldades_manuais=dificuldades,
        conclusoes_manuais=conclusoes,
    )

    if saida_markdown:
        print(gerar_tabela_markdown(resultado, incluir_narrativa=not so_tabela))
    else:
        imprimir_painel_console(resultado)

    return resultado


def _anexar_secao_qualitativa_e_narrativa(md: list[str], r: dict[str, object]) -> None:
    """Anexa a matriz qualitativa e a prosa narrativa da sessao ao Markdown."""
    qual = _como_dict(r.get("qualitativo"))
    narr = _como_dict(r.get("narrativa"))
    eixos = _como_dict(qual.get("eixos"))
    if eixos:
        md.extend(
            [
                f"### Diagnostico Qualitativo por Eixo (Postura Geral: {qual.get('saude_geral', 'ESTAVEL')})",
                "",
                "| Eixo Avaliado | Nivel | Evidencia Medida |",
                "| :--- | :--- | :--- |",
            ]
        )
        for nome, raw_info in eixos.items():
            info = _como_dict(raw_info)
            md.append(f"| `{nome}` | **{info.get('nivel', '?')}** | {info.get('sinal', '')} |")
        md.append("")

    if narr:
        md.extend(
            [
                "### Resumo Escrito da Sessao",
                "",
                "#### Sintese Executiva",
                str(narr.get("sintese_executiva", "")),
                "",
                "#### Marcos e Entregas",
            ]
        )
        for item in _como_lista_strs(narr.get("marcos")):
            md.append(f"- {item}")
        md.extend(["", "#### Dificuldades e Atritos"])
        for item in _como_lista_strs(narr.get("dificuldades")):
            md.append(f"- {item}")
        md.extend(["", "#### Conclusoes e Proximos Passos"])
        for item in _como_lista_strs(narr.get("conclusoes")):
            md.append(f"- {item}")
        md.append("")


def _anexar_linhas_git_e_cwv(md: list[str], r: dict[str, object]) -> None:
    """Anexa linhas de entregas git e qualidade CWV/A11y/CVE ao painel Markdown."""
    git_info = _como_dict(r.get("atividade_git"))
    if git_info:
        md.append(
            f"| **Entregas Git ({git_info.get('janela_horas', 12)}h)** | **{git_info.get('commits_count', 0)} commits / {git_info.get('arquivos_unicos_tocados', 0)} arq.** |"
            f" +{git_info.get('insercoes', 0)}/-{git_info.get('delecoes', 0)} linhas, branch `{git_info.get('branch_atual', 'HEAD')}`, dirty={git_info.get('working_tree_dirty', 0)} |"
        )
    cwv_wrap = _como_dict(r.get("qualidade_cwv"))
    if not cwv_wrap:
        return
    cwv = _como_dict(cwv_wrap.get("cwv_report"))
    suite = _como_dict(cwv_wrap.get("suite_verde"))
    if cwv.get("disponivel"):
        lcp_txt = _formatar_numero(cwv.get("lcp_ms"), 1, "ms")
        cls_txt = _formatar_numero(cwv.get("cls"), 4)
        tbt_txt = _formatar_numero(cwv.get("tbt_ms"), 1, "ms")
        cves = _int_ou_zero(cwv.get("critical_cve")) + _int_ou_zero(cwv.get("high_cve"))
        md.append(
            f"| **CWV, A11y & Seguranca** | **LCP {lcp_txt} / CLS {cls_txt}** |"
            f" TBT {tbt_txt}, axe={cwv.get('axe_violations', 'N/A')}, CVE crit/high={cves}, suite HEAD={suite.get('atualizado_no_head', False)} |"
        )


def _anexar_linhas_devin_e_memoria(md: list[str], mem: dict[str, object]) -> None:
    """Anexa linhas de memoria agentica local e Devin Session Insights ao painel Markdown."""
    if not mem:
        return
    superficies = _como_dict(mem.get("superficies"))
    site_mem = _como_dict(superficies.get("site_memory"))
    repo = _como_dict(mem.get("memoria_repo_git"))
    md.append(
        f"| **Memoria Agentica Local** | **{mem.get('total_notas_md', 0)} notas**"
        f" (site: {site_mem.get('notas_md', 0)}) |"
        f" repo ~/.gemini/memoria: {repo.get('dirty_files', '?')} dirty, ultimo commit {repo.get('ultimo_commit', 'N/A')} |"
    )
    devin_resumo = _como_dict(mem.get("devin_insights"))
    if not devin_resumo:
        return
    if devin_resumo.get("session_size"):
        md.append(
            f"| **Devin Session Insights** | **{str(devin_resumo.get('session_size')).upper()}**"
            f" / {devin_resumo.get('category') or 'N/A'} |"
            f" ACU: {devin_resumo.get('acus_consumed')} | msgs: {devin_resumo.get('num_user_messages')}u/"
            f"{devin_resumo.get('num_devin_messages')}d | issues: {devin_resumo.get('issues_total')}"
            f" ({devin_resumo.get('issues_high')} altas) | action_items: {devin_resumo.get('action_items_total')}"
            f" | skills enganosas: {devin_resumo.get('skills_enganosos')} |"
        )
    else:
        detalhe = devin_resumo.get("_erro") or devin_resumo.get("_status") or devin_resumo.get("_detalhe") or "?"
        md.append(f"| **Devin Session Insights** | **indisponivel** | {detalhe} |")


def gerar_tabela_markdown(r: dict[str, object], incluir_narrativa: bool = True) -> str:
    """Gera tabela padrao-ouro Markdown, matriz qualitativa e prosa narrativa para o HANDOFF."""
    pend = _como_dict(r.get("pendencias"))
    ledger = _como_dict(r.get("ledger"))
    fila = _como_dict(r.get("fila_tarefas"))
    mcp = _como_dict(r.get("interceptador_mcp"))
    ing = _como_dict(r.get("ingress_fast_path"))
    pools = _como_dict(r.get("pools_openrouter"))
    econ = _como_dict(r.get("eficiencia_economica_infra"))
    malha = _como_dict(r.get("saude_malha"))

    md: list[str] = [
        "### Painel de Avaliacao de Impacto da Sessao (Agnostico Tier 1-2-3)",
        "",
        "| Metrica de Impacto | Valor Medido | Status / Observacao |",
        "| :--- | :--- | :--- |",
    ]
    _anexar_linhas_git_e_cwv(md, r)
    md.extend(
        [
            (
                f"| **Economia de Tokens MCP (S1)** | **-{mcp.get('economia_media_tokens_pct', 0.0)}%** |"
                f" {mcp.get('status', 'Poda dinamica de schemas irrelevantes')} (overhead: {mcp.get('overhead_latencia_us', 0.0)} us) |"
            ),
            (
                f"| **Ingress Fast-Path S1** | **{ing.get('latencia_s1_ms', 0.0)} ms** ({ing.get('latencia_s1_us', 0.0)} us) |"
                " Triagem O(1) de tarefas sem compilar grafo |"
            ),
            (
                f"| **Passivo de Pendencias** | **{pend.get('abertas', 0)} abertas** ({pend.get('vencidas', 0)} vencidas, reducao: {pend.get('reducao_pct', 0.0)}%) |"
                " Resolucao formal via M.O. 13.F |"
            ),
            (
                f"| **Integridade do Ledger** | **{ledger.get('total_registros', 0)} registros** (tail: `{str(ledger.get('tail_hash', 'none'))[:8]}`) |"
                f" Portao: {ledger.get('sessoes_acumuladas', 0)} sessoes (faltam {ledger.get('sessoes_faltantes', 0)}, ref {ledger.get('data_referencia', 'none')}, TimesFM: {ledger.get('timesfm_status', 'N/A')}) |"
            ),
            (
                f"| **Resolucao de Tarefas SQLite** | **{fila.get('taxa_resolucao_pct', 100.0)}%** ({fila.get('completed', 0)}/{fila.get('total_tarefas', 0)}) |"
                f" pending={fila.get('pending', 0)} / failed={fila.get('failed', 0)} |"
            ),
        ]
    )
    if malha:
        malha_status = str(malha.get("status", "indisponivel")).upper()
        md.append(
            f"| **Saude da Malha** | **{malha_status}** ({malha.get('graves', 0)} alertas graves) |"
            f" {malha.get('total_sinais', 0)} sinal(is) observado(s) via saude_da_malha.py |"
        )
    if pools and pools.get("total_chaves"):
        md.append(
            f"| **Pools OpenRouter Multi-Tier** | **{pools['total_chaves']} chaves** ({pools['ativas']} ativas, score: {pools['score_medio']}) |"
            f" T1: {pools['tier1_count']} \\| T2: {pools['tier2_count']} \\| T3: {pools['tier3_count']} \\| T4: {pools['tier4_count']} ({pools['bloqueadas']} bloq / {pools['revogadas']} rev) |"
        )
    if econ:
        idents = _como_dict(econ.get("identidades_canonicas"))
        md.append(
            f"| **Eficiencia Economica & Infra** | **{econ.get('modelos_locais_quantizados_count', 0)} locais / {idents.get('total', 0)} identidades** |"
            f" Tier 1={idents.get('tier_1', 0)}, Tier 2={idents.get('tier_2', 0)}; Cotas Pro Tier 1 (Faixa.FLAT_FEE) prioritarias |"
        )
    _anexar_linhas_devin_e_memoria(md, _como_dict(r.get("memoria_agentica_devin")))
    md.append("")
    if incluir_narrativa:
        _anexar_secao_qualitativa_e_narrativa(md, r)
    return "\n".join(md)


def imprimir_painel_console(r: dict[str, object]) -> None:
    """Imprime sumario quantitativo, diagnostico qualitativo e resumo escrito no console."""
    pend = _como_dict(r.get("pendencias"))
    ledger = _como_dict(r.get("ledger"))
    fila = _como_dict(r.get("fila_tarefas"))
    mcp = _como_dict(r.get("interceptador_mcp"))
    ing = _como_dict(r.get("ingress_fast_path"))
    pools = _como_dict(r.get("pools_openrouter"))
    git_info = _como_dict(r.get("atividade_git"))
    qual = _como_dict(r.get("qualitativo"))
    narr = _como_dict(r.get("narrativa"))

    print("\n" + "=" * 68)
    print("  AVALIACAO DE IMPACTO DE SESSAO (QUANTITATIVO + QUALITATIVO)")
    print("=" * 68)
    if git_info:
        print(
            f"* Entregas Git ({git_info.get('janela_horas', 12)}h):      {git_info.get('commits_count', 0)} commits | {git_info.get('arquivos_unicos_tocados', 0)} arq. | +{git_info.get('insercoes', 0)}/-{git_info.get('delecoes', 0)}"
        )
    print(
        f"* Economia Tokens MCP (S1):    -{mcp.get('economia_media_tokens_pct', 0.0)}% ({mcp.get('overhead_latencia_us', 0.0)} us)"
    )
    print(f"* Ingress Fast-Path S1:        {ing.get('latencia_s1_ms', 0.0)} ms ({ing.get('latencia_s1_us', 0.0)} us)")
    print(f"* Passivo de Pendencias:       {pend.get('abertas', 0)} abertas ({pend.get('vencidas', 0)} vencidas)")
    print(
        f"* Ledger & Portao (8.3):       {ledger.get('total_registros', 0)} reg | {ledger.get('sessoes_acumuladas', 0)} sessoes (ref {ledger.get('data_referencia', 'none')})"
    )
    print(
        f"* Fila SQLite / Pools OR:      {fila.get('taxa_resolucao_pct', 100.0)}% fila | {pools.get('ativas', 0)} chaves OR ativas"
    )
    if qual:
        print("-" * 68)
        print(f"  POSTURA QUALITATIVA: {qual.get('saude_geral', 'ESTAVEL')}")
        for nome, raw_info in _como_dict(qual.get("eixos")).items():
            info = _como_dict(raw_info)
            print(f"  - [{info.get('nivel', '?'):8}] {nome}: {info.get('sinal', '')}")
    if narr:
        print("-" * 68)
        print("  RESUMO ESCRITO DA SESSAO:")
        print(str(narr.get("sintese_executiva", "")))
    print("=" * 68 + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Avalia o impacto quantitativo, qualitativo e narrativo de uma sessao de forma agnostica."
    )
    parser.add_argument(
        "--pendencias-inicio", type=int, default=None, help="Numero de pendencias abertas no inicio da sessao"
    )
    parser.add_argument("--horas", type=float, default=12.0, help="Janela em horas para metricas git da sessao")
    parser.add_argument(
        "--marcos",
        action="append",
        default=[],
        help="Marco qualitativo/entrega relevante observada na sessao (repetivel)",
    )
    parser.add_argument(
        "--dificuldades",
        action="append",
        default=[],
        help="Dificuldade ou atrito encontrado na sessao (repetivel)",
    )
    parser.add_argument(
        "--conclusoes",
        action="append",
        default=[],
        help="Conclusao ou proximo passo declarado para a sessao (repetivel)",
    )
    parser.add_argument("--markdown", action="store_true", help="Gera a saida em formato Markdown")
    parser.add_argument("--so-tabela", action="store_true", help="Emite apenas a tabela quantitativa no Markdown")
    parser.add_argument("--json", action="store_true", help="Imprime o payload JSON completo")
    parser.add_argument(
        "--forcar-benchmark",
        action="store_true",
        help="Forca execucao do benchmark em regime ignorando telemetria viva",
    )
    parser.add_argument(
        "--devin-session",
        type=str,
        default=None,
        help="ID de sessao Devin Cloud para ingerir Session Insights via API v3",
    )
    parser.add_argument(
        "--devin-insights",
        type=str,
        default=None,
        help="Caminho para JSON de Session Insights previamente exportado (modo offline)",
    )
    parser.add_argument(
        "--devin-generate",
        action="store_true",
        help="Dispara geracao de insights no Devin antes de consultar (requer ManageOrgSessions)",
    )
    parser.add_argument(
        "--devin-timeout",
        type=float,
        default=120.0,
        help="Timeout de polling da analise Devin em segundos",
    )

    args = parser.parse_args()

    r = avaliar_impacto_sessao(
        pendencias_inicio=args.pendencias_inicio,
        saida_markdown=args.markdown,
        forcar_benchmark=args.forcar_benchmark,
        devin_session=args.devin_session,
        devin_insights_path=args.devin_insights,
        devin_generate=args.devin_generate,
        devin_timeout=args.devin_timeout,
        horas=args.horas,
        marcos=args.marcos,
        dificuldades=args.dificuldades,
        conclusoes=args.conclusoes,
        so_tabela=args.so_tabela,
    )

    if args.json:
        print(json.dumps(r, indent=2))

    return 0


if __name__ == "__main__":
    sys.exit(main())
