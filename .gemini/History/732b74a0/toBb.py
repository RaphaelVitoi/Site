import unittest
from unittest.mock import patch, mock_open, MagicMock
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
    @patch('task_executor.Path')
    @patch('task_executor.get_autonomy_mode')
    def test_cria_arquivo_e_executa_comando_com_sucesso(self, mock_get_autonomy, mock_path, mock_file, mock_run, mock_logging):
        mock_get_autonomy.return_value = 'full'
        mock_path.return_value.parent.mkdir.return_value = None
        mock_run.return_value = MagicMock(returncode=0)

        text = (
            "Arquivo: config.conf\n"
            "```ini\n[settings]\nenabled = true\n```\n\n"
            "Comando: `ls -l`"
        )

        apply_god_mode(text)

        mock_path.assert_called()
        mock_file.assert_called()
        mock_run.assert_called_once()
        mock_logging.info.assert_any_call("[MATERIALIZACAO] Arquivo forjado com sucesso: config.conf")

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