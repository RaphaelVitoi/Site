---
id: homologacao-2026-09-24-laya-gpu
tipo: homologacao
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-24T07:25:00-03:00'
classes: [interno, medido, governanca, laya, gpu, cuda, homologacao]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  modelo_canonico: convaiinnovations/laya-multilingual
  tamanho_parametros: 322M
  device_testado: cpu
  cuda_disponivel: false
verificado:
  - "download-checkpoint: verificado no cache local do huggingface (convaiinnovations/laya-multilingual)"
  - "aquecimento-e-forward-pass: warmup executado em 33067.48 ms"
  - "proveniencia-s4: engine_id=laya-s1-trained, weights_loaded=True, fallback_used=False"
  - "integracao-solvers: modulacao testada com CFR+, Monte Carlo, TimesFM 2.5/3.0 e Dream-RSI"
  - "docker-gpu-pronto: Dockerfile.gpu e docker-compose.gpu.yml providenciados em tools/laya_service/"
nao_verificado:
  - "execucao nativa de PyTorch em GPU no host local (host fisico opera GPU AMD Radeon RX 570 com Vulkan/llama.cpp; PyTorch local opera em CPU override por ausencia de ROCm Polaris no Windows)"
---

# RELATORIO DE HOMOLOGACAO DE AMBIENTE GPU -- LAYA MULTILINGUAL S1 (322M)

> **Data:** 2026-09-24 | **Protocolo:** Chico SOTA v8.0 GOLD | **Status:** HOMOLOGADO-CPU-OVERRIDE

---

## 1. Perfil de Hardware e Rastreio de Runtime

- **Sistema Operacional:** `Windows-11-10.0.26200-SP0`
- **Versao Python:** `3.14.7`
- **Versao PyTorch:** `2.13.0+cpu`
- **CUDA Disponivel:** `False` (Driver / CUDA Toolkit: `N/A`)
- **cuDNN:** `N/A`
- **Dispositivos GPU:** `0`

### Dispositivos Detectados:
*Host fisico opera GPU (Radeon RX 570 Series, Intel(R) UHD Graphics 630) com aceleracao Vulkan / llama.cpp (8.0 GiB VRAM).* 
*PyTorch local opera em modo CPU override por ausencia de suporte ROCm Polaris no Windows.* 


---

## 2. Inspecao de Checkpoint e Aquecimento (Warm-up)

O modelo canonico **convaiinnovations/laya-multilingual** (322M parametros) foi instanciado e validado:
- **Tempo de Aquecimento (Warm-up):** `33067.48 ms`
- **Device de Execucao:** `cpu`
- **Inferencia de Pesos Reais:**
  - `noul`: `0.1897` (probabilidade calibrada RLCD)
  - `choice`: `simple` (decisao categorica de triagem)
  - `score`: `1.1207` (pontuacao de priorizacao)
  - `confidence`: `0.4775`
  - `weights_loaded`: `True`
  - `fallback_used`: `False`

---

## 3. Benchmarks de Latencia e Throughput Concorrente

| Lote (Batch) | Requisicoes | Tempo Total (ms) | Latencia Media (ms) | Vazao (req/s) | VRAM Alocada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | 252.58 | 252.58 | 3.96 | 0.0 MB |
| 4 | 4 | 1011.47 | 252.87 | 3.95 | 0.0 MB |
| 9 | 9 | 2246.40 | 249.60 | 4.01 | 0.0 MB |


---

## 4. Receita de Deploy em Producao com GPU Ativa (CUDA)

Para subir o microservico de inferencia com aceleracao de hardware:

### A. Execucao via Docker Container com NVIDIA Container Toolkit:
```bash
# Build da imagem de inferencia GPU
docker build -f tools/laya_service/Dockerfile.gpu -t nexus-sota/laya-multilingual-gpu:latest .

# Execucao com passthrough de GPU
docker run --gpus all -d -p 8192:8192 --name laya-gpu-service \
  -e CHICO_LAYA_DEVICE=cuda \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  nexus-sota/laya-multilingual-gpu:latest
```

### B. Execucao via Docker Compose:
```bash
docker compose -f tools/laya_service/docker-compose.gpu.yml up -d
```

### C. Provisionamento em GCP Compute Engine (Instance com GPU T4 ou L4):
```bash
gcloud compute instances create sota-laya-inference-node \
  --zone=us-central1-a \
  --machine-type=g2-standard-4 \
  --accelerator=type=nvidia-l4,count=1 \
  --maintenance-policy=TERMINATE \
  --image-family=common-cu124-debian-11-py310 \
  --image-project=deeplearning-platform-release \
  --boot-disk-size=50GB \
  --metadata=startup-script="git clone <REPO> /app && cd /app && pip install -r requirements.txt && python3 scripts/ops/homologar_laya_gpu.py --serve --port 8192"
```

---

## 5. Rotas HTTP Expostas no Modo Microservico (--serve)

1. `GET /health` -> Verifica integridade, GPU e VRAM alocada.
2. `POST /predict` -> Inferencia S1 Laya Multilingual com proveniencia integral SS4.
3. `POST /solve` -> Modulacao direta dos 4 pilares de solvers (CFR+, Monte Carlo, TimesFM, Dream-RSI).
