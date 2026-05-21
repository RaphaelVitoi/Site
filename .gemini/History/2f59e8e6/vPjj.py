import os
import sys

import torch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from transformers import AutoModelForCausalLM, AutoProcessor

from engine.math_sota import compute_quantum_metrics

MODEL_ID = "google/gemma-4-E2B-it"

print("1. Carregando modelo e motor SOTA (Otimizado)...")
processor = AutoProcessor.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
    device_map="auto",
)

# Compilação do modelo para aceleração (Otimização SOTA)
if hasattr(torch, "compile"):
    print("-> Compilando modelo (torch.compile)...")
    model = torch.compile(model)

# Simulando uma situação de mesa para o Motor SOTA
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

# 2. Construir o Prompt com dados do motor e Cosmovisão SOTA
prompt_context = f"""
Atue como o motor de governança SOTA (State-of-the-Art). Analise esta situação sob a ótica dos axiomas VITOI:
- Perspectiva (Expectativa): {metricas["perspectiva"]:.2f}
- Coeficiente de Insolvência (Ci): {metricas["ci"]:.2f}
- Insolvente: {"Sim" if not metricas["is_solvent"] else "Não"}

Diretrizes de Resposta:
1. Priorize a sobrevivência e a preservação do RIO (Return on Investment) sobre o EV simples.
2. Se Ci < 1, identifique o Hero como tecnicamente 'Insolvente' e sugira uma linha de contenção (evitar o All-in).
3. Se Perspectiva > 0 e Ci >= 1, sugira uma linha de agressão quantizada.
4. Finalize com um diagnóstico tático de 3 pontos.
"""

mensagens = [{"role": "user", "content": prompt_context}]

# 3. Gerar resposta estratégica
prompt = processor.apply_chat_template(
    mensagens, tokenize=False, add_generation_prompt=True
)
inputs = processor(text=prompt, return_tensors="pt").to(model.device)

print("2. Gerando análise estratégica SOTA...")
outputs = model.generate(**inputs, max_new_tokens=1024)

# Fatiar a saída para ignorar o prompt original e pegar apenas os novos tokens
input_length = inputs["input_ids"].shape[1]
generated_tokens = outputs[0][input_length:]
resposta = processor.decode(generated_tokens, skip_special_tokens=True)

print("\n=== ANÁLISE ESTRATÉGICA SOTA ===")
print(resposta)
