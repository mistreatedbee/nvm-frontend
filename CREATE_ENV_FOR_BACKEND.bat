@echo off
echo ========================================
echo   Creating .env file for Backend
echo ========================================
echo.

cd nvm-marketplace-backend

(
echo MONGO_URI=mongodb+srv://ashleymashigo013_db_user:qFXdrSHolTF9Z608@nvm2.s7pikmj.mongodb.net/nvm-marketplace?appName=NVM2
echo JWT_SECRET=nvm-marketplace-super-secret-jwt-key-2026-change-in-production
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
) > .env

echo.
echo ========================================
echo   SUCCESS! .env file created
echo ========================================
echo.
echo Location: nvm-marketplace-backend\.env
echo MongoDB: Connected with your credentials
echo.
echo Next steps:
echo 1. cd nvm-marketplace-backend
echo 2. npm install
echo 3. npm run dev
echo.
pause

