import unittest
from unittest.mock import patch, mock_open, MagicMock, call, ANY
from pathlib import Path
import os
import sys

# Garante que o diretorio raiz esteja no path para importar o task_executor
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from task_executor import apply_god_mode

class TestApplyGodMode(unittest.TestCase):
    """
    Suite de testes para o God Mode 2.0.
    Utiliza uma estrategia de Mocking SOTA para garantir que as verificacoes
    de seguranca (Path Traversal) permitam a execucao em ambiente controlado.
    """

    @patch('task_executor.logging')
    @patch('task_executor.subprocess.run')
    @patch('builtins.open', new_callable=mock_open)
    @patch('task_executor.Path')
    @patch('task_executor.get_autonomy_mode')
    def test_cria_arquivo_e_executa_comando_com_sucesso(self, mock_get_autonomy, mock_path_class, mock_file_open,
                                                         mock_run, mock_logging):
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
            "Arquivo: config.conf\n\n" # \n\n exigido pelo regex \n+
            "```ini\n[settings]\nenabled = true\n```\n\n"
            "Comando: `ls -l`"
        )

        apply_god_mode(text)

        # Verificamos se a classe Path foi instanciada (base e target)
        self.assertGreaterEqual(mock_path_class.call_count, 2)
        # Verificamos se o diretorio pai foi criado
        mock_p.parent.mkdir.assert_called()
        # Verificamos a escrita do arquivo
        mock_file_open.assert_called_with(mock_p, 'w', encoding='utf-8')
        mock_file_open().write.assert_called_once_with('[settings]\nenabled = true\n')
        # Verificamos o comando de terminal
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
        mock_p = MagicMock(spec=Path)
        mock_p.resolve.return_value = mock_p
        mock_p.parent = mock_p
        mock_p.__str__.return_value = "/root/site/a/b/c.txt"
        mock_path_class.return_value = mock_p

        text = "Arquivo: `a/b/c.txt`\n\n```\nconteudo\n```"
        apply_god_mode(text)

        # O mkdir deve ser chamado com os parametros de seguranca
        mock_p.parent.mkdir.assert_called_with(parents=True, exist_ok=True)

    @patch('task_executor.logging')
    @patch('task_executor.Path')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_integridade_do_caminho_god_mode(self, mock_get_autonomy, mock_path_class, mock_logging):
        """Testa a prevencao de Path Traversal"""
        # Configuramos o mock para retornar strings diferentes para base e target
        def side_effect(path):
            m = MagicMock(spec=Path)
            m.resolve.return_value = m
            m.parent = m
            if "etc" in str(path) or ".." in str(path):
                m.__str__.return_value = "/etc/passwd"
            else:
                m.__str__.return_value = "/root/site"
            return m
        
        mock_path_class.side_effect = side_effect
        text = "Arquivo: ../../etc/passwd\n\n```\nfail\n```"
        apply_god_mode(text)
        mock_logging.error.assert_called_with("[SEC] Bloqueio de escrita fora da raiz: ../../etc/passwd")

if __name__ == '__main__':
    unittest.main()
