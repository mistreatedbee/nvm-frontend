@echo off
echo ============================================
echo  Backend Local Test Script
echo ============================================
echo.

cd C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\nvm-marketplace-backend

echo [1/4] Checking Node.js version...
node --version
echo.

echo [2/4] Checking npm version...
npm --version
echo.

echo [3/4] Installing dependencies (if needed)...
npm install
echo.

echo [4/4] Testing backend startup...
echo.
echo Starting server for 10 seconds to check for errors...
echo.
timeout /t 3 /nobreak > nul
start /b npm run dev
timeout /t 10 /nobreak > nul
taskkill /f /im node.exe > nul 2>&1

echo.
echo ============================================
echo  Check above for any errors!
echo ============================================
echo.
echo If you saw:
echo   ✅ "Server running on port 5000"
echo   ✅ "MongoDB Connected"
echo.
echo Then backend is working correctly!
echo.
echo If you saw errors, check:
echo   - Is MongoDB connection string correct in .env?
echo   - Are all environment variables set in .env?
echo   - Are there any missing packages?
echo.
pause

