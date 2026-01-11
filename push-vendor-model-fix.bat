@echo off
echo ============================================
echo  Push Vendor Model Fix
echo  Making banking details OPTIONAL
echo ============================================
echo.

cd C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\nvm-marketplace-backend

echo [1/4] Checking what changed...
git status
echo.

echo [2/4] Adding Vendor model...
git add models/Vendor.js
echo.

echo [3/4] Committing fix...
git commit -m "URGENT: Make banking details optional in Vendor model"
echo.

echo [4/4] Pushing to GitHub...
git push origin main
echo.

echo ============================================
echo  ✅ Vendor Model Fix Pushed!
echo ============================================
echo.
echo Render will redeploy in 2-3 minutes
echo.
echo Fixed: Banking details now OPTIONAL
echo   - accountHolderName: optional
echo   - accountNumber: optional
echo   - bankName: optional
echo   - branchCode: optional
echo   - accountType: optional
echo.
echo Wait 3 minutes then test again!
echo ============================================
pause

