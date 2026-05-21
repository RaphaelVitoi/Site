import logging
from threading import Thread

import torch
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

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

MODEL_ID = "google/gemma-2-9b-it"

if torch.cuda.is_available():
    DEVICE, DTYPE = "cuda:0", torch.bfloat16
elif DML_AVAILABLE:
    DTYPE = torch.float16
    DEVICE = "privateuseone:0"

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
            logging.warning(f"[AUTO-DISCOVERY] {candidate} rejeitado: {e}")
            continue
else:
    raise RuntimeError(
        "Falha Critica: Aceleracao por GPU (CUDA ou DirectML) nao detectada. "
        "O motor SOTA esta configurado para abortar em vez de usar a CPU. "
        "Verifique a instalacao do torch-directml ou dos drivers NVIDIA."
    )

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
