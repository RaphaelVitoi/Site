# RELATÓRIO DE ENCERRAMENTO — GOVERNANÇA DE EXTENSÕES DEV

**Data do snapshot:** 2026-08-26 · America/Sao_Paulo
**Escopo atual:** Google Chrome Dev / perfil Admin SOTA e Microsoft Edge Dev
**Autoridade de governança:** Raphael Vitoi
**Estado:** encerrado com handoff documentado; mudanças futuras exigem novo gate de escopo.

> Este relatório substitui, para os dois canais Dev auditados nesta data, observações históricas divergentes presentes em relatórios anteriores. Ele não reescreve o histórico: delimita a evidência atual, a proveniência e o que ainda depende de nova decisão.

## 1. Resolução executiva

| Dimensão | Resultado auditado | Estado |
|---|---|---|
| Política Chrome Dev | 9 de 9 controles esperados no valor alvo | **PASS** |
| Política Edge Dev | 9 de 9 controles esperados no valor alvo | **PASS** |
| Governança de extensões | Regras por ID; sem blocklist, allowlist ou force-list global legado | **PASS** |
| Remoções aprovadas | SciGemini no Chrome; Improve YouTube! TEST, Audio Transcription, Chessvision.ai e TubeLens no Edge | **registradas como `removed`** |
| Conteúdo / segurança | uBOL Lite MV3 gerenciado no Chrome; uBO completo `force_installed` no Edge | **PASS** |
| Recuperação | Três backups de política, com SHA-256 registrado | **PASS** |
| Integridade de automação | Oito scripts PowerShell parseados sem erro | **PASS** |
| Verificação no navegador | Administrador confirmou as páginas de política após reinício/reload | **atestado pelo administrador** |

### Plataformas verificadas

| Produto | Executável verificado | Versão |
|---|---|---:|
| Google Chrome Dev | `C:\Program Files\Google\Chrome Dev\Application\chrome.exe` | `154.0.8013.2` |
| Microsoft Edge Dev | `C:\Program Files (x86)\Microsoft\Edge Dev\Application\msedge.exe` | `153.0.4234.2` |

## 2. Snapshot de política efetiva

### Chrome Dev / Admin SOTA

| Política | Esperado | Lido de volta | Resultado |
|---|---:|---:|---|
| `SafeBrowsingProtectionLevel` | 2 | 2 | PASS |
| `SafeBrowsingExtendedReportingEnabled` | 1 | 1 | PASS |
| `SafeBrowsingDeepScanningEnabled` | 1 | 1 | PASS |
| `SafeBrowsingForTrustedSourcesEnabled` | 1 | 1 | PASS |
| `MetricsReportingEnabled` | 1 | 1 | PASS |
| `BackgroundModeEnabled` | 1 | 1 | PASS |
| `DeveloperToolsAvailability` | 1 | 1 | PASS |
| `ExtensionDeveloperModeSettings` | 0 | 0 | PASS |
| `NetworkPredictionOptions` | 2 | 2 | PASS |

### Edge Dev

| Política | Esperado | Lido de volta | Resultado |
|---|---:|---:|---|
| `SmartScreenEnabled` | 1 | 1 | PASS |
| `SmartScreenPuaEnabled` | 1 | 1 | PASS |
| `DiagnosticData` | 2 | 2 | PASS |
| `UrlDiagnosticDataEnabled` | 1 | 1 | PASS |
| `BackgroundModeEnabled` | 1 | 1 | PASS |
| `DeveloperToolsAvailability` | 1 | 1 | PASS |
| `ExtensionDeveloperModeSettings` | 0 | 0 | PASS |
| `NetworkPredictionOptions` | 2 | 2 | PASS |
| `ExtensionManifestV2Availability` | 3 | 3 | PASS |

## 3. Estado da governança de extensões

| Navegador | Entradas em `ExtensionSettings` | Blocklist global | Allowlist global | Legacy force-list |
|---|---:|---|---|---|
| Chrome Dev | 14 | Ausente | Ausente | Ausente |
| Edge Dev | 23 | Ausente | Ausente | Ausente |

Interpretação: a governança foi mantida por extensão/ID. Não há política global que impeça genericamente instalação ou remoção de extensões. Regras individuais são reversíveis pelos backups de política abaixo.

### Ações materialmente relevantes já consolidadas

| Navegador | Objeto | ID | Estado final de política |
|---|---|---|---|
| Chrome Dev | SciGemini — Gemini for Scientists | `fbdfkkohcnanaloccoianaglbgebjpoj` | `removed` |
| Chrome Dev | ChatGPT oficial — OpenAI | `hehggadaopoacecdllhhajmbjkdcmajg` | `allowed` |
| Chrome Dev | uBlock Origin Lite | `ddkjiahejlhfcafbddmgiahcphecmpfh` | gerenciado em MV3, modo `complete` |
| Edge Dev | Improve YouTube! TEST | `lodjfjlkodalimdjgncejhkadjhacgki` | `removed` |
| Edge Dev | Audio Transcription & Live Interpreter | `mgekiekmhamibkobnlfbphhifjkhkohh` | `removed` |
| Edge Dev | Chessvision.ai | `johejpedmdkeiffkdaodgoipdjodhlld` | `removed` |
| Edge Dev | TubeLens | `eaaomefpilfbdjhcaigglnjmmmedenah` | `removed` |
| Edge Dev | uBlock Origin oficial 1.73.0 | `odfafepnkmbhccpbejgmiehpchacaeak` | `force_installed`; origem Microsoft Edge Add-ons |

## 4. Evidência de rollback e integridade

Os arquivos-fonte operacionais permanecem fora deste repositório, em `C:\Users\rapha\Documents\Browser-Audits\2026-08-26`. Seus hashes constituem a âncora de integridade do handoff.

| Artefato | Bytes | SHA-256 |
|---|---:|---|
| `Relatorio-Final-Governanca-Extensoes.md` | 11961 | `6118299F18E25A5D876F420BC6E3B1AB20009667E8C9333F0305FFCDD3257095` |
| `Registro-de-Acoes-e-Rollback.md` | 7329 | `E7594F2D2DA55605C1A53A35CFB6132851573EA227AD02DA90915A33E0B8687B` |
| `Fase-C-Inventario-e-Proximas-Acoes.md` | 7626 | `860746D6C01C31EBBF65963110C2516AB1F5759B7296110DBF80C2047BC080E5` |
| `chrome-full-capacity-prechange-20260826-130739.reg` | 4992 | `8602C1B1923849517B396E6FAB8ED630DB7852E860D6B94C81BA5779F4530CA4` |
| `edge-full-capacity-prechange-20260826-130741.reg` | 7166 | `518971F2B399DF99EFD1B70932CD4F19740C71886B19536C309C577D182CAC41` |
| `edge-ubo-force-prechange-20260826-124600.reg` | 7168 | `F18788E007E48E13F59318806EE7A79DEDD89A3C67BFDF5C7FBCD6CA6FF4ADF5` |

### Scripts auditados — parse PowerShell

| Script | SHA-256 | Estado |
|---|---|---|
| `Apply-ChromeFullCapacityPolicy.ps1` | `4DA922A193F758BFB7B5BFFC38BD8977E6CAEE0EF8A0428E5312CF9799959B31` | PASS |
| `Apply-EdgeFullCapacityPolicy.ps1` | `A84132DF5B1EF2DF2F66248EA9F0902EB4F0A48892DC33D08C4A308037EF3A31` | PASS |
| `Apply-ExtensionRemovalPolicy.ps1` | `38DAB70992603352A85D10BF81380C463673CDF7FC2DC749751CE49CD890A990` | PASS |
| `Apply-uBlockOriginGoldMigration.ps1` | `173A631957D71E65B72F82E81146CB567A2082083B192A422EB0BBD0D051C6A6` | PASS |
| `Harden-ChromeNetworkPrediction.ps1` | `77063DBDC5840554C24DAB3E4F933C27E460FE1E90FC72C4B6EC64A4BD012E8E` | PASS |
| `Harden-EdgeNetworkPrediction.ps1` | `E2ED4EF7B426F9B742FF9104F1630B1A5711D43A21719FDDCF6DB876B614089F` | PASS |
| `Set-ChatGPTOpenAIPolicy.ps1` | `ADDD4CF254968F4512296E91FA04C47306B6986298A3B3D477D7B54FABE8CD80` | PASS |
| `Set-EdgeUboForceInstalled.ps1` | `4EB8D11CCE5B1244614BAE2B637C796C41849F798346BBDC479CEA5A8975B948` | PASS |

## 5. Segurança, privacidade e limites conhecidos

- Chrome Safe Browsing Avançado, relatório estendido e varredura profunda foram aprovados conscientemente. Downloads suspeitos podem ser encaminhados para análise antimalware.
- Chrome está em `WORKGROUP`. O Registro confirma `MetricsReportingEnabled=1`, mas a aplicação integral pode depender de inscrição em Chrome Enterprise Core.
- Edge está em `DiagnosticData=2` e `UrlDiagnosticDataEnabled=1`, portanto diagnósticos opcionais, uso, crash reports e URLs estão autorizados pela governança.
- SmartScreen/PUA foram configurados no Registro. A aplicação efetiva pode depender do requisito de gestão de dispositivo definido pela Microsoft.
- Nenhuma via indireta para páginas internas, CDP bruto, edição de perfil ou manipulação de `Secure Preferences` foi utilizada.
- Nenhuma desativação, remoção ou purge adicional foi executada após a lista explicitamente autorizada.

## 6. Protocolo de handoff iniciado

### Estado entregue ao próximo operador

1. Tratar este arquivo como o snapshot canônico para Chrome Dev/Admin SOTA e Edge Dev em 2026-08-26.
2. Tratar `C:\Users\rapha\Documents\Browser-Audits\2026-08-26` como cofre local dos scripts, relatórios detalhados e backups de rollback.
3. Antes de qualquer mutação, comparar o hash local com a tabela de integridade; em caso de discrepância, parar e investigar.
4. Para qualquer extensão remanescente, usar o ciclo: evidência de uso e permissão → ID explícito → `disable first` → observação → autorização específica para `remove`/`purge`.
5. Não restaurar um backup `.reg` em bloco para resolver incidente localizado. Restaurar somente após comparar as entradas alvo e o impacto nas regras de extensão existentes.
6. Não converter a exceção MV2 do Edge em permissão geral: `ExtensionManifestV2Availability=3` deve continuar limitada a extensões gerenciadas.

### Gates de reabertura

| Gatilho | Ação exigida |
|---|---|
| Nova extensão com acesso a todos os sites, captura de reunião ou leitura/escrita de conteúdo | Revisão de permissões, publicador, versão e necessidade antes de habilitar. |
| Pedido de purge | Consentimento explícito para extensão e caminhos exatos, backup prévio, tamanho/hash e verificação pós-reinício. |
| Atualização de uBO/uBOL | Confirmar origem oficial, compatibilidade MV2/MV3 e preservar regras gerenciadas. |
| Falha de política em `chrome://policy` ou `edge://policy` | Registrar mensagem e origem; não editar perfil, cache ou preferências assinadas como tentativa de correção. |
| Necessidade de nova auditoria | Executar leitura de `HKLM`, validar os valores esperados e criar novo relatório datado; não sobrescrever este snapshot. |

## 7. Declaração de verificações

**Executadas:** leitura de política `HKLM`; comparação valor a valor; inventário de presença de listas globais; validação sintática PowerShell; SHA-256 de scripts, relatórios e backups; identificação de versão dos executáveis; leitura de estado Git antes da inclusão deste relatório.
**Não executadas:** leitura de cookies/perfis/sessões; telemetria de último uso; verificação de permissões de site por extensão; teste funcional automatizado de bloqueio de cada extensão; commit e push Git.
**Atestadas pelo administrador:** confirmação de `chrome://policy` e `edge://policy` após aplicação/reload.

---

*Handoff inicializado. Este arquivo deve ser versionado somente após revisão humana das mudanças pendentes do repositório e sem ignorar o pre-commit gate.*
