# pylint: disable=missing-module-docstring
# load_model.py
from transformers import AutoModelForCausalLM, AutoProcessor

MODEL_ID = "google/gemma-4-E2B-it"

# Load model
processor = AutoProcessor.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype="auto",  # Correção: no transformers geralmente se usa torch_dtype="auto"
    device_map="auto",
)

print("Modelo carregado com sucesso!")
