@echo off
echo ========================================
echo   PUSHING FIXES TO GITHUB
echo ========================================
echo.

echo Adding all files...
git add .

echo Committing changes...
git commit -m "Fix vendor registration validation, banking details, and API routes - All 22 fields working"

echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   DONE! 
echo ========================================
echo.
echo Vercel will now rebuild automatically.
echo.
echo Go to: https://vercel.com/dashboard
echo Watch the build progress (takes 1-2 minutes)
echo.
echo When it shows "Ready" with a green checkmark:
echo 1. Go to: https://nvm-frontend.vercel.app
echo 2. Press Ctrl+Shift+R to hard refresh
echo 3. Test vendor registration again
echo 4. ALL BANKING FIELDS WILL BE THERE!
echo.
pause

