<#
.SYNOPSIS
    Motor Sensorial de Alertas (Smart MDA Notification).
.DESCRIPTION
    Emite alertas de interface Windows (Toast) categorizados com som e iconografia
    apropriada com base no nivel critico da avaliacao (SOTA).
#>
param (
    [ValidateSet('Perfect', 'Low', 'Moderate', 'High', 'Critical')]
    [string]$Level = 'Moderate',
    
    [string]$Title = 'Nexus Orquestrador',
    [string]$Message = 'Ocorreu um evento sistemico.'
)

$Icon = switch ($Level) {
    'Perfect' { "✨ [PERFEITO]" }
    'Low' { "🟢 [INFO]" }
    'Moderate' { "🟡 [ALERTA MODERADO]" }
    'High' { "🟠 [ATENCAO ALTA]" }
    'Critical' { "🚨 [CRITICO]" }
}

$AudioNode = switch ($Level) {
    'Critical' { "<audio src='ms-winsoundevent:Notification.Looping.Alarm' loop='true'/>" }
    'High' { "<audio src='ms-winsoundevent:Notification.IM'/>" }
    'Perfect' { "<audio src='ms-winsoundevent:Notification.Mail'/>" }
    default { "<audio src='ms-winsoundevent:Notification.Default'/>" }
}

$SafeTitle = [System.Security.SecurityElement]::Escape("$Icon $Title")
$SafeMessage = [System.Security.SecurityElement]::Escape($Message)

$ps_code = "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null; " +
"[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null; " +
"`$xml = New-Object Windows.Data.Xml.Dom.XmlDocument; " +
"`$xml.LoadXml('<toast><visual><binding template=\"ToastText02\"><text id=\"1\">$SafeTitle</text><text id=\"2\">$SafeMessage</text></binding></visual>$AudioNode</toast>'); " +
"`$toast = [Windows.UI.Notifications.ToastNotification]::new(`$xml); " +
"[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('OmniMaster').Show(`$toast)"

Invoke-Expression $ps_code