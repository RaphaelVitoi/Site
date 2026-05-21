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
    @patch('task_executor.Path')
    @patch('task_executor.get_autonomy_mode')
    def test_cria_arquivo_e_executa_comando_com_sucesso(self, mock_get_autonomy, mock_path_class, mock_file_open,
                                                         mock_run, mock_logging):
        """
        Testa o cenário de ponta a ponta: criação de um arquivo e execução
        de um comando na mesma chamada em modo de autonomia 'full'.
        """
        mock_get_autonomy.return_value = 'full'
        mock_run.return_value = MagicMock(returncode=0)

        # SOTA Mocking: Criamos um mock de Path que se comporta como um caminho real
        # e sempre passa na verificação de segurança (startswith)
        mock_p = MagicMock(spec=Path)
        mock_p.resolve.return_value = mock_p
        mock_p.parent = mock_p
        # Fazemos str(path) retornar um caminho fixo para o startswith bater
        mock_p.__str__.return_value = "/root/site/config.conf"
        mock_path_class.return_value = mock_p

        text = (
            "Arquivo: config.conf\n\n" # Garantimos \n\n para o regex \n+
            "```ini\n[settings]\nenabled = true\n```\n\n"
            "Comando: `ls -l`"
        )

        apply_god_mode(text)

        # Verificamos se Path foi chamado (uma para __file__ e uma para o filepath)
        self.assertGreaterEqual(mock_path_class.call_count, 2)

        # Verificamos se tentou criar o diretório pai
        mock_p.parent.mkdir.assert_called()

        # Verificamos se abriu o arquivo para escrita
        mock_file_open.assert_called_once_with(mock_p, 'w', encoding='utf-8')
        mock_file_open().write.assert_called_once_with('[settings]\nenabled = true\n')

        # Verificamos o comando
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
    def test_idempotencia_na_criacao_de_diretorio(self, mock_get_autonomy, mock_path_class, mock_open):
        # Setup de mock similar para garantir que passe no startswith
        mock_p = MagicMock(spec=Path)
        mock_p.resolve.return_value = mock_p
        mock_p.parent = mock_p
        mock_p.__str__.return_value = "/root/site/a/b/c.txt"
        mock_path_class.return_value = mock_p

        text = "Arquivo: `a/b/c.txt`\n\n```\nconteudo\n```"
        apply_god_mode(text)

        # A função deve chamar mkdir com `parents=True` e `exist_ok=True`.
        mock_p.parent.mkdir.assert_called_once_with(parents=True, exist_ok=True)

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