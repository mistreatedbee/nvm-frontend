# 🚨 URGENT: CREATE .env FILE NOW

## The Problem
Your server is crashing because the `.env` file doesn't exist in the `backend` folder.

## ✅ Solution - Follow These Exact Steps:

### Method 1: Using File Explorer (Easiest)

1. **Open File Explorer** and navigate to:
   ```
   C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\backend
   ```

2. **Right-click** in the empty space → **New** → **Text Document**

3. **Name it exactly**: `.env` 
   - Delete everything including `.txt`
   - Just type: `.env`
   - Windows might warn you - click **Yes** to confirm

4. **Open the file** with Notepad or VS Code

5. **Copy and paste this EXACT text** (replace YOUR_PASSWORD with your MongoDB password):

```
MONGO_URI=mongodb+srv://ashleymashigo013_db_user:YOUR_PASSWORD@nvmmartketplace.s6zrw6q.mongodb.net/nvm-marketplace?appName=NVMmartketplace
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
```

6. **IMPORTANT**: On line 1, replace `YOUR_PASSWORD` with your actual MongoDB password

7. **Save the file** (Ctrl+S)

8. **Restart the server**:
   - Go back to your terminal
   - Press `Ctrl+C` to stop
   - Run: `npm run dev`

### Method 2: Using VS Code (Recommended)

1. **Open VS Code**

2. **Open the backend folder**:
   - File → Open Folder
   - Navigate to: `C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\backend`
   - Click **Select Folder**

3. **Create new file**:
   - Click the "New File" icon
   - Name it: `.env`

4. **Paste the content** from above (with your MongoDB password)

5. **Save** (Ctrl+S)

6. **Restart server**

### Method 3: Using Command Line

```cmd
cd C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\backend
echo MONGO_URI=mongodb+srv://ashleymashigo013_db_user:YOUR_PASSWORD@nvmmartketplace.s6zrw6q.mongodb.net/nvm-marketplace?appName=NVMmartketplace > .env
echo JWT_SECRET=nvm-marketplace-super-secret-jwt-key-2026 >> .env
echo JWT_EXPIRE=30d >> .env
echo NODE_ENV=development >> .env
echo PORT=5000 >> .env
echo FRONTEND_URL=http://localhost:5173 >> .env
```

Then edit the file to add your password.

## 🔑 Your MongoDB Password

You need to get your password from MongoDB Atlas:

1. Go to: https://cloud.mongodb.com
2. Login
3. Click **"Database Access"** (left menu)
4. Find: `ashleymashigo013_db_user`
5. Click **"Edit"** → **"Edit Password"**
6. Copy or create a new password

## ⚠️ Special Characters in Password

If your password contains these characters, encode them:
- `@` → `%40`
- `#` → `%23`
- `!` → `%21`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`

Example:
- Password: `Test@123!`
- Encoded: `Test%40123%21`

## ✅ Verify It's Working

After creating `.env` with your password:

1. Stop the server (Ctrl+C)
2. Run: `npm run dev`
3. You should see:

```
✅ MongoDB Connected successfully
🚀 Server running in development mode on port 5000
```

NOT:
```
❌ Error: The `uri` parameter to `openUri()` must be a string, got "undefined"
```

## 🆘 Still Not Working?

### Check 1: File Location
Make sure `.env` is in:
```
backend/.env  ✅ Correct
.env  ❌ Wrong (this is root folder)
```

### Check 2: File Name
- Must be exactly `.env`
- NOT `.env.txt`
- NOT `env`
- NOT `.env.example`

### Check 3: File Content
- No empty lines at the beginning
- No spaces before variable names
- Format: `VARIABLE=value` (no spaces around `=`)

### Check 4: Restart Required
Always restart the server after creating/editing `.env`

---

## 🎯 Quick Copy-Paste Template

Save this to `backend/.env`:

```
MONGO_URI=mongodb+srv://ashleymashigo013_db_user:PUT_YOUR_PASSWORD_HERE@nvmmartketplace.s6zrw6q.mongodb.net/nvm-marketplace?appName=NVMmartketplace
JWT_SECRET=nvm-marketplace-super-secret-jwt-key-2026
JWT_EXPIRE=30d
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
STRIPE_SECRET_KEY=sk_test_demo
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=demo@gmail.com
EMAIL_PASS=demo
EMAIL_FROM=noreply@nvmmarketplace.com
SESSION_SECRET=nvm-session-secret-2026
```

**Replace `PUT_YOUR_PASSWORD_HERE` on line 1 and save!**

---

Once you create this file, your server will start successfully! 🎉

