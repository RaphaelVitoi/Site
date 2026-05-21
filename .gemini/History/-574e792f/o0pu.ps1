.SYNOPSIS
Checks CPU, Memory, and Disk usage and logs the information.
#>
try {

    $TaskName = "SystemHealthCheck"

    # Set thresholds
    $CPUThreshold = 80
    $MemoryThreshold = 80
    $DiskThreshold = 90

    # Get CPU Usage
    $CPUUsage = (Get-Counter -Counter "\Processor(_Total)\% Processor Time" -SampleInterval 1 -MaxSamples 1).CounterSamples.CookedValue

    # Get Memory Usage
    $Memory = Get-CimInstance Win32_OperatingSystem
    $TotalMemoryGB = [Math]::Round($Memory.TotalVisibleMemorySize / 1MB)
    $FreeMemoryGB = [Math]::Round($Memory.FreePhysicalMemory / 1MB)

    $MemoryUsage = [Math]::Round((($TotalMemoryGB - $FreeMemoryGB) / $TotalMemoryGB) * 100)

    # Get Disk Usage
    $Disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
    $FreeSpace = $Disk.FreeSpace / 1GB
    $TotalSpace = $Disk.Size / 1GB
    $DiskUsage = (($TotalSpace - $FreeSpace) / $TotalSpace) * 100

    # Log the results
    $LogPath = Join-Path $PSScriptRoot "health_check.log"
    $LogMessage = "$(Get-Date) - CPU: $($CPUUsage)%, Memory: $($MemoryUsage)%, Disk: $($DiskUsage)%"

    try {
        Add-Content -Path $LogPath -Value $LogMessage
        Write-Host $LogMessage
    }
    catch {
        Write-Warning "Failed to write to log: $($_.Exception.Message)"
    }
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
}
finally {
    $TaskName = "SystemHealthCheck"

    # Register the scheduled task
    try {
        # Check if the scheduled task already exists
        if (!(Get-ScheduledTask -TaskName $TaskName)) {
            $Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File `"$($PSCommandPath)`""
            $Trigger = New-ScheduledTaskTrigger -Daily -At "08:00"

            Register-ScheduledTask `
                -TaskName $TaskName `
                -Action $Action `
                -Trigger $Trigger `
                -Description "Checks system health daily at 8:00 AM"

            Write-Host "Scheduled task '$TaskName' registered successfully."
        }
        else {
            Write-Host "Scheduled task '$TaskName' already exists."
        }
    }
    catch {
        Write-Error "Failed to register scheduled task: $($_.Exception.Message)"
    }
}
