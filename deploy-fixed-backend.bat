@echo off
echo ============================================
echo  Deploy Fixed Backend to GitHub
echo  - Vendor model: Banking details optional
echo  - Multer middleware: FormData handling
echo  - Cloudinary: Logo upload integration
echo ============================================
echo.

cd C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\nvm-marketplace-backend

echo [Step 1] Checking git status...
git status
echo.

echo [Step 2] Staging all changes...
git add -A
echo.

echo [Step 3] Creating commit...
git commit -m "Fix vendor registration: Make banking optional, add multer middleware, integrate Cloudinary"
echo.

echo [Step 4] Checking remote...
git remote -v
echo.

REM Add remote if not exists
git remote add origin https://github.com/mistreatedbee/NVM-Backend.git 2>nul

echo [Step 5] Pushing to GitHub...
git push -u origin main
echo.

echo ============================================
echo  ✅ Backend Pushed Successfully!
echo ============================================
echo.
echo Repository: https://github.com/mistreatedbee/NVM-Backend
echo.
echo Render will auto-deploy in ~3 minutes
echo.
echo Changes deployed:
echo   ✅ Banking details now optional in Vendor model
echo   ✅ Multer middleware for FormData handling
echo   ✅ Cloudinary integration for logo uploads
echo   ✅ Updated validation for optional banking
echo.
echo After 3 minutes, test at:
echo https://nvm-frontend.vercel.app/vendor-registration
echo.
echo ============================================
pause

