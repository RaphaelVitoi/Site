# Local llama.cpp Multimodal Inference Backend

This folder contains precompiled executable binaries and shared libraries (`.dll`) of `llama.cpp` tuned for local inference (including multimodal vision-language models like MiniCPM-V and Gemma 2B Vision).

## Directory Structure & Components

* **`llama-mtmd-cli.exe`**: Local multimodal executor wrapper. It processes text prompts alongside visual and auditory context inputs.
* **`llama-server.exe` / `llama-server-impl.dll`**: Embedded lightweight server to serve API endpoints locally.
* **`ggml-vulkan.dll`**: Vulkan compute backend, allowing GPU acceleration across diverse vendor hardware (NVIDIA, AMD, Intel).
* **Architecture-Optimized CPU backends (`ggml-cpu-*.dll`)**:
  * `ggml-cpu-alderlake.dll`: Optimized for Intel 12th+ Gen (hybrid arch).
  * `ggml-cpu-zen4.dll`: Optimized for AMD Zen 4 architectures (AVX-512).
  * `ggml-cpu-haswell.dll`, `ggml-cpu-skylakex.dll`, `ggml-cpu-sse42.dll`, etc.: Architecture-specific instruction dispatchers.
* **`libomp140.x86_64.dll`**: OpenMP runtime for multithreading coordination.

## Integration & Performance Optimization (SOTA Gold Standard)

The python wrapper `engine/avatars/run_avatar.py` invokes the local multimodal CLI using several key optimizations:

1. **Dynamic Thread Allocation (`-t`)**:
   Instead of hardcoding thread count, `run_avatar.py` dynamically queries physical CPU cores using `psutil.cpu_count(logical=False)` to avoid scheduling overhead and core thrashing on SMT/Hyperthreaded logical cores.
2. **VRAM Offloading (`-ngl` / `--gpu-layers`)**:
   Enables offloading model layers to VRAM. When running `llama-mtmd-cli.exe`, if `--ngl <layers>` is passed or configured, it binds with `ggml-vulkan.dll` to accelerate matrix multiplication on the GPU.
3. **Flash Attention (`-fa`)**:
   Activated by default in `llama-mtmd-cli` execution parameters to optimize attention matrix memory layout.
4. **Context Constraints (`-c` / `-b`)**:
   Restricts context size (`8192` tokens) and batch size (`1024` tokens) to balance prompt ingestion latency with GPU memory availability.

## Verification & Manual Dry-run

To run a manual multimodal inference query with VRAM offloading:

```bash
python engine/avatars/run_avatar.py --persona maverick --prompt "Analyze the table range" --image /path/to/board.png --ngl 16
```
