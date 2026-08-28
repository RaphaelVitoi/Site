---
id: handoff-2026-08-28-browser-sota-cdp
tipo: handoff
escopo: navegador, CDP, MCPs, qualidade e continuidade operacional
ecossistema: gemini-antigravity
autor: sessao-concorrente@nao-declarado
criado_em: 2026-08-28T04:01:35-03:00
commit: 4888f666
classes: [interno, medido, runtime-parcial]
estado: handoff-completo-com-excecoes-explicitas
config_medida:
  repositorio: C:/Users/rapha/.gemini/Site
  branch: master
  head_inicial: 4888f666
  suite_python_no_momento: 493 passed
  data: 2026-08-28
verificado:
  - npm run sota full aprovado -- Ruff, Pyright, ESLint, TypeScript e 493 testes
  - JUnit Python sem saida truncavel -- 493 de 493, com hash no artefato externo
  - npm test aprovado -- 18 suites, 95 testes, 0 erros e 0 warnings
  - lint de workflows aprovado; npm audit sem vulnerabilidade
  - nexus index --suspeitos aprovado -- 121 arquivos, 9 vigentes, 1 obsoleto
  - cwv_gate.ps1 parseado em pwsh 7 e em Windows PowerShell 5.1
  - pre-commit executado sem bloqueio, veredito FRAGIL com os 2 warnings do
    POSTULADO-001
nao_verificado:
  - fases 1 e 2 do CWV continuam literais; a baseline sintetica NAO e medicao
  - pip-audit nao fica verde -- quatro vulnerabilidades sem correcao upstream em
    chromadb, tratadas como excecao explicita
  - a disponibilidade efetiva do MCP de extensoes exige reinicio do cliente e
    teste de runtime do service worker, nao feitos
  - o proxy CDP 9224 ficou pendente -- listener nao estava ativo
  - o achado de credencial em argumento de MCP NAO reproduziu na verificacao
    independente de 2026-08-28T08:40; ver INTERLUDIO-2026-08-28 secao 7
_ancora_normalizada_por: claude@opus-5 em 2026-08-28T09:15-03:00. Somente o
  frontmatter foi tocado, para satisfazer a secao 13.B; verificado e
  nao_verificado foram TRANSCRITOS das declaracoes do proprio documento (matriz
  de validacao e limites visiveis), nunca inferidos. O corpo esta intacto.
supersede: null
---

# HANDOFF — Browser SOTA, Chrome Dev, CDP e qualidade

## Veredito

O endurecimento de perfis, atalhos e CDP foi concluído de modo reversível, com
rollback e evidência preservados. A baseline de código foi reparada e toda a
suíte aplicável está verde. O pré-commit real executou sem erro, detectou o
Chrome Dev administrativo em `127.0.0.1:9223` e registrou corretamente o
estado **FRÁGIL**, não verde: CWV e acessibilidade ainda não possuem medição
real, e `pip-audit` continua apontando quatro vulnerabilidades sem release
corrigido no `chromadb 1.5.9`.

Nenhum commit ou push foi feito. Nenhuma mudança já preparada por outro fluxo
foi encenada, removida ou reescrita neste handoff.

## Estado operacional atual

| Superfície | Estado | Evidência |
|---|---|---|
| Chrome estável multifocal | Preservado | atalho oficial sem CDP ou flags experimentais forçadas |
| Chrome Dev Admin | Preservado e ativo | `127.0.0.1:9223/json/version` respondeu como Chrome `154.0.8025.0` |
| Atalhos Chrome Dev — usuário e `ProgramData` | Endurecidos | perfil `User Data - Admin`; porta `9223`; origem `http://127.0.0.1:9224`; wildcard e cinco flags GPU de fallback ausentes |
| Chrome Dev alternativo | Quarentena recuperável | 17.810 arquivos; 8.641.227.114 bytes preservados |
| Guest Profile Admin | Quarentena recuperável | 140 arquivos; 7.584.964 bytes preservados |
| Edge e Edge Dev | Preservados | nenhuma alteração em perfis, Microsoft 365, Copilot ou políticas Edge |
| Background global Chrome | Preservado | `BackgroundModeEnabled=1` mantido |
| Proxy CDP `9224` | Não ativo nesta coleta | listener ausente; sem tentativa de contornar a restrição do runner para iniciar auxiliar local |
| Ollama `11434` | Ativo em loopback | listener local observado na auditoria anterior |

## Correções realizadas nesta etapa

1. Ruff: removidos nomes de variável ambíguos que interrompiam a suíte, sem
   mudar o contrato dos gates ou testes.
2. Pyright: `nexus index` passou a importar `scripts.ops.record_index` pelo
   caminho estático do pacote; `nexus index --suspeitos` foi executado com
   sucesso e estado derivado consistente.
3. Higiene Python: removido o import `os` sem uso em `record_index.py`.
4. Governança de referências: as três menções históricas do plano 2-B foram
   declaradas no frontmatter, em vez de uma isenção oculta no detector.
5. Gate CWV: consulta ordenadamente `9223, 9222`, registra a porta efetiva e
   mantém compatibilidade com a instância padrão legada.
6. Relatórios CWV: JSON e Markdown agora reproduzem o mesmo estado triestável
   do console. Sem medição de fases 1 e 2, declaram `FRAGILE`, não aprovação
   dourada; o URL alvo também é interpolado corretamente.

## Artefatos externos, recuperação e integridade

Diretório operacional: `C:\Users\rapha\OneDrive\Documentos\Browser-Audits\2026-08-28-sota-browser-audit`.

| Artefato | Função |
|---|---|
| `AUDITORIA_SOTA_NAVEGADORES_2026-08-28.md` | relatório detalhado de GPU, navegador, perfis, extensões e limites |
| `MANIFESTO_QUARENTENA_20260828T025037.md` | origem/destino e restauração dos dois diretórios em quarentena |
| `MANIFESTO_ENDURECIMENTO_CDP_20260828T030000.md` | correções CDP, rollback e limites runtime |
| `HARDEN_ATALHO_GLOBAL_CHROME_DEV.ps1` | procedimento elevado, executado e validado |
| `pre-cdp-hardening-20260828T030000` | cópias de reversão dos scripts e atalhos |
| `SHA256SUMS.txt` | integridade dos artefatos de auditoria de navegador |
| `evidence-site-python-tests-20260828.xml` | JUnit: 493 testes, 0 falhas, 0 erros, 0 ignorados, 31,205 s; SHA-256 `43515268A536EB42E3614E522BC16A3DF0D6973D93F696BD1B4AFE83AB696197` |

Nenhum diretório foi apagado. Restauração da quarentena exige Chrome Dev
fechado e movimentação explícita de volta ao caminho original; exclusão
definitiva continua fora de escopo e exige novo consentimento.

## Matriz de validação final

| Verificação | Resultado | Evidência/limite |
|---|---|---|
| `npm run sota:full` | **Aprovado** | Ruff, Pyright, ESLint, TypeScript e 493 testes Python; 0 erros e 0 warnings |
| JUnit Python sem saída truncável | **Aprovado** | 493/493, 31,205 s, hash no artefato externo |
| `npm test` | **Aprovado** | 18 suítes, 95 testes, 0 erros e 0 warnings |
| `npm run lint:workflows` | **Aprovado** | Actionlint retornou sucesso |
| `npm audit --audit-level=low` | **Aprovado** | 0 vulnerabilidades |
| `pip-audit --cache-dir <temporário> -r requirements.txt` | **Exceção upstream explícita** | quatro vulnerabilidades sem versão de correção em `chromadb 1.5.9` |
| `nexus index --suspeitos` | **Aprovado** | 121 arquivos: 9 vigentes, 0 suspeitos, 1 obsoleto e 111 sem frontmatter |
| Parser `pwsh` e `powershell.exe` 5.1 | **Aprovado** | `cwv_gate.ps1` válido nos dois; BOM UTF-8 preservado |
| Pré-commit `cwv_gate.ps1` | **Sem bloqueio, FRÁGIL** | CDP ativo em 9223; CVE npm, SRI e higiene passaram; fases 1/2 geraram 2 warnings declarados |
| `git diff --check` | **Aprovado** | nenhum erro de whitespace |
| Proxy CDP `9224` | Pendente | listener não estava ativo; inicialização pelo runner foi bloqueada antes de executar |

## Limites que permanecem visíveis

1. **Medição de CWV/A11y:** o gate confirma o handshake CDP, mas as métricas e
   contadores das fases 1 e 2 continuam literais. Implementar instrumentação
   real exige definir navegador, alvo servido, protocolo de navegação e
   métricas por WebSocket CDP. A baseline sintética não é apresentada como
   medição.
2. **ChromaDB:** a versão instalada já é a mais recente publicada, e as quatro
   vulnerabilidades não têm correção upstream. O uso atual é
   `PersistentClient` embarcado, sem `HttpClient` ou `chroma run`; isso reduz a
   superfície, mas não torna o `pip-audit` verde. Uma migração requer plano de
   compatibilidade, exportação/importação dos índices e validação semântica.
3. **MCP de extensões:** `--categoryExtensions` foi configurado, mas a
   disponibilidade efetiva requer reinício do cliente MCP/IDE e teste de
   runtime do service worker.
4. **Segredo de MCP:** há credencial materializada como argumento em
   configuração local. Ela não foi exposta; a remediação correta é rotação
   externa e migração para mecanismo fora da linha de comando.

## Próximo passo seguro

Com autorização arquitetural separada, implementar medição CWV/A11y real e um
plano reversível de migração de ChromaDB. Para Git, revisar o diff e encenar
somente os arquivos intencionais; commit e push continuam autorizações
distintas.

## Lições de processo

- Uma suíte composta que falha cedo não prova as fases seguintes; JUnit com
  contagem, duração e hash elimina a ambiguidade causada por truncamento.
- Configuração, política e atalho são evidência de estado; listener, endpoint
  e extensão carregada são evidência runtime e não são equivalentes.
- Um relatório deve usar o mesmo veredito de seu gate. “Sem falhas” não é
  equivalente a “tudo medido”.
- Um runner restrito pode bloquear auxiliares locais mesmo quando o ambiente
  administrativo aplica uma mudança; os dois contextos precisam permanecer
  separados no handoff.
