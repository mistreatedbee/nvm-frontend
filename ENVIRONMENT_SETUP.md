# 🔧 Environment Setup Guide

## ⚠️ IMPORTANT: Create .env File

Your application is crashing because the `.env` file is missing. Here's how to fix it:

## 📝 Step-by-Step Instructions

### 1. Create the .env File

Navigate to the `backend` folder and create a new file named `.env`

```bash
cd backend
# On Windows: Create a new file in the backend folder named .env
# You can use Notepad, VS Code, or any text editor
```

### 2. Add Your Environment Variables

Copy and paste the following into your `backend/.env` file:

```env
# ============================================
# MONGODB CONFIGURATION
# ============================================
MONGO_URI=mongodb+srv://ashleymashigo013_db_user:YOUR_PASSWORD_HERE@nvmmartketplace.s6zrw6q.mongodb.net/nvm-marketplace?appName=NVMmartketplace

# IMPORTANT: Replace YOUR_PASSWORD_HERE with your actual MongoDB password
# Make sure there are NO spaces in the connection string

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=nvm-marketplace-super-secret-jwt-key-2026-change-in-production
JWT_EXPIRE=30d

# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development
PORT=5000

# ============================================
# CLOUDINARY (Image Uploads)
# ============================================
# Sign up at https://cloudinary.com for free
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ============================================
# STRIPE (Payment Processing)
# ============================================
# Get test keys from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# ============================================
# EMAIL (Nodemailer for Email Verification)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM="NVM Marketplace <noreply@nvmmarketplace.com>"

# ============================================
# FRONTEND URL
# ============================================
FRONTEND_URL=http://localhost:5173

# ============================================
# PAYFAST (South African Payments)
# ============================================
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=your-passphrase
PAYFAST_SANDBOX=true

# ============================================
# SESSION SECRET
# ============================================
SESSION_SECRET=nvm-session-secret-key-2026-change-in-production
```

## 🔑 How to Get Your MongoDB Password

Your MongoDB connection string is:
```
mongodb+srv://ashleymashigo013_db_user:<db_password>@nvmmartketplace.s6zrw6q.mongodb.net/?appName=NVMmartketplace
```

**You need to replace `<db_password>` with your actual password.**

### To Find Your Password:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Log in to your account
3. Click on **Database Access** in the left sidebar
4. Find user `ashleymashigo013_db_user`
5. Click **Edit** → **Edit Password**
6. Either view your existing password or set a new one
7. Copy the password

### Update the .env File:

Replace this:
```env
MONGO_URI=mongodb+srv://ashleymashigo013_db_user:YOUR_PASSWORD_HERE@nvmmartketplace...
```

With this (using your actual password):
```env
MONGO_URI=mongodb+srv://ashleymashigo013_db_user:MyActualPassword123@nvmmartketplace.s6zrw6q.mongodb.net/nvm-marketplace?appName=NVMmartketplace
```

**⚠️ Important Notes:**
- NO spaces in the connection string
- If your password has special characters like `@`, `#`, `!`, you need to URL encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `!` becomes `%21`
  - `$` becomes `%24`

## 📦 Optional Services (Can Set Up Later)

### Cloudinary (For Image Uploads)
1. Sign up at https://cloudinary.com (free tier available)
2. Get your credentials from the Dashboard
3. Update `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Stripe (For International Payments)
1. Sign up at https://stripe.com
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy your test keys
4. Update `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

### Email (For Email Verification)
1. Use Gmail with App Password:
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Generate App Password
   - Use that password in `EMAIL_PASS`

## 🚀 After Creating .env File

1. Save the file
2. Restart your development server:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

3. You should see:
```
✅ MongoDB Connected
✅ Server running on port 5000
```

## 🔒 Security Note

**NEVER commit the `.env` file to Git!**

The `.env` file is already in `.gitignore`, so it won't be committed. This file contains sensitive information like passwords and API keys.

## 📝 Quick Start Template

Here's a minimal `.env` to get started (just MongoDB required):

```env
# Minimum Required Configuration
MONGO_URI=mongodb+srv://ashleymashigo013_db_user:YOUR_PASSWORD@nvmmartketplace.s6zrw6q.mongodb.net/nvm-marketplace?appName=NVMmartketplace
JWT_SECRET=nvm-secret-key-change-later
JWT_EXPIRE=30d
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Optional (can add later)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
```

## ✅ Verification

After creating the `.env` file with your MongoDB password, run:

```bash
npm run dev
```

You should see:
```
🚀 Server running in development mode on port 5000
📍 API: http://localhost:5000
💬 Socket.IO ready for real-time chat
✅ MongoDB Connected (or similar success message)
```

## 🆘 Troubleshooting

### Error: "uri parameter must be a string"
- ✅ Create the `.env` file in the `backend` folder
- ✅ Make sure `MONGO_URI` is on line 1 or has no leading spaces
- ✅ Restart the server after creating the file

### Error: "Authentication failed"
- ❌ Wrong password
- ✅ Get the correct password from MongoDB Atlas
- ✅ URL encode special characters in the password

### Error: "Network timeout"
- ❌ MongoDB cluster might be paused
- ✅ Check MongoDB Atlas dashboard
- ✅ Make sure your IP is whitelisted (0.0.0.0/0 for development)

---

**Once you've created the `.env` file with your MongoDB password, the server should start successfully!** 🎉

