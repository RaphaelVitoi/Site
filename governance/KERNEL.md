# Governance Kernel — ponteiro

> **A doutrina canônica do projeto `Site` é [`../CLAUDE.md`](../CLAUDE.md).**
> Este arquivo é **ponteiro**, não cópia. Não reintroduza aqui regra nenhuma.

**Motivo medido, 2026-09-29.** Este arquivo declarava-se *"the canonical
governance source for the repository and its agent ecosystem"*, e o
`docs/INDEX.md` o listava como **nº 1 na ordem de autoridade** — ao lado do
`CLAUDE.md`, que o `AGENTS.md`, o `GEMINI.md` e o
`.claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md` apontam como canônico. Duas
autoridades concorrentes, com o INDEX publicando uma ordem invertida em relação
a tudo que os adaptadores declaram.

**O defeito não era a coexistência: era a semântica.** O `KERNEL.md` definia
**Tiers 0 a 3** com outro significado — `Tier 1` era "primary orchestrator",
`Tier 2` "restricted kernel mutation rights". O `CLAUDE.md` §0 define **8
Tiers**, onde `Tier 1` é o Núcleo Cognitivo Mestre. Um agente que lesse este
arquivo primeiro receberia uma pirâmide de 4 Tiers e a aplicaria à de 8: a
fonte paralela que a §4 nomeia, com o agravante de inverter o mesmo inteiro.

**O que sobrevive, e por quê.** As peças deste arquivo com valor próprio já
vivem onde pertencem, e foram preservadas intactas:

| Peça | Onde vive | Consumida por máquina? |
| :--- | :--- | :--- |
| Perfil de host, modos de boot, regras de recuperação | [`environment.md`](environment.md) | não — contrato lido por humano e agente |
| Política de autonomia por modo | [`autonomy.yaml`](autonomy.yaml) | **não — ver medição abaixo** |
| Invariantes operacionais e roteamento de mudança | [`REPOSITORY_RULES.md`](REPOSITORY_RULES.md) | não |
| Portões de aprovação, política de mutação, handoff | [`../CLAUDE.md`](../CLAUDE.md) §2 (portão) e §9 (handoff) | não |

**Medido em 2026-09-29: `autonomy.yaml` não é lida por nada.** A especificação
de 2026-05-22 exige que o runtime *"loads and validates `governance/autonomy.yaml`"*,
e `governance/environment.md` promete que a ausência do arquivo leva a
fallback estrito. Nenhuma das duas coisas acontece: `agents/autonomy.py` nunca
menciona `autonomy.yaml` — os cinco modos estão hardcoded no código — e o modo
efetivo vem de `system_state.autonomy_mode` no banco `queue/tasks.db`
(medido: `'full'`), que tem precedência sobre o leitor legado. O arquivo é
**documento de intenção, não instrumento de execução**: descreve uma política
que o runtime não aplica, e `protected_paths` lista `governance` — o que
significa que ele é protegido, não que ele é lido. Um arquivo que parece
normativo e não é é pior que um ausente. Ver §3.

O que **não** sobrevive é a redefinição de Tiers. Um número que dois documentos
atribuem a coisas diferentes não é documento: é ambiguidade com aparência de
autoridade.

---

## Ordem de autoridade do projeto `Site`

Resolvida em 2026-09-29 por medição. Um agente que precise decidir para onde
olhar lê esta lista e para:

1. **[`../CLAUDE.md`](../CLAUDE.md)** — constituição do projeto. Portão,
   soberania, Tiers, taxonomia, identidade de autoria.
2. **[`environment.md`](environment.md)** — contrato de host e runtime. Como o
   ambiente se comporta; não decide política.
3. **[`autonomy.yaml`](autonomy.yaml)** — autonomia por modo. **Declara uma
   política que o runtime não aplica** (ver §3). Não confie nele para
   prever o modo efetivo.
4. **[`REPOSITORY_RULES.md`](REPOSITORY_RULES.md)** — invariantes operacionais e
   roteamento de mudança.
5. **[`../docs/INDEX.md`](../docs/INDEX.md)** — índice de referências. **Não é
   ordem de autoridade**; é mapa de leitura.
6. `AGENTS.md`, `GEMINI.md`, `.claude/GOVERNANCA/*` — **adaptadores**. Apontam
   para o que está acima; nunca definem.

**Em conflito, vence a fonte mais específica da lista acima, e o desacordo se
declara em vez de ser resolvido por cópia.** É a doutrina que o
`GLOBAL_INSTRUCTIONS.md` já enunciava e que ninguém executava: ele dizia
*"em conflito, siga a fonte mais específica acima"*, enquanto o `INDEX.md`
publicava uma ordem **invertida** logo abaixo. A instrução estava certa; o mapa
é que a desmentia.

## Regra de manutenção desta página

Governança nova entra no `CLAUDE.md`. Aqui não entra nada, e o que já está
permanece. É a regra do ponteiro aplicada a si mesmo: a lista de papéis acima
pode **encolher**, nunca crescer. `tests/test_governanca_kernel_ponteiro.py`
reprova o crescimento e a redefinição de Tiers.

---

## 3. `autonomy.yaml` descreve; não decide

**Medido em 2026-09-29.** A cadeia real de autonomia, do comando ao efeito:

```
nexus autonomy <modo>  ──►  system_state.autonomy_mode  (queue/tasks.db)
                                      │  tem precedência
                                      ▼
                     _read_legacy_autonomy_config()  ──►  ./autonomy.json  (CWD)
                                                              ↑ nunca existiu
```

Três fatos, todos medidos:

1. **A fonte de verdade é o banco.** `agents/autonomy.py:105` consulta
   `system_state.autonomy_mode` primeiro; o arquivo só é lido se o banco
   estiver vazio. Estado medido hoje: `'full'`.
2. **O arquivo de fallback é código morto.** `Path("autonomy.json")` resolve
   contra o CWD. Esse arquivo **nunca foi versionado** (`git log --all -- autonomy.json`
   é vazio) e o `.gitignore` não o cobre — mas também nunca precisou existir,
   porque o banco sempre tem precedência sobre ele.
3. **A política declarada não é aplicada.** A especificação de 2026-05-22 exige
   que o runtime carregue e valide `autonomy.yaml`; `environment.md` promete
   fallback estrito na ausência dele. `agents/autonomy.py` **não menciona o
   arquivo uma única vez** — os cinco modos estão hardcoded.

**Consequência.** `autonomy.yaml` é documento de intenção. Ler o modo efetivo
dele é ler uma ficção: `deny_state_changing_commands: false` sob `full`
parece autorização, e não é — quem autoriza é o valor na tabela. Alguém pode
editar `autonomy.yaml` achando que muda o comportamento, e nada muda. É a
mesma classe de falha do `KERNEL.md` dual: um arquivo com aparência normativa
que ninguém executa.

**Não corrigido aqui, deliberadamente.** Fazer o runtime ler o `autonomy.yaml`
**foi avaliado e rejeitado por medição** (2026-09-29), não por princípio de
"não mexer no runtime". Três motivos, todos verificados:

1. **O YAML perde um token de segurança.** O autor escreveu `- format ` com
   espaço final, para casar com o literal Python — e **YAML apara o espaço final
   de escalar não-quotado**. A intenção se perde sem erro, sem aviso e sem
   diff. Só foi visto porque o token foi comparado elemento a elemento. Ligar o
   YAML ao runtime teria introduzido um `format` sem espaço, que reprova
   `npm run format` — comando oficial do `package.json` — em modo `partial`.
2. **`protected_paths` inclui `governance` e `scripts`.** Aplicá-lo bloqueia a
   própria manutenção de governança, inclusive a que produziu este §3. É a
   lista de proteção escrita antes de existir alguém para protegê-la.
3. **`sandbox` não passa por `_validate_command`.** O YAML declara
   `sandbox.deny_state_changing_commands: true`; o código desvia para o
   container e continua. O isolamento vem de `--network bridge`,
   `no-new-privileges` e `cap-drop ALL` — não da validação de comando. Ligar o
   YAML criaria a *aparência* de enforcement exatamente onde não há.

Além disso, `_resolve_effective_mode` pode devolver `full_restricted`, que não
está em `VALID_AUTONOMY_MODES` nem no YAML; e a checagem de
`state_changing_commands` só dispara quando o modo é exatamente `partial`, o
que deixa `full_restricted` e `sandbox` sem a proteção que o YAML promete.

**O que foi feito, em vez disso.** Correção da fonte, não do consumidor:

- O token foi quotado (`- 'format '`), com comentário explicando que o espaço
  é semântico. A intenção do autor agora sobrevive ao parser.
- O cabeçalho do YAML declara, na language em que é lido, o que é aplicado e
  o que não é, e `doctrine` passou a apontar para `../CLAUDE.md` — que é a
  constituição, e não este arquivo.
- `tests/test_autonomia_politica_declarada.py` trava a distância: 10 testes que
  comparam YAML e código elemento a elemento, registram o desvio de `sandbox`,
  o modo `full_restricted` não declarado, e as quatro famílias sem
  enforcement. Se `autonomy.py` passar a ler o YAML, o teste quebra com as três
  ressalvas — porque fechar a distância sem revisão é que produz a política que
  ninguém escreveu.

**Correção de um artefato só, quando autorizada:** `nexus autonomy <modo>` deve
imprimir o modo que gravou e o modo efetivo resolvido, e um teste deve fixar a
precedência banco→arquivo. Enquanto isso não existir, o único jeito de saber o
modo real é ler `system_state.autonomy_mode` na tabela — e é isso que este §3
diz.
