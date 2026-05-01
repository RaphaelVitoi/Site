# Serve Project on Port 5500
# Tries Python 3, Python 2, Node (npx), or generic message.

Write-Host "=== SERVING PROJECT ON PORT 5500 ===" -ForegroundColor Cyan

if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "[INFO] Starting Python HTTP Server..." -ForegroundColor Gray
    python -m http.server 5500
}
elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    Write-Host "[INFO] Starting Python3 HTTP Server..." -ForegroundColor Gray
    python3 -m http.server 5500
}
elseif (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "[INFO] Starting Node http-server..." -ForegroundColor Gray
    npx http-server -p 5500 -c-1
}
else {
    Write-Host "[WARN] Python/Node not found. Starting PowerShell Native Server..." -ForegroundColor Yellow
    
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:5500/")
        $listener.Start()
        
        Write-Host " Server running at http://localhost:5500/" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
        
        # Abre o navegador automaticamente
        Start-Process "http://localhost:5500"
        
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $req = $context.Request
            $res = $context.Response
            
            $path = if ($req.Url.LocalPath -eq "/") { "index.html" } else { $req.Url.LocalPath.TrimStart('/') }
            $filePath = Join-Path $PSScriptRoot $path
            
            # BLINDAGEM DE SEGURANCA: Path Traversal Check
            # Resolve o caminho absoluto e verifica se ainda esta dentro da raiz
            $fullPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($filePath)
            $rootPath = $PSScriptRoot + [System.IO.Path]::DirectorySeparatorChar
            
            if (-not ($fullPath.StartsWith($rootPath) -or $fullPath -eq $PSScriptRoot)) {
                $res.StatusCode = 403 # Forbidden
            }
            elseif (Test-Path $fullPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                $res.ContentLength64 = $bytes.Length
                
                # MIME Types basicos
                if ($fullPath -match '\.html$') { $res.ContentType = "text/html; charset=utf-8" }
                elseif ($fullPath -match '\.js$') { $res.ContentType = "application/javascript" }
                elseif ($fullPath -match '\.css$') { $res.ContentType = "text/css" }
                elseif ($fullPath -match '\.svg$') { $res.ContentType = "image/svg+xml" }
                elseif ($fullPath -match '\.mp4$') { $res.ContentType = "video/mp4" }
                elseif ($fullPath -match '\.ico$') { $res.ContentType = "image/x-icon" }
                
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
                $res.StatusCode = 200
            }
            else { $res.StatusCode = 404 }
            $res.Close()
        }
    }
    catch { Write-Error "Failed to start: $_" }
}
