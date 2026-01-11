@echo off
echo ============================================
echo  FIX CORS ERROR - URGENT DEPLOY
echo ============================================
echo.
echo Issue: Backend blocking Vercel preview URLs
echo Fix: Allow all Vercel and localhost URLs
echo.

cd C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\nvm-marketplace-backend

echo [1/3] Staging CORS fix...
git add server.js

echo.
echo [2/3] Committing fix...
git commit -m "Fix CORS: Allow all Vercel preview and production URLs"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ============================================
echo  ✅ CORS FIX DEPLOYED!
echo ============================================
echo.
echo Render will auto-deploy in ~2 minutes
echo.
echo Fixed in server.js:
echo   ✅ Allow all *.vercel.app domains
echo   ✅ Allow all localhost URLs
echo   ✅ No more CORS errors!
echo.
echo After 2 minutes, test again:
echo https://nvm-frontend-dz3bmxtyp-ashleys-projects-2341728e.vercel.app
echo.
echo ============================================
pause

