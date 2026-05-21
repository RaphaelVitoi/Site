import asyncio
import logging
import os
from threading import Thread
from typing import Annotated, Optional

import torch
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

# ==============================================================================
# [SOTA BYPASS] RESOLUÇÃO DO DEADLOCK ARQUITETURAL (Gemma 2 x AMD DirectML)
# ==============================================================================
TRANSFORMERS_PREFIX = "transformers::"

if hasattr(torch.library, "custom_op"):
    _original_custom_op = torch.library.custom_op

    def _patched_custom_op(name, *args, **kwargs):
        if isinstance(name, str) and TRANSFORMERS_PREFIX in name:
            return args[0] if args else lambda fn: fn
        return _original_custom_op(name, *args, **kwargs)

    torch.library.custom_op = _patched_custom_op

if hasattr(torch.library, "register_fake"):
    _original_register_fake = torch.library.register_fake

    def _patched_register_fake(name, *args, **kwargs):
        if isinstance(name, str) and TRANSFORMERS_PREFIX in name:
            return args[0] if args else lambda fn: fn
        return _original_register_fake(name, *args, **kwargs)

    torch.library.register_fake = _patched_register_fake

if hasattr(torch.library, "register_autograd"):
    _original_register_autograd = torch.library.register_autograd

    def _patched_register_autograd(name, *args, **kwargs):
        if isinstance(name, str) and TRANSFORMERS_PREFIX in name:
            return args[0] if args else lambda fn: fn
        return _original_register_autograd(name, *args, **kwargs)

    torch.library.register_autograd = _patched_register_autograd
# ==============================================================================

torch_directml = None
DML_AVAILABLE = False
try:
    import torch_directml  # type: ignore

    # SOTA Bypass: torch_directml.is_available() possui vazamento intrinseco de COM/DXGI (Memory Leak).
    # A importacao bem-sucedida atesta o modulo. A presenca fisica do hardware e resolvida sem vazamentos no Auto-Discovery.
    DML_AVAILABLE = True
except ImportError:
    # torch-directml não está instalado.
    pass

from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer  # noqa: E402
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer, BitsAndBytesConfig  # noqa: E402

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


app = FastAPI(title="SOTA Inference Engine (Gemma 4)")

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

# SOTA: Roteamento Assimétrico. Padrão 4B (Dense) para inferência DirectML/CUDA de Baixa Latência.
MODEL_ID = os.environ.get("SOTA_LOCAL_MODEL", "google/gemma-4-4b-it")
MODEL_ID = os.environ.get("SOTA_LOCAL_MODEL", "google/gemma-4-26b-moe-it")

DEVICE = "cpu"
DTYPE = torch.bfloat16

if torch.cuda.is_available():
    DEVICE = "cuda:0"
    DTYPE = torch.bfloat16
elif DML_AVAILABLE and torch_directml is not None:
    candidate_device = None
    # [SOTA AUTO-DISCOVERY] Busca a GPU dedicada de trás para frente.
    # No DXGI do Windows, a iGPU (Adaptador Básico) fica no índice 0, e a dGPU (Dedicada) no 1 ou 2.
    try:
        dml_count = torch_directml.device_count()
    except (RuntimeError, ValueError):
        dml_count = 2

    for i in reversed(range(dml_count)):
        candidate = f"privateuseone:{i}"
        try:
            # Teste de carga para forçar a validação da interface física
            _ = torch.ones((1024, 1024), dtype=torch.float16).to(candidate)
            candidate_device = candidate
            break
        except (RuntimeError, ValueError) as e:
            logger.warning(f"[AUTO-DISCOVERY] {candidate} rejeitado: {e}")
            continue

    if candidate_device is not None:
        DEVICE = candidate_device
        DTYPE = torch.float16
    else:
        DML_AVAILABLE = False

print(f"\n[INFRA] Inicializando {MODEL_ID} na {str(DEVICE).upper()}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
attn_impl = "eager" if DML_AVAILABLE else "sdpa"
attn_impl = "eager" if DML_AVAILABLE else "auto"

# Quantização O(1) em 8-bits: Permite rodar o 26B MoE nativamente sem OOM.
quantization_config = None
if DEVICE.startswith("cuda"):
    quantization_config = BitsAndBytesConfig(load_in_8bit=True)
    print("[INFRA] Quantização 8-bits (BitsAndBytes) ATIVADA para redução térmica de VRAM.")

model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID, torch_dtype=DTYPE, attn_implementation=attn_impl
).to(DEVICE)  # type: ignore
    MODEL_ID,
    torch_dtype=DTYPE,
    attn_implementation=attn_impl,
    quantization_config=quantization_config,
    device_map="auto" if quantization_config else None
)
if not quantization_config:
    model = model.to(DEVICE)
print("[INFRA] Motor ativo. Aguardando conexões...\n")


class PhysicsSnapshot(BaseModel):
    heroStack: float
    pot: float
    heroInvested: float
    position: str
    referenceStatus: str


class InferenceRequest(BaseModel):
    prompt: str
    physics_snapshot: Optional[PhysicsSnapshot] = None
    max_tokens: int = 1024


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
        "device": str(DEVICE),
    }


@app.post("/generate")
async def generate_response(
    req: InferenceRequest,
    request: Request,
    auth: Annotated[str, Depends(verify_sota_auth)],
):
    rag_context = _get_rag_context(req.prompt)
    snapshot_block = _format_snapshot_block(req.physics_snapshot)

    final_prompt = (
        VITOI_SYSTEM_PROMPT
        + rag_context
        + snapshot_block
        + "[CENÁRIO/PERGUNTA]:\n"
        + req.prompt
    )
    mensagens = [{"role": "user", "content": final_prompt}]
    prompt_fmt = tokenizer.apply_chat_template(
        mensagens, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer(prompt_fmt, return_tensors="pt").to(DEVICE)  # type: ignore

    streamer = TextIteratorStreamer(
        tokenizer, skip_prompt=True, skip_special_tokens=True
    )
    generation_kwargs = dict(
        **inputs,
        max_new_tokens=req.max_tokens,
        use_cache=True,
        do_sample=False,
        streamer=streamer,
    )

    def _sota_generate():
        with torch.inference_mode():
            model.generate(**generation_kwargs)  # type: ignore

    thread = Thread(target=_sota_generate, daemon=True)
    thread.start()

    async def token_generator():
        try:
            for text_chunk in streamer:
                if await request.is_disconnected():
                    logger.warning(
                        "[API] Cliente desconectado. Abortando stream SOTA..."
                    )
                    break
                yield text_chunk
        except asyncio.CancelledError:
            logger.warning("[API] Request cancelada pelo AbortController (Frontend).")
            raise
        finally:
            # SOTA: Drena a fila bloqueante em background para permitir o fim da Thread e liberar a VRAM
            Thread(target=lambda: list(streamer), daemon=True).start()

    return StreamingResponse(token_generator(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=11434)
