@echo off
echo ========================================
echo   PUSHING WITH VISUAL DEBUG MARKERS
echo ========================================
echo.

git add src/pages/VendorRegistration.tsx

git commit -m "Add visual debug markers to Step 4 banking fields - ALL 5 FIELDS HIGHLIGHTED"

git push origin main

echo.
echo ========================================
echo   PUSHED!
echo ========================================
echo.
echo NOW:
echo 1. Wait 2 minutes for Vercel to rebuild
echo 2. Go to: https://nvm-frontend.vercel.app/vendor-registration
echo 3. Hard refresh: Ctrl+Shift+R
echo 4. Fill Steps 1, 2, 3
echo 5. Click Next to Step 4
echo.
echo YOU WILL SEE:
echo - Green banner: "YOU ARE NOW ON STEP 4"
echo - Blue boxes around EACH field
echo - "FIELD 1 of 5: ACCOUNT HOLDER NAME"
echo - "FIELD 2 of 5: BANK NAME"
echo - "FIELD 3 of 5: ACCOUNT TYPE"
echo - "FIELD 4 of 5: ACCOUNT NUMBER"
echo - "FIELD 5 of 5: BRANCH CODE"
echo.
echo If you DON'T see these blue boxes:
echo - You're not on Step 4 yet (go through Steps 1-3)
echo - Browser cache (clear it completely)
echo - Vercel hasn't rebuilt yet (wait longer)
echo.
pause

