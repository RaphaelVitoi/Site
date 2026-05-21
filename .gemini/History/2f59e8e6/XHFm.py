from transformers import AutoModelForCausalLM, AutoProcessor

MODEL_ID = "google/gemma-4-E2B-it"

print("1. Carregando modelo e processador para a RAM/VRAM...")
processor = AutoProcessor.from_pretrained(MODEL_ID)

# SOTA: Força o uso de Flash Attention 2 para máxima performance em GPUs NVIDIA.
# O torch_dtype="auto" selecionará bfloat16 ou float16 se a GPU suportar.
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype="auto",
    device_map="auto",
    attn_implementation="flash_attention_2",
)

# 2. Definir a mensagem (O que você quer perguntar)
mensagens = [
    {
        "role": "user",
        "content": "Explique o conceito de Equilíbrio de Nash aplicado ao Poker em um parágrafo curto.",
    }
]

# 3. Aplicar o template de chat nativo do Gemma e tokenizar
prompt = processor.apply_chat_template(
    mensagens, tokenize=False, add_generation_prompt=True
)
inputs = processor(text=prompt, return_tensors="pt").to(model.device)

print("2. Gerando resposta (Inferência)...")
# 4. Gerar os tokens de saída (max_new_tokens define o limite da resposta)
outputs = model.generate(**inputs, max_new_tokens=256)

# 5. Decodificar de volta para texto humano
resposta = processor.decode(outputs[0], skip_special_tokens=True)

print("\n=== RESPOSTA DA IA ===")
print(resposta)
