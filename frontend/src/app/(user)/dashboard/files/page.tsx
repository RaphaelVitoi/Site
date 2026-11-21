'use client';

import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchJson, isAbortError } from '@/lib/client-fetch';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import {
  UniversalDocumentViewer,
  formatFileSize as formatSize,
  type FileItem,
  type FileContent,
} from '@/components/files/UniversalDocumentViewer';

interface SourceTree {
  source: string;
  path: string;
  files: FileItem[];
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

const FILE_VIRTUALIZATION_THRESHOLD = 40;

function FileTreeItemButton({
  file,
  isSelected,
  onSelectFile,
}: {
  readonly file: FileItem;
  readonly isSelected: boolean;
  readonly onSelectFile: (file: FileItem) => void;
}) {
  return (
    <button
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
}

function VirtualizedFileList({
  files,
  selectedFile,
  onSelectFile,
}: {
  readonly files: readonly FileItem[];
  readonly selectedFile: FileItem | null;
  readonly onSelectFile: (file: FileItem) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 32,
    overscan: 8,
  });

  return (
    <div ref={scrollRef} className="max-h-96 overflow-y-auto pr-1">
      <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const file = files[virtualRow.index];
          if (!file) return null;
          return (
            <div
              key={file.path}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <FileTreeItemButton
                file={file}
                isSelected={selectedFile?.path === file.path}
                onSelectFile={onSelectFile}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
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
              <span className="text-text-muted rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">{files.length}</span>
            </button>

            {!isCollapsed && (
              <div className="mt-1 ml-3 space-y-1 border-l border-white/5 pl-4">
                {files.length === 0 ? (
                  <span className="text-text-muted block py-1 pl-2 text-[10px]">Nenhum arquivo encontrado</span>
                ) : files.length > FILE_VIRTUALIZATION_THRESHOLD ? (
                  <VirtualizedFileList
                    files={files}
                    selectedFile={selectedFile}
                    onSelectFile={onSelectFile}
                  />
                ) : (
                  files.map((file) => (
                    <FileTreeItemButton
                      key={file.path}
                      file={file}
                      isSelected={selectedFile?.path === file.path}
                      onSelectFile={onSelectFile}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
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
  const [collapsedSources, setCollapsedSources] = useState<Record<string, boolean>>({});

  // Carregar lista de arquivos
  useEffect(() => {
    const controller = new AbortController();
    async function fetchFiles() {
      try {
        const data = await fetchJson<{ status: string; tree: SourceTree[]; error?: string }>('/api/vitoi/files/list', {
          signal: controller.signal,
          timeoutMs: 15_000,
          fallbackError: 'Serviço temporariamente indisponível.',
        });
        if (controller.signal.aborted) return;
        if (data?.status === 'SUCCESS') {
          setTree(data.tree);
        } else {
          setError(data?.error || 'Falha ao obter lista de arquivos.');
        }
      } catch (err: unknown) {
        if (controller.signal.aborted || isAbortError(err)) return;
        setError(err instanceof Error ? err.message : 'Falha na conexão com a API de arquivos.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    void fetchFiles();
    return () => {
      controller.abort();
    };
  }, []);

  // Carregar conteúdo individual do arquivo selecionado
  useEffect(() => {
    if (!selectedFile) return;
    const file = selectedFile;
    const controller = new AbortController();

    async function fetchFileContent() {
      setLoadingContent(true);
      setFileContent(null);
      try {
        const encPath = encodeURIComponent(file.path);
        const data = await fetchJson<FileContent>(`/api/vitoi/files/view?path=${encPath}`, {
          signal: controller.signal,
          timeoutMs: 15_000,
          fallbackError: 'Erro ao ler arquivo.',
        });
        if (!controller.signal.aborted && data) {
          setFileContent(data);
        }
      } catch (err: unknown) {
        if (controller.signal.aborted || isAbortError(err)) return;
        setFileContent({
          type: 'text',
          error: err instanceof Error ? err.message : 'Falha ao ler arquivo.',
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoadingContent(false);
        }
      }
    }
    void fetchFileContent();
    return () => {
      controller.abort();
    };
  }, [selectedFile]);

  const toggleSource = (source: string) => {
    setCollapsedSources((prev) => ({ ...prev, [source]: !prev[source] }));
  };

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

        {/* Right Panel: Universal Document Viewport */}
        <div className="space-y-6 lg:col-span-8">
          {!selectedFile ? (
            <GlassPanel className="flex h-187.5 flex-col items-center justify-center border-white/5 p-12 text-center">
              <div className="text-accent-indigo mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <i className="fa-solid fa-file-invoice text-2xl"></i>
              </div>
              <h3 className="mb-1 text-lg font-bold text-white">Selecione um Arquivo</h3>
              <p className="text-text-muted max-w-xs text-xs leading-relaxed">
                Selecione qualquer documento do Cerebro, do projeto ou do Google Drive no explorador para renderizá-lo
                em tempo real com o motor universal (PDF, DOCX, Markdown, Código e Planilhas).
              </p>
            </GlassPanel>
          ) : (
            <GlassPanel className="border-accent-indigo/20 flex min-h-187.5 flex-col p-6">
              {/* File Header */}
              <div className="mb-4 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
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
              </div>

              {/* Universal Document Viewer */}
              <UniversalDocumentViewer
                selectedFile={selectedFile}
                fileContent={fileContent}
                loadingContent={loadingContent}
              />
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
