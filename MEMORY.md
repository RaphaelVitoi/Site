# PERSISTÊNCIA DE MEMÓRIA SOTA - 16/06/2026
**Anchor ID:** SITE-V8-GOLD-RESTORED

## DECISÕES ARQUITETURAIS
1. **Source of Truth:** C:\Users\rapha\.gemini\Site.
2. **Paridade de Motores:** math_sota.py LOCAL (v7.0 GOLD) preservado contra overwrite da nuvem (inferior).
3. **Cura de Runtime:** Injetado vcruntime140.dll e instalado VCRedist 2025 para habilitar PyTorch 2.9.0 no Python 3.14.5.

## ESTADO DO HARDWARE
- **Bloqueio SATA:** Kingston (D:) e Toshiba (E:) detectados via PnP mas ocultos no kernel.
- **Causa:** Driver iaStorAC (Intel RST).
- **Procedimento Pós-Boot:** Executar 'Update-StorageProviderCache' e forçar 'Online' via Diskpart.

## BANCO DE DADOS
- **Postgres 16:** Serviço ativo e rodando no Windows 11 (Status: Running).

## STATUS ESTÉTICO
- Perfil Ouro Ativo.
