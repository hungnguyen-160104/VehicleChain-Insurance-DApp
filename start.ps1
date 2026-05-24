# ================================================================
# VehicleChain Insurance DApp - PowerShell Startup Script
# ================================================================
# Su dung: .\start.ps1
# Hoac chi chay mot dich vu: .\start.ps1 -Service hardhat
# ================================================================

param(
    [string]$Service = "all"  # all | hardhat | ai | frontend
)

$Root = $PSScriptRoot

function Write-Header {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  VehicleChain Insurance DApp - KHOI DONG HE THONG" -ForegroundColor White
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Check-Prerequisites {
    Write-Host "[CHECK] Kiem tra moi truong..." -ForegroundColor Yellow

    # Check Node.js
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) {
        Write-Host "  [FAIL] Node.js chua duoc cai dat! Tai tai: https://nodejs.org" -ForegroundColor Red
        return $false
    }
    $nodeVersion = (node --version)
    Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green

    # Check Python
    $python = Get-Command py -ErrorAction SilentlyContinue
    if (-not $python) {
        Write-Host "  [FAIL] Python chua duoc cai dat! Tai tai: https://python.org" -ForegroundColor Red
        return $false
    }
    $pyVersion = (py --version)
    Write-Host "  [OK] $pyVersion" -ForegroundColor Green

    # Check .env.local
    if (-not (Test-Path "$Root\vehicle-insurance-dapp\.env.local")) {
        Write-Host "  [WARN] vehicle-insurance-dapp\.env.local chua ton tai!" -ForegroundColor Yellow
        Write-Host "         Copy tu .env.example va dien cac gia tri truoc khi chay." -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] .env.local ton tai" -ForegroundColor Green
    }

    # Check ai-service/.env
    if (-not (Test-Path "$Root\ai-service\.env")) {
        Write-Host "  [WARN] ai-service\.env chua ton tai!" -ForegroundColor Yellow
        Write-Host "         Copy tu ai-service\.env.example va dien GEMINI_API_KEY." -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] ai-service\.env ton tai" -ForegroundColor Green
    }

    Write-Host ""
    return $true
}

function Start-Hardhat {
    Write-Host "[1/3] Khoi dong Hardhat Blockchain (port 8545)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$Root\vehicle-insurance-dapp\web3'; Write-Host '[HARDHAT] Dang khoi dong...' -ForegroundColor Cyan; npx hardhat node"
    ) -WindowStyle Normal
    Write-Host "  [OK] Hardhat node dang khoi dong..." -ForegroundColor Green
    Start-Sleep -Seconds 3
}

function Start-AIService {
    Write-Host "[2/3] Khoi dong AI Service FastAPI (port 8000)..." -ForegroundColor Magenta
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$Root\ai-service'; Write-Host '[AI] Dang khoi dong FastAPI...' -ForegroundColor Magenta; py main.py"
    ) -WindowStyle Normal
    Write-Host "  [OK] AI Service dang khoi dong..." -ForegroundColor Green
    Start-Sleep -Seconds 2
}

function Start-Frontend {
    Write-Host "[3/3] Khoi dong Frontend Next.js (port 3000)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$Root\vehicle-insurance-dapp'; Write-Host '[FRONTEND] Dang khoi dong Next.js...' -ForegroundColor Yellow; npm run dev"
    ) -WindowStyle Normal
    Write-Host "  [OK] Frontend dang khoi dong..." -ForegroundColor Green
}

function Show-Summary {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  Tat ca dich vu dang chay!" -ForegroundColor White
    Write-Host ""
    Write-Host "  Blockchain : http://localhost:8545" -ForegroundColor Gray
    Write-Host "  AI Service : http://localhost:8000" -ForegroundColor Gray
    Write-Host "  API Docs   : http://localhost:8000/docs" -ForegroundColor Gray
    Write-Host "  Frontend   : http://localhost:3000" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  De deploy smart contract (lan dau):" -ForegroundColor Yellow
    Write-Host "    cd vehicle-insurance-dapp\web3" -ForegroundColor White
    Write-Host "    npx hardhat run scripts/deploy.js --network localhost" -ForegroundColor White
    Write-Host "    npx hardhat run scripts/setup.js --network localhost" -ForegroundColor White
    Write-Host ""
}

# === MAIN ===
Write-Header

$ok = Check-Prerequisites
if (-not $ok) {
    Write-Host "Vui long cai dat cac phu thuoc con thieu va thu lai." -ForegroundColor Red
    Read-Host "Nhan Enter de thoat"
    exit 1
}

switch ($Service.ToLower()) {
    "hardhat"  { Start-Hardhat }
    "ai"       { Start-AIService }
    "frontend" { Start-Frontend }
    default {
        Start-Hardhat
        Start-AIService
        Start-Frontend
    }
}

Show-Summary
