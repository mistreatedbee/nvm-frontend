@echo off
echo ============================================
echo  Committing Vendor Registration Fix
echo ============================================
echo.

cd C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main

echo [1/3] Staging changes...
git add -A

echo.
echo [2/3] Committing changes...
git commit -m "Fix vendor registration: add multer middleware for FormData and optional banking details"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ============================================
echo  Done! Changes pushed to GitHub.
echo  Render will auto-deploy in 2-3 minutes.
echo ============================================
echo.
pause

