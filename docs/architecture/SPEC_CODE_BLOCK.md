# SPEC: Componente CodeBlock

> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Execucao
> **Alinhamento:** COSMOVISAO.md (Beleza Estrutural, Interatividade Funcional)

---

## 1. Visao Geral

O componente `CodeBlock` sera responsavel por renderizar trechos de codigo (snippets) dentro dos artigos tecnicos e de ferramentas do ecossistema. Ele deve seguir a estetica "Cyber/Dark" e oferecer um feedback interativo tatil e rapido.

## 2. Requisitos de UI/UX

- **Syntax Highlighting:** Suporte visual limpo para TypeScript, Python, PowerShell e JSON.
- **Botao de Copiar:** Um botao no canto superior direito que copia o codigo para a area de transferencia do usuario e oferece um micro-feedback ("Copiado!").
- **Identificacao de Linguagem:** Uma `label` no cabecalho do bloco indicando a linguagem (ex: "typescript").
- **Estetica:** Fundo denso (`bg-slate-950` ou similar), contorno sutil (`border-white/5` ou `border-white/10`) e fonte otimizada para codigo (`font-mono`).

## 3. Requisitos de Arquitetura (Props Imutaveis)

Garantindo alinhamento com os padroes do React 19+ e TS SOTA, as `props` DEVEM usar o modificador `readonly`.

```typescript
interface CodeBlockProps {
  readonly code: string;
  readonly language: string;
  readonly showLineNumbers?: boolean;
}
```

## 4. Plano de Execucao (@implementor)

1. **Implementacao do Componente:** Criar o arquivo `frontend/src/components/CodeBlock.tsx`.
2. **Highlighting:** Recomenda-se a utilizacao de uma lib nativa React leve ou classes proprias do Tailwind.
3. **Micro-interacao de Copia:** Implementar o hook para uso da API `navigator.clipboard.writeText`, com um controle de estado (`isCopied`) que volta a `false` apos 2 segundos.
4. **Renderizacao:** Garantir que o bloco permita scroll horizontal nativo caso a linha de codigo seja muito longa, nao quebrando o layout da pagina (`overflow-x-auto`).

## 5. Proximos Passos

- Injetar um bloco de teste na pagina inicial da Biblioteca assim que implementado.

