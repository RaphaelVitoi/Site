import unittest
from unittest.mock import patch, mock_open, MagicMock
from pathlib import Path
import os
import sys

# Adiciona o diretório raiz do projeto ao sys.path para permitir a importação do task_executor.
# Isso é necessário para que o Python encontre o módulo que estamos testando.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Agora podemos importar a função que queremos testar.
from task_executor import apply_god_mode

class TestApplyGodMode(unittest.TestCase):
    """
    Suíte de testes para a função apply_god_mode, o núcleo do "God Mode".

    Estes testes utilizam 'mocks' para isolar a função de sistemas externos,
    como o sistema de arquivos e a execução de processos. Isso garante que os
    testes sejam rápidos, repetíveis e não tenham efeitos colaterais indesejados
    no ambiente de desenvolvimento.
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
        # Configuração dos mocks
        mock_get_autonomy.return_value = 'full'
        mock_path.return_value.parent.mkdir.return_value = None # mkdir não retorna nada
        mock_run.return_value = MagicMock(returncode=0)

        text = """
        Vamos criar um arquivo de configuração e depois listar o diretório.
        
        Arquivo: /tmp/config.conf
        ```ini
        [settings]
        enabled = true
        ```

        Agora, execute o seguinte comando:
        Comando: `ls -l /tmp`
        """

        apply_god_mode(text)

        # Verificação da criação do arquivo
        mock_path.assert_called_with('/tmp/config.conf')
        mock_path.return_value.parent.mkdir.assert_called_once_with(parents=True, exist_ok=True)
        mock_file.assert_called_once_with(mock_path.return_value, 'w', encoding='utf-8')
        mock_file().write.assert_called_once_with('[settings]\nenabled = true\n')
        mock_logging.info.assert_any_call("[MATERIALIZACAO] Arquivo forjado com sucesso: /tmp/config.conf")

        # Verificação da execução do comando
        mock_run.assert_called_once_with("ls -l /tmp", shell=True, capture_output=True, text=True, timeout=300)
        mock_logging.info.assert_any_call("[EXECUCAO] Orquestrador rodando comando nativo: ls -l /tmp")

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
        mock_logging.error.assert_called_with("[SEC] Comando destrutivo bloqueado por regras de seguranca: rm -rf /")

    @patch('task_executor.logging')
    @patch('task_executor.subprocess.run')
    @patch('task_executor.get_autonomy_mode', return_value='partial')
    def test_ignora_comando_de_estado_em_modo_parcial(self, mock_get_autonomy, mock_run, mock_logging):
        """Testa se comandos que alteram o estado (ex: npm install) são ignorados no modo 'partial'."""
        text = "Por favor, instale esta dependência. Comando: `npm install react`"

        apply_god_mode(text)

        mock_run.assert_not_called()
        mock_logging.info.assert_called_with("[AUTONOMIA PARCIAL] Comando de alteracao de estado interceptado: 'npm install react'")
        mock_logging.warning.assert_called_with("[GOD MODE] Seguranca ativa. Execute 'npm install react' manualmente no terminal.")

    @patch('task_executor.subprocess.run')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_trata_falha_de_comando(self, mock_get_autonomy, mock_run):
        """Testa se a falha na execução de um comando (código de saída != 0) levanta um RuntimeError."""
        mock_run.return_value = MagicMock(returncode=127, stderr='comando nao encontrado')
        text = "Comando: `comando-inexistente`"

        with self.assertRaises(RuntimeError) as context:
            apply_god_mode(text)

        self.assertIn("O comando nativo falhou: comando-inexistente", str(context.exception))
        self.assertIn("comando nao encontrado", str(context.exception))

    @patch('builtins.open', new_callable=mock_open)
    @patch('pathlib.Path')
    @patch('task_executor.get_autonomy_mode', return_value='full')
    def test_idempotencia_na_criacao_de_diretorio(self, mock_get_autonomy, mock_path, mock_open):
        """
        Testa se a chamada para criar diretórios é idempotente, usando `exist_ok=True`,
        o que evita erros se o diretório já existir.
        """
        mock_parent = MagicMock()
        mock_path.return_value.parent = mock_parent
        
        text = "Arquivo: `a/b/c.txt`\n```\nconteudo\n```"
        
        apply_god_mode(text)
        
        # A função deve chamar mkdir com `parents=True` e `exist_ok=True`.
        mock_parent.mkdir.assert_called_once_with(parents=True, exist_ok=True)


if __name__ == '__main__':
    unittest.main()