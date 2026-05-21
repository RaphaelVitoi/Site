import logging
from threading import Thread

import torch
from fastapi import FastAPI
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

from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer

app = FastAPI(title="SOTA Inference Engine (Gemma 2 9B)")

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
async def generate_response(req: InferenceRequest):
    mensagens = [{"role": "user", "content": req.prompt}]
    final_prompt = VITOI_SYSTEM_PROMPT + req.prompt
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
    thread.start()

    async def token_generator():
        for text_chunk in streamer:
            yield text_chunk

    return StreamingResponse(token_generator(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=11434)
