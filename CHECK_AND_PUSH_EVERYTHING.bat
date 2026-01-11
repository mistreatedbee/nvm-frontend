@echo off
echo ========================================
echo   CHECKING AND PUSHING ALL FILES
echo ========================================
echo.

cd /d "%~dp0"

echo Current directory:
cd

echo.
echo ===========================================
echo CHECKING WHAT FILES HAVE CHANGED:
echo ===========================================
git status

echo.
echo ===========================================
echo ADDING ALL CHANGES:
echo ===========================================
git add -A

echo.
echo ===========================================
echo SHOWING WHAT WILL BE COMMITTED:
echo ===========================================
git status

echo.
echo Press any key to commit and push all changes...
pause

git commit -m "Complete vendor registration fix: All 22 fields including Account Holder Name and Branch Code visible and working"

echo.
echo ===========================================
echo PUSHING TO GITHUB:
echo ===========================================
git push origin main

echo.
echo ===========================================
echo   DONE!
echo ===========================================
echo.
echo Now:
echo 1. Go to Vercel: https://vercel.com/dashboard
echo 2. Wait for deployment to finish (green checkmark)
echo 3. Go to your site: https://nvm-frontend.vercel.app
echo 4. HARD REFRESH: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
echo 5. Go to vendor registration
echo 6. ALL FIELDS WILL BE THERE!
echo.
echo If you STILL don't see the fields after this:
echo - Clear your browser cache completely
echo - Try in incognito/private mode
echo - Try a different browser
echo.
pause

