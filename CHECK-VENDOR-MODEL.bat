@echo off
echo ========================================
echo  CHECK VENDOR MODEL STATUS
echo ========================================
echo.

cd /d C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\nvm-marketplace-backend

echo Checking models/Vendor.js...
echo.
findstr /C:"required: [true" models\Vendor.js
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ❌ PROBLEM FOUND!
    echo Banking fields still have "required: [true"
    echo.
    echo This means the file wasn't fixed properly.
    echo.
) else (
    echo.
    echo ✅ File looks good locally!
    echo No "required: [true" found in banking section.
    echo.
    echo Now checking git status...
    echo.
    git status models/Vendor.js
    echo.
    echo If file shows as modified or untracked:
    echo   → Run PUSH-VENDOR-FIX-NOW.bat
    echo.
    echo If file is clean:
    echo   → File already pushed, wait for Render to deploy
)
echo.
echo ========================================
pause

