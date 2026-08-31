'use client';

import { useState, useEffect } from 'react';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';

interface FileItem {
  name: string;
  path: string;
  relative_path: string;
  category: 'text' | 'archive' | 'image' | 'media' | 'spreadsheet' | 'pdf';
  size: number;
}

interface SourceTree {
  source: string;
  path: string;
  files: FileItem[];
}

interface FileContent {
  type: 'text' | 'document' | 'spreadsheet' | 'image' | 'archive' | 'media';
  content?: string;
  message?: string;
  error?: string;
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

interface ChartDataPoint {
  name: string;
  [key: string]: number | string;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(cat: string): string {
  switch (cat) {
    case 'pdf':
      return 'fa-file-pdf text-red-400';
    case 'spreadsheet':
      return 'fa-file-excel text-emerald-400';
    case 'image':
      return 'fa-file-image text-cyan-400';
    case 'media':
      return 'fa-file-video text-rose-400';
    case 'archive':
      return 'fa-file-zipper text-yellow-500';
    default:
      return 'fa-file-code text-indigo-300';
  }
}

function formatCellValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'bigint' || typeof val === 'symbol') {
    return val.toString();
  }
  return JSON.stringify(val);
}

function getChartData(data: NonNullable<FileContent['data']>): ChartDataPoint[] | null {
  if (!data.headers || !data.rows) return null;
  const numIndices: number[] = [];
  data.headers.forEach((_: string, idx: number) => {
    let isNumeric = true;
    for (let i = 0; i < Math.min(data.rows.length, 3); i++) {
      const rowVal = data.rows[i]?.[idx];
      const val = Number(rowVal);
      if (Number.isNaN(val)) {
        isNumeric = false;
        break;
      }
    }
    if (isNumeric && data.rows.length > 0) {
      numIndices.push(idx);
    }
  });

  if (numIndices.length === 0) return null;

  return data.rows.slice(0, 30).map((row: unknown[], rIdx: number) => {
    const point: ChartDataPoint = { name: `R${rIdx + 1}` };
    numIndices.forEach((idx) => {
      const key = data.headers[idx];
      const rowVal = row[idx];
      if (key) {
        point[key] = Number(rowVal || 0);
      }
    });
    return point;
  });
}

interface FileExplorerTreeProps {
  readonly tree: readonly SourceTree[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly searchTerm: string;
  readonly selectedFile: FileItem | null;
  readonly collapsedSources: Record<string, boolean>;
  readonly onToggleSource: (source: string) => void;
  readonly onSelectFile: (file: FileItem) => void;
}

function FileExplorerTree({
  tree,
  loading,
  error,
  searchTerm,
  selectedFile,
  collapsedSources,
  onToggleSource,
  onSelectFile,
}: FileExplorerTreeProps) {
  if (loading) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-2">
        <i className="fa-solid fa-circle-notch fa-spin text-accent-indigo text-2xl"></i>
        <span className="text-text-muted text-xs">Mapeando arquivos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-xs text-rose-400">
        <i className="fa-solid fa-circle-exclamation mb-2 text-lg"></i>
        <p>Falha ao carregar arquivos: {error}</p>
      </div>
    );
  }

  return (
    <>
      {tree.map((src) => {
        const files = src.files.filter(
          (f) =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.relative_path.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const isCollapsed = collapsedSources[src.source];
        if (files.length === 0 && searchTerm) return null;

        return (
          <div key={src.source} className="space-y-1">
            <button
              type="button"
              onClick={() => onToggleSource(src.source)}
              className="group flex w-full items-center justify-between rounded px-2 py-1 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex items-center space-x-2">
                <i
                  className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'} text-text-muted text-[10px]`}
                ></i>
                <i
                  className={`fa-solid ${src.source === 'GoogleDrive' ? 'fa-cloud' : 'fa-folder'} text-accent-indigo-light text-sm`}
                ></i>
                <span className="text-xs font-bold tracking-wider text-white uppercase">{src.source}</span>
              </div>
              <span className="text-text-muted rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {files.length}
              </span>
            </button>

            {!isCollapsed && (
              <div className="mt-1 ml-3 space-y-1 border-l border-white/5 pl-4">
                {files.length === 0 ? (
                  <span className="text-text-muted block py-1 pl-2 text-[10px]">Nenhum arquivo encontrado</span>
                ) : (
                  files.map((file) => {
                    const isSelected = selectedFile?.path === file.path;
                    return (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => onSelectFile(file)}
                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-all ${
                          isSelected
                            ? 'bg-accent-indigo/20 border-accent-indigo/40 border text-white'
                            : 'text-text-muted border border-transparent hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="mr-2 flex items-center space-x-2 overflow-hidden">
                          <i className={`fa-solid ${getFileIcon(file.category)} shrink-0 text-xs`}></i>
                          <span className="block truncate text-xs">{file.name}</span>
                        </div>
                        <span className="text-text-muted shrink-0 text-[9px]">{formatSize(file.size)}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

interface FileViewerBodyProps {
  readonly selectedFile: FileItem;
  readonly fileContent: FileContent | null;
  readonly loadingContent: boolean;
  readonly pdfTab: 'visual' | 'text';
  readonly onPdfTabChange: (tab: 'visual' | 'text') => void;
  readonly gridSearch: string;
  readonly onGridSearchChange: (search: string) => void;
  readonly chartData: readonly ChartDataPoint[] | null;
}

function FileViewerBody({
  selectedFile,
  fileContent,
  loadingContent,
  pdfTab,
  onPdfTabChange,
  gridSearch,
  onGridSearchChange,
  chartData,
}: FileViewerBodyProps) {
  if (loadingContent) {
    return (
      <div className="flex grow flex-col items-center justify-center space-y-3 py-24">
        <i className="fa-solid fa-spinner fa-spin text-accent-indigo text-3xl"></i>
        <span className="text-text-muted text-xs">Processando e renderizando arquivo...</span>
      </div>
    );
  }

  if (fileContent?.error) {
    return (
      <div className="flex grow flex-col items-center justify-center py-24 text-center text-xs text-rose-400">
        <i className="fa-solid fa-triangle-exclamation mb-2 text-2xl"></i>
        <p>Erro ao visualizar conteúdo:</p>
        <p className="mt-1 rounded border border-rose-950 bg-black/40 p-2 font-mono">{fileContent.error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 grow flex-col">
      {fileContent?.type === 'text' && (
        <div className="max-h-137.5 grow overflow-auto rounded-lg border border-white/5 bg-black/40 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-indigo-200">
          {fileContent.content || '[Arquivo Vazio]'}
        </div>
      )}

      {selectedFile.category === 'pdf' && (
        <div className="mb-4 flex space-x-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => onPdfTabChange('visual')}
            className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              pdfTab === 'visual'
                ? 'bg-accent-indigo text-white'
                : 'text-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-eye mr-1.5"></i>
            <span>Visualizador PDF</span>
          </button>
          <button
            type="button"
            onClick={() => onPdfTabChange('text')}
            className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              pdfTab === 'text'
                ? 'bg-accent-indigo text-white'
                : 'text-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-file-invoice mr-1.5"></i>
            <span>Texto RAG</span>
          </button>
        </div>
      )}

      {fileContent?.type === 'document' && (selectedFile.category !== 'pdf' || pdfTab === 'text') && (
        <div className="flex grow flex-col space-y-4">
          <div className="bg-accent-indigo/10 border-accent-indigo/30 text-accent-indigo-light flex items-center space-x-2 self-start rounded border px-2.5 py-1 text-[10px]">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>
              {selectedFile.category === 'pdf'
                ? 'Texto Extraído via Motor RAG (PDF)'
                : 'Texto Extraído via LibreOffice Engine'}
            </span>
          </div>
          <div className="text-text-main max-h-125 grow overflow-auto rounded-lg border border-white/5 bg-black/30 p-5 text-xs leading-relaxed whitespace-pre-wrap">
            {fileContent.content || '[Sem texto extraído]'}
          </div>
        </div>
      )}

      {selectedFile.category === 'pdf' && pdfTab === 'visual' && (
        <div className="h-137.5 grow overflow-hidden rounded-lg border border-white/5 bg-black/20">
          <iframe
            src={`/api/proxy?url=/api/files/view?path=${encodeURIComponent(selectedFile.path)}&raw=true`}
            className="h-full w-full border-0"
            title="PDF Viewer"
          />
        </div>
      )}

      {fileContent?.type === 'image' && fileContent.data && (
        <div className="grid min-h-0 grow grid-cols-1 gap-6 md:grid-cols-12">
          <div className="flex max-h-120 items-center justify-center rounded-lg border border-white/5 bg-black/40 p-4 md:col-span-8">
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
                <i className="fa-solid fa-eye-slash mb-2 text-lg"></i>
                <p>Imagem muito grande para exibição inline.</p>
                <p className="mt-1">Clique em &apos;Abrir Raw&apos; para visualizá-la.</p>
              </div>
            )}
          </div>
          <div className="space-y-4 md:col-span-4">
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <h4 className="mb-2 text-xs font-bold tracking-wide text-white uppercase">Dimensões</h4>
              <p className="text-base font-black text-white">{fileContent.data.size}</p>
              <p className="text-text-muted mt-0.5 text-[10px] uppercase">
                Formato: {fileContent.data.format}
              </p>
            </div>
            {fileContent.data.exif && Object.keys(fileContent.data.exif).length > 0 && (
              <div className="max-h-75 overflow-y-auto rounded-lg border border-white/5 bg-white/5 p-4">
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

      {selectedFile.category === 'media' && (
        <div className="flex max-h-137.5 grow flex-col items-center space-y-4 overflow-y-auto rounded-lg border border-white/5 bg-black/40 p-4">
          {selectedFile.name.toLowerCase().endsWith('.mp3') ||
          selectedFile.name.toLowerCase().endsWith('.wav') ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-12 w-full max-w-md">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-accent-indigo/10 border border-accent-indigo/30 animate-pulse">
                <i className="fa-solid fa-music text-accent-indigo text-4xl"></i>
              </div>
              <audio
                controls
                src={`/api/proxy?url=/api/files/view?path=${encodeURIComponent(selectedFile.path)}&raw=true`}
                className="w-full shadow-lg"
              >
                <track kind="captions" />
              </audio>
              <div className="text-text-muted w-full text-center text-xs">
                <i className="fa-solid fa-circle-info text-accent-indigo mr-1"></i>
                {fileContent?.message || 'Streaming de áudio local disponível. Use os controles para reproduzir.'}
              </div>
            </div>
          ) : (
            <>
              <video
                controls
                src={`/api/proxy?url=/api/files/view?path=${encodeURIComponent(selectedFile.path)}&raw=true`}
                className="max-h-95 w-full rounded-lg border border-white/10 shadow-2xl"
              >
                <track kind="captions" />
              </video>
              <div className="text-text-muted w-full text-center text-xs">
                <i className="fa-solid fa-circle-info text-accent-indigo mr-1"></i>
                {fileContent?.message || 'Suporte a streaming direto do arquivo local. Use os controles para reproduzir.'}
              </div>
            </>
          )}
        </div>
      )}

      {fileContent?.type === 'spreadsheet' && fileContent.data && (
        <div className="flex min-h-0 grow flex-col space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                Planilha carregada
              </div>
              <span className="text-text-muted text-[10px]">Primeiras 50 linhas exibidas</span>
            </div>
            <input
              type="text"
              placeholder="Filtrar dados da planilha..."
              value={gridSearch}
              onChange={(e) => onGridSearchChange(e.target.value)}
              className="focus:border-accent-emerald w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white transition-colors focus:outline-none sm:w-64"
            />
          </div>

          <div className="max-h-100 grow overflow-auto rounded-lg border border-white/5 bg-black/20">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="sticky top-0 border-b border-white/10 bg-white/5 font-bold text-white backdrop-blur-md">
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
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <h4 className="mb-3 flex items-center space-x-1.5 text-xs font-bold tracking-wide text-white uppercase">
                <i className="fa-solid fa-chart-line text-accent-emerald-light"></i>
                <span>Gráfico de Tendência Dinâmico (SVG Autónomo)</span>
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
                        style={{ height: `${Math.max(5, Math.min(pct, 100))}%` }}
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

      {fileContent?.type === 'archive' && fileContent.files && (
        <div className="flex grow flex-col space-y-4">
          <div className="flex items-center space-x-2 self-start rounded border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[10px] text-yellow-400">
            <i className="fa-solid fa-circle-info"></i>
            <span>Listagem de Arquivos no Pacote de Compressão</span>
          </div>
          <div className="max-h-120 grow overflow-auto rounded-lg border border-white/5 bg-black/20">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="sticky top-0 border-b border-white/10 bg-white/5 font-bold text-white">
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
                      {file.is_dir ? '-' : formatSize(file.size)}
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

export default function FilesDashboardPage() {
  const [tree, setTree] = useState<SourceTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gridSearch, setGridSearch] = useState('');
  const [collapsedSources, setCollapsedSources] = useState<Record<string, boolean>>({});
  const [pdfTab, setPdfTab] = useState<'visual' | 'text'>('visual');

  // Load files list from local API
  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch('/api/proxy?url=/api/files/list');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = (await res.json()) as { status: string; tree: SourceTree[]; error?: string };
        if (data.status === 'SUCCESS') {
          setTree(data.tree);
        } else {
          throw new Error(data.error || 'Failed to retrieve file tree.');
        }
      } catch (err: unknown) {
        console.error('[Files DB] Tree load failed:', err);
        setError((err as Error).message || 'API connection failed.');
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  // Load individual file content
  useEffect(() => {
    if (!selectedFile) return;
    const file = selectedFile;
    setPdfTab('visual');

    async function fetchFileContent() {
      setLoadingContent(true);
      setFileContent(null);
      setGridSearch('');
      try {
        const encPath = encodeURIComponent(file.path);
        const res = await fetch(`/api/proxy?url=/api/files/view?path=${encPath}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = (await res.json()) as FileContent;
        setFileContent(data);
      } catch (err: unknown) {
        console.error('[Files DB] File view failed:', err);
        setFileContent({
          type: 'text',
          error: (err as Error).message || 'Failed to read file.',
        });
      } finally {
        setLoadingContent(false);
      }
    }
    fetchFileContent();
  }, [selectedFile]);

  const toggleSource = (source: string) => {
    setCollapsedSources((prev) => ({ ...prev, [source]: !prev[source] }));
  };

  const chartData = fileContent?.data ? getChartData(fileContent.data) : null;

  return (
    <div className="bg-bg-base text-text-bright font-body min-h-screen pb-24">
      <ContentPageHeader
        title="Central de Documentos"
        subtitle="Mapeamento, RAG vetorial e visualizador integrado de arquivos locais e Google Drive."
        category="Orquestrador"
        icon="fa-folder-open"
      />

      <div className="sota-container relative z-10 -mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sidebar: File Explorer */}
        <GlassPanel className="border-accent-indigo/20 flex h-187.5 flex-col p-6 lg:col-span-4">
          <div className="mb-4">
            <label htmlFor="file-search" className="sr-only">
              Buscar arquivos
            </label>
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass text-text-muted absolute top-1/2 left-3 -translate-y-1/2 text-xs"></i>
              <input
                id="file-search"
                type="text"
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:border-accent-indigo w-full rounded-lg border border-white/10 bg-black/40 py-2 pr-4 pl-9 text-sm text-white transition-colors focus:outline-none"
              />
            </div>
          </div>

          <div className="grow space-y-4 overflow-y-auto pr-1">
            <FileExplorerTree
              tree={tree}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              selectedFile={selectedFile}
              collapsedSources={collapsedSources}
              onToggleSource={toggleSource}
              onSelectFile={setSelectedFile}
            />
          </div>
        </GlassPanel>

        {/* Right Panel: File Visualizer Viewport */}
        <div className="space-y-6 lg:col-span-8">
          {!selectedFile ? (
            <GlassPanel className="flex h-187.5 flex-col items-center justify-center border-white/5 p-12 text-center">
              <div className="text-accent-indigo mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <i className="fa-solid fa-file-invoice text-2xl"></i>
              </div>
              <h3 className="mb-1 text-lg font-bold text-white">Selecione um Arquivo</h3>
              <p className="text-text-muted max-w-xs text-xs leading-relaxed">
                Selecione qualquer documento do Cerebro, do projeto ou do Google Drive no explorador para renderizá-lo
                em tempo real.
              </p>
            </GlassPanel>
          ) : (
            <GlassPanel className="border-accent-indigo/20 flex min-h-187.5 flex-col p-6">
              {/* File Header */}
              <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
                <div className="overflow-hidden">
                  <div className="text-text-muted mb-1 flex items-center space-x-2 text-[10px] tracking-widest uppercase">
                    <span>{selectedFile.category}</span>
                    <span>•</span>
                    <span>{formatSize(selectedFile.size)}</span>
                  </div>
                  <h2 className="truncate text-base font-black text-white">{selectedFile.name}</h2>
                  <p className="text-text-muted mt-0.5 truncate text-[10px]" title={selectedFile.path}>
                    {selectedFile.path}
                  </p>
                </div>
                <div className="flex shrink-0 items-center space-x-2">
                  <a
                    href={`/api/proxy?url=/api/files/view?path=${encodeURIComponent(selectedFile.path)}&raw=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/10"
                  >
                    <i className="fa-solid fa-up-right-from-square"></i>
                    <span>Abrir Raw</span>
                  </a>
                </div>
              </div>

              {/* Viewer Viewport */}
              <FileViewerBody
                selectedFile={selectedFile}
                fileContent={fileContent}
                loadingContent={loadingContent}
                pdfTab={pdfTab}
                onPdfTabChange={setPdfTab}
                gridSearch={gridSearch}
                onGridSearchChange={setGridSearch}
                chartData={chartData}
              />
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
