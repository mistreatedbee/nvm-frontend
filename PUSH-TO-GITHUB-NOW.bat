@echo off
echo ============================================
echo  PUSH VENDOR MODEL FIX TO GITHUB
echo  Repository: NVM-Backend
echo ============================================
echo.

cd /d C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\nvm-marketplace-backend

echo [1/6] Checking current git remote...
git remote -v
echo.

echo [2/6] Making sure remote is set correctly...
git remote set-url origin https://github.com/mistreatedbee/NVM-Backend.git
echo ✅ Remote set to: https://github.com/mistreatedbee/NVM-Backend.git
echo.

echo [3/6] Checking git status...
git status
echo.

echo [4/6] Adding ALL changed files...
git add -A
echo.

echo [5/6] Creating commit...
git commit -m "CRITICAL FIX: Make banking details optional in Vendor model - Fix 400 validation error"
echo.

echo [6/6] Pushing to GitHub...
echo Pushing to: https://github.com/mistreatedbee/NVM-Backend
echo.
git push -u origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo  ✅ SUCCESS! PUSHED TO GITHUB!
    echo ============================================
    echo.
    echo Repository: https://github.com/mistreatedbee/NVM-Backend
    echo.
    echo Render will auto-deploy in 2-3 minutes!
    echo.
    echo What was pushed:
    echo   ✅ models/Vendor.js - Banking optional
    echo   ✅ middleware/upload.js - Multer for FormData
    echo   ✅ middleware/validator.js - Optional validation
    echo   ✅ routes/vendors.js - Multer added
    echo   ✅ controllers/vendorController.js - Cloudinary
    echo   ✅ server.js - CORS for all Vercel URLs
    echo.
    echo Next steps:
    echo   1. Go to Render dashboard
    echo   2. Watch for "Deploy started"
    echo   3. Wait for "Deploy succeeded" (2-3 min)
    echo   4. Test vendor registration again
    echo   5. SUCCESS! No more banking error!
    echo.
    echo ============================================
) else (
    echo ============================================
    echo  ❌ PUSH FAILED!
    echo ============================================
    echo.
    echo Possible issues:
    echo   - Need to authenticate with GitHub
    echo   - No changes to commit
    echo   - Network error
    echo.
    echo Check the error message above.
    echo.
    echo ============================================
)
echo.
pause

