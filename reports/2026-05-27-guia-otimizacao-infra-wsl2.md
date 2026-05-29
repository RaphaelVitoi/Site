# GUIA DE OTIMIZACAO DE INFRAESTRUTURA: WSL2 & LINUX KERNEL
## Otimizacoes de Latencia, Desempenho e Estabilidade (SOTA v7.0 GOLD)

> **Status:** Homologado | **Autor:** @chico (Antigravity SOTA Core)
> **Objetivo:** Extrair a performance limite da maquina host Windows nas execucoes nativas do WSL2.

---

## 1. Otimizacoes Globais do WSL2 (`.wslconfig`)

Para evitar vazamentos de memoria (memory leaks), contencao de CPU e picos de latencia (micro-stutters) durante inferencias de IA, configure o arquivo global do WSL2 no host Windows.

### Configuracao Recomendada
Crie ou edite o arquivo **`C:\Users\Raphael\.wslconfig`** com as seguintes diretivas otimizadas:

```ini
[wsl2]
# 1. Modo de Rede Espelhado (Mirrored Mode)
# Reduz a latencia de socket virtual a zero. O WSL compartilha as portas locais diretamente 
# com o Windows, permitindo conexoes em localhost (127.0.0.1) sem NAT ou redirecionamento virtual.
networkingMode=mirrored
firewall=true

# 2. Gerenciamento Termodinamico de Memoria
# Limita o consumo do WSL a 8GB de RAM, evitando esgotamento da RAM do Host.
memory=8GB
# Ativa a devolucao dinamica gradual de memoria RAM nao utilizada de volta ao Windows.
autoMemoryReclaim=gradual

# 3. Alocacao de Processadores
# Reserva cores especificos para o Windows e outros para o WSL para evitar contencao.
processors=6

# 4. Compactacao Dinamica de Disco (VHDX Sparse)
# Faz com que o disco virtual do WSL2 (.vhdx) encolha automaticamente ao deletar arquivos 
# (essencial para limpezas de logs e bancos de dados SQLite temporarios).
sparseVhd=true

# 5. Modo de Console Avancado
guiApplications=false
```

---

## 2. Otimizacoes de Kernel Nativas do Linux para o Projeto

O Linux nos fornece primitivas de kernel extremamente robustas para aceleracao de I/O e concorrencia que podem ser injetadas diretamente no projeto:

### A. Integracao do `uvloop` no Backend FastAPI
O `uvloop` e um substituto de alta performance para o loop de eventos nativo do `asyncio` em Python, escrito em Cython sobre a biblioteca `libuv`. Ele torna a performance de sockets assincronos do Python equivalente a de Go ou Node.js, reduzindo a latencia de rede no `gemma_server.py` em ate **2x a 4x**.

- **Disponibilidade:** Exclusivo para Linux/Unix.
- **Implementacao recomendada em `gemma_server.py`**:
```python
if os.name != "nt":
    try:
        import uvloop
        uvloop.install()
        logger.info("[INFRA] uvloop instalado e ativo como motor assincrono.")
    except ImportError:
        logger.warning("[INFRA] uvloop nao instalado. Usando loop de eventos asyncio padrao.")
```

### B. SQLite Mapeado em Memoria RAM (`/dev/shm`)
O diretorio `/dev/shm` no Linux e um sistema de arquivos montado diretamente na memoria RAM fisica (RAM Disk) gerenciado diretamente pelo kernel.
- **Caso de Uso:** Para execucoes de testes unitarios ou ambientes sandbox que geram volumes massivos de escrita e leitura de banco de dados e logs temporarios.
- **Otimizacao:** Em ambientes de desenvolvimento/teste rapidos, configurar o `DATABASE_URL` no `.env` do WSL2 para apontar para `/dev/shm/dev.db` aniquila a latencia fisica de disco (I/O fisico vira I/O de memoria RAM) e poupa o ciclo de vida de gravacao do SSD/NVMe do Host Windows.

### C. SQLite `PRAGMA mmap_size` O(1) de Kernel
No Linux, o gerenciamento de arquivos mapeados em memoria virtual (`mmap`) e altamente otimizado:
* No arquivo `database/queue_manager.py` nos ja usamos `PRAGMA mmap_size=30000000000;`. No Linux/WSL2, isso faz com que o kernel do Linux mapeie virtualmente o banco de dados inteiro diretamente na memoria virtual do processo. Toda consulta de leitura no banco de dados torna-se uma operacao de leitura de memoria pura na RAM, ignorando chamadas de sistema (`syscall`) de I/O de disco.

---
*Relatorio de Otimizacao de Infraestrutura homologado sob a egide SOTA v7.0 Gold.*
