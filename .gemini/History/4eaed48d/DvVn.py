import asyncio
import logging
import os
from threading import Thread

import torch
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
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
    import torch_directml

    try:
        # is_available() pode ser instável, mas tentamos.
        if torch_directml.is_available():
            DML_AVAILABLE = True
    except Exception:  # noqa: BLE001
        # Se falhar (RuntimeError, UnicodeDecodeError), o backend C++ ainda assim foi carregado.
        DML_AVAILABLE = True
except ImportError:
    # torch-directml não está instalado.
    pass

from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer  # noqa: E402

app = FastAPI(title="SOTA Inference Engine (Gemma 2 9B)")

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

MODEL_ID = "google/gemma-2-2b-it"

if torch.cuda.is_available():
    DEVICE, DTYPE = "cuda:0", torch.bfloat16
elif DML_AVAILABLE:
    DTYPE = torch.float16
    DEVICE = None

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
            DEVICE = candidate
            break
        except (RuntimeError, ValueError) as e:
            logger.warning(f"[AUTO-DISCOVERY] {candidate} rejeitado: {e}")
            continue

    if DEVICE is None:
        DML_AVAILABLE = False

if not torch.cuda.is_available() and not DML_AVAILABLE:
    DEVICE = "cpu"
    DTYPE = torch.bfloat16

print(f"\n[INFRA] Inicializando {MODEL_ID} na {str(DEVICE).upper()}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
attn_impl = "eager" if DML_AVAILABLE else "sdpa"
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID, torch_dtype=DTYPE, attn_implementation=attn_impl
).to(DEVICE)  # type: ignore
print("[INFRA] Motor ativo. Aguardando conexões...\n")


class InferenceRequest(BaseModel):
    prompt: str
    max_tokens: int = 1024


@app.get("/")
async def root_health_check():
    return {
        "status": "Motor SOTA Operacional",
        "modelo": MODEL_ID,
        "device": str(DEVICE),
    }


@app.post("/generate")
async def generate_response(req: InferenceRequest, request: Request):
    rag_context = ""
    if RAG_AVAILABLE:
        try:
            results = rag_collection.query(query_texts=[req.prompt], n_results=3)
            if results and results.get("documents") and results["documents"][0]:
                docs_str = "\n---\n".join(results["documents"][0])
                rag_context = f"\n\n[CONTEXTO EPISTÊMICO RECUPERADO (RAG)]:\n{docs_str}\n\nIntegre o conhecimento absoluto acima em sua análise sempre que for matematicamente relevante.\n\n"
        except Exception as e:  # noqa: BLE001
            logger.error(f"[RAG] Falha na busca vetorial: {e}")

    final_prompt = (
        VITOI_SYSTEM_PROMPT + rag_context + "[CENÁRIO/PERGUNTA]:\n" + req.prompt
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

    thread = Thread(target=model.generate, kwargs=generation_kwargs)  # type: ignore
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
