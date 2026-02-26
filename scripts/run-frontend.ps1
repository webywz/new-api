param(
  [int]$Port = 5173,
  [switch]$Install,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$webDir = Join-Path $repoRoot "web"

if (-not (Test-Path $webDir)) {
  throw "web directory not found: $webDir"
}

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  throw "bun was not found in PATH. Install Bun and reopen your terminal."
}

Push-Location $webDir
try {
  $nodeModules = Join-Path $webDir "node_modules"
  if ($Install -or -not (Test-Path $nodeModules)) {
    if ($DryRun) {
      Write-Host "bun install"
    } else {
      bun install
    }
  }

  $env:PORT = "$Port"

  if ($DryRun) {
    Write-Host "bun run dev"
    exit 0
  }

  bun run dev
} finally {
  Pop-Location
}
