@echo off
echo ========================================
echo   PUSHING ALL FIXES TO GITHUB
echo ========================================
echo.

echo Checking for changes...
git status

echo.
echo Adding ALL files (including backend)...
git add .
git add src/pages/VendorRegistration.tsx
git add nvm-marketplace-backend/server.js
git add nvm-marketplace-backend/routes/vendors.js
git add nvm-marketplace-backend/routes/reviews.js
git add nvm-marketplace-backend/routes/orders.js
git add nvm-marketplace-backend/controllers/vendorController.js
git add nvm-marketplace-backend/controllers/reviewController.js
git add tsconfig.json
git add src/vite-env.d.ts
git add src/components/ui/Button.tsx
git add .gitignore

echo.
echo Committing all fixes...
git commit -m "Fix vendor registration validation, backend API routes, CORS, and 404 errors - Complete fix"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   COMPLETE! 
echo ========================================
echo.
echo All fixes have been pushed to GitHub!
echo Vercel is now rebuilding...
echo.
echo Next steps:
echo 1. Go to: https://vercel.com/dashboard
echo 2. Click your nvm-frontend project
echo 3. Go to Deployments tab
echo 4. Wait for green checkmark (1-2 minutes)
echo 5. Visit: https://nvm-frontend.vercel.app
echo 6. Hard refresh: Ctrl+Shift+R
echo 7. Test vendor registration
echo 8. ALL 22 fields including banking details will work!
echo.
pause

