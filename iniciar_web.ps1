# PowerShell script to open GÓMEZ & HIJOS Web Application

$htmlPath = Join-Path -Path $PSScriptRoot -ChildPath "index.html"
Write-Host 'Abriendo sitio web de GOMEZ & HIJOS...' -ForegroundColor Green
Start-Process $htmlPath
