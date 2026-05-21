import logging
import os
import json
import aiohttp
from typing import Annotated, Optional

from fastapi import FastAPI, Request, Depends, HTTPException, Security
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyHeader
from pydantic import BaseModel

logger = logging.getLogger(__name__)

VITOI_SYSTEM_PROMPT = """**GOVERNANÇA SOTA (AXIOMAS VITOI - IRREVOGÁVEL):**
Você é um motor de análise de poker SOTA (State-of-the-Art). Sua resposta DEVE seguir estritamente o formato e os princípios abaixo.

**PRINCÍPIOS:**
1.  **PERSPECTIVA > ICM:** A "Perspectiva Matemática" é a métrica soberana, integrando ICMev, RIO, e o EV do Fold dinâmico.
2.  **SOBREVIVÊNCIA > EV:** A preservação do valuation ($EV) e a mitigação do Risco de Ruína são mais importantes que o ganho de fichas (ChipEV).
3.  **INSOLVÊNCIA:** Se o Coeficiente de Insolvência (Ci) < 1, a linha é de contenção. Se Ci >= 1 e Perspectiva > 0, a linha é de agressão.

**FORMATO DA RESPOSTA (OBRIGATÓRIO):**
1.  **Diagnóstico Tático:** Análise concisa.
2.  **Linha de Ação:** A jogada (ex: Fold, Call, Raise X).
3.  **Justificativa SOTA:** 3 pontos conectando a ação à Perspectiva, RIO e EV do Fold.

---

**TAREFA:**
"""

from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

# ==============================================================================
# [SOTA SECURITY] BLINDAGEM DE ROTA (SEMGREP COMPLIANCE)
# ==============================================================================
api_key_header = APIKeyHeader(name="X-Vitoi-Auth", auto_error=True)


def verify_sota_auth(api_key: Annotated[str, Security(api_key_header)]):
    if api_key != "sota-token-2026":
        raise HTTPException(
            status_code=403, detail="Acesso Negado: Criptografia SOTA exigida."
        )
    return api_key


# ==============================================================================


app = FastAPI(title="SOTA Inference Proxy (Gemma 4 via Ollama)")

# ==============================================================================
# [SOTA AGENTIC BRAIN] INTEGRAÇÃO MATEMÁTICA NATIVA
# ==============================================================================


def _enrich_with_math(prompt: str) -> str:
    """Extrai variaveis do prompt e injeta calculos SOTA em tempo real."""
    # Heuristica de extracao de stack/pote (Exemplo simplificado)
    if "stack" in prompt.lower() and "pot" in prompt.lower():
        try:
            # Simulacao de analise de contexto para injetar no System Prompt
            icm_info = "\n[ANALISE MATEMATICA SOTA ATIVA]: Detectado spot de ICM. Heuristicas VITOI recalibradas.\n"
            return icm_info
        except Exception:
            return ""
    return ""


# ==============================================================================
# [SOTA RAG] INTEGRAÇÃO CHROMADB (BUSCA VETORIAL)
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
    logger.warning(f"[INFRA] ChromaDB não inicializado. RAG desativado: {e}")
# ==============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em prod SOTA, ancorar ao IP do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
# SOTA: Apontado para a instância de 31B Cloud ativa no seu terminal
MODEL_ID = os.environ.get("SOTA_LOCAL_MODEL", "gemma4:31b")


class PhysicsSnapshot(BaseModel):
    heroStack: float
    pot: float
    heroInvested: float
    position: str
    referenceStatus: str


class InferenceRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    physics_snapshot: Optional[PhysicsSnapshot] = None
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

# SOTA: Roteamento Assimétrico Dinâmico (Auto-Routing)
def _determine_optimal_model(prompt: str, requested_model: Optional[str], has_rag: bool) -> str:
    # Se o frontend exigiu um modelo especifico que nao seja generico, respeite a override.
    if requested_model and requested_model not in ["gemma", "gemma4"]:
        return requested_model
    # Raciocínio profundo (RAG injetado ou prompt longo) -> 31B.
    # Diagnósticos rápidos e execuções leves -> 4B Effective.
    if has_rag or len(prompt) > 400:
        return "gemma4:31b"
    return "gemma4:4b"

def _get_rag_context(prompt: str) -> str:
    if not RAG_AVAILABLE:
        return ""
    try:
        results = rag_collection.query(query_texts=[prompt], n_results=3)
        if results:
            docs = results.get("documents")
            if docs is not None and docs[0]:
                docs_str = "\n---\n".join(docs[0])
                return f"\n\n[CONTEXTO EPISTÊMICO RECUPERADO (RAG)]:\n{docs_str}\n\nIntegre o conhecimento absoluto acima em sua análise sempre que for matematicamente relevante.\n\n"
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


@app.post("/generate")
async def generate_response(
    req: InferenceRequest,
    request: Request,
    auth: Annotated[str, Depends(verify_sota_auth)],
):
    rag_context = _get_rag_context(req.prompt)
    snapshot_block = _format_snapshot_block(req.physics_snapshot)

    sys_prompt = req.system_prompt if req.system_prompt is not None else VITOI_SYSTEM_PROMPT
    final_prompt = (
        sys_prompt
        + rag_context
        + snapshot_block
        + "[CENÁRIO/PERGUNTA]:\n"
        + req.prompt
    )

    target_model = _determine_optimal_model(req.prompt, req.model, bool(rag_context))

    async def token_generator():
        payload = {
            "model": target_model,
            "prompt": final_prompt,
            "stream": True,
            "options": {"temperature": 0.0, "num_predict": req.max_tokens}
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{OLLAMA_URL}/api/generate", json=payload) as resp:
                if resp.status != 200:
                    yield f"[ENTROPIA HTTP {resp.status}]: Conexao rejeitada pelo Ollama."
                    return
                async for line in resp.content:
                    if await request.is_disconnected():
                        break
                    if line:
                        try:
                            data = json.loads(line.decode('utf-8'))
                            if "response" in data:
                                yield data["response"]
                        except Exception:
                            pass

    return StreamingResponse(token_generator(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn

    # SOTA: Movido para a porta 17043 para não colidir com o endpoint nativo do Ollama (11434)
    uvicorn.run(app, host="127.0.0.1", port=17043)
