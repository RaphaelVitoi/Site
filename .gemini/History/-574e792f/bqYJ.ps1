
Now let's add a basic health check script to monitor the resource usage:
(Note: This script provides a basic resource check and you can expand it by adding more metrics and alerting logic)

```diff
--- /dev/null
+++ b/scripts/maintenance/health_check.ps1
@@ -0,0 +1,37 @@
 <#
 .SYNOPSIS
-    Basic health check script for system resources.
+    Checks CPU, Memory, and Disk usage and logs the information.
 #>
 
 # Set thresholds
 $CPUThreshold = 80
 $MemoryThreshold = 80
 $DiskThreshold = 90
 
 # Get CPU Usage
 $CPUUsage = (Get-Counter -Counter "\Processor(_Total)\% Processor Time" -SampleInterval 1 -MaxSamples 1).CounterSamples.CookedValue
 
 # Get Memory Usage
 $Memory = Get-WmiObject Win32_OperatingSystem
 $FreeMemory = $Memory.FreePhysicalMemory / 1MB
 $TotalMemory = $Memory.TotalVisibleMemorySize / 1MB
 $MemoryUsage = (($TotalMemory - $FreeMemory) / $TotalMemory) * 100
 
 # Get Disk Usage
 $Disk = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'"
 $FreeSpace = $Disk.FreeSpace / 1GB
 $TotalSpace = $Disk.Size / 1GB
 $DiskUsage = (($TotalSpace - $FreeSpace) / $TotalSpace) * 100
 
 # Output and log the results
 Write-Host "CPU Usage: $($CPUUsage)%"
 Write-Host "Memory Usage: $($MemoryUsage)%"
 Write-Host "Disk Usage (C:): $($DiskUsage)%"
 
 $LogPath = Join-Path $PSScriptRoot "health_check.log"
 
 Add-Content -Path $LogPath -Value "$(Get-Date) - CPU: $($CPUUsage)%, Memory: $($MemoryUsage)%, Disk: $($DiskUsage)%"
 
 # Basic Alerting (example)
 if ($CPUUsage -gt $CPUThreshold -or $MemoryUsage -gt $MemoryThreshold -or $DiskUsage -gt $DiskThreshold) {
  Write-Warning "Threshold exceeded!"
 }

