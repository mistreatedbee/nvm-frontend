@echo off
echo ============================================
echo    NVM Marketplace - .env File Creator
echo ============================================
echo.

set /p MONGO_PASSWORD="Enter your MongoDB password: "

if "%MONGO_PASSWORD%"=="" (
    echo.
    echo ERROR: MongoDB password is required!
    pause
    exit /b 1
)

echo.
echo Creating .env file in backend folder...
echo.

(
echo MONGO_URI=mongodb+srv://ashleymashigo013_db_user:%MONGO_PASSWORD%@nvmmartketplace.s6zrw6q.mongodb.net/nvm-marketplace?appName=NVMmartketplace
echo JWT_SECRET=nvm-marketplace-super-secret-jwt-key-2026
echo JWT_EXPIRE=30d
echo NODE_ENV=development
echo PORT=5000
echo CLOUDINARY_CLOUD_NAME=demo
echo CLOUDINARY_API_KEY=demo
echo CLOUDINARY_API_SECRET=demo
echo STRIPE_SECRET_KEY=sk_test_demo
echo STRIPE_PUBLISHABLE_KEY=pk_test_demo
echo STRIPE_WEBHOOK_SECRET=whsec_demo
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_PORT=587
echo EMAIL_USER=demo@gmail.com
echo EMAIL_PASS=demo
echo EMAIL_FROM=noreply@nvmmarketplace.com
echo FRONTEND_URL=http://localhost:5173
echo PAYFAST_MERCHANT_ID=10000100
echo PAYFAST_MERCHANT_KEY=46f0cd694581a
echo PAYFAST_PASSPHRASE=demo
echo PAYFAST_SANDBOX=true
echo SESSION_SECRET=nvm-session-secret-2026
) > backend\.env

echo ============================================
echo    SUCCESS! .env file created
echo ============================================
echo.
echo Location: backend\.env
echo.
echo You can now run: npm run dev
echo.
pause

