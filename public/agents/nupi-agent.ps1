
# NUPI Local Agent - Windows
$CLOUD_URL = "https://nupidesktopai.com/api/real-system-data"
$DEVICE_ID = [System.Guid]::NewGuid().ToString()

Write-Host "🚀 NUPI Local Agent Started - Device ID: $DEVICE_ID"
Write-Host "📡 Pushing real system data to cloud..."

function Get-SystemData {
    $cpu = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
    $memory = Get-WmiObject Win32_OperatingSystem
    $disk = Get-PSDrive C
    $processes = (Get-Process).Count
    
    return @{
        device_id = $DEVICE_ID
        timestamp = [int][double]::Parse((Get-Date -UFormat %s))
        cpu = [math]::Round($cpu, 1)
        memory_used = [math]::Round(($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / 1MB, 2)
        memory_total = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
        memory_percent = [math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 1)
        disk_used = [math]::Round($disk.Used / 1GB, 1)
        disk_total = [math]::Round(($disk.Used + $disk.Free) / 1GB, 1)
        disk_percent = [math]::Round(($disk.Used / ($disk.Used + $disk.Free)) * 100, 1)
        processes = $processes
        system = "Windows"
        platform = "$($PSVersionTable.PSVersion.Major).$($PSVersionTable.PSVersion.Minor)"
    }
}

while ($true) {
    try {
        $data = Get-SystemData | ConvertTo-Json
        Invoke-RestMethod -Uri $CLOUD_URL -Method POST -Body $data -ContentType "application/json" | Out-Null
        Write-Host "✅ Data pushed: CPU $($cpu)%"
    } catch {
        Write-Host "⚠️ Push failed: $_"
    }
    Start-Sleep -Seconds 5
}
