@echo off
title VehicleChain Insurance DApp - Launcher
color 0A

echo.
echo  ================================================================
echo   VehicleChain Insurance DApp - KHOI DONG HE THONG
echo  ================================================================
echo.
echo  Quy trinh:
echo    [1] Khoi dong Hardhat Blockchain    (port 8545)
echo    [2] Deploy Smart Contract           (tu dong)
echo    [3] Khoi dong AI Service FastAPI    (port 8000)
echo    [4] Khoi dong Frontend Next.js      (port 3000)
echo    [5] Khoi dong Cloudflare Tunnel     ^<-- copy URL o cua so nay^>
echo.
echo  Luu y: Dam bao da cau hinh ai-service/.env truoc!
echo.

pause

REM === [1] Hardhat Node ===
echo.
echo  [1/5] Khoi dong Hardhat Blockchain...
start "Hardhat Node (port 8545)" cmd /k "cd /d "%~dp0vehicle-insurance-dapp\web3" && echo [HARDHAT] Dang khoi dong... && npx hardhat node"

echo  Cho Hardhat khoi dong (15 giay)...
timeout /t 15 /nobreak >nul

REM === [2] Deploy Contract ===
echo.
echo  [2/5] Deploy Smart Contract...
cd /d "%~dp0vehicle-insurance-dapp\web3"
call npx hardhat run scripts/deploy.js --network localhost
if %errorlevel% neq 0 (
    echo.
    echo  [LOI] Deploy contract that bai!
    echo  Kiem tra cua so Hardhat da chay chua, roi thu lai.
    pause
    exit /b 1
)
echo  [OK] Deploy contract thanh cong!
cd /d "%~dp0"

timeout /t 2 /nobreak >nul

REM === [3] AI Service ===
echo.
echo  [3/5] Khoi dong AI Service...
start "AI Service FastAPI (port 8000)" cmd /k "cd /d "%~dp0ai-service" && echo [AI] Dang khoi dong FastAPI... && py main.py"

timeout /t 3 /nobreak >nul

REM === [4] Frontend ===
echo.
echo  [4/5] Khoi dong Frontend Next.js...
start "Frontend Next.js (port 3000)" cmd /k "cd /d "%~dp0vehicle-insurance-dapp" && echo [FRONTEND] Dang khoi dong Next.js... && npm run dev"

timeout /t 8 /nobreak >nul

REM === [5] Cloudflare Tunnel ===
echo.
echo  [5/5] Khoi dong Cloudflare Tunnel...
start "Cloudflare Tunnel - COPY URL NAY" cmd /k "echo. && echo  ============================================ && echo   Doi 15-20 giay de lay URL chia se... && echo  ============================================ && echo. && cloudflared tunnel --url http://localhost:3000"

echo.
echo  ================================================================
echo   Tat ca dich vu da khoi dong!
echo.
echo   [LOCAL]
echo   Blockchain : http://localhost:8545
echo   AI Service : http://localhost:8000
echo   Frontend   : http://localhost:3000
echo   Admin      : http://localhost:3000/admin
echo.
echo   [CHIA SE QUA INTERNET]
echo   Xem cua so "Cloudflare Tunnel" de lay URL dang:
echo   https://xxxx-xxxx.trycloudflare.com
echo   (chi can 1 URL nay la du)
echo  ================================================================
echo.

pause
