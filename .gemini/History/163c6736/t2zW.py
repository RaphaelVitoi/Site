import logging
import shutil
import subprocess  # noqa: S404


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
        ps_path = shutil.which("powershell") or "powershell"
        subprocess.Popen(  # noqa: S603
            [
                ps_path,
                "-NoProfile",
                "-WindowStyle",
                "Hidden",
                "-Command",
                ps_code,
            ]
        )
    except Exception as e:
        logging.error(f"Falha ao disparar Toast: {e}")
