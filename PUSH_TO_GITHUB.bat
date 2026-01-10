@echo off
echo ========================================
echo   PUSHING TO GITHUB
echo ========================================
echo.

REM Check if Git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo.
)

REM Check if remote exists, if not add it
git remote -v | findstr "origin" >nul 2>&1
if errorlevel 1 (
    echo Adding remote origin...
    git remote add origin https://github.com/mistreatedbee/nvm-frontend.git
    echo.
) else (
    echo Remote origin already exists
    echo Updating remote URL...
    git remote set-url origin https://github.com/mistreatedbee/nvm-frontend.git
    echo.
)

REM Add all files
echo Adding all files...
git add .
echo.

REM Check if there are changes to commit
git diff-index --quiet HEAD -- >nul 2>&1
if errorlevel 1 (
    echo Committing changes...
    git commit -m "Fix TypeScript build errors for Vercel deployment"
    echo.
) else (
    echo No changes to commit
    echo.
)

REM Push to GitHub
echo Pushing to GitHub...
git branch -M main
git push -u origin main --force
echo.

echo ========================================
echo   DONE!
echo ========================================
echo.
echo Your code is now on GitHub at:
echo https://github.com/mistreatedbee/nvm-frontend
echo.
pause

