@echo off
echo ============================================
echo  Push ALL Changes to GitHub
echo  - Frontend to: nvm-frontend
echo  - Backend to: NVM-Backend
echo ============================================
echo.

REM ============================================
REM PUSH FRONTEND
REM ============================================
echo.
echo ============================================
echo [1/2] PUSHING FRONTEND...
echo ============================================
echo.

cd C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main

echo Checking frontend remote...
git remote -v
echo.

echo Staging frontend changes...
git add -A

echo Committing frontend changes...
git commit -m "Fix vendor registration form: optional banking details and improved validation"

echo Pushing to GitHub...
git push origin main

echo.
echo ✅ Frontend pushed to: https://github.com/mistreatedbee/nvm-frontend
echo.

REM ============================================
REM PUSH BACKEND
REM ============================================
echo.
echo ============================================
echo [2/2] PUSHING BACKEND...
echo ============================================
echo.

cd C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\nvm-marketplace-backend

echo Checking backend remote...
git remote -v
echo.

REM Try to add remote if not exists
git remote add origin https://github.com/mistreatedbee/NVM-Backend.git 2>nul

echo Staging backend changes...
git add -A

echo Committing backend changes...
git commit -m "Fix vendor registration: add multer middleware, optional banking, Cloudinary integration"

echo Pushing to GitHub...
git push -u origin main

echo.
echo ✅ Backend pushed to: https://github.com/mistreatedbee/NVM-Backend
echo.

REM ============================================
REM SUMMARY
REM ============================================
echo.
echo ============================================
echo  ✅ ALL CHANGES PUSHED!
echo ============================================
echo.
echo Frontend: https://github.com/mistreatedbee/nvm-frontend
echo   └─ Vercel will auto-deploy in ~2 minutes
echo.
echo Backend:  https://github.com/mistreatedbee/NVM-Backend
echo   └─ Render will auto-deploy in ~3 minutes
echo.
echo Wait 5 minutes then test:
echo https://nvm-frontend.vercel.app/vendor-registration
echo.
echo ============================================
pause

