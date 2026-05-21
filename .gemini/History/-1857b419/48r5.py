import unittest
from unittest.mock import patch, mock_open
from pathlib import Path
import sys
import os

# Adiciona o diretorio raiz ao path para importar o task_executor
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from task_executor import get_agent_system_prompt

class TestPromptAssembly(unittest.TestCase):
    """
    Valida se a montagem do prompt do sistema para os agentes
    esta carregando todos os documentos de infraestrutura obrigatorios.
    """

    @patch('task_executor.Path.exists')
    def test_get_agent_system_prompt_structure(self, mock_exists):
        # Simula que todos os arquivos existem para testar a inclusao de todas as secoes
        mock_exists.return_value = True
        
        # Mock do open para retornar um conteudo identificavel por arquivo
        def side_effect(path, *args, **kwargs):
            path_str = str(path)
            return mock_open(read_data=f"Conteudo de: {path_str}").return_value

        with patch('builtins.open', side_effect=side_effect):
            agent_name = "@pesquisador"
            prompt = get_agent_system_prompt(agent_name)
            
            # Verificacoes de Secoes Globais e Infraestrutura
            self.assertIn("GLOBAL_INSTRUCTIONS.md", prompt)
            self.assertIn("=== COSMOVISAO FILOSOFICA ===", prompt)
            self.assertIn("=== IDENTIDADE DO USUARIO ===", prompt)
            self.assertIn("=== LIDERANCA E GOVERNANCA ===", prompt)
            self.assertIn("=== TEMPLO DO APRENDIZADO GENERATIVO ===", prompt)
            self.assertIn("=== PROTOCOLO DE ROTEAMENTO HOLOGRAFICO ===", prompt)
            self.assertIn("=== ARQUITETURA DO CEREBRO HIBRIDO ===", prompt)
            self.assertIn("=== MANIFESTO DE COERENCIA E HARMONIA ===", prompt)
            
            # Verificacao de Identidade do Agente
            self.assertIn("=== SUA IDENTIDADE ESPECIFICA (@pesquisador) ===", prompt)
            self.assertIn("pesquisador.md", prompt)
            self.assertIn("Conteudo de: .claude\\agents\\pesquisador.md", prompt)

if __name__ == '__main__':
    unittest.main()