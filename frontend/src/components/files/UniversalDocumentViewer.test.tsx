import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  UniversalDocumentViewer,
  formatFileSize,
  type FileItem,
  type FileContent,
} from './UniversalDocumentViewer';

// Mock do SotaMarkdown para isolamento de teste
jest.mock('@/components/ui/layout/SotaMarkdown', () => ({
  SotaMarkdown: ({ content }: { content: string }) => (
    <div data-testid="sota-markdown">{content}</div>
  ),
}));

describe('UniversalDocumentViewer (SOTA Core)', () => {
  const basePdfFile: FileItem = {
    name: 'documento_tecnico.pdf',
    path: 'docs/documento_tecnico.pdf',
    relative_path: 'docs/documento_tecnico.pdf',
    category: 'pdf',
    size: 204800,
  };

  const baseMdFile: FileItem = {
    name: 'guia_arquitetura.md',
    path: 'docs/guia_arquitetura.md',
    relative_path: 'docs/guia_arquitetura.md',
    category: 'text',
    size: 1024,
  };

  const baseDocxFile: FileItem = {
    name: 'tratado_didatico.docx',
    path: 'docs/tratado_didatico.docx',
    relative_path: 'docs/tratado_didatico.docx',
    category: 'text',
    size: 45000,
  };

  const baseCodeFile: FileItem = {
    name: 'solver_engine.py',
    path: 'scripts/solver_engine.py',
    relative_path: 'scripts/solver_engine.py',
    category: 'text',
    size: 512,
  };

  const baseSheetFile: FileItem = {
    name: 'simulacoes.csv',
    path: 'data/simulacoes.csv',
    relative_path: 'data/simulacoes.csv',
    category: 'spreadsheet',
    size: 3072,
  };

  it('calcula formatação de tamanho de arquivo com precisão', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('exibe indicador de loading quando loadingContent for true', () => {
    render(
      <UniversalDocumentViewer
        selectedFile={basePdfFile}
        fileContent={null}
        loadingContent={true}
      />
    );
    expect(screen.getByText(/Carregando e decodificando documento/i)).toBeInTheDocument();
  });

  it('exibe estado de erro formatado quando fileContent contiver erro', () => {
    render(
      <UniversalDocumentViewer
        selectedFile={basePdfFile}
        fileContent={{ type: 'text', error: 'Arquivo corrompido' }}
        loadingContent={false}
      />
    );
    expect(screen.getByText(/Não foi possível visualizar este arquivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Arquivo corrompido/i)).toBeInTheDocument();
  });

  it('renderiza PDF com abas de visualização nativa e texto RAG', () => {
    const pdfContent: FileContent = {
      type: 'document',
      content: 'Texto extraído do PDF via motor RAG com 200 palavras.',
      words: 200,
      chars: 1200,
    };

    render(
      <UniversalDocumentViewer
        selectedFile={basePdfFile}
        fileContent={pdfContent}
        loadingContent={false}
      />
    );

    // Botões de abas
    expect(screen.getByRole('button', { name: /Visualizador PDF/i })).toBeInTheDocument();
    const ragButtons = screen.getAllByRole('button', { name: /Texto RAG/i });
    expect(ragButtons.length).toBeGreaterThanOrEqual(1);

    // Alternar para Texto RAG
    fireEvent.click(ragButtons[0]);
    expect(screen.getByText(/Motor RAG Nexus/i)).toBeInTheDocument();
    expect(screen.getByText(/Texto extraído do PDF via motor RAG/i)).toBeInTheDocument();
  });

  it('renderiza Markdown com modo formatado e código fonte', () => {
    const mdContent: FileContent = {
      type: 'text',
      content: '# Título Markdown\n\nTexto descritivo com $EV = 1.5$.',
    };

    render(
      <UniversalDocumentViewer
        selectedFile={baseMdFile}
        fileContent={mdContent}
        loadingContent={false}
      />
    );

    expect(screen.getByTestId('sota-markdown')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Código Fonte/i })).toBeInTheDocument();

    // Alternar para código fonte
    fireEvent.click(screen.getByRole('button', { name: /Código Fonte/i }));
    expect(screen.getByText(/Código Fonte Markdown/i)).toBeInTheDocument();
  });

  it('renderiza Documento Office (DOCX) no Modo Leitor Editorial', () => {
    const docxContent: FileContent = {
      type: 'document',
      content: 'Conteúdo editorial do documento Word.',
      words: 150,
      chars: 900,
    };

    render(
      <UniversalDocumentViewer
        selectedFile={baseDocxFile}
        fileContent={docxContent}
        loadingContent={false}
      />
    );

    expect(screen.getByText(/Modo Leitor Editorial Nexus/i)).toBeInTheDocument();
    expect(screen.getByText(/Conteúdo editorial do documento Word/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Pesquisar no texto/i)).toBeInTheDocument();
  });

  it('renderiza código com régua de numeração lateral de linhas', () => {
    const codeContent: FileContent = {
      type: 'text',
      content: 'import sys\n\ndef main():\n    print("SOTA")',
    };

    render(
      <UniversalDocumentViewer
        selectedFile={baseCodeFile}
        fileContent={codeContent}
        loadingContent={false}
      />
    );

    expect(screen.getByText(/4 linhas/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renderiza planilha tabular e permite filtro de busca', () => {
    const sheetContent: FileContent = {
      type: 'spreadsheet',
      data: {
        headers: ['Rodada', 'Jogador', 'EV'],
        rows: [
          ['1', 'Vitoi', '+12.5'],
          ['2', 'Oponente', '-8.2'],
        ],
      },
    };

    render(
      <UniversalDocumentViewer
        selectedFile={baseSheetFile}
        fileContent={sheetContent}
        loadingContent={false}
      />
    );

    expect(screen.getByText(/Planilha tabular carregada/i)).toBeInTheDocument();
    expect(screen.getByText('Vitoi')).toBeInTheDocument();
    expect(screen.getByText('Oponente')).toBeInTheDocument();

    // Filtrar dados
    const input = screen.getByPlaceholderText(/Filtrar dados da planilha/i);
    fireEvent.change(input, { target: { value: 'Vitoi' } });

    expect(screen.getByText('Vitoi')).toBeInTheDocument();
    expect(screen.queryByText('Oponente')).toBeNull();
  });

  it('copia conteúdo de texto com feedback', async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const textContent: FileContent = {
      type: 'text',
      content: 'conteudo para copiar',
    };

    render(
      <UniversalDocumentViewer
        selectedFile={baseCodeFile}
        fileContent={textContent}
        loadingContent={false}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Copiar/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('conteudo para copiar');
    await waitFor(() => {
      expect(screen.getByText(/Copiado!/i)).toBeInTheDocument();
    });
  });
});
