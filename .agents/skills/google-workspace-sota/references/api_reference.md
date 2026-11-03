# Google Workspace API & MCP Quick Reference

Guia de consulta rápida para operadores de busca, filtros de query e parâmetros canônicos nas 4 APIs do Google Workspace.

---

## 1. Google Drive Query Syntax (`q`)

Exemplos de strings de busca para o parâmetro `q` da API v3 do Drive:

| Caso de Uso | Sintaxe do `q` |
| :--- | :--- |
| Arquivos ativos fora da lixeira | `trashed = false` |
| Google Docs contendo palavra | `trashed = false and mimeType = 'application/vnd.google-apps.document' and fullText contains 'reunião'` |
| Arquivos de vídeo | `trashed = false and mimeType contains 'video/'` |
| Pastas de reuniões do Meet | `trashed = false and mimeType = 'application/vnd.google-apps.folder' and name contains 'Meet'` |
| Arquivos modificados recentemente | `trashed = false and modifiedTime > '2026-08-01T00:00:00Z'` |
| Itens dentro de uma pasta específica | `'ID_DA_PASTA' in parents and trashed = false` |

### MIME Types mais comuns:
- Google Document: `application/vnd.google-apps.document`
- Google Spreadsheet: `application/vnd.google-apps.spreadsheet`
- Google Presentation: `application/vnd.google-apps.presentation`
- Google Drive Folder: `application/vnd.google-apps.folder`
- PDF: `application/pdf`
- Markdown / Texto: `text/markdown`, `text/plain`

---

## 2. Gmail Search Operators (`query`)

Operadores válidos no parâmetro `query` / `q` da API v1 do Gmail:

| Operador | Significado | Exemplo |
| :--- | :--- | :--- |
| `from:` | Remetente específico | `from:notificacoes@banco.com` |
| `to:` | Destinatário específico | `to:raphavitoi@gmail.com` |
| `subject:` | Palavras no assunto | `subject:fatura OR subject:boleto` |
| `has:attachment` | Contém anexo | `has:attachment filename:pdf` |
| `is:unread` | Mensagens não lidas | `is:unread category:primary` |
| `after:` / `before:` | Intervalo de datas (`YYYY/MM/DD`) | `after:2026/08/15 before:2026/09/01` |
| `larger:` / `smaller:` | Tamanho do e-mail | `larger:5M` |

---

## 3. Google Calendar Filtering (`list_events`)

Parâmetros para paginação e janela temporal na API v3 do Calendar:

| Parâmetro | Formato / Tipo | Descrição |
| :--- | :--- | :--- |
| `calendarId` | string | `"primary"` para o calendário principal |
| `timeMin` | RFC 3339 string | Início da janela (ex: `2026-09-04T00:00:00-03:00`) |
| `timeMax` | RFC 3339 string | Término da janela (ex: `2026-09-04T23:59:59-03:00`) |
| `singleEvents` | boolean (`true`) | Expande eventos recorrentes em instâncias individuais |
| `orderBy` | string | `"startTime"` (requer `singleEvents=true`) |

---

## 4. Google Sheets Ranges (`get_values`, `update_values`)

Notação canônica A1 para intervalos:

| Notação | Escopo Selecionado |
| :--- | :--- |
| `Sheet1!A1:D10` | Células de A1 até D10 na aba "Sheet1" |
| `'Aba com Espaço'!A:A` | Coluna A inteira |
| `A2:Z` | Da linha 2 até o fim da planilha em todas as colunas até Z |
| `update_values` | Exige `valueInputOption: "USER_ENTERED"` para parsing automático de datas/números |
