import unittest
from unittest.mock import patch, mock_open, MagicMock
from pathlib import Path
import os
import sys

# Adiciona o diretório raiz do projeto ao sys.path para permitir a importação do task_executor.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from task_executor import apply_god_mode

class TestApplyGodMode(unittest.TestCase):
    """
    Suíte de testes para a função apply_god_mode, o núcleo do "God Mode".
    """

    @patch('task_executor.logging')
    @patch('task_executor.subprocess.run')
    @patch('builtins.open', new_callable=mock_open)
    @patch('pathlib.Path')
    @patch('task_executor.get_autonomy_mode')
    def test_cria_arquivo_e_executa_comando_com_sucesso(self, mock_get_autonomy, mock_path, mock_file, mock_run, mock_logging):
        """
        Testa o cenário de ponta a ponta: criação de um arquivo e execução
        de um comando na mesma chamada em modo de autonomia 'full'.
        """
        mock_get_autonomy.return_value = 'full'
        mock_path.return_value.parent.mkdir.return_value = None 
        mock_run.return_value = MagicMock(returncode=0)

        text = """
        Arquivo: /tmp/config.conf
        ```ini
        [settings]
        enabled = true
        ```

        Comando: `ls -l /tmp`
        """

        apply_god_mode(text)

        # Verificações
        mock_path.assert_called_with('/tmp/config.conf')
        mock_file.assert_called_once_with(mock_path.return_value, 'w', encoding='utf-8')
        mock_file().write.assert_called_once_with('[settings]\nenabled = true\n')
        mock_run.assert_called_once_with("ls -l /tmp", shell=True, capture_output=True, text=True, timeout=300)

    @patch('task_executor.logging')
    @patch('task_executor.subprocess.run')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_bloqueia_comando_proibido(self, mock_get_autonomy, mock_run, mock_logging):
        """Testa se um comando destrutivo (ex: rm -rf) é bloqueado e levanta PermissionError."""
        text = "Comando: `rm -rf /`"

        with self.assertRaises(PermissionError) as context:
            apply_god_mode(text)

        self.assertIn("Comando destrutivo bloqueado", str(context.exception))
        mock_run.assert_not_called()

    @patch('task_executor.logging')
    @patch('task_executor.subprocess.run')
    @patch('task_executor.get_autonomy_mode', return_value='partial')
    def test_ignora_comando_de_estado_em_modo_parcial(self, mock_get_autonomy, mock_run, mock_logging):
        """Testa se comandos que alteram o estado são ignorados no modo 'partial'."""
        text = "Comando: `npm install react`"

        apply_god_mode(text)

        mock_run.assert_not_called()
        mock_logging.info.assert_called_with("[AUTONOMIA PARCIAL] Comando de alteracao de estado interceptado: 'npm install react'")

    @patch('task_executor.subprocess.run')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_trata_falha_de_comando(self, mock_get_autonomy, mock_run):
        """Testa se a falha na execução de um comando levanta um RuntimeError."""
        mock_run.return_value = MagicMock(returncode=127, stderr='comando nao encontrado')
        text = "Comando: `comando-inexistente`"

        with self.assertRaises(RuntimeError) as context:
            apply_god_mode(text)

        self.assertIn("O comando nativo falhou: comando-inexistente", str(context.exception))

    @patch('builtins.open', new_callable=mock_open)
    @patch('pathlib.Path')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_idempotencia_na_criacao_de_diretorio(self, mock_get_autonomy, mock_path, mock_open):
        """
        Testa se a chamada para criar diretórios é idempotente.
        """
        mock_parent = MagicMock()
        mock_path.return_value.parent = mock_parent
        
        text = "Arquivo: `a/b/c.txt`\n```\nconteudo\n```"
        
        apply_god_mode(text)
        
        mock_parent.mkdir.assert_called_once_with(parents=True, exist_ok=True)

if __name__ == '__main__':
    unittest.main()