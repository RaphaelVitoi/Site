import logging
import os
import subprocess

logger = logging.getLogger(__name__)


def send_toast(title: str, message: str):
    try:
        ps_code = f"""
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml("<toast><visual><binding template='ToastText02'><text id='1'>{title}</text><text id='2'>{message}</text></binding></visual></toast>")
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Nexus Worker").Show($toast)
        """
        system32 = os.path.join(os.environ.get("SystemRoot", "C:\\Windows"), "System32")
        powershell_path = os.path.join(system32, "WindowsPowerShell", "v1.0", "powershell.exe")
        subprocess.Popen([  # noqa: S603
            powershell_path,
            "-NoProfile",
            "-WindowStyle",
            "Hidden",
            "-Command",
            ps_code,
        ])
    except Exception as e:  # noqa: BLE001
        logger.error(f"Falha ao disparar Toast: {e}")
