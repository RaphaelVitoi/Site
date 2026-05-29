# ruff: noqa: D100, D101, D103, BLE001, G004, ARG001, ARG002, E402, I001
# pylint: disable=wrong-import-position

import asyncio
from collections.abc import AsyncGenerator
import json
import logging
import os
import socket
import subprocess  # noqa: S404
import sys
import time
from pathlib import Path
from typing import Annotated, TypedDict

# SOTA: Garantir que o root do projeto esteja no sys.path para execucao direta
PROJECT_ROOT = str(Path(__file__).parent.parent.resolve())
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

import aiohttp
from fastapi import Depends, FastAPI, HTTPException, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field

# Sourcing global ASCII log purification filter for Uvicorn
from core.config import AsciiEnforcementFilter  # type: ignore
from utils.env_loader import load_env  # type: ignore
from utils.harmonizer import harmonizer  # type: ignore

logger = logging.getLogger(__name__)

for log_name in ["uvicorn", "uvicorn.access", "uvicorn.error"]:
    logging.getLogger(log_name).addFilter(AsciiEnforcementFilter())

ENV_KEYS = load_env()

API_SECRET_TOKEN = os.environ.get("API_SECRET_TOKEN") or ENV_KEYS.get("API_SECRET_TOKEN")
if not API_SECRET_TOKEN:
    raise RuntimeError("A variavel de ambiente API_SECRET_TOKEN nao esta configurada.")

VITOI_SYSTEM_PROMPT = """**GOVERNANCA SOTA (AXIOMAS VITOI - IRREVOGAVEL):**
Voce e um motor de analise de poker SOTA (State-of-the-Art). Sua resposta DEVE seguir estritamente o formato e os principios abaixo.

**PRINCIPIOS:**
1.  **PERSPECTIVA > ICM:** A "Perspectiva Matematica" e a metrica soberana, integrando ICMev, RIO, e o EV do Fold dinamico.
2.  **SOBREVIVENCIA > EV:** A preservacao do valuation ($EV) e a mitigacao do Risco de Ruina sao mais importantes que o ganho de fichas (ChipEV).
3.  **INSOLVENCIA:** Se o Coeficiente de Insolvencia (Ci) < 1, a linha e de contencao. Se Ci >= 1 e Perspectiva > 0, a linha e de agressao.

**FORMATO DA RESPOSTA (OBRIGATORIO):**
1.  **Diagnostico Tatico:** Analise concisa.
2.  **Linha de Acao:** A jogada (ex: Fold, Call, Raise X).
3.  **Justificativa SOTA:** 3 pontos conectando a acao a Perspectiva, RIO e EV do Fold.

---

**TAREFA:**
"""

# ==============================================================================
# [SOTA SECURITY] BLINDAGEM DE ROTA (SEMGREP COMPLIANCE)
# ==============================================================================
api_key_header = APIKeyHeader(name="X-Vitoi-Auth", auto_error=True)


def verify_sota_auth(api_key: Annotated[str, Security(api_key_header)]) -> str:
    if api_key != API_SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Acesso Negado: Criptografia SOTA exigida.")
    return api_key


# ==============================================================================


app = FastAPI(title="SOTA Inference Proxy (Gemma 4 via llama.cpp)")


# ==============================================================================
# [SOTA RAG] INTEGRACAO CHROMADB (BUSCA VETORIAL)
# ==============================================================================
try:
    import chromadb

    chroma_client = chromadb.PersistentClient(
        path=os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/chroma_db"))
    )
    rag_collection = chroma_client.get_or_create_collection(name="research_docs")
    RAG_AVAILABLE = True
except Exception as e:  # noqa: BLE001
    RAG_AVAILABLE = False
    logger.warning("[INFRA] ChromaDB nao inicializado. RAG desativado: %s", e)
# ==============================================================================

ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SOTA: Apontado para a instancia de 31B Cloud ativa no seu terminal
MODEL_ID = os.environ.get("SOTA_LOCAL_MODEL", "gemma4:31b")


class PhysicsSnapshot(BaseModel):
    hero_stack: float = Field(alias="heroStack")
    villain1_stack: float | None = Field(default=None, alias="villain1Stack")
    villain2_stack: float | None = Field(default=None, alias="villain2Stack")
    pot: float
    hero_invested: float = Field(alias="heroInvested")
    edge_factor: float | None = Field(default=1.0, alias="edgeFactor")
    position: str
    reference_status: str = Field(alias="referenceStatus")
    hero_rp: float = Field(default=15.0, alias="heroRp")
    villain_rp: float = Field(default=15.0, alias="villainRp")
    bounty_value: float = Field(default=0.0, alias="bountyValue")


class CognitiveProfile(TypedDict, total=False):
    """Perfil cognitivo do usuario para adaptacao de prompt."""

    aggression_factor: float
    vpip: float
    pfr: float
    tilt_level: float
    open_raise_freq: float
    three_bet_freq: float


class InferenceRequest(BaseModel):
    prompt: str
    system_prompt: str | None = None
    physics_snapshot: PhysicsSnapshot | None = None
    predictive_profile: CognitiveProfile | None = None
    max_tokens: int = 1024
    model: str | None = None


def _format_snapshot_block(snapshot: PhysicsSnapshot | None) -> str:
    if not snapshot:
        return ""
    return f"""
[SOTA_SNAPSHOT_ACTIVE]
Hero Stack: {snapshot.hero_stack}bb
Pot Size: {snapshot.pot}bb
Hero Invested: {snapshot.hero_invested}bb
Position: {snapshot.position}
Psychological Status: {snapshot.reference_status}
Hero RP: {snapshot.hero_rp}
Villain RP: {snapshot.villain_rp}
Bounty Value: {snapshot.bounty_value}
[END_SNAPSHOT]
"""


def _format_predictive_profile(profile: CognitiveProfile | None) -> str:
    if not profile:
        return ""
    prof_str = "\n".join([f"- {k}: {v}" for k, v in profile.items()])
    return f"\n[PERFIL COGNITIVO (TELEMETRIA BAYESIANA)]\n{prof_str}\nDiretriz SOTA: Adapte sua argumentacao e justifique a jogada mitigando ativamente as maiores fraquezas numericas deste perfil.\n[END_PROFILE]\n"


# SOTA: Mapeamento e Normalizacao de Modelos Gemma 4
LOCAL_MODEL_MAP = {
    "gemma4:31b": "gemma4:31b",
    "gemma-4-31b-it": "gemma4:31b",
    "gemma4:4b": "gemma4:4b",
    "gemma-4-26b-a4b-it": "gemma4:4b",
    "google/gemma-4-e2b-it": "gemma4:4b",
}

CLOUD_MODEL_MAP = {
    "gemma4:31b": "gemma-4-31b-it",
    "gemma4:4b": "gemma-4-26b-a4b-it",
}


def normalize_model(model_name: str | None) -> str:
    if not model_name:
        return "gemma4:4b"
    model_lower = model_name.lower().strip()
    for k, v in LOCAL_MODEL_MAP.items():
        if k in model_lower:
            return v
    if "31b" in model_lower:
        return "gemma4:31b"
    return "gemma4:4b"


# SOTA: Roteamento Assimetrico Dinamico (Auto-Routing)
def _determine_optimal_model(prompt: str, requested_model: str | None, has_rag: bool) -> str:
    # Se o frontend exigiu um modelo especifico que nao seja generico, respeite a override.
    if requested_model and requested_model not in ["gemma", "gemma4"]:
        return normalize_model(requested_model)
    # Raciocinio profundo (RAG injetado ou prompt longo) -> 31B.
    # Diagnosticos rapidos e execucoes leves -> 4B Effective.
    if has_rag or len(prompt) > 400:
        return "gemma4:31b"
    return "gemma4:4b"


def _get_rag_context(prompt: str) -> str:
    if not RAG_AVAILABLE:
        return ""
    try:
        # SOTA (Plano Hacker): Fetch expandido e corte de Distancia (Strictness)
        results = rag_collection.query(query_texts=[prompt], n_results=5)
        if results:
            docs = results.get("documents")
            distances = results.get("distances")

            # SOTA FIX: Protecao robusta contra listas vazias ou nulas do ChromaDB
            if docs and distances and len(docs) > 0 and len(distances) > 0 and docs[0]:
                strictness_threshold = 1.1  # ChromaDB L2 Default: Menor e mais proximo. > 1.1 e ruido.

                valid_docs = [
                    doc for doc, dist in zip(docs[0], distances[0], strict=True) if dist <= strictness_threshold
                ]

                if not valid_docs:
                    logger.info("[RAG] Todos os fragmentos foram bloqueados pelo strictness_threshold.")
                    return ""

                top_docs = valid_docs[:3]
                docs_str = "\n---\n".join(top_docs)

                # SOTA: Log explicito dos fragmentos RAG no terminal do backend para auditoria epistemologica
                logger.info(
                    "=== [RAG INJECTED FRAGMENTS: %d CHUNKS (Threshold < %s)] ===",
                    len(top_docs),
                    strictness_threshold,
                )
                for i, d in enumerate(top_docs):
                    logger.info("Fragment %d:\n%s...[TRUNCADO]\n", i + 1, d[:200])
                logger.info("=====================================================")

                return f"\n\n[CONTEXTO EPISTEMICO RECUPERADO (RAG)]:\n{docs_str}\n\nIntegre o conhecimento absoluto acima em sua analise sempre que for matematicamente relevante.\n\n"
    except Exception:  # noqa: BLE001
        logger.exception("[RAG] Falha na busca vetorial.")
    return ""


@app.get("/")
def root_health_check() -> dict[str, str]:
    return {
        "status": "Motor SOTA Operacional",
        "modelo": MODEL_ID,
        "backend": "llama.cpp GGUF",
    }


RATE_LIMIT_STORE: dict[str, float] = {}
RATE_LIMIT_SECONDS = 1


def rate_limit(request: Request) -> str:
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    if client_ip in RATE_LIMIT_STORE:
        diff = now - RATE_LIMIT_STORE[client_ip]
        if diff < RATE_LIMIT_SECONDS:
            raise HTTPException(status_code=429, detail="Too Many Requests")
    RATE_LIMIT_STORE[client_ip] = now
    return client_ip


llama_server_name = "llama_cpp/llama-server.exe" if os.name == "nt" else "llama_cpp/llama-server"
LLAMA_SERVER_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), llama_server_name))
LLAMA_PORT = 17045


def is_port_open(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def ensure_llama_server() -> bool:
    if is_port_open(LLAMA_PORT):
        logger.info("[LLAMA.CPP] Server ja esta rodando na porta %d", LLAMA_PORT)
        return True

    if not os.path.exists(LLAMA_SERVER_PATH):
        logger.error("[LLAMA.CPP] Binario nao encontrado em %s", LLAMA_SERVER_PATH)
        return False

    logger.info("[LLAMA.CPP] Iniciando llama-server na porta %d...", LLAMA_PORT)
    cmd = [
        LLAMA_SERVER_PATH,
        "-hf",
        "bartowski/gemma-2-2b-it-GGUF",
        "-hff",
        "gemma-2-2b-it-Q4_K_M.gguf",
        "--port",
        str(LLAMA_PORT),
        "-c",
        "4096",
        "-ngl",
        "99",
    ]
    try:
        subprocess.Popen(  # noqa: S603
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        for _ in range(20):
            time.sleep(0.5)
            if is_port_open(LLAMA_PORT):
                logger.info("[LLAMA.CPP] Server iniciado com sucesso!")
                return True
        logger.warning("[LLAMA.CPP] Timeout aguardando o server subir.")
    except Exception as e:
        logger.error("[LLAMA.CPP] Falha ao iniciar subprocesso: %s", e)
    return False


@harmonizer.ultra_fast_async
async def _get_rag_context_async(prompt: str) -> str:
    """SOTA: Interface assincrona harmonizada para o RAG do Oracle."""
    return await asyncio.to_thread(_get_rag_context, prompt)


@app.post("/generate", dependencies=[Depends(rate_limit)])
@harmonizer.ultra_fast_async
async def generate_response(
    req: InferenceRequest,
    request: Request,
    _auth: Annotated[str, Depends(verify_sota_auth)],  # noqa: ARG001
) -> StreamingResponse:
    rag_context = await _get_rag_context_async(req.prompt)
    snapshot_block = _format_snapshot_block(req.physics_snapshot)
    profile_block = _format_predictive_profile(req.predictive_profile)

    # CRIT-05 / SEC-005: Prompt Injection via req.system_prompt. Override removido.
    sys_prompt = VITOI_SYSTEM_PROMPT.replace("**TAREFA:**", "").strip()
    if req.system_prompt is not None:
        logger.warning(
            "O parametro 'system_prompt' e obsoleto e foi ignorado por seguranca. O prompt do sistema padrao foi aplicado."
        )

    # SOTA: Arquitetura de Prompt de 3 Camadas (Doutrina -> Contexto -> Dados -> Instrucao)
    final_prompt = (
        sys_prompt
        + "\n\n"
        + rag_context
        + snapshot_block
        + profile_block
        + "\n**TAREFA:**\n"
        + "[CENARIO/PERGUNTA]:\n"
        + req.prompt
    )

    target_model = _determine_optimal_model(req.prompt, req.model, bool(rag_context))

    async def token_generator() -> AsyncGenerator[str]:
        # SOTA: Hybrid cloud/local routing for Gemma 4 31B Cloud / 4B Local
        is_cloud = target_model == "gemma4:31b"

        # SOTA: Encontrar chave ativa do Google AI Studio
        gemini_key = None
        for idx in [7, 8, 9, 10, 6, 5, 4, 3, 2, 1]:
            val = ENV_KEYS.get(f"GEMINI_API_KEY_{idx}")
            if val:
                gemini_key = val
                break
        if not gemini_key:
            gemini_key = ENV_KEYS.get("GEMINI_API_KEY")

        openrouter_key = (
            os.environ.get("OPENROUTER_API_KEY")
            or ENV_KEYS.get("OPENROUTER_API_KEY")
            or ENV_KEYS.get("OPENROUTER_API_KEY_1")
        )

        success = False

        if not is_cloud:
            logger.info("[ROTEAMENTO LOCAL] Direcionando %s para llama.cpp Local...", target_model)
            if ensure_llama_server():
                payload = {
                    "prompt": final_prompt,
                    "stream": True,
                    "temperature": 0.0,
                    "n_predict": req.max_tokens,
                }
                try:
                    async with (
                        aiohttp.ClientSession() as session,
                        session.post(
                            f"http://127.0.0.1:{LLAMA_PORT}/completion",
                            json=payload,
                            timeout=aiohttp.ClientTimeout(total=60),
                        ) as resp,
                    ):
                        if resp.status == 200:
                            async for line in resp.content:
                                if await request.is_disconnected():
                                    break
                                line_str = line.decode("utf-8").strip()
                                if not line_str:
                                    continue
                                if line_str.startswith("data: "):
                                    try:
                                        data_json = json.loads(line_str[6:])
                                        chunk = data_json.get("content", "")
                                        if chunk:
                                            yield chunk
                                    except Exception:  # noqa: S112
                                        continue
                            success = True
                        else:
                            logger.warning(
                                "[ROTEAMENTO LOCAL] llama.cpp falhou com status %s. Tentando Fallback...",
                                resp.status,
                            )
                except Exception as e:
                    logger.warning(
                        "[ROTEAMENTO LOCAL] Erro ao conectar ao llama.cpp local (%s). Tentando Fallback...",
                        e,
                    )
            else:
                logger.warning("[ROTEAMENTO LOCAL] Falha ao garantir llama-server online. Tentando Fallback...")

        if success:
            return

        cloud_model = CLOUD_MODEL_MAP.get(target_model, "gemma-4-31b-it")
        if gemini_key:
            logger.info(
                "[ROTEAMENTO CLOUD] Direcionando para Google AI Studio (%s)...",
                cloud_model,
            )
            cloud_payload = {
                "model": cloud_model,
                "messages": [{"role": "user", "content": final_prompt}],
                "stream": True,
                "temperature": 0.0,
                "max_tokens": req.max_tokens,
            }
            headers = {
                "Authorization": f"Bearer {gemini_key}",
                "Content-Type": "application/json",
            }
            try:
                async with (
                    aiohttp.ClientSession() as session,
                    session.post(
                        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                        json=cloud_payload,
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=60),
                    ) as resp,
                ):
                    if resp.status == 200:
                        async for line in resp.content:
                            if await request.is_disconnected():
                                break
                            line_str = line.decode("utf-8").strip()
                            if not line_str:
                                continue
                            if line_str.startswith("data: "):
                                data_content = line_str[6:].strip()
                                if data_content == "[DONE]":
                                    break
                                try:
                                    data_json = json.loads(data_content)
                                    chunk = data_json["choices"][0]["delta"].get("content", "")
                                    if chunk:
                                        yield chunk
                                except Exception as e:
                                    logger.debug("[CLOUD] Erro ao decodificar chunk JSON: %s", e)
                                    continue
                        success = True
                    else:
                        err_txt = await resp.text()
                        logger.warning(
                            "[ROTEAMENTO CLOUD] Google AI Studio falhou: %s. Tentando OpenRouter...", err_txt
                        )
            except Exception as e:
                logger.warning("[ROTEAMENTO CLOUD] Erro no Google AI Studio: %s. Tentando OpenRouter...", e)

        if success:
            return

        if openrouter_key:
            logger.info("[ROTEAMENTO CLOUD] Direcionando para OpenRouter...")
            openrouter_model = "google/gemma-4-31b-it" if target_model == "gemma4:31b" else "google/gemma-4-e2b-it"
            cloud_payload = {
                "model": openrouter_model,
                "messages": [{"role": "user", "content": final_prompt}],
                "stream": True,
                "temperature": 0.0,
                "max_tokens": req.max_tokens,
            }
            headers = {
                "Authorization": f"Bearer {openrouter_key}",
                "Content-Type": "application/json",
            }
            try:
                async with (
                    aiohttp.ClientSession() as session,
                    session.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        json=cloud_payload,
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=60),
                    ) as resp,
                ):
                    if resp.status == 200:
                        async for line in resp.content:
                            if await request.is_disconnected():
                                break
                            line_str = line.decode("utf-8").strip()
                            if not line_str:
                                continue
                            if line_str.startswith("data: "):
                                data_content = line_str[6:].strip()
                                if data_content == "[DONE]":
                                    break
                                try:
                                    data_json = json.loads(data_content)
                                    chunk = data_json["choices"][0]["delta"].get("content", "")
                                    if chunk:
                                        yield chunk
                                except Exception as e:
                                    logger.debug("[CLOUD] Erro ao decodificar chunk JSON: %s", e)
                                    continue
                        success = True
                    else:
                        err_txt = await resp.text()
                        yield f"[ENTROPIA CLOUD HTTP {resp.status}]: Falha na conexao com OpenRouter. Detalhes: {err_txt}"
            except Exception as e:
                yield f"[ENTROPIA CLOUD]: Erro catastrofico no OpenRouter: {e}"
        else:
            yield "[ENTROPIA CRITICA]: Nenhum motor (local ou cloud) esta disponivel para atender esta requisicao."

    return StreamingResponse(token_generator(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn

    if os.name != "nt":
        try:
            import uvloop

            uvloop.install()
            logger.info("[INFRA] uvloop instalado e ativo como motor assincrono de alta performance.")
        except ImportError:
            logger.warning("[INFRA] uvloop nao detectado. Rodando sob o loop asyncio padrao.")

    # SOTA: Movido para a porta 17043 para nao colidir com o endpoint nativo do Ollama (11434)
    uvicorn.run(app, host="127.0.0.1", port=17043)
