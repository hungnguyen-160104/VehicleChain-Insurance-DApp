@echo off
title VehicleChain Insurance DApp - Launcher
color 0A

echo.
echo  ================================================================
echo   VehicleChain Insurance DApp - KHOI DONG HE THONG
echo  ================================================================
echo.
echo  Se mo 3 cua so terminal:
echo    [1] Hardhat Local Blockchain (port 8545)
echo    [2] AI Service - Python FastAPI (port 8000)
echo    [3] Frontend - Next.js (port 3000)
echo.
echo  Luu y: Dam bao da cau hinh .env.local va ai-service/.env truoc!
echo.

pause

REM === Terminal 1: Hardhat Node ===
echo [1/3] Khoi dong Hardhat Blockchain...
start "Hardhat Node (port 8545)" cmd /k "cd /d "%~dp0vehicle-insurance-dapp\web3" && echo [HARDHAT] Dang khoi dong Hardhat node... && npx hardhat node"

timeout /t 3 /nobreak >nul

REM === Terminal 2: AI Service ===
echo [2/3] Khoi dong AI Service...
start "AI Service FastAPI (port 8000)" cmd /k "cd /d "%~dp0ai-service" && echo [AI] Dang khoi dong FastAPI service... && py main.py"

timeout /t 3 /nobreak >nul

REM === Terminal 3: Frontend ===
echo [3/3] Khoi dong Frontend Next.js...
start "Frontend Next.js (port 3000)" cmd /k "cd /d "%~dp0vehicle-insurance-dapp" && echo [FRONTEND] Dang khoi dong Next.js... && npm run dev"

echo.
echo  ================================================================
echo   Tat ca dich vu dang khoi dong!
echo.
echo   Blockchain : http://localhost:8545
echo   AI Service : http://localhost:8000
echo   AI API Docs: http://localhost:8000/docs
echo   Frontend   : http://localhost:3000
echo  ================================================================
echo.
echo  Nho deploy contract truoc khi su dung:
echo    cd vehicle-insurance-dapp\web3
echo    npx hardhat run scripts/deploy.js --network localhost
echo.

pause
