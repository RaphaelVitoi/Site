'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

export type FileCategory = 'text' | 'archive' | 'image' | 'media' | 'spreadsheet' | 'pdf';
type FileContentType = 'text' | 'document' | 'spreadsheet' | 'image' | 'archive' | 'media';
export type ReaderFontSize = 'sm' | 'base' | 'lg';
export type PdfTabMode = 'visual' | 'text';
export type MarkdownTabMode = 'formatted' | 'raw';

export interface FileItem {
  readonly name: string;
  readonly path: string;
  readonly relative_path: string;
  readonly category: FileCategory;
  readonly size: number;
  readonly ext?: string;
  readonly mtime?: number;
}

export interface FileContent {
  type: FileContentType;
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
    sheets?: string[];
    active_sheet?: string | null;
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
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatCellValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'bigint' || typeof val === 'symbol') {
    return val.toString();
  }
  return JSON.stringify(val);
}

const FONT_SIZE_TEXT_CLASS: Record<ReaderFontSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
};

const MAX_HIGHLIGHT_MATCHES = 400;

function renderHighlightedText(content: string | undefined, search: string, emptyFallback: string) {
  if (!content) {
    return <span className="text-text-muted italic">{emptyFallback}</span>;
  }
  const trimmed = search.trim();
  if (!trimmed) {
    return content;
  }
  const escaped = trimmed.replace(/[-/\\^$*+?.()|[\]{}]/g, String.raw`\$&`);
  const parts = content.split(new RegExp(`(${escaped})`, 'gi'));
  let highlightedCount = 0;
  return parts.map((part, i) => {
    if (part.toLowerCase() === trimmed.toLowerCase() && highlightedCount < MAX_HIGHLIGHT_MATCHES) {
      highlightedCount += 1;
      return (
        <mark key={`highlight-${i}-${part}`} className="rounded bg-amber-400/30 px-0.5 text-amber-200">
          {part}
        </mark>
      );
    }
    return part;
  });
}

export interface UniversalDocumentViewerProps {
  readonly selectedFile: FileItem;
  readonly fileContent: FileContent | null;
  readonly loadingContent: boolean;
  readonly rawUrl?: string;
  readonly onClose?: () => void;
  readonly onNavigateRelativeLink?: ((href: string) => void) | undefined;
  readonly onSelectSheet?: ((sheet: string) => void) | undefined;
}

function computeCsvChartData(fileContent: FileContent | null): ChartDataPoint[] | null {
  if (!fileContent?.data?.headers || !fileContent.data.rows) return null;
  const { headers, rows } = fileContent.data;
  if (rows.length === 0) return null;
  const numIndices: number[] = [];

  headers.forEach((_: string, idx: number) => {
    let numericCount = 0;
    let nonEmptyCount = 0;
    for (let i = 0; i < Math.min(rows.length, 25); i++) {
      const rowVal = rows[i]?.[idx];
      if (
        rowVal === null ||
        rowVal === undefined ||
        (typeof rowVal !== 'string' && typeof rowVal !== 'number' && typeof rowVal !== 'boolean') ||
        String(rowVal).trim() === ''
      ) {
        continue;
      }
      nonEmptyCount += 1;
      const val = Number(rowVal);
      if (Number.isFinite(val)) {
        numericCount += 1;
      }
    }
    if (nonEmptyCount > 0 && numericCount >= Math.min(2, nonEmptyCount) && numericCount / nonEmptyCount >= 0.7) {
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
        const parsed = Number(rowVal);
        point[key] = Number.isFinite(parsed) ? parsed : 0;
      }
    });
    return point;
  });
}

interface ViewerLoadingStateProps {
  readonly fileName: string;
}

function ViewerLoadingState({ fileName }: Readonly<ViewerLoadingStateProps>) {
  return (
    <div className="flex grow flex-col items-center justify-center space-y-4 py-24">
      <div className="relative flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-accent-indigo text-4xl"></i>
        <i className="fa-solid fa-file text-accent-indigo/60 absolute text-sm"></i>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-white">Carregando e decodificando documento...</p>
        <p className="text-text-muted mt-1 text-[11px]">{fileName}</p>
      </div>
    </div>
  );
}

interface ViewerErrorStateProps {
  readonly error: string;
  readonly rawUrl: string;
  readonly downloadUrl: string;
  readonly fileName: string;
}

function ViewerErrorState({ error, rawUrl, downloadUrl, fileName }: Readonly<ViewerErrorStateProps>) {
  return (
    <div className="flex grow flex-col items-center justify-center py-20 text-center text-xs">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
        <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
      </div>
      <p className="font-semibold text-rose-300">Não foi possível visualizar este arquivo</p>
      <p className="mt-2 max-w-md rounded-lg border border-rose-900/50 bg-black/40 p-3 font-mono text-[11px] text-rose-200">
        {error}
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
          download={fileName}
          className="bg-accent-indigo-surface hover:bg-accent-indigo/80 flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
        >
          <i className="fa-solid fa-download"></i>
          <span>Baixar Arquivo</span>
        </a>
      </div>
    </div>
  );
}

interface ViewerHeaderToolbarProps {
  readonly fileExt: string;
  readonly selectedFile: FileItem;
  readonly pdfTab: PdfTabMode;
  readonly setPdfTab: (tab: PdfTabMode) => void;
  readonly isMarkdown: boolean;
  readonly mdTab: MarkdownTabMode;
  readonly setMdTab: (tab: MarkdownTabMode) => void;
  readonly fileContent: FileContent | null;
  readonly copied: boolean;
  readonly copyToClipboard: (text: string) => void;
  readonly rawUrl: string;
  readonly downloadUrl: string;
  readonly onClose: (() => void) | undefined;
}

function ViewerHeaderToolbar({
  fileExt,
  selectedFile,
  pdfTab,
  setPdfTab,
  isMarkdown,
  mdTab,
  setMdTab,
  fileContent,
  copied,
  copyToClipboard,
  rawUrl,
  downloadUrl,
  onClose,
}: Readonly<ViewerHeaderToolbarProps>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/2 p-2.5">
      <div className="flex items-center space-x-2">
        <span className="bg-accent-indigo/20 text-accent-indigo-light rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          {fileExt}
        </span>
        <span className="text-text-muted text-xs">{formatFileSize(selectedFile.size)}</span>
      </div>

      <div className="flex items-center space-x-2">
        {selectedFile.category === 'pdf' && (
          <div className="flex items-center rounded-lg border border-white/10 bg-black/30 p-0.5">
            <button
              type="button"
              onClick={() => setPdfTab('visual')}
              className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                pdfTab === 'visual'
                  ? 'bg-accent-indigo-surface text-white shadow-sm'
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
                pdfTab === 'text' ? 'bg-accent-indigo-surface text-white shadow-sm' : 'text-text-muted hover:text-white'
              }`}
            >
              <i className="fa-solid fa-file-lines text-[11px]"></i>
              <span>Texto RAG</span>
            </button>
          </div>
        )}

        {isMarkdown && (
          <div className="flex items-center rounded-lg border border-white/10 bg-black/30 p-0.5">
            <button
              type="button"
              onClick={() => setMdTab('formatted')}
              className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                mdTab === 'formatted'
                  ? 'bg-accent-indigo-surface text-white shadow-sm'
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
                mdTab === 'raw' ? 'bg-accent-indigo-surface text-white shadow-sm' : 'text-text-muted hover:text-white'
              }`}
            >
              <i className="fa-solid fa-code text-[11px]"></i>
              <span>Código Fonte</span>
            </button>
          </div>
        )}

        {fileContent?.content && (
          <button
            type="button"
            onClick={() => copyToClipboard(fileContent.content || '')}
            className={`flex items-center space-x-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium transition-all ${
              copied
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                : 'text-text-muted bg-white/5 hover:bg-white/10 hover:text-white'
            }`}
            title="Copiar conteúdo para a área de transferência"
          >
            <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        )}

        <a
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs transition-colors hover:bg-white/10 hover:text-white"
          title="Abrir arquivo bruto em nova aba"
        >
          <i className="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
          <span className="hidden sm:inline">Abrir Raw</span>
        </a>

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
            className="text-text-muted ml-2 flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>
    </div>
  );
}

interface PdfVisualViewerProps {
  readonly rawUrl: string;
  readonly fileName: string;
  readonly setPdfTab: (t: PdfTabMode) => void;
}

function PdfVisualViewer({ rawUrl, fileName, setPdfTab }: Readonly<PdfVisualViewerProps>) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-2xl">
      <object data={rawUrl} type="application/pdf" className="h-full w-full" aria-label={fileName}>
        <iframe src={rawUrl} className="h-full w-full border-0" title={fileName}>
          <div className="text-text-muted flex h-full flex-col items-center justify-center p-8 text-center text-xs">
            <i className="fa-solid fa-file-pdf mb-3 text-4xl text-rose-400"></i>
            <p className="font-semibold text-white">Visualização de PDF Integrada</p>
            <p className="mt-1 max-w-sm">
              Se o seu navegador não carregar o PDF embutido diretamente, você pode abri-lo em uma nova aba ou alternar
              para o Modo Leitor RAG.
            </p>
            <div className="mt-4 flex space-x-3">
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-indigo-surface rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow"
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
  );
}

interface EditorialReaderViewerProps {
  readonly category: string;
  readonly words: number | undefined;
  readonly content: string | undefined;
  readonly docSearch: string;
  readonly setDocSearch: (val: string) => void;
  readonly fontSize: ReaderFontSize;
  readonly setFontSize: (size: ReaderFontSize) => void;
}

function EditorialReaderViewer({
  category,
  words,
  content,
  docSearch,
  setDocSearch,
  fontSize,
  setFontSize,
}: Readonly<EditorialReaderViewerProps>) {
  return (
    <div className="flex grow flex-col space-y-3">
      <div className="border-accent-indigo/20 bg-accent-indigo-surface/5 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-wand-magic-sparkles text-accent-indigo-light"></i>
          <span className="text-accent-indigo-light font-semibold">
            {category === 'pdf'
              ? 'Motor RAG Nexus (Extração Vetorial & Textual)'
              : 'Modo Leitor Editorial Nexus (Documento Office)'}
          </span>
          {words ? (
            <span className="text-text-muted text-[11px]">
              • {words.toLocaleString()} palavras (~{Math.max(1, Math.ceil(words / 200))} min de leitura)
            </span>
          ) : null}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass text-text-muted absolute top-2 left-2.5 text-[10px]"></i>
            <input
              type="text"
              placeholder="Pesquisar no texto..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              className="focus:border-accent-indigo w-36 rounded-md border border-white/10 bg-black/40 py-1 pr-2.5 pl-7 text-xs text-white placeholder-white/30 focus:outline-none sm:w-48"
            />
          </div>

          <div className="flex items-center rounded-md border border-white/10 bg-black/30 p-0.5">
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                fontSize === 'sm' ? 'bg-accent-indigo-surface text-white' : 'text-text-muted hover:text-white'
              }`}
              title="Fonte pequena"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('base')}
              className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                fontSize === 'base' ? 'bg-accent-indigo-surface text-white' : 'text-text-muted hover:text-white'
              }`}
              title="Fonte média"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize('lg')}
              className={`rounded px-1.5 py-0.5 text-sm font-bold ${
                fontSize === 'lg' ? 'bg-accent-indigo-surface text-white' : 'text-text-muted hover:text-white'
              }`}
              title="Fonte grande"
            >
              A++
            </button>
          </div>
        </div>
      </div>

      <div
        className={`max-h-[68vh] grow overflow-y-auto rounded-xl border border-white/5 bg-black/30 p-6 leading-relaxed whitespace-pre-wrap ${
          FONT_SIZE_TEXT_CLASS[fontSize]
        } selection:bg-accent-indigo text-neutral-200 selection:text-white`}
      >
        {renderHighlightedText(content, docSearch, '[Sem texto legível extraído]')}
      </div>
    </div>
  );
}

interface MarkdownHeadingItem {
  readonly level: number;
  readonly text: string;
  readonly slug: string;
}

function stripFrontmatterAndNormalize(content: string | undefined): {
  body: string;
  frontmatterEntries: readonly [string, string][];
} {
  if (!content) return { body: '', frontmatterEntries: [] };
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
  if (!match) return { body: content, frontmatterEntries: [] };

  const rawYaml = match[1] ?? '';
  const entries: [string, string][] = [];
  for (const line of rawYaml.split(/\r?\n/)) {
    const kv = /^([a-zA-Z0-9_-]+):(.+)$/.exec(line.trim());
    if (kv?.[1] && kv?.[2]) {
      const cleanedVal = kv[2].trim().replace(/^["']|["']$/g, '');
      if (cleanedVal) entries.push([kv[1], cleanedVal]);
    }
  }
  return {
    body: content.slice(match[0].length),
    frontmatterEntries: entries.slice(0, 8),
  };
}

function extractMarkdownToc(content: string | undefined): MarkdownHeadingItem[] {
  if (!content) return [];
  const lines = content.split('\n');
  const items: MarkdownHeadingItem[] = [];
  const slugCounts = new Map<string, number>();
  let inFence = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (/^ {0,3}(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const heading = parseMarkdownHeading(line);
    if (!heading) continue;
    const { level, title: rawTitle } = heading;
    const cleanedText = stripMarkdownLinkTargets(rawTitle)
      .replace(/\$\\to\$|\$\\rightarrow\$/g, '→')
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/[`*_~]/g, '')
      .trim();
    if (!cleanedText) continue;

    const baseSlug = cleanedText
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-');
    if (!baseSlug) continue;

    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;
    items.push({ level, text: cleanedText, slug });
  }
  return items;
}

function parseMarkdownHeading(line: string): { level: number; title: string } | null {
  const leadingSpaces = line.length - line.trimStart().length;
  if (leadingSpaces > 3) return null;
  const trimmedLine = line.slice(leadingSpaces);
  let level = 0;
  while (trimmedLine[level] === '#' && level < 4) level += 1;
  if (level === 0 || level > 3 || !/\s/.test(trimmedLine[level] ?? '')) return null;

  let title = trimmedLine.slice(level).trim();
  let end = title.length;
  while (end > 0 && title[end - 1] === '#') end -= 1;
  if (end < title.length && end > 0 && /\s/.test(title[end - 1] ?? '')) {
    title = title.slice(0, end).trimEnd();
  }
  return title ? { level, title } : null;
}

function stripMarkdownLinkTargets(text: string): string {
  let result = '';
  let cursor = 0;
  while (cursor < text.length) {
    const labelStart = text.indexOf('[', cursor);
    if (labelStart < 0) return result + text.slice(cursor);
    const labelEnd = text.indexOf('](', labelStart + 1);
    const targetEnd = labelEnd < 0 ? -1 : text.indexOf(')', labelEnd + 2);
    if (labelEnd < 0 || targetEnd < 0) {
      result += text.slice(cursor, labelStart + 1);
      cursor = labelStart + 1;
      continue;
    }
    result += text.slice(cursor, labelStart) + text.slice(labelStart + 1, labelEnd);
    cursor = targetEnd + 1;
  }
  return result;
}

interface MarkdownViewerProps {
  readonly content: string | undefined;
  readonly mdTab: MarkdownTabMode;
  readonly wrapLines: boolean;
  readonly setWrapLines: (w: boolean) => void;
  readonly onNavigateRelativeLink?: ((href: string) => void) | undefined;
}

function MarkdownViewer({
  content,
  mdTab,
  wrapLines,
  setWrapLines,
  onNavigateRelativeLink,
}: Readonly<MarkdownViewerProps>) {
  const [showToc, setShowToc] = useState(false);
  const { body, frontmatterEntries } = useMemo(() => stripFrontmatterAndNormalize(content), [content]);
  const toc = useMemo(() => extractMarkdownToc(body), [body]);
  const stats = useMemo(() => {
    const text = content?.trim() || '';
    if (!text) return { words: 0, minutes: 0, lines: 0 };
    const words = text.split(/\s+/).length;
    return {
      words,
      minutes: Math.max(1, Math.ceil(words / 200)),
      lines: content ? content.split('\n').length : 0,
    };
  }, [content]);

  const scrollToHeading = (slug: string) => {
    const target = document.getElementById(slug);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex grow flex-col space-y-2">
      {mdTab === 'formatted' ? (
        <>
          <div className="text-text-muted flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/2 px-3 py-1.5 text-[11px]">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-book-open text-accent-indigo-light"></i>
              <span>
                {stats.words.toLocaleString()} palavras • ~{stats.minutes} min de leitura
              </span>
            </div>
            {toc.length > 0 && (
              <button
                type="button"
                onClick={() => setShowToc((prev) => !prev)}
                className={`flex items-center space-x-1.5 rounded-md border px-2 py-0.5 text-[11px] transition-colors ${
                  showToc
                    ? 'border-accent-indigo/50 bg-accent-indigo/20 text-white'
                    : 'border-white/10 bg-black/30 text-text-muted hover:text-white'
                }`}
              >
                <i className="fa-solid fa-list-ul text-[10px]"></i>
                <span>Índice ({toc.length})</span>
              </button>
            )}
          </div>

          {showToc && toc.length > 0 && (
            <nav
              aria-label="Índice do documento"
              className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs"
            >
              <ul className="space-y-1">
                {toc.map((item) => (
                  <li key={item.slug} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                    <button
                      type="button"
                      onClick={() => scrollToHeading(item.slug)}
                      className="text-text-muted hover:text-accent-indigo-light block w-full truncate text-left transition-colors"
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="max-h-[70vh] grow overflow-y-auto rounded-xl border border-white/5 bg-black/30 p-6">
            {frontmatterEntries.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/3 p-3">
                {frontmatterEntries.map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center space-x-1.5 rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-[11px]"
                  >
                    <span className="font-mono text-indigo-300/80 uppercase">{k}:</span>
                    <span className="text-neutral-200">{v}</span>
                  </span>
                ))}
              </div>
            )}
            <SotaMarkdown content={body} onRelativeLinkClick={onNavigateRelativeLink} />
          </div>
        </>
      ) : (
        <div className="flex flex-col space-y-2">
          <div className="text-text-muted flex items-center justify-between text-[11px]">
            <span>Código Fonte Markdown ({stats.lines} linhas)</span>
            <button type="button" onClick={() => setWrapLines(!wrapLines)} className="hover:text-white">
              Quebra de linha: {wrapLines ? 'Ativada' : 'Desativada'}
            </button>
          </div>
          <div
            className={`max-h-[68vh] grow overflow-auto rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs text-indigo-200 ${
              wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'
            }`}
          >
            {content || '[Arquivo Vazio]'}
          </div>
        </div>
      )}
    </div>
  );
}

interface CodeTextViewerProps {
  readonly content: string | undefined;
  readonly wrapLines: boolean;
  readonly setWrapLines: (w: boolean) => void;
}

function CodeTextViewer({ content, wrapLines, setWrapLines }: Readonly<CodeTextViewerProps>) {
  const [codeSearch, setCodeSearch] = useState('');
  const lines = useMemo(() => (content ? content.split('\n') : []), [content]);
  const matchCount = useMemo(() => {
    const trimmed = codeSearch.trim().toLowerCase();
    if (!trimmed || !content) return 0;
    return content.toLowerCase().split(trimmed).length - 1;
  }, [content, codeSearch]);

  return (
    <div className="flex grow flex-col space-y-2">
      <div className="text-text-muted flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="text-accent-indigo-light font-mono">
            {content ? `${lines.length} linhas` : '0 linhas'}
          </span>
          <span>•</span>
          <span>{content ? `${content.length.toLocaleString()} caracteres` : '0 caracteres'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass text-text-muted absolute top-1.5 left-2 text-[10px]"></i>
            <input
              type="text"
              placeholder="Buscar no código..."
              value={codeSearch}
              onChange={(e) => setCodeSearch(e.target.value)}
              className="focus:border-accent-indigo w-36 rounded border border-white/10 bg-black/40 py-0.5 pr-2 pl-6 text-[11px] text-white placeholder-white/30 focus:outline-none sm:w-44"
            />
          </div>
          {codeSearch.trim() && (
            <span className="text-[10px] text-amber-300">{matchCount} ocorr.</span>
          )}
          <button type="button" onClick={() => setWrapLines(!wrapLines)} className="hover:text-white">
            Quebra de linha: {wrapLines ? 'Ativada' : 'Desativada'}
          </button>
        </div>
      </div>

      <div className="max-h-[68vh] grow overflow-auto rounded-xl border border-white/5 bg-black/40 py-2 font-mono text-xs">
        {lines.length === 0 ? (
          <div className="p-4 text-indigo-100">[Arquivo Vazio]</div>
        ) : (
          <div className="min-w-full">
            {lines.map((lineText, i) => (
              <div key={`code-line-${i + 1}`} className="flex items-start leading-relaxed hover:bg-white/3">
                <span className="sticky left-0 w-12 shrink-0 border-r border-white/10 bg-black/60 pr-3 pl-2 text-right text-white/30 tabular-nums select-none">
                  {i + 1}
                </span>
                <span
                  className={`grow pr-4 pl-4 text-indigo-100 ${
                    wrapLines ? 'wrap-break-word whitespace-pre-wrap' : 'whitespace-pre'
                  }`}
                >
                  {lineText ? renderHighlightedText(lineText, codeSearch, '') : ' '}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SpreadsheetViewerProps {
  readonly headers: string[];
  readonly rows: unknown[][];
  readonly sheets?: string[] | undefined;
  readonly activeSheet?: string | null | undefined;
  readonly onSelectSheet?: ((sheet: string) => void) | undefined;
  readonly gridSearch: string;
  readonly setGridSearch: (val: string) => void;
  readonly chartData: ChartDataPoint[] | null;
}

function SpreadsheetViewer({
  headers,
  rows,
  sheets,
  activeSheet,
  onSelectSheet,
  gridSearch,
  setGridSearch,
  chartData,
}: Readonly<SpreadsheetViewerProps>) {
  const [selectedSeriesKey, setSelectedSeriesKey] = useState<string>('');
  const numericSeriesKeys = useMemo(() => {
    const firstPoint = chartData?.[0];
    if (!firstPoint) return [];
    return Object.keys(firstPoint).filter((k) => k !== 'name');
  }, [chartData]);

  const activeChartSeries = useMemo(() => {
    if (!chartData || numericSeriesKeys.length === 0) return null;
    const key =
      selectedSeriesKey && numericSeriesKeys.includes(selectedSeriesKey)
        ? selectedSeriesKey
        : numericSeriesKeys[0];
    if (!key) return null;
    const vals = chartData.map((p) => Number(p[key] || 0));
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals, 0);
    return { key, min, max };
  }, [chartData, numericSeriesKeys, selectedSeriesKey]);

  const filteredRows = useMemo(() => {
    const q = gridSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row: unknown[]) => row.some((val) => formatCellValue(val).toLowerCase().includes(q)));
  }, [rows, gridSearch]);

  return (
    <div className="flex min-h-0 grow flex-col space-y-4">
      {sheets && sheets.length > 1 && onSelectSheet && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/5 bg-black/30 p-1.5">
          <span className="text-text-muted px-2 text-[10px] font-semibold uppercase">Abas:</span>
          {sheets.map((sheet) => {
            const isActive = sheet === activeSheet;
            return (
              <button
                key={sheet}
                type="button"
                onClick={() => onSelectSheet(sheet)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-emerald/20 border border-emerald-500/40 text-emerald-300'
                    : 'text-text-muted border border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                {sheet}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-2">
          <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
            Planilha tabular carregada
          </div>
          <span className="text-text-muted text-[11px]">
            {filteredRows.length === rows.length
              ? `${rows.length} linhas analisadas`
              : `${filteredRows.length} de ${rows.length} linhas`}
          </span>
        </div>
        <div className="relative w-full sm:w-64">
          <i className="fa-solid fa-magnifying-glass text-text-muted absolute top-2.5 left-2.5 text-[11px]"></i>
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
              {headers.map((h: string, idx: number) => (
                <th key={`col-${idx}-${h}`} className="p-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row: unknown[], rIdx: number) => {
              const rowKey = `row-${rIdx}-${formatCellValue(row[0])}`;
              return (
                <tr key={rowKey} className="border-b border-white/5 transition-colors hover:bg-white/5">
                  {row.map((val: unknown, cIdx: number) => {
                    const colKey = `cell-${rIdx}-${cIdx}-${headers[cIdx] || cIdx}`;
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

      {chartData && activeChartSeries && (
        <div className="rounded-xl border border-white/5 bg-white/2 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center space-x-2 text-xs font-bold tracking-wide text-white uppercase">
              <i className="fa-solid fa-chart-column text-accent-emerald-light"></i>
              <span>Tendência Tabular Interativa ({activeChartSeries.key})</span>
              <span className="text-text-muted font-mono text-[10px] font-normal lowercase">
                min {activeChartSeries.min.toLocaleString()} • max {activeChartSeries.max.toLocaleString()}
              </span>
            </h4>
            {numericSeriesKeys.length > 1 && (
              <div className="flex flex-wrap items-center gap-1">
                {numericSeriesKeys.slice(0, 6).map((seriesKey) => (
                  <button
                    key={seriesKey}
                    type="button"
                    onClick={() => setSelectedSeriesKey(seriesKey)}
                    className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
                      activeChartSeries.key === seriesKey
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'text-text-muted border border-white/10 bg-black/30 hover:text-white'
                    }`}
                  >
                    {seriesKey}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-text-muted flex h-32 items-end justify-between border-b border-l border-white/10 px-2 pt-2 font-mono text-[9px]">
            {chartData.map((pt) => {
              const val = Number(pt[activeChartSeries.key] || 0);
              const { min, max } = activeChartSeries;
              const pct = max === min ? 50 : ((val - min) / (max - min)) * 100;

              return (
                <div key={`chart-pt-${pt.name}`} className="group relative flex h-full grow flex-col items-center justify-end">
                  <div
                    style={{ height: `${Math.max(6, Math.min(pct, 100))}%` }}
                    className="w-3 rounded-t bg-emerald-400/60 transition-all group-hover:bg-emerald-400"
                  ></div>
                  <div className="pointer-events-none absolute -top-8 z-50 rounded border border-white/10 bg-black px-1.5 py-0.5 text-[8px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {activeChartSeries.key}: {val}
                  </div>
                  <span className="mt-1 shrink-0 text-[8px]">{pt.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface MediaOrArchiveViewerProps {
  readonly selectedFile: FileItem;
  readonly fileContent: FileContent | null;
  readonly rawUrl: string;
}

const AUDIO_EXTS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'] as const;

function MediaOrArchiveViewer({ selectedFile, fileContent, rawUrl }: Readonly<MediaOrArchiveViewerProps>) {
  const [imgLoadFailed, setImgLoadFailed] = useState(false);

  if (fileContent?.type === 'image' && fileContent.data) {
    const imgSrc = fileContent.data.base64
      ? `data:image/${fileContent.data.format?.toLowerCase() || 'png'};base64,${fileContent.data.base64}`
      : rawUrl;

    return (
      <div className="grid min-h-0 grow grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex max-h-120 items-center justify-center rounded-xl border border-white/5 bg-black/40 p-4 md:col-span-8">
          {!imgLoadFailed ? (
            <img
              src={imgSrc}
              alt={selectedFile.name}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              onError={() => setImgLoadFailed(true)}
              className="max-h-110 max-w-full rounded border border-white/10 object-contain shadow-2xl"
            />
          ) : (
            <div className="text-text-muted p-8 text-center text-xs">
              <i className="fa-solid fa-eye-slash mb-2 text-2xl"></i>
              <p>Não foi possível pré-visualizar a imagem inline.</p>
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent-indigo-surface mt-3 inline-block rounded-lg px-3 py-1.5 text-xs text-white"
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
            <p className="text-text-muted mt-0.5 text-[10px] uppercase">Formato: {fileContent.data.format}</p>
          </div>
          {fileContent.data.exif && Object.keys(fileContent.data.exif).length > 0 && (
            <div className="max-h-75 overflow-y-auto rounded-xl border border-white/5 bg-white/5 p-4">
              <h4 className="mb-2 text-xs font-bold tracking-wide text-white uppercase">Metadados EXIF</h4>
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
    );
  }

  if (selectedFile.category === 'media') {
    const lowerName = selectedFile.name.toLowerCase();
    const isAudio = AUDIO_EXTS.some((ext) => lowerName.endsWith(ext));

    return (
      <div className="flex max-h-137.5 grow flex-col items-center space-y-4 overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-4">
        {isAudio ? (
          <div className="flex w-full max-w-md flex-col items-center justify-center space-y-6 py-12">
            <div className="bg-accent-indigo/10 border-accent-indigo/30 relative flex h-24 w-24 animate-pulse items-center justify-center rounded-full border">
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
            <video controls src={rawUrl} className="max-h-96 w-full rounded-xl border border-white/10 shadow-2xl">
              <track kind="captions" />
            </video>
            <div className="text-text-muted w-full text-center text-xs">
              <i className="fa-solid fa-circle-info text-accent-indigo mr-1"></i>
              {fileContent?.message || 'Streaming de vídeo local direto.'}
            </div>
          </>
        )}
      </div>
    );
  }

  if (fileContent?.type === 'archive' && fileContent.files) {
    return (
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
                <tr
                  key={`archive-file-${file.name}-${file.size}`}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
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
    );
  }

  return null;
}

export function UniversalDocumentViewer({
  selectedFile,
  fileContent,
  loadingContent,
  rawUrl: customRawUrl,
  onClose,
  onNavigateRelativeLink,
  onSelectSheet,
}: Readonly<UniversalDocumentViewerProps>) {
  const [pdfTab, setPdfTab] = useState<PdfTabMode>('visual');
  const [mdTab, setMdTab] = useState<MarkdownTabMode>('formatted');
  const [gridSearch, setGridSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(true);
  const [fontSize, setFontSize] = useState<ReaderFontSize>('sm');
  const [docSearch, setDocSearch] = useState('');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const rawUrl = customRawUrl || `/api/vitoi/files/view?path=${encodeURIComponent(selectedFile.path)}&raw=true`;
  const downloadUrl = `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}download=true`;

  const lowerName = selectedFile.name.toLowerCase();
  const isMarkdown = lowerName.endsWith('.md') || lowerName.endsWith('.mdx');
  const isDoc =
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.odt') ||
    lowerName.endsWith('.doc') ||
    lowerName.endsWith('.rtf');

  const fileExt = useMemo(() => {
    const parts = selectedFile.name.split('.');
    return parts.length > 1 ? parts.pop()?.toUpperCase() || 'ARQUIVO' : 'ARQUIVO';
  }, [selectedFile.name]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignora falha de clipboard silenciosamente
    }
  };

  const chartData = useMemo<ChartDataPoint[] | null>(() => computeCsvChartData(fileContent), [fileContent]);

  const isPdfVisual = selectedFile.category === 'pdf' && pdfTab === 'visual';

  if (loadingContent && !isPdfVisual) {
    return <ViewerLoadingState fileName={selectedFile.name} />;
  }

  if (fileContent?.error) {
    return (
      <ViewerErrorState
        error={fileContent.error}
        rawUrl={rawUrl}
        downloadUrl={downloadUrl}
        fileName={selectedFile.name}
      />
    );
  }

  const isReader =
    (selectedFile.category === 'pdf' && pdfTab === 'text') ||
    (fileContent?.type === 'document' && selectedFile.category !== 'pdf');
  const isCodeOrText = !isMarkdown && !isDoc && selectedFile.category !== 'pdf' && fileContent?.type === 'text';

  return (
    <div className="flex min-h-0 grow flex-col space-y-3">
      <ViewerHeaderToolbar
        fileExt={fileExt}
        selectedFile={selectedFile}
        pdfTab={pdfTab}
        setPdfTab={setPdfTab}
        isMarkdown={isMarkdown}
        mdTab={mdTab}
        setMdTab={setMdTab}
        fileContent={fileContent}
        copied={copied}
        copyToClipboard={copyToClipboard}
        rawUrl={rawUrl}
        downloadUrl={downloadUrl}
        onClose={onClose}
      />

      {isPdfVisual && <PdfVisualViewer rawUrl={rawUrl} fileName={selectedFile.name} setPdfTab={setPdfTab} />}

      {isReader && (
        <EditorialReaderViewer
          category={selectedFile.category}
          words={fileContent?.words}
          content={fileContent?.content}
          docSearch={docSearch}
          setDocSearch={setDocSearch}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />
      )}

      {isMarkdown && (
        <MarkdownViewer
          content={fileContent?.content}
          mdTab={mdTab}
          wrapLines={wrapLines}
          setWrapLines={setWrapLines}
          onNavigateRelativeLink={onNavigateRelativeLink}
        />
      )}

      {isCodeOrText && (
        <CodeTextViewer content={fileContent?.content} wrapLines={wrapLines} setWrapLines={setWrapLines} />
      )}

      {fileContent?.type === 'spreadsheet' && fileContent.data && (
        <SpreadsheetViewer
          headers={fileContent.data.headers}
          rows={fileContent.data.rows}
          sheets={fileContent.data.sheets}
          activeSheet={fileContent.data.active_sheet}
          onSelectSheet={onSelectSheet}
          gridSearch={gridSearch}
          setGridSearch={setGridSearch}
          chartData={chartData}
        />
      )}

      <MediaOrArchiveViewer selectedFile={selectedFile} fileContent={fileContent} rawUrl={rawUrl} />
    </div>
  );
}
