# pylint: disable=missing-module-docstring, missing-function-docstring, missing-class-docstring, line-too-long, broad-exception-caught, logging-fstring-interpolation, unused-argument

from utils.env_loader import load_env

import json
import logging
import os
from typing import Annotated, Optional

import aiohttp
from fastapi import Depends, FastAPI, HTTPException, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyHeader
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Sourcing global ASCII log purification filter for Uvicorn
from core.config import AsciiEnforcementFilter
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


def verify_sota_auth(api_key: Annotated[str, Security(api_key_header)]):
    if api_key != API_SECRET_TOKEN:
        raise HTTPException(
            status_code=403, detail="Acesso Negado: Criptografia SOTA exigida."
        )
    return api_key


# ==============================================================================


app = FastAPI(title="SOTA Inference Proxy (Gemma 4 via Ollama)")


# ==============================================================================
# [SOTA RAG] INTEGRACAO CHROMADB (BUSCA VETORIAL)
# ==============================================================================
try:
    import chromadb

    chroma_client = chromadb.PersistentClient(
        path=os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../data/chroma_db")
        )
    )
    rag_collection = chroma_client.get_or_create_collection(name="research_docs")
    RAG_AVAILABLE = True
except Exception as e:  # noqa: BLE001
    RAG_AVAILABLE = False
    logger.warning("[INFRA] ChromaDB nao inicializado. RAG desativado: %s", e)
# ==============================================================================

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
# SOTA: Apontado para a instancia de 31B Cloud ativa no seu terminal
MODEL_ID = os.environ.get("SOTA_LOCAL_MODEL", "gemma4:31b")


class PhysicsSnapshot(BaseModel):
    heroStack: float
    villain1Stack: Optional[float] = None
    villain2Stack: Optional[float] = None
    pot: float
    heroInvested: float
    edgeFactor: Optional[float] = 1.0
    position: str
    referenceStatus: str


class InferenceRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    physics_snapshot: Optional[PhysicsSnapshot] = None
    predictive_profile: Optional[dict] = None
    max_tokens: int = 1024
    model: Optional[str] = None


def _format_snapshot_block(snapshot: Optional[PhysicsSnapshot]) -> str:
    if not snapshot:
        return ""
    return f"""
[SOTA_SNAPSHOT_ACTIVE]
Hero Stack: {snapshot.heroStack}bb
Pot Size: {snapshot.pot}bb
Hero Invested: {snapshot.heroInvested}bb
Position: {snapshot.position}
Psychological Status: {snapshot.referenceStatus}
[END_SNAPSHOT]
"""


def _format_predictive_profile(profile: Optional[dict]) -> str:
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


def normalize_model(model_name: Optional[str]) -> str:
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
def _determine_optimal_model(
    prompt: str, requested_model: Optional[str], has_rag: bool
) -> str:
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

            if docs is not None and docs[0] and distances is not None and distances[0]:
                strictness_threshold = (
                    1.1  # ChromaDB L2 Default: Menor e mais proximo. > 1.1 e ruido.
                )

                valid_docs = [
                    doc
                    for doc, dist in zip(docs[0], distances[0], strict=True)
                    if dist <= strictness_threshold
                ]

                if not valid_docs:
                    logger.info(  # noqa: G004
                        "[RAG] Todos os fragmentos foram bloqueados pelo strictness_threshold."
                    )
                    return ""

                top_docs = valid_docs[:3]
                docs_str = "\n---\n".join(top_docs)

                # SOTA: Log explicito dos fragmentos RAG no terminal do backend para auditoria epistemologica
                logger.info(  # HIGH-08
                    "=== [RAG INJECTED FRAGMENTS: %d CHUNKS (Threshold < %s)] ===",
                    len(top_docs),
                    strictness_threshold,
                )
                for i, d in enumerate(top_docs):
                    logger.info("Fragment %d:\n%s...[TRUNCADO]\n", i + 1, d[:200])
                logger.info("=====================================================")  # noqa: G004

                return f"\n\n[CONTEXTO EPISTEMICO RECUPERADO (RAG)]:\n{docs_str}\n\nIntegre o conhecimento absoluto acima em sua analise sempre que for matematicamente relevante.\n\n"
    except Exception:  # noqa: BLE001
        logger.exception("[RAG] Falha na busca vetorial.")
    return ""


@app.get("/")
def root_health_check():
    return {
        "status": "Motor SOTA Operacional",
        "modelo": MODEL_ID,
        "backend": "Ollama GGUF",
    }


def _extract_chunk(line: bytes) -> str:
    """Decodifica e extrai a resposta do buffer preservando a simplicidade cognitiva O(1)."""
    if not line:
        return ""
    try:
        return json.loads(line.decode("utf-8")).get("response", "")
    except Exception:
        return ""


import time

RATE_LIMIT_STORE = {}
RATE_LIMIT_SECONDS = 1

def rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    if client_ip in RATE_LIMIT_STORE:
        diff = now - RATE_LIMIT_STORE[client_ip]
        if diff < RATE_LIMIT_SECONDS:
            raise HTTPException(status_code=429, detail="Too Many Requests")
    RATE_LIMIT_STORE[client_ip] = now
    return client_ip

@app.post("/generate", dependencies=[Depends(rate_limit)])
async def generate_response(
    req: InferenceRequest,
    request: Request,
    auth: Annotated[str, Depends(verify_sota_auth)],
):
    rag_context = _get_rag_context(req.prompt)
    snapshot_block = _format_snapshot_block(req.physics_snapshot)
    profile_block = _format_predictive_profile(req.predictive_profile)

    # CRIT-05 / SEC-005: Prompt Injection via req.system_prompt. Override removido.
    sys_prompt = VITOI_SYSTEM_PROMPT
    if req.system_prompt is not None:
        logger.warning(
            "O parametro 'system_prompt' e obsoleto e foi ignorado por seguranca. O prompt do sistema padrao foi aplicado."
        )
    final_prompt = (
        sys_prompt
        + rag_context
        + snapshot_block
        + profile_block
        + "[CENARIO/PERGUNTA]:\n"
        + req.prompt
    )

    target_model = _determine_optimal_model(req.prompt, req.model, bool(rag_context))

    async def token_generator():
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

        if not is_cloud:
            logger.info(
                "[ROTEAMENTO LOCAL] Direcionando %s para Ollama Local...", target_model
            )
            payload = {
                "model": target_model,
                "prompt": final_prompt,
                "stream": True,
                "options": {"temperature": 0.0, "num_predict": req.max_tokens},
            }
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{OLLAMA_URL}/api/generate",
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=5),
                    ) as resp:
                        if resp.status == 200:
                            async for line in resp.content:
                                if await request.is_disconnected():
                                    break
                                chunk = _extract_chunk(line)
                                if chunk:
                                    yield chunk
                            return
                        else:
                            logger.warning(
                                "[ROTEAMENTO LOCAL] Ollama local falhou com status %s. Redirecionando para Fallback Cloud...",
                                resp.status,
                            )
            except Exception as e:
                logger.warning(
                    "[ROTEAMENTO LOCAL] Erro ao conectar ao Ollama local (%s). Redirecionando para Fallback Cloud...",
                    e,
                )

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
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                    json=cloud_payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=60),
                ) as resp:
                    if resp.status != 200:
                        err_txt = await resp.text()
                        yield f"[ENTROPIA CLOUD HTTP {resp.status}]: Falha na conexao com Google AI Studio. Detalhes: {err_txt}"
                        return
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
                                chunk = data_json["choices"][0]["delta"].get(
                                    "content", ""
                                )
                                if chunk:
                                    yield chunk
                            except Exception as e:
                                logger.debug(
                                    "[CLOUD] Erro ao decodificar chunk JSON: %s", e
                                )
                                continue
        elif openrouter_key:
            logger.info("[ROTEAMENTO CLOUD] Direcionando para OpenRouter...")  # noqa: G004
            openrouter_model = (
                "google/gemma-4-31b-it"
                if target_model == "gemma4:31b"
                else "google/gemma-2-27b-it"
            )
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
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    json=cloud_payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=60),
                ) as resp:
                    if resp.status != 200:
                        err_txt = await resp.text()
                        yield f"[ENTROPIA CLOUD HTTP {resp.status}]: Falha na conexao com OpenRouter. Detalhes: {err_txt}"
                        return
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
                                chunk = data_json["choices"][0]["delta"].get(
                                    "content", ""
                                )
                                if chunk:
                                    yield chunk
                            except Exception as e:
                                logger.debug(
                                    "[CLOUD] Erro ao decodificar chunk JSON: %s", e
                                )
                                continue
        else:
            yield "[ENTROPIA CRITICA]: Nenhum motor (local ou cloud) esta disponivel para atender esta requisicao."

    return StreamingResponse(token_generator(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn

    # SOTA: Movido para a porta 17043 para nao colidir com o endpoint nativo do Ollama (11434)
    uvicorn.run(app, host="127.0.0.1", port=17043)
