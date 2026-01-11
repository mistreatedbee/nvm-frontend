@echo off
echo ========================================
echo  PUSH VENDOR MODEL FIX TO GITHUB
echo ========================================
echo.
echo This will push models/Vendor.js to fix:
echo   "Branch code is required"
echo   "Account holder name is required"
echo.
pause
echo.

cd /d C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\nvm-marketplace-backend

echo Step 1: Checking git status...
git status
echo.
echo.

echo Step 2: Adding Vendor.js model...
git add models/Vendor.js
echo.

echo Step 3: Committing...
git commit -m "CRITICAL FIX: Make all banking details optional in Vendor model"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo  DONE! Check output above for errors.
echo.
echo If you see "Everything up-to-date":
echo   - The file was already pushed
echo   - Check if Render deployed it
echo.
echo If you see commit/push success:
echo   - Wait 2-3 minutes
echo   - Render will auto-deploy
echo   - Then test again
echo ========================================
echo.
pause

