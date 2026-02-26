param(
  [int]$Port = 3000,
  [string]$FrontendBaseUrl = "",
  [string]$LogDir = "",
  [string[]]$ExtraArgs = @(),
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
  throw "go was not found in PATH. Install Go and reopen your terminal."
}

Push-Location $repoRoot
try {
  $distDir = Join-Path $repoRoot "web\\dist"
  if (-not (Test-Path $distDir)) {
    $null = New-Item -ItemType Directory -Force -Path $distDir
  }
  $indexHtml = Join-Path $distDir "index.html"
  if (-not (Test-Path $indexHtml)) {
    Set-Content -Path $indexHtml -Value "<!doctype html><html><head><meta charset=""utf-8""><title>new-api</title></head><body><div id=""root""></div></body></html>" -Encoding Ascii
  }
  $placeholderFile = Join-Path $distDir "placeholder.txt"
  if (-not (Test-Path $placeholderFile)) {
    Set-Content -Path $placeholderFile -Value "placeholder" -Encoding Ascii
  }

  $env:PORT = "$Port"

  if ($FrontendBaseUrl -ne "") {
    $env:FRONTEND_BASE_URL = $FrontendBaseUrl
  }

  if ($LogDir -ne "") {
    $resolvedLogDir = Resolve-Path $LogDir -ErrorAction SilentlyContinue
    if (-not $resolvedLogDir) {
      $null = New-Item -ItemType Directory -Force -Path $LogDir
      $resolvedLogDir = Resolve-Path $LogDir
    }
    $ExtraArgs = @("-log-dir", "$resolvedLogDir") + $ExtraArgs
  }

  $cmd = @("go", "run", ".\main.go") + $ExtraArgs

  if ($DryRun) {
    Write-Host ($cmd -join " ")
    exit 0
  }

  & $cmd[0] $cmd[1..($cmd.Length - 1)]
} finally {
  Pop-Location
}
