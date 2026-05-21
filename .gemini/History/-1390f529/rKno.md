# SPEC: Componente CodeBlock

> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Execução
> **Alinhamento:** COSMOVISAO.md (Beleza Estrutural, Interatividade Funcional)

---

## 1. Visão Geral

O componente `CodeBlock` será responsável por renderizar trechos de código (snippets) dentro dos artigos técnicos e de ferramentas do ecossistema. Ele deve seguir a estética "Cyber/Dark" e oferecer um feedback interativo tátil e rápido.

## 2. Requisitos de UI/UX

- **Syntax Highlighting:** Suporte visual limpo para TypeScript, Python, PowerShell e JSON.
- **Botão de Copiar:** Um botão no canto superior direito que copia o código para a área de transferência do usuário e oferece um micro-feedback ("Copiado!").
- **Identificação de Linguagem:** Uma `label` no cabeçalho do bloco indicando a linguagem (ex: "typescript").
- **Estética:** Fundo denso (`bg-slate-950` ou similar), contorno sutil (`border-white/5` ou `border-white/10`) e fonte otimizada para código (`font-mono`).

## 3. Requisitos de Arquitetura (Props Imutáveis)

Garantindo alinhamento com os padrões do React 19+ e TS SOTA, as `props` DEVEM usar o modificador `readonly`.

```typescript
interface CodeBlockProps {
  readonly code: string;
  readonly language: string;
  readonly showLineNumbers?: boolean;
}
```

## 4. Plano de Execução (@implementor)

1. **Implementação do Componente:** Criar o arquivo `frontend/src/components/CodeBlock.tsx`.
2. **Highlighting:** Recomenda-se a utilização de uma lib nativa React leve ou classes próprias do Tailwind.
3. **Micro-interação de Cópia:** Implementar o hook para uso da API `navigator.clipboard.writeText`, com um controle de estado (`isCopied`) que volta a `false` após 2 segundos.
4. **Renderização:** Garantir que o bloco permita scroll horizontal nativo caso a linha de código seja muito longa, não quebrando o layout da página (`overflow-x-auto`).

## 5. Próximos Passos

- Injetar um bloco de teste na página inicial da Biblioteca assim que implementado.
