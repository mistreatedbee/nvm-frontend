@echo off
echo ============================================
echo  Push Backend to GitHub
echo ============================================
echo.

cd C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\nvm-marketplace-backend

echo [Step 1] Checking current git status...
git status
echo.

echo [Step 2] Checking remote repository...
git remote -v
echo.

echo Is the remote URL correct?
echo Should be: https://github.com/mistreatedbee/NVM-Backend.git
echo.
echo If remote is NOT set up, I will set it up now...
git remote add origin https://github.com/mistreatedbee/NVM-Backend.git 2>nul

echo.
echo [Step 3] Staging all changes...
git add -A

echo.
echo [Step 4] Committing changes...
git commit -m "Fix vendor registration: add multer middleware, optional banking details, and Cloudinary integration"

echo.
echo [Step 5] Pushing to GitHub...
git push -u origin main

echo.
echo ============================================
echo  Backend pushed to:
echo  https://github.com/mistreatedbee/NVM-Backend
echo.
echo  Render will auto-deploy in 2-3 minutes!
echo ============================================
echo.
pause

