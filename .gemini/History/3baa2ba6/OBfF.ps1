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
    npx http-server -p 5500
}
else {
    Write-Host "[WARN] Python or Node.js not found. Please start a web server manually on port 5500." -ForegroundColor Yellow
    Write-Host "Suggested: Use VS Code Live Server extension." -ForegroundColor Gray
}