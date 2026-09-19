'use client';

import { useState, useMemo } from 'react';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

export interface FileItem {
  name: string;
  path: string;
  relative_path: string;
  category: 'text' | 'archive' | 'image' | 'media' | 'spreadsheet' | 'pdf';
  size: number;
}

export interface FileContent {
  type: 'text' | 'document' | 'spreadsheet' | 'image' | 'archive' | 'media';
  content?: string;
  message?: string;
  error?: string;
  format?: string;
  lines?: number;
  words?: number;
  chars?: number;
  data?: {
    headers: string[];
    rows: unknown[][];
    format?: string;
    size?: string;
    exif?: Record<string, string>;
    base64?: string;
  };
  files?: {
    name: string;
    size: number;
    is_dir: boolean;
  }[];
}

export interface ChartDataPoint {
  name: string;
  [key: string]: number | string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatCellValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'bigint' || typeof val === 'symbol') {
    return val.toString();
  }
  return JSON.stringify(val);
}

export interface UniversalDocumentViewerProps {
  readonly selectedFile: FileItem;
  readonly fileContent: FileContent | null;
  readonly loadingContent: boolean;
  readonly rawUrl?: string;
  readonly onClose?: () => void;
}

export function UniversalDocumentViewer({
  selectedFile,
  fileContent,
  loadingContent,
  rawUrl: customRawUrl,
  onClose,
}: Readonly<UniversalDocumentViewerProps>) {
  const [pdfTab, setPdfTab] = useState<'visual' | 'text'>('visual');
  const [mdTab, setMdTab] = useState<'formatted' | 'raw'>('formatted');
  const [gridSearch, setGridSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [docSearch, setDocSearch] = useState('');

  const rawUrl =
    customRawUrl ||
    `/api/vitoi/files/view?path=${encodeURIComponent(selectedFile.path)}&raw=true`;
  const downloadUrl = `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}download=true`;

  const isMarkdown = selectedFile.name.toLowerCase().endsWith('.md');
  const isDoc =
    selectedFile.name.toLowerCase().endsWith('.docx') ||
    selectedFile.name.toLowerCase().endsWith('.odt') ||
    selectedFile.name.toLowerCase().endsWith('.doc') ||
    selectedFile.name.toLowerCase().endsWith('.rtf');

  const fileExt = useMemo(() => {
    const parts = selectedFile.name.split('.');
    return parts.length > 1 ? parts.pop()?.toUpperCase() || 'ARQUIVO' : 'ARQUIVO';
  }, [selectedFile.name]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignora falha de clipboard silenciosamente
    }
  };

  const chartData = useMemo<ChartDataPoint[] | null>(() => {
    if (!fileContent?.data?.headers || !fileContent.data.rows) return null;
    const { headers, rows } = fileContent.data;
    const numIndices: number[] = [];

    headers.forEach((_: string, idx: number) => {
      let isNumeric = true;
      for (let i = 0; i < Math.min(rows.length, 3); i++) {
        const rowVal = rows[i]?.[idx];
        const val = Number(rowVal);
        if (Number.isNaN(val)) {
          isNumeric = false;
          break;
        }
      }
      if (isNumeric && rows.length > 0) {
        numIndices.push(idx);
      }
    });

    if (numIndices.length === 0) return null;

    return rows.slice(0, 30).map((row: unknown[], rIdx: number) => {
      const point: ChartDataPoint = { name: `R${rIdx + 1}` };
      numIndices.forEach((idx) => {
        const key = headers[idx];
        const rowVal = row[idx];
        if (key) {
          point[key] = Number(rowVal || 0);
        }
      });
      return point;
    });
  }, [fileContent]);

  if (loadingContent) {
    return (
      <div className="flex grow flex-col items-center justify-center space-y-4 py-24">
        <div className="relative flex items-center justify-center">
          <i className="fa-solid fa-circle-notch fa-spin text-accent-indigo text-4xl"></i>
          <i className="fa-solid fa-file text-accent-indigo/60 absolute text-sm"></i>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-white">Carregando e decodificando documento...</p>
          <p className="text-text-muted mt-1 text-[11px]">{selectedFile.name}</p>
        </div>
      </div>
    );
  }

  if (fileContent?.error) {
    return (
      <div className="flex grow flex-col items-center justify-center py-20 text-center text-xs">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
          <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
        </div>
        <p className="font-semibold text-rose-300">Não foi possível visualizar este arquivo</p>
        <p className="mt-2 max-w-md rounded-lg border border-rose-900/50 bg-black/40 p-3 font-mono text-[11px] text-rose-200">
          {fileContent.error}
        </p>
        <div className="mt-4 flex space-x-3">
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            <span>Tentar Abrir Raw</span>
          </a>
          <a
            href={downloadUrl}
            download={selectedFile.name}
            className="flex items-center space-x-1.5 rounded-lg bg-accent-indigo px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-indigo/80"
          >
            <i className="fa-solid fa-download"></i>
            <span>Baixar Arquivo</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 grow flex-col space-y-3">
      {/* Barra Superior de Ações do Documento */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-accent-indigo/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-accent-indigo-light uppercase">
            {fileExt}
          </span>
          <span className="text-text-muted text-xs">{formatFileSize(selectedFile.size)}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Ações para PDF */}
          {selectedFile.category === 'pdf' && (
            <div className="flex items-center rounded-lg border border-white/10 bg-black/30 p-0.5">
              <button
                type="button"
                onClick={() => setPdfTab('visual')}
                className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  pdfTab === 'visual'
                    ? 'bg-accent-indigo text-white shadow-sm'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <i className="fa-solid fa-eye text-[11px]"></i>
                <span>Visualizador PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setPdfTab('text')}
                className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  pdfTab === 'text'
                    ? 'bg-accent-indigo text-white shadow-sm'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <i className="fa-solid fa-file-lines text-[11px]"></i>
                <span>Texto RAG</span>
              </button>
            </div>
          )}

          {/* Ações para Markdown */}
          {isMarkdown && (
            <div className="flex items-center rounded-lg border border-white/10 bg-black/30 p-0.5">
              <button
                type="button"
                onClick={() => setMdTab('formatted')}
                className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  mdTab === 'formatted'
                    ? 'bg-accent-indigo text-white shadow-sm'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <i className="fa-solid fa-book-open text-[11px]"></i>
                <span>Formatado</span>
              </button>
              <button
                type="button"
                onClick={() => setMdTab('raw')}
                className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  mdTab === 'raw'
                    ? 'bg-accent-indigo text-white shadow-sm'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <i className="fa-solid fa-code text-[11px]"></i>
                <span>Código Fonte</span>
              </button>
            </div>
          )}

          {/* Botão de Copiar Conteúdo de Texto */}
          {fileContent?.content && (
            <button
              type="button"
              onClick={() => copyToClipboard(fileContent.content || '')}
              className={`flex items-center space-x-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium transition-all ${
                copied
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                  : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
              }`}
              title="Copiar conteúdo para a área de transferência"
            >
              <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          )}

          {/* Botão Abrir em Nova Aba */}
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-white/10 hover:text-white"
            title="Abrir arquivo bruto em nova aba"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            <span className="hidden sm:inline">Abrir Raw</span>
          </a>

          {/* Botão Baixar */}
          <a
            href={downloadUrl}
            download={selectedFile.name}
            className="flex items-center space-x-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20"
            title="Baixar arquivo original"
          >
            <i className="fa-solid fa-download text-[11px]"></i>
            <span className="hidden sm:inline">Baixar</span>
          </a>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-white/10 hover:text-white"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* RENDERIZAÇÃO: PDF VISUAL NATIVO */}
      {selectedFile.category === 'pdf' && pdfTab === 'visual' && (
        <div className="relative flex h-[620px] grow flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-2xl">
          <object
            data={rawUrl}
            type="application/pdf"
            className="h-full w-full"
            aria-label={selectedFile.name}
          >
            <iframe
              src={rawUrl}
              className="h-full w-full border-0"
              title={selectedFile.name}
            >
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-xs text-text-muted">
                <i className="fa-solid fa-file-pdf mb-3 text-4xl text-rose-400"></i>
                <p className="font-semibold text-white">Visualização de PDF Integrada</p>
                <p className="mt-1 max-w-sm">
                  Se o seu navegador não carregar o PDF embutido diretamente, você pode abri-lo em uma nova aba ou alternar para o Modo Leitor RAG.
                </p>
                <div className="mt-4 flex space-x-3">
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-accent-indigo px-3 py-1.5 text-xs font-medium text-white shadow"
                  >
                    Abrir PDF em Nova Aba
                  </a>
                  <button
                    type="button"
                    onClick={() => setPdfTab('text')}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                  >
                    Ver Texto RAG
                  </button>
                </div>
              </div>
            </iframe>
          </object>
        </div>
      )}

      {/* RENDERIZAÇÃO: PDF MODO LEITOR RAG OU DOCUMENTO (DOCX/ODT/DOC) */}
      {((selectedFile.category === 'pdf' && pdfTab === 'text') ||
        (fileContent?.type === 'document' && selectedFile.category !== 'pdf')) && (
        <div className="flex grow flex-col space-y-3">
          {/* Barra Editorial do Leitor */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent-indigo/20 bg-accent-indigo/5 px-3 py-2 text-xs">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-wand-magic-sparkles text-accent-indigo-light"></i>
              <span className="font-semibold text-accent-indigo-light">
                {selectedFile.category === 'pdf'
                  ? 'Motor RAG Nexus (Extração Vetorial & Textual)'
                  : 'Modo Leitor Editorial Nexus (Documento Office)'}
              </span>
              {fileContent?.words ? (
                <span className="text-text-muted text-[11px]">
                  • {fileContent.words.toLocaleString()} palavras (~{Math.max(1, Math.ceil(fileContent.words / 200))} min de leitura)
                </span>
              ) : null}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute top-2 left-2.5 text-[10px] text-text-muted"></i>
                <input
                  type="text"
                  placeholder="Pesquisar no texto..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="w-36 rounded-md border border-white/10 bg-black/40 py-1 pr-2.5 pl-7 text-xs text-white placeholder-white/30 focus:border-accent-indigo focus:outline-none sm:w-48"
                />
              </div>

              <div className="flex items-center rounded-md border border-white/10 bg-black/30 p-0.5">
                <button
                  type="button"
                  onClick={() => setFontSize('sm')}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    fontSize === 'sm' ? 'bg-accent-indigo text-white' : 'text-text-muted hover:text-white'
                  }`}
                  title="Fonte pequena"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('base')}
                  className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                    fontSize === 'base' ? 'bg-accent-indigo text-white' : 'text-text-muted hover:text-white'
                  }`}
                  title="Fonte média"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('lg')}
                  className={`rounded px-1.5 py-0.5 text-sm font-bold ${
                    fontSize === 'lg' ? 'bg-accent-indigo text-white' : 'text-text-muted hover:text-white'
                  }`}
                  title="Fonte grande"
                >
                  A++
                </button>
              </div>
            </div>
          </div>

          {/* Área Editorial de Leitura */}
          <div
            className={`max-h-[560px] grow overflow-y-auto rounded-xl border border-white/5 bg-black/30 p-6 leading-relaxed whitespace-pre-wrap ${
              fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'
            } text-neutral-200 selection:bg-accent-indigo selection:text-white`}
          >
            {fileContent?.content ? (
              docSearch.trim() ? (
                // Destaque de termos da pesquisa
                fileContent.content.split(new RegExp(`(${docSearch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')).map((part, i) =>
                  part.toLowerCase() === docSearch.toLowerCase() ? (
                    <mark key={`highlight-${i}-${part}`} className="rounded bg-amber-400/30 px-0.5 text-amber-200">
                      {part}
                    </mark>
                  ) : (
                    part
                  )
                )
              ) : (
                fileContent.content
              )
            ) : (
              <span className="italic text-text-muted">[Sem texto legível extraído]</span>
            )}
          </div>
        </div>
      )}

      {/* RENDERIZAÇÃO: MARKDOWN (.md) */}
      {isMarkdown && (
        <div className="flex grow flex-col space-y-2">
          {mdTab === 'formatted' ? (
            <div className="max-h-[580px] grow overflow-y-auto rounded-xl border border-white/5 bg-black/30 p-6">
              <SotaMarkdown content={fileContent?.content || ''} />
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>Código Fonte Markdown ({fileContent?.content?.split('\n').length || 0} linhas)</span>
                <button
                  type="button"
                  onClick={() => setWrapLines(!wrapLines)}
                  className="hover:text-white"
                >
                  Quebra de linha: {wrapLines ? 'Ativada' : 'Desativada'}
                </button>
              </div>
              <div
                className={`max-h-[560px] grow overflow-auto rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs text-indigo-200 ${
                  wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'
                }`}
              >
                {fileContent?.content || '[Arquivo Vazio]'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDERIZAÇÃO: CÓDIGO E ARQUIVOS DE TEXTO (.py, .ts, .json, .yaml, .sql, etc.) */}
      {!isMarkdown && !isDoc && selectedFile.category !== 'pdf' && fileContent?.type === 'text' && (
        <div className="flex grow flex-col space-y-2">
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-accent-indigo-light">
                {fileContent.content ? `${fileContent.content.split('\n').length} linhas` : '0 linhas'}
              </span>
              <span>•</span>
              <span>{fileContent.content ? `${fileContent.content.length.toLocaleString()} caracteres` : '0 caracteres'}</span>
            </div>
            <button
              type="button"
              onClick={() => setWrapLines(!wrapLines)}
              className="hover:text-white"
            >
              Quebra de linha: {wrapLines ? 'Ativada' : 'Desativada'}
            </button>
          </div>

          <div className="flex max-h-[560px] grow overflow-auto rounded-xl border border-white/5 bg-black/40 font-mono text-xs">
            {/* Numeração de Linhas Lateral */}
            <div className="sticky left-0 select-none border-r border-white/10 bg-black/60 py-4 pr-3 pl-3 text-right text-white/30">
              {(fileContent.content || '')
                .split('\n')
                .map((_, i) => (
                  <div key={`line-num-${i + 1}`} className="leading-relaxed">
                    {i + 1}
                  </div>
                ))}
            </div>

            {/* Conteúdo de Código */}
            <div
              className={`grow p-4 leading-relaxed text-indigo-100 ${
                wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
              }`}
            >
              {fileContent.content || '[Arquivo Vazio]'}
            </div>
          </div>
        </div>
      )}

      {/* RENDERIZAÇÃO: PLANILHAS (CSV / XLSX / ODS) */}
      {fileContent?.type === 'spreadsheet' && fileContent.data && (
        <div className="flex min-h-0 grow flex-col space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                Planilha tabular carregada
              </div>
              <span className="text-text-muted text-[11px]">
                {fileContent.data.rows.length} linhas analisadas
              </span>
            </div>
            <div className="relative w-full sm:w-64">
              <i className="fa-solid fa-magnifying-glass absolute top-2.5 left-2.5 text-[11px] text-text-muted"></i>
              <input
                type="text"
                placeholder="Filtrar dados da planilha..."
                value={gridSearch}
                onChange={(e) => setGridSearch(e.target.value)}
                className="focus:border-accent-emerald w-full rounded-lg border border-white/10 bg-black/40 py-1.5 pr-3 pl-8 text-xs text-white transition-colors focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-96 grow overflow-auto rounded-xl border border-white/5 bg-black/20">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="sticky top-0 border-b border-white/10 bg-neutral-900/90 font-bold text-white backdrop-blur-md">
                  {fileContent.data.headers.map((h: string) => (
                    <th key={h} className="p-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fileContent.data.rows
                  .filter((row: unknown[]) =>
                    row.some((val) =>
                      formatCellValue(val)
                        .toLowerCase()
                        .includes(gridSearch.toLowerCase()),
                    ),
                  )
                  .map((row: unknown[], rIdx: number) => {
                    const rowKey = `row-${rIdx}-${formatCellValue(row[0])}`;
                    return (
                      <tr key={rowKey} className="border-b border-white/5 transition-colors hover:bg-white/5">
                        {row.map((val: unknown, cIdx: number) => {
                          const colKey = `cell-${rIdx}-${cIdx}-${fileContent.data?.headers[cIdx] || cIdx}`;
                          return (
                            <td key={colKey} className="text-text-muted max-w-xs truncate p-3">
                              {formatCellValue(val)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {chartData && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <h4 className="mb-3 flex items-center space-x-2 text-xs font-bold tracking-wide text-white uppercase">
                <i className="fa-solid fa-chart-column text-accent-emerald-light"></i>
                <span>Tendência Tabular Interativa</span>
              </h4>
              <div className="text-text-muted flex h-32 items-end justify-between border-b border-l border-white/10 px-2 pt-2 font-mono text-[9px]">
                {chartData.map((pt) => {
                  const key = Object.keys(pt).find((k) => k !== 'name');
                  if (!key) return null;
                  const val = Number(pt[key] || 0);
                  const vals = chartData.map((p) => Number(p[key] || 0));
                  const max = Math.max(...vals, 1);
                  const min = Math.min(...vals, 0);
                  const pct = max === min ? 50 : ((val - min) / (max - min)) * 100;

                  return (
                    <div key={`chart-pt-${pt.name}`} className="group relative flex grow flex-col items-center">
                      <div
                        style={{ height: `${Math.max(6, Math.min(pct, 100))}%` }}
                        className="bg-accent-emerald/40 group-hover:bg-accent-emerald w-3 rounded-t transition-all"
                      ></div>
                      <div className="pointer-events-none absolute -top-8 z-50 rounded border border-white/10 bg-black px-1.5 py-0.5 text-[8px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {key}: {val}
                      </div>
                      <span className="mt-1 shrink-0 text-[8px]">{pt.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDERIZAÇÃO: IMAGEM */}
      {fileContent?.type === 'image' && fileContent.data && (
        <div className="grid min-h-0 grow grid-cols-1 gap-6 md:grid-cols-12">
          <div className="flex max-h-120 items-center justify-center rounded-xl border border-white/5 bg-black/40 p-4 md:col-span-8">
            {fileContent.data.base64 ? (
              <img
                src={`data:image/${fileContent.data.format?.toLowerCase() || 'png'};base64,${fileContent.data.base64}`}
                alt={selectedFile.name}
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="max-h-110 max-w-full rounded border border-white/10 object-contain shadow-2xl"
              />
            ) : (
              <div className="text-text-muted p-8 text-center text-xs">
                <i className="fa-solid fa-eye-slash mb-2 text-2xl"></i>
                <p>Imagem dimensionada para visualização externa.</p>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-lg bg-accent-indigo px-3 py-1.5 text-xs text-white"
                >
                  Abrir Imagem Completa
                </a>
              </div>
            )}
          </div>
          <div className="space-y-4 md:col-span-4">
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <h4 className="mb-2 text-xs font-bold tracking-wide text-white uppercase">Dimensões</h4>
              <p className="text-base font-black text-white">{fileContent.data.size}</p>
              <p className="text-text-muted mt-0.5 text-[10px] uppercase">
                Formato: {fileContent.data.format}
              </p>
            </div>
            {fileContent.data.exif && Object.keys(fileContent.data.exif).length > 0 && (
              <div className="max-h-75 overflow-y-auto rounded-xl border border-white/5 bg-white/5 p-4">
                <h4 className="mb-2 text-xs font-bold tracking-wide text-white uppercase">
                  Metadados EXIF
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(fileContent.data.exif).map(([k, v]) => (
                    <div key={k} className="flex flex-col border-b border-white/5 pb-1">
                      <span className="text-text-muted text-[9px] uppercase">{k}</span>
                      <span className="font-mono text-xs break-all text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDERIZAÇÃO: MÍDIA (ÁUDIO / VÍDEO) */}
      {selectedFile.category === 'media' && (
        <div className="flex max-h-137.5 grow flex-col items-center space-y-4 overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-4">
          {selectedFile.name.toLowerCase().endsWith('.mp3') ||
          selectedFile.name.toLowerCase().endsWith('.wav') ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-12 w-full max-w-md">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-accent-indigo/10 border border-accent-indigo/30 animate-pulse">
                <i className="fa-solid fa-music text-accent-indigo text-4xl"></i>
              </div>
              <audio controls src={rawUrl} className="w-full shadow-lg">
                <track kind="captions" />
              </audio>
              <div className="text-text-muted w-full text-center text-xs">
                <i className="fa-solid fa-circle-info text-accent-indigo mr-1"></i>
                {fileContent?.message || 'Streaming de áudio direto. Use os controles para reproduzir.'}
              </div>
            </div>
          ) : (
            <>
              <video
                controls
                src={rawUrl}
                className="max-h-96 w-full rounded-xl border border-white/10 shadow-2xl"
              >
                <track kind="captions" />
              </video>
              <div className="text-text-muted w-full text-center text-xs">
                <i className="fa-solid fa-circle-info text-accent-indigo mr-1"></i>
                {fileContent?.message || 'Streaming de vídeo local direto.'}
              </div>
            </>
          )}
        </div>
      )}

      {/* RENDERIZAÇÃO: ARQUIVOS COMPACTADOS (ZIP / TAR / GZ) */}
      {fileContent?.type === 'archive' && fileContent.files && (
        <div className="flex grow flex-col space-y-3">
          <div className="flex items-center space-x-2 self-start rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300">
            <i className="fa-solid fa-file-zipper"></i>
            <span>Conteúdo do Arquivo Compactado ({fileContent.files.length} itens)</span>
          </div>
          <div className="max-h-120 grow overflow-auto rounded-xl border border-white/5 bg-black/20">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="sticky top-0 border-b border-white/10 bg-neutral-900/90 font-bold text-white">
                  <th className="p-3">Nome do Arquivo</th>
                  <th className="p-3 text-right">Tamanho</th>
                </tr>
              </thead>
              <tbody>
                {fileContent.files.map((file) => (
                  <tr key={`archive-file-${file.name}-${file.size}`} className="border-b border-white/5 transition-colors hover:bg-white/5">
                    <td className="text-text-main p-3 font-mono">
                      <i
                        className={`fa-solid ${file.is_dir ? 'fa-folder text-accent-indigo-light' : 'fa-file-code text-text-muted'} mr-2`}
                      ></i>
                      {file.name}
                    </td>
                    <td className="text-text-muted p-3 text-right font-mono">
                      {file.is_dir ? '-' : formatFileSize(file.size)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
