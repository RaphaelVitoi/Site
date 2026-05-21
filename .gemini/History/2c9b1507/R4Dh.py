import unittest
from unittest.mock import patch
import os
import sys

# Adiciona o diretorio raiz ao path para importar o memory_rag
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from memory_rag import MemoryRAG

class TestMemoryRAGChunking(unittest.TestCase):
    
    @patch('memory_rag.chromadb.PersistentClient')
    @patch('memory_rag.embedding_functions.SentenceTransformerEmbeddingFunction')
    def setUp(self, mock_emb, mock_chroma):
        """
        Instancia o MemoryRAG neutralizando dependencias pesadas de Machine Learning
        e de I/O de disco do ChromaDB para manter os testes com latencia zero.
        """
        self.rag = MemoryRAG(memory_dir=":memory:")

    def test_chunk_agrupa_paragrafos_curtos(self):
        """Testa se varios paragrafos curtos sao combinados no mesmo chunk se houver espaco."""
        text = "Paragrafo 1.\n\nParagrafo 2.\n\nParagrafo 3."
        # Limite alto (100) engloba os 3 paragrafos (~40 caracteres)
        chunks = self.rag._chunk_text(text, chunk_size=100)
        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0], "Paragrafo 1.\n\nParagrafo 2.\n\nParagrafo 3.")

    def test_chunk_respeita_limite_com_multiplos_paragrafos(self):
        """Testa se a funcao quebra suavemente quando o chunk_size e atingido."""
        text = "P1 limit.\n\nP2 limit.\n\nP3 limit."
        # Limite baixo forca a quebra a cada paragrafo
        chunks = self.rag._chunk_text(text, chunk_size=15)
        self.assertEqual(len(chunks), 3)
        self.assertEqual(chunks[0], "P1 limit.")
        self.assertEqual(chunks[2], "P3 limit.")

    def test_chunk_hard_split_em_paragrafo_gigante(self):
        """Testa a defesa critica: fatiamento rigido de blocos sem quebras de linha."""
        text = "A" * 100 # Um unico bloco massivo de 100 caracteres
        chunks = self.rag._chunk_text(text, chunk_size=30)
        self.assertEqual(len(chunks), 4)
        self.assertEqual(len(chunks[0]), 30, "O fatiamento rigido falhou no primeiro bloco")
        self.assertEqual(len(chunks[-1]), 10, "O resto do texto falhou no ultimo bloco")

    def test_chunk_ignora_entradas_vazias(self):
        """Garante que strings sujas ou vazias nao poluam a base vetorial."""
        self.assertEqual(self.rag._chunk_text("   \n\n  \n\n", chunk_size=100), [])

if __name__ == '__main__':
    unittest.main()