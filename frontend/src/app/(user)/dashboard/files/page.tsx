'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchJson, isAbortError } from '@/lib/client-fetch';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import {
  UniversalDocumentViewer,
  formatFileSize as formatSize,
  type FileCategory,
  type FileItem,
  type FileContent,
} from '@/components/files/UniversalDocumentViewer';

interface SourceTree {
  source: string;
  kind?: string;
  description?: string;
  path: string;
  total_count?: number;
  truncated?: boolean;
  files: FileItem[];
}

type QuickFilter = 'all' | 'docs' | 'governance' | 'skills' | 'code';
type ExplorerViewMode = 'tree' | 'list';

interface FolderNode {
  readonly name: string;
  readonly fullPath: string;
  readonly folders: FolderNode[];
  readonly files: FileItem[];
  readonly fileCount: number;
}

const QUICK_FILTER_OPTIONS: readonly { readonly id: QuickFilter; readonly label: string; readonly icon: string }[] = [
  { id: 'all', label: 'Todos', icon: 'fa-layer-group' },
  { id: 'docs', label: 'Docs', icon: 'fa-book-open' },
  { id: 'governance', label: 'Governança', icon: 'fa-shield-halved' },
  { id: 'skills', label: 'Skills', icon: 'fa-wand-magic-sparkles' },
  { id: 'code', label: 'Código', icon: 'fa-code' },
];

const DOC_EXTS = new Set(['.md', '.mdx', '.txt', '.rst', '.pdf', '.docx', '.odt', '.doc']);
const CODE_EXTS = new Set([
  '.py',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.yaml',
  '.yml',
  '.toml',
  '.ps1',
  '.sh',
  '.rs',
  '.sql',
  '.css',
]);
const GOVERNANCE_NAMES = new Set([
  'claude.md',
  'gemini.md',
  'agents.md',
  'workspace_index.md',
  'modus_operandi.md',
  'soul.md',
  'hermes.md',
  'devin.md',
  'manutencao.md',
  'fundamentos_sota.md',
  'cosmovisao_malha_sota_v8_gold.md',
  'handoff_sessao_sota_v8_gold.md',
]);

function getExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx > 0 ? name.slice(idx).toLowerCase() : '';
}

function inferCategoryFromName(name: string): FileCategory {
  const ext = getExtension(name);
  if (['.zip', '.rar', '.7z'].includes(ext)) return 'archive';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) return 'image';
  if (['.mp4', '.avi', '.mkv', '.mov', '.webm', '.mp3', '.wav', '.ogg', '.flac', '.m4a'].includes(ext)) return 'media';
  if (['.csv', '.xlsx', '.ods', '.xls'].includes(ext)) return 'spreadsheet';
  if (ext === '.pdf') return 'pdf';
  return 'text';
}

function getFileIcon(file: FileItem): string {
  const ext = file.ext || getExtension(file.name);
  if (ext === '.md' || ext === '.mdx') return 'fa-book-open text-sky-400';
  if (ext === '.json' || ext === '.yaml' || ext === '.yml' || ext === '.toml') return 'fa-sliders text-amber-300';
  switch (file.category) {
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

function getSourceIcon(src: SourceTree): string {
  if (src.kind === 'ecosystem' || src.source.startsWith('Ecosystem')) return 'fa-sitemap text-emerald-400';
  if (src.kind === 'onedrive' || src.source === 'OneDrive') return 'fa-cloud text-sky-400';
  if (src.kind === 'cloud' || src.source === 'GoogleDrive') return 'fa-cloud text-amber-400';
  if (src.kind === 'knowledge' || src.source === 'Cerebro') return 'fa-brain text-purple-400';
  return 'fa-folder text-accent-indigo-light';
}

function getSourceShortLabel(source: string): string {
  if (source.startsWith('Ecosystem')) return '.gemini';
  if (source === 'Project') return 'Site';
  if (source === 'GoogleDrive') return 'Google Drive';
  if (source === 'OneDrive') return 'OneDrive';
  return source;
}

function matchesQuickFilter(file: FileItem, filter: QuickFilter): boolean {
  if (filter === 'all') return true;
  const ext = file.ext || getExtension(file.name);
  const relLower = file.relative_path.toLowerCase();
  const nameLower = file.name.toLowerCase();

  if (filter === 'docs') {
    return DOC_EXTS.has(ext);
  }
  if (filter === 'governance') {
    return (
      GOVERNANCE_NAMES.has(nameLower) ||
      relLower.startsWith('nucleo/') ||
      relLower.startsWith('memoria/') ||
      relLower.startsWith('governance/') ||
      relLower.startsWith('policies/') ||
      relLower.startsWith('.claude/') ||
      relLower.includes('/rules')
    );
  }
  if (filter === 'skills') {
    return (
      relLower.startsWith('.agents/') ||
      relLower.startsWith('skills/') ||
      relLower.startsWith('skills_library/') ||
      relLower.startsWith('agents/') ||
      relLower.includes('/skills/')
    );
  }
  return CODE_EXTS.has(ext);
}

interface MutableFolderNode {
  name: string;
  fullPath: string;
  foldersMap: Map<string, MutableFolderNode>;
  files: FileItem[];
}

function finalizeFolderNode(node: MutableFolderNode): FolderNode {
  const folders = Array.from(node.foldersMap.values())
    .map(finalizeFolderNode)
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
  const nestedCount = folders.reduce((acc, f) => acc + f.fileCount, 0);
  return {
    name: node.name,
    fullPath: node.fullPath,
    folders,
    files,
    fileCount: files.length + nestedCount,
  };
}

function buildFolderTree(files: readonly FileItem[]): FolderNode {
  const root: MutableFolderNode = {
    name: '',
    fullPath: '',
    foldersMap: new Map(),
    files: [],
  };

  for (const file of files) {
    const parts = file.relative_path.split('/').filter(Boolean);
    if (parts.length <= 1) {
      root.files.push(file);
      continue;
    }
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      if (!seg) continue;
      const nextPath = current.fullPath ? `${current.fullPath}/${seg}` : seg;
      let nextNode = current.foldersMap.get(seg);
      if (!nextNode) {
        nextNode = {
          name: seg,
          fullPath: nextPath,
          foldersMap: new Map(),
          files: [],
        };
        current.foldersMap.set(seg, nextNode);
      }
      current = nextNode;
    }
    current.files.push(file);
  }

  return finalizeFolderNode(root);
}

function resolvePosixPath(baseFilePath: string, relativeHref: string): string | null {
  const cleanHref = relativeHref.split('#')[0]?.split('?')[0]?.trim();
  if (!cleanHref) return null;

  let decodedHref = cleanHref;
  try {
    decodedHref = decodeURIComponent(cleanHref);
  } catch {
    // Mantém string original se percent-encoding for inválido
  }

  const normalizedBase = baseFilePath.replaceAll('\\', '/');
  const lastSlash = normalizedBase.lastIndexOf('/');
  const baseDir = lastSlash >= 0 ? normalizedBase.slice(0, lastSlash) : '';
  const combined = decodedHref.startsWith('/') ? decodedHref : `${baseDir}/${decodedHref}`;

  const segments = combined.split('/');
  const resolved: string[] = [];
  const drivePrefix = /^[a-zA-Z]:$/.test(segments[0] || '') ? segments.shift() || '' : '';

  for (const seg of segments) {
    if (!seg || seg === '.') continue;
    if (seg === '..') {
      if (resolved.length > 0) resolved.pop();
      continue;
    }
    resolved.push(seg);
  }

  return drivePrefix ? `${drivePrefix}/${resolved.join('/')}` : `/${resolved.join('/')}`;
}

function resolveFileFromInitialPath(tree: readonly SourceTree[], initialPath: string): FileItem {
  const normalizedTarget = initialPath.replaceAll('\\', '/').toLowerCase();
  const matched = tree.flatMap((source) => source.files).find((file) => {
    return file.path.replaceAll('\\', '/').toLowerCase() === normalizedTarget;
  });
  if (matched) return matched;

  const name = initialPath.split(/[/\\]/).pop() || initialPath;
  return {
    name,
    path: initialPath,
    relative_path: name,
    category: inferCategoryFromName(name),
    size: 0,
  };
}

function setFilesFromResponse(
  data: { status: string; tree: SourceTree[]; error?: string },
  setTree: (tree: SourceTree[]) => void,
  setSelectedFile: (file: FileItem) => void,
): string | null {
  if (data.status !== 'SUCCESS') return data.error || 'Falha ao obter lista de arquivos.';
  setTree(data.tree);
  if (typeof window === 'undefined') return null;
  const initialPath = new URLSearchParams(window.location.search).get('path')?.trim();
  if (initialPath) setSelectedFile(resolveFileFromInitialPath(data.tree, initialPath));
  return null;
}

const FILE_VIRTUALIZATION_THRESHOLD = 40;

function FileTreeItemButton({
  file,
  isSelected,
  showRelativePath,
  onSelectFile,
}: {
  readonly file: FileItem;
  readonly isSelected: boolean;
  readonly showRelativePath?: boolean;
  readonly onSelectFile: (file: FileItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelectFile(file)}
      title={file.relative_path}
      className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-all ${
        isSelected
          ? 'bg-accent-indigo/20 border-accent-indigo/40 border text-white'
          : 'text-text-muted border border-transparent hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="mr-2 flex min-w-0 items-center space-x-2 overflow-hidden">
        <i className={`fa-solid ${getFileIcon(file)} shrink-0 text-xs`}></i>
        <div className="min-w-0">
          <span className="block truncate text-xs">{file.name}</span>
          {showRelativePath && file.relative_path !== file.name && (
            <span className="text-text-muted/70 block truncate text-[9px]">{file.relative_path}</span>
          )}
        </div>
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
    estimateSize: () => 38,
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
                showRelativePath={true}
                onSelectFile={onSelectFile}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FolderBranch({
  source,
  node,
  selectedFile,
  expandedFolders,
  forceExpand,
  onToggleFolder,
  onSelectFile,
}: {
  readonly source: string;
  readonly node: FolderNode;
  readonly selectedFile: FileItem | null;
  readonly expandedFolders: Record<string, boolean>;
  readonly forceExpand: boolean;
  readonly onToggleFolder: (key: string) => void;
  readonly onSelectFile: (file: FileItem) => void;
}) {
  const folderKey = `${source}::${node.fullPath}`;
  const isExpanded = forceExpand || Boolean(expandedFolders[folderKey]);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => onToggleFolder(folderKey)}
        className="group flex w-full items-center justify-between rounded px-2 py-1 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex min-w-0 items-center space-x-2">
          <i
            className={`fa-solid ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'} text-text-muted text-[9px]`}
          ></i>
          <i className={`fa-solid ${isExpanded ? 'fa-folder-open' : 'fa-folder'} text-amber-400/80 text-xs`}></i>
          <span className="truncate text-xs font-medium text-neutral-200 group-hover:text-white">{node.name}</span>
        </div>
        <span className="text-text-muted shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[9px]">{node.fileCount}</span>
      </button>

      {isExpanded && (
        <div className="ml-2.5 space-y-0.5 border-l border-white/10 pl-2.5">
          {node.folders.map((subFolder) => (
            <FolderBranch
              key={`${source}::${subFolder.fullPath}`}
              source={source}
              node={subFolder}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              forceExpand={forceExpand}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
            />
          ))}
          {node.files.map((file) => (
            <FileTreeItemButton
              key={file.path}
              file={file}
              isSelected={selectedFile?.path === file.path}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileExplorerTreeProps {
  readonly tree: readonly SourceTree[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly searchTerm: string;
  readonly quickFilter: QuickFilter;
  readonly sourceFilter: string;
  readonly viewMode: ExplorerViewMode;
  readonly selectedFile: FileItem | null;
  readonly collapsedSources: Record<string, boolean>;
  readonly expandedFolders: Record<string, boolean>;
  readonly onToggleSource: (source: string) => void;
  readonly onToggleFolder: (key: string) => void;
  readonly onSelectFile: (file: FileItem) => void;
  readonly onRetry: () => void;
}

function FileExplorerTree({
  tree,
  loading,
  error,
  searchTerm,
  quickFilter,
  sourceFilter,
  viewMode,
  selectedFile,
  collapsedSources,
  expandedFolders,
  onToggleSource,
  onToggleFolder,
  onSelectFile,
  onRetry,
}: FileExplorerTreeProps) {
  if (loading) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-2">
        <i className="fa-solid fa-circle-notch fa-spin text-accent-indigo text-2xl"></i>
        <span className="text-text-muted text-xs">Mapeando ecossistema e documentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-xs text-rose-400">
        <i className="fa-solid fa-circle-exclamation mb-2 text-lg"></i>
        <p className="mb-3">Falha ao carregar arquivos: {error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20"
        >
          <i aria-hidden="true" className="fa-solid fa-rotate-right mr-1.5"></i>
          <span>Tentar novamente</span>
        </button>
      </div>
    );
  }

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const forceExpandFolders = Boolean(normalizedQuery) || quickFilter !== 'all';

  const visibleTree = sourceFilter === 'all' ? tree : tree.filter((src) => src.source === sourceFilter);

  return (
    <>
      {visibleTree.map((src) => {
        const files = src.files.filter((f) => {
          if (!matchesQuickFilter(f, quickFilter)) return false;
          if (!normalizedQuery) return true;
          return (
            f.name.toLowerCase().includes(normalizedQuery) ||
            f.relative_path.toLowerCase().includes(normalizedQuery)
          );
        });
        const isCollapsed = collapsedSources[src.source];
        if (files.length === 0 && (normalizedQuery || quickFilter !== 'all')) return null;

        let fileListContent: React.ReactNode;
        if (files.length === 0) {
          fileListContent = (
            <span className="text-text-muted block py-1 pl-2 text-[10px]">Nenhum arquivo encontrado</span>
          );
        } else if (viewMode === 'list' || files.length > FILE_VIRTUALIZATION_THRESHOLD && viewMode !== 'tree') {
          fileListContent = (
            <VirtualizedFileList files={files} selectedFile={selectedFile} onSelectFile={onSelectFile} />
          );
        } else if (viewMode === 'tree') {
          const rootNode = buildFolderTree(files);
          fileListContent = (
            <div className="space-y-1">
              {rootNode.folders.map((folder) => (
                <FolderBranch
                  key={`${src.source}::${folder.fullPath}`}
                  source={src.source}
                  node={folder}
                  selectedFile={selectedFile}
                  expandedFolders={expandedFolders}
                  forceExpand={forceExpandFolders}
                  onToggleFolder={onToggleFolder}
                  onSelectFile={onSelectFile}
                />
              ))}
              {rootNode.files.map((file) => (
                <FileTreeItemButton
                  key={file.path}
                  file={file}
                  isSelected={selectedFile?.path === file.path}
                  onSelectFile={onSelectFile}
                />
              ))}
            </div>
          );
        } else {
          fileListContent = files.map((file) => (
            <FileTreeItemButton
              key={file.path}
              file={file}
              isSelected={selectedFile?.path === file.path}
              showRelativePath={true}
              onSelectFile={onSelectFile}
            />
          ));
        }

        return (
          <div key={src.source} className="space-y-1">
            <button
              type="button"
              onClick={() => onToggleSource(src.source)}
              title={src.description || src.path}
              className="group flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex min-w-0 items-center space-x-2">
                <i
                  className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'} text-text-muted text-[10px]`}
                ></i>
                <i className={`fa-solid ${getSourceIcon(src)} text-sm`}></i>
                <span className="truncate text-xs font-bold tracking-wider text-white uppercase">{src.source}</span>
              </div>
              <div className="flex shrink-0 items-center space-x-1">
                {src.truncated && (
                  <span
                    className="rounded bg-amber-500/20 px-1 py-0.5 text-[9px] text-amber-300"
                    title={`Exibindo ${src.files.length} de ${src.total_count ?? src.files.length} arquivos`}
                  >
                    +
                  </span>
                )}
                <span className="text-text-muted rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {files.length}
                </span>
              </div>
            </button>

            {!isCollapsed && (
              <div className="mt-1 ml-2.5 space-y-1 border-l border-white/10 pl-3">{fileListContent}</div>
            )}
          </div>
        );
      })}
    </>
  );
}

interface QuickShortcutItem {
  readonly label: string;
  readonly sourceLabel: string;
  readonly file: FileItem;
}

interface SelectedFilePanelProps {
  readonly file: FileItem | null;
  readonly fileContent: FileContent | null;
  readonly loadingContent: boolean;
  readonly isReaderExpanded: boolean;
  readonly copiedPath: boolean;
  readonly quickShortcuts: readonly QuickShortcutItem[];
  readonly onSelectFile: (file: FileItem) => void;
  readonly onCopyPath: (path: string) => void;
  readonly onToggleReader: () => void;
  readonly onNavigateRelativeLink: (href: string) => void;
  readonly onSelectSheet: (sheet: string) => void;
}

function SelectedFilePanel({
  file,
  fileContent,
  loadingContent,
  isReaderExpanded,
  copiedPath,
  quickShortcuts,
  onSelectFile,
  onCopyPath,
  onToggleReader,
  onNavigateRelativeLink,
  onSelectSheet,
}: Readonly<SelectedFilePanelProps>) {
  if (!file) {
    return (
      <GlassPanel className="border-accent-indigo/20 flex h-[calc(100vh-11.5rem)] min-h-152 flex-col items-center justify-center p-8 text-center">
        <div className="text-accent-indigo mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 shadow-inner">
          <i className="fa-solid fa-file-invoice text-2xl"></i>
        </div>
        <h3 className="mb-1.5 text-lg font-bold tracking-tight text-white">Selecione um Arquivo</h3>
        <p className="text-text-muted max-w-lg text-xs leading-relaxed">
          Explore a documentação do ecossistema (<code className="text-indigo-300">.gemini</code>), repositório{' '}
          <code className="text-indigo-300">Site/</code>, Cérebro, <span className="text-amber-300">Google Drive</span>{' '}
          e <span className="text-sky-300">OneDrive</span> com leitura universal, gráficos e navegação por links
          relativos.
        </p>

        {quickShortcuts.length > 0 && (
          <div className="mt-7 w-full max-w-xl">
            <p className="text-text-muted mb-2.5 text-[10px] font-bold tracking-widest uppercase">
              Acesso Rápido Canônico
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {quickShortcuts.map((item) => (
                <button
                  key={item.file.path}
                  type="button"
                  onClick={() => onSelectFile(item.file)}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left transition-all hover:border-indigo-400/40 hover:bg-indigo-500/10"
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate text-xs font-semibold text-white group-hover:text-indigo-200">
                      {item.label}
                    </div>
                    <div className="text-text-muted truncate text-[10px]">{item.sourceLabel}</div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-text-muted shrink-0 text-[10px] transition-transform group-hover:translate-x-0.5 group-hover:text-white"></i>
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="border-accent-indigo/20 flex h-[calc(100vh-11.5rem)] min-h-152 flex-col p-5">
      <div className="mb-3 flex shrink-0 flex-col justify-between gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center">
        <div className="min-w-0 overflow-hidden">
          <div className="text-text-muted mb-1 flex items-center space-x-2 text-[10px] tracking-widest uppercase">
            <span className="shrink-0">{file.category}</span>
            <span className="shrink-0">•</span>
            <span className="shrink-0 whitespace-nowrap">{formatSize(file.size)}</span>
            {file.relative_path && file.relative_path !== file.name && (
              <>
                <span className="shrink-0">•</span>
                <span className="truncate normal-case text-indigo-300/80">{file.relative_path}</span>
              </>
            )}
          </div>
          <h2 className="truncate text-base font-black text-white">{file.name}</h2>
          <p className="text-text-muted mt-0.5 truncate font-mono text-[10px]" title={file.path}>
            {file.path}
          </p>
        </div>
        <div className="flex shrink-0 items-center space-x-2">
          <button
            type="button"
            onClick={() => onCopyPath(file.path)}
            title="Copiar caminho completo"
            className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
              copiedPath
                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                : 'text-text-muted border-white/10 bg-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${copiedPath ? 'fa-check' : 'fa-link'} text-[11px]`}></i>
            <span className="hidden sm:inline">{copiedPath ? 'Caminho copiado' : 'Caminho'}</span>
          </button>
          <button
            type="button"
            onClick={onToggleReader}
            title={isReaderExpanded ? 'Mostrar explorador lateral (Esc)' : 'Expandir área de leitura'}
            className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
              isReaderExpanded
                ? 'border-accent-indigo/50 bg-accent-indigo/20 text-white'
                : 'text-text-muted border-white/10 bg-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${isReaderExpanded ? 'fa-chevron-right' : 'fa-chevron-left'} text-[11px]`}></i>
            <span className="hidden sm:inline">{isReaderExpanded ? 'Mostrar árvore' : 'Expandir'}</span>
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <UniversalDocumentViewer
          key={file.path}
          selectedFile={file}
          fileContent={fileContent}
          loadingContent={loadingContent}
          onNavigateRelativeLink={onNavigateRelativeLink}
          onSelectSheet={onSelectSheet}
        />
      </div>
    </GlassPanel>
  );
}

export default function FilesDashboardPage() {
  const [tree, setTree] = useState<SourceTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ExplorerViewMode>('tree');
  const [collapsedSources, setCollapsedSources] = useState<Record<string, boolean>>({});
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isReaderExpanded, setIsReaderExpanded] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const copyPathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectFileAndSyncUrl = useCallback((file: FileItem) => {
    setSelectedFile(file);
    setSelectedSheet(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('path', file.path);
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyPathTimerRef.current) clearTimeout(copyPathTimerRef.current);
    };
  }, []);

  // Atalhos globais: '/' ou 'Ctrl+K' foca busca; 'Escape' sai do modo expandido ou limpa busca
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable === true;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (!isTyping && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current && searchTerm) {
          setSearchTerm('');
        } else if (isReaderExpanded) {
          setIsReaderExpanded(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchTerm, isReaderExpanded]);

  // Carregar lista de arquivos do ecossistema, projeto, cérebro e drive
  useEffect(() => {
    const controller = new AbortController();
    async function fetchFiles() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJson<{ status: string; tree: SourceTree[]; error?: string }>('/api/vitoi/files/list', {
          signal: controller.signal,
          timeoutMs: 15_000,
          fallbackError: 'Serviço temporariamente indisponível.',
        });
        if (controller.signal.aborted) return;
        const responseError = setFilesFromResponse(data, setTree, setSelectedFile);
        if (responseError) setError(responseError);
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
  }, [reloadNonce]);

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
        const sheetQuery = selectedSheet ? `&sheet=${encodeURIComponent(selectedSheet)}` : '';
        const data = await fetchJson<FileContent>(`/api/vitoi/files/view?path=${encPath}${sheetQuery}`, {
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
  }, [selectedFile, selectedSheet]);

  const toggleSource = (source: string) => {
    setCollapsedSources((prev) => ({ ...prev, [source]: !prev[source] }));
  };

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const handleNavigateRelativeLink = useCallback(
    (href: string) => {
      if (!selectedFile) return;
      const targetPath = resolvePosixPath(selectedFile.path, href);
      if (!targetPath) return;

      const normalizedTarget = targetPath.toLowerCase();
      const matched = tree
        .flatMap((src) => src.files)
        .find((f) => f.path.replaceAll('\\', '/').toLowerCase() === normalizedTarget);

      if (matched) {
        selectFileAndSyncUrl(matched);
        return;
      }

      const name = targetPath.split('/').pop() || targetPath;
      selectFileAndSyncUrl({
        name,
        path: targetPath,
        relative_path: name,
        category: inferCategoryFromName(name),
        size: 0,
      });
    },
    [selectedFile, tree, selectFileAndSyncUrl],
  );

  const handleCopyPath = async (pathText: string) => {
    try {
      await navigator.clipboard.writeText(pathText);
      setCopiedPath(true);
      if (copyPathTimerRef.current) clearTimeout(copyPathTimerRef.current);
      copyPathTimerRef.current = setTimeout(() => setCopiedPath(false), 2000);
    } catch {
      // Ignora falha de clipboard
    }
  };

  const totalIndexedFiles = useMemo(() => tree.reduce((acc, src) => acc + src.files.length, 0), [tree]);

  const quickShortcuts = useMemo<QuickShortcutItem[]>(() => {
    const targets: readonly { sourcePrefix: string; relPath: string; label: string }[] = [
      { sourcePrefix: 'Ecosystem', relPath: 'WORKSPACE_INDEX.md', label: 'WORKSPACE_INDEX.md' },
      { sourcePrefix: 'Ecosystem', relPath: 'COSMOVISAO_MALHA_SOTA_v8_GOLD.md', label: 'Cosmovisão SOTA v8' },
      { sourcePrefix: 'Ecosystem', relPath: 'CLAUDE.md', label: 'Governança Raiz (CLAUDE.md)' },
      { sourcePrefix: 'Project', relPath: 'README.md', label: 'Site/README.md' },
    ];
    const resolved: QuickShortcutItem[] = [];
    for (const target of targets) {
      const src = tree.find((s) => s.source.startsWith(target.sourcePrefix));
      const matched = src?.files.find((f) => f.relative_path.toLowerCase() === target.relPath.toLowerCase());
      if (src && matched) {
        resolved.push({
          label: target.label,
          sourceLabel: getSourceShortLabel(src.source),
          file: matched,
        });
      }
    }
    return resolved;
  }, [tree]);

  return (
    <div className="bg-bg-base text-text-bright font-body min-h-screen pb-20">
      <ContentPageHeader
        title="Central de Documentos"
        subtitle="Mapeamento simétrico do ecossistema (.gemini), repositório Site, Cérebro vetorial, Google Drive e OneDrive com leitor universal."
        category="Orquestrador"
        icon="fa-folder-open"
      />

      <div className="sota-container relative z-10 -mt-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Left Sidebar: File Explorer */}
        {!isReaderExpanded && (
          <GlassPanel className="border-accent-indigo/20 flex h-[calc(100vh-11.5rem)] min-h-152 flex-col p-5 lg:col-span-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs font-bold tracking-wider text-white uppercase">
                <i className="fa-solid fa-compass text-accent-indigo-light"></i>
                <span>Explorador</span>
                {!loading && (
                  <span className="text-text-muted rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-normal">
                    {totalIndexedFiles.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex items-center rounded-md border border-white/10 bg-black/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('tree')}
                    title="Visualização em árvore de pastas"
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                      viewMode === 'tree' ? 'bg-accent-indigo-surface text-white' : 'text-text-muted hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-folder mr-1"></i>
                    <span>Árvore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    title="Visualização em lista plana"
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                      viewMode === 'list' ? 'bg-accent-indigo-surface text-white' : 'text-text-muted hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-bars mr-1"></i>
                    <span>Lista</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setReloadNonce((n) => n + 1)}
                  title="Recarregar árvore de arquivos"
                  className="text-text-muted flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-black/30 text-[11px] transition-colors hover:bg-white/10 hover:text-white"
                >
                  <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i>
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="file-search" className="sr-only">
                Buscar arquivos
              </label>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass text-text-muted absolute top-1/2 left-3 -translate-y-1/2 text-xs"></i>
                <input
                  ref={searchInputRef}
                  id="file-search"
                  type="text"
                  placeholder="Buscar por nome ou caminho... (/)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:border-accent-indigo w-full rounded-lg border border-white/10 bg-black/40 py-2 pr-8 pl-9 text-xs text-white transition-colors focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    aria-label="Limpar busca"
                    className="text-text-muted absolute top-1/2 right-2.5 -translate-y-1/2 text-xs hover:text-white"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Ecosystem Filters */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {QUICK_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setQuickFilter(opt.id)}
                  className={`flex items-center space-x-1 rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors ${
                    quickFilter === opt.id
                      ? 'border-accent-indigo/50 bg-accent-indigo/20 text-white'
                      : 'text-text-muted border-white/10 bg-black/30 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${opt.icon} text-[9px]`}></i>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Source Root Filter Pills */}
            {tree.length > 1 && (
              <div className="mb-2.5 flex flex-wrap gap-1 border-b border-white/5 pb-2.5">
                <button
                  type="button"
                  onClick={() => setSourceFilter('all')}
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    sourceFilter === 'all'
                      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                      : 'text-text-muted border-white/10 bg-black/30 hover:text-white'
                  }`}
                >
                  Todas ({tree.length})
                </button>
                {tree.map((src) => (
                  <button
                    key={src.source}
                    type="button"
                    onClick={() => setSourceFilter(src.source)}
                    className={`flex items-center space-x-1 rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      sourceFilter === src.source
                        ? 'border-indigo-400/50 bg-indigo-500/20 text-white'
                        : 'text-text-muted border-white/10 bg-black/30 hover:text-white'
                    }`}
                  >
                    <i className={`fa-solid ${getSourceIcon(src)} text-[9px]`}></i>
                    <span>{getSourceShortLabel(src.source)}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="min-h-0 grow space-y-3 overflow-y-auto pr-1">
              <FileExplorerTree
                tree={tree}
                loading={loading}
                error={error}
                searchTerm={searchTerm}
                quickFilter={quickFilter}
                sourceFilter={sourceFilter}
                viewMode={viewMode}
                selectedFile={selectedFile}
                collapsedSources={collapsedSources}
                expandedFolders={expandedFolders}
                onToggleSource={toggleSource}
                onToggleFolder={toggleFolder}
                onSelectFile={selectFileAndSyncUrl}
                onRetry={() => setReloadNonce((n) => n + 1)}
              />
            </div>
          </GlassPanel>
        )}

        {/* Right Panel: Universal Document Viewport */}
        <div className={`${isReaderExpanded ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
          <SelectedFilePanel
            file={selectedFile}
            fileContent={fileContent}
            loadingContent={loadingContent}
            isReaderExpanded={isReaderExpanded}
            copiedPath={copiedPath}
            quickShortcuts={quickShortcuts}
            onSelectFile={selectFileAndSyncUrl}
            onCopyPath={handleCopyPath}
            onToggleReader={() => setIsReaderExpanded((previous) => !previous)}
            onNavigateRelativeLink={handleNavigateRelativeLink}
            onSelectSheet={setSelectedSheet}
          />
        </div>
      </div>
    </div>
  );
}
