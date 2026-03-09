# PowerShell Script to Create .env File
# Run this from the project root directory

Write-Host "🔧 Creating .env file for NVM Marketplace Backend..." -ForegroundColor Cyan
Write-Host ""

# Get MongoDB password from user
$mongoPassword = Read-Host "Enter your MongoDB password (for user: ashleymashigo013_db_user)"

if ([string]::IsNullOrWhiteSpace($mongoPassword)) {
    Write-Host "❌ Error: MongoDB password is required!" -ForegroundColor Red
    exit 1
}

# Create .env content
$envContent = @"
MONGO_URI=mongodb+srv://ashleymashigo013_db_user:$mongoPassword@nvmmartketplace.s6zrw6q.mongodb.net/nvm-marketplace?appName=NVMmartketplace
JWT_SECRET=nvm-marketplace-super-secret-jwt-key-2026
JWT_EXPIRE=30d
NODE_ENV=development
PORT=5000
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
STRIPE_SECRET_KEY=sk_test_demo
STRIPE_PUBLISHABLE_KEY=pk_test_demo
STRIPE_WEBHOOK_SECRET=whsec_demo
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=demo@gmail.com
EMAIL_PASS=demo
EMAIL_FROM=noreply@nvmmarketplace.com
FRONTEND_URL=http://localhost:5173
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=demo
PAYFAST_SANDBOX=true
SESSION_SECRET=nvm-session-secret-2026
"@

# Check if backend folder exists
if (-not (Test-Path ".\backend")) {
    Write-Host "❌ Error: backend folder not found!" -ForegroundColor Red
    Write-Host "   Make sure you're running this from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Write .env file
try {
    $envContent | Out-File -FilePath ".\backend\.env" -Encoding UTF8 -NoNewline
    Write-Host "✅ Successfully created backend\.env file!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Configuration saved:" -ForegroundColor Cyan
    Write-Host "   - MongoDB URI: Configured with your password" -ForegroundColor White
    Write-Host "   - JWT Secret: Generated" -ForegroundColor White
    Write-Host "   - Port: 5000" -ForegroundColor White
    Write-Host "   - Environment: development" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 You can now run: npm run dev" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error creating .env file: $_" -ForegroundColor Red
    exit 1
}

