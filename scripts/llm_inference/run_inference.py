# pylint: disable=missing-module-docstring, broad-exception-caught, logging-fstring-interpolation, invalid-name

import logging
import os
import sys

import torch

logger = logging.getLogger(__name__)

# ==============================================================================
# [SOTA BYPASS] RESOLUCAO DO DEADLOCK ARQUITETURAL (Gemma 4 x AMD DirectML)
# ==============================================================================
# Transformers 4.49+ exige PyTorch 2.5+, mas AMD DirectML exige PyTorch 2.4.1.
# Silenciamos o registro de operacoes FP8 incompativeis para evitar o crash.
if hasattr(torch.library, "custom_op"):
    _original_custom_op = torch.library.custom_op

    def _patched_custom_op(name, *args, **kwargs):
        if isinstance(name, str) and "transformers::" in name:
            return args[0] if args else lambda fn: fn
        return _original_custom_op(name, *args, **kwargs)

    torch.library.custom_op = _patched_custom_op

if hasattr(torch.library, "register_fake"):
    _original_register_fake = torch.library.register_fake

    def _patched_register_fake(name, *args, **kwargs):
        if isinstance(name, str) and "transformers::" in name:
            return args[0] if args else lambda fn: fn
        return _original_register_fake(name, *args, **kwargs)

    torch.library.register_fake = _patched_register_fake
# ==============================================================================

# Tentativa de importacao do DirectML para placas AMD
torch_directml = None
DML_AVAILABLE = False
try:
    import torch_directml  # type: ignore

    try:
        if torch_directml.is_available():
            DML_AVAILABLE = True
    except Exception:  # noqa: BLE001
        DML_AVAILABLE = True
except ImportError:
    pass

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from transformers import AutoModelForCausalLM, AutoTokenizer  # noqa: E402

from engine.math_sota import compute_quantum_metrics  # noqa: E402

MODEL_ID = "google/gemma-2-2b-it"  # Reduzido para 2B para contornar gargalo de VRAM

# Deteccao de hardware SOTA (NVIDIA, AMD, CPU)
DEVICE = "cpu"
DTYPE = torch.bfloat16

if torch.cuda.is_available():
    DEVICE = "cuda:0"
    DTYPE = torch.bfloat16
elif DML_AVAILABLE and torch_directml is not None:
    candidate_device = None
    try:
        dml_count = torch_directml.device_count()
    except (RuntimeError, ValueError):
        dml_count = 2

    for i in reversed(range(dml_count)):
        candidate = f"privateuseone:{i}"
        try:
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

if DEVICE == "cpu":
    print("1. Carregando modelo e motor SOTA (Alvo: CPU)...")
elif DEVICE == "cuda:0":
    print("1. Carregando modelo e motor SOTA (Alvo: NVIDIA CUDA)...")
else:
    print(f"1. Carregando modelo e motor SOTA (Alvo: {DEVICE})...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)

attn_impl = "eager" if DML_AVAILABLE else "sdpa"
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=DTYPE,
    attn_implementation=attn_impl,
).to(DEVICE)  # type: ignore

user_prompt = " ".join(sys.argv[1:]).strip() if len(sys.argv) > 1 else None

if user_prompt:
    prompt_context = user_prompt
else:
    # Simulando uma situacao de mesa para o Motor SOTA (Fallback)
    metricas = compute_quantum_metrics(
        current_equity_pct=45.0,
        delta_win_pct=15.0,
        delta_lose_pct=-10.0,
        dynamic_ev_fold=-2.0,
        realization_factor=0.9,
        fgs_health=1.0,
        active_players=2,
        hero_invested=5.0,
        current_pot=20.0,
        stack_eff=30.0,
    )
    prompt_context = f"""
Atue como o motor de governanca SOTA (State-of-the-Art). Analise esta situacao sob a otica dos axiomas VITOI:
- Perspectiva (Expectativa): {metricas["perspectiva"]:.2f}
- Coeficiente de Insolvencia (Ci): {metricas["ci"]:.2f}
- Insolvente: {"Sim" if not metricas["is_solvent"] else "Nao"}

Diretrizes de Resposta:
1. Priorize a sobrevivencia e a preservacao do RIO (Return on Investment) sobre o EV simples.
2. Se Ci < 1, identifique o Hero como tecnicamente 'Insolvente' e sugira uma linha de contencao (evitar o All-in).
3. Se Perspectiva > 0 e Ci >= 1, sugira uma linha de agressao quantizada.
4. Finalize com um diagnostico tatico de 3 pontos.
"""

mensagens = [{"role": "user", "content": prompt_context}]

# 3. Gerar resposta estrategica
prompt = tokenizer.apply_chat_template(mensagens, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)  # type: ignore

print("2. Gerando analise estrategica SOTA...")
outputs = model.generate(  # type: ignore
    **inputs, max_new_tokens=1024, use_cache=True, do_sample=False
)

# Fatiar a saida para ignorar o prompt original e pegar apenas os novos tokens
input_length = inputs["input_ids"].shape[1]
generated_tokens = outputs[0][input_length:]
resposta = tokenizer.decode(generated_tokens, skip_special_tokens=True)

print("\n=== ANALISE ESTRATEGICA SOTA ===")
print(resposta)
