import unittest
from unittest.mock import patch, mock_open, MagicMock, call, ANY
from pathlib import Path
import os
import sys

# Garante que o diretorio raiz esteja no path para importar o task_executor
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from task_executor import apply_god_mode, QueueManager

class TestApplyGodMode(unittest.TestCase):
    @patch('task_executor.logging')
    @patch('task_executor.subprocess.run')
    @patch('builtins.open', new_callable=mock_open)
    @patch('task_executor.Path')  # Mocka a classe Path
    @patch('task_executor.get_autonomy_mode')
    def test_cria_arquivo_e_executa_comando_com_sucesso(self, mock_get_autonomy, mock_path_class, mock_file,
                                                         mock_run, mock_logging):
        """
        Testa o cenário de ponta a ponta: criação de um arquivo e execução
        de um comando na mesma chamada em modo de autonomia 'full'.
        """
        mock_get_autonomy.return_value = 'full'
        mock_run.return_value = MagicMock(returncode=0)
        
        # Mock para Path(__file__).parent.resolve()
        mock_base_path_resolved = MagicMock(spec=Path)
        mock_base_path_resolved.__str__.return_value = "/mock/project/root"
        
        # Mock para Path(filepath).resolve()
        mock_target_path_resolved = MagicMock(spec=Path)
        mock_target_path_resolved.__str__.return_value = "/mock/project/root/config.conf"
        mock_target_path_resolved.parent.mkdir.return_value = None # Mock mkdir no pai do target_path
        
        # Configura o mock da classe Path para retornar diferentes mocks para cada chamada
        # Path(__file__) é a primeira chamada, Path(filepath) é a segunda
        mock_path_class.side_effect = [
            MagicMock(parent=MagicMock(resolve=MagicMock(return_value=mock_base_path_resolved))), # Para Path(__file__)
            MagicMock(resolve=MagicMock(return_value=mock_target_path_resolved)) # Para Path(filepath)
        ]
        
        text = (
            "Arquivo: config.conf\n" # Caminho relativo para passar no startswith
            "```ini\n[settings]\nenabled = true\n```\n\n"
            "Comando: `ls -l`"
        )
        
        apply_god_mode(text)
        
        # Verificacoes (ajustadas para o novo mocking)
        # Verifica as chamadas para Path()
        mock_path_class.assert_has_calls([
            call(ANY), # Para Path(__file__)
            call("config.conf") # Para Path(filepath)
        ])
        
        # Verifica se mkdir foi chamado no parent do target_path
        mock_target_path_resolved.parent.mkdir.assert_called_once_with(parents=True, exist_ok=True)
        
        # Verifica se open foi chamado com o target_path mockado
        mock_file.assert_called_once_with(mock_target_path_resolved, 'w', encoding='utf-8')
        mock_file().write.assert_called_once_with('[settings]\nenabled = true\n')
        mock_run.assert_called_once()
        mock_logging.info.assert_any_call("[MATERIALIZACAO] Arquivo forjado com sucesso: config.conf") # Log usa o filepath original

    @patch('task_executor.logging')
    @patch('task_executor.subprocess.run')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_bloqueia_comando_proibido(self, mock_get_autonomy, mock_run, mock_logging):
        text = "Comando: `rm -rf /`"
        with self.assertRaises(PermissionError):
            apply_god_mode(text)
        mock_run.assert_not_called()

    @patch('task_executor.logging')
    @patch('task_executor.subprocess.run')
    @patch('task_executor.get_autonomy_mode', return_value='partial')
    def test_ignora_comando_de_estado_em_modo_parcial(self, mock_get_autonomy, mock_run, mock_logging):
        text = "Comando: `npm install react`"
        apply_god_mode(text)
        mock_run.assert_not_called()
        mock_logging.info.assert_called_with("[AUTONOMIA PARCIAL] Comando de alteracao de estado interceptado: 'npm install react'")

    @patch('task_executor.subprocess.run')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_trata_falha_de_comando(self, mock_get_autonomy, mock_run):
        mock_run.return_value = MagicMock(returncode=127, stderr='comando nao encontrado')
        text = "Comando: `comando-inexistente`"
        with self.assertRaises(RuntimeError):
            apply_god_mode(text)

    @patch('builtins.open', new_callable=mock_open)
    @patch('task_executor.Path')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_idempotencia_na_criacao_de_diretorio(self, mock_get_autonomy, mock_path, mock_open):
        mock_parent = MagicMock()
        mock_path.return_value.parent = mock_parent
        text = "Arquivo: `a/b/c.txt`\n```\nconteudo\n```"
        apply_god_mode(text)
        mock_parent.mkdir.assert_called_once_with(parents=True, exist_ok=True)

    @patch('task_executor.logging')
    @patch('task_executor.subprocess.run')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_integridade_do_caminho_god_mode(self, mock_get_autonomy, mock_run, mock_logging):
        # Testa a prevenção de Path Traversal
        text = "Arquivo: ../../etc/passwd\n```\nfail\n```"
        apply_god_mode(text)
        mock_logging.error.assert_called()

if __name__ == '__main__':
    unittest.main()