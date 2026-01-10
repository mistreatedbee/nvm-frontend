# 🚨 FIX SERVER CRASH - 3 Easy Methods

## The Problem
```
Error: The `uri` parameter to `openUri()` must be a string, got "undefined"
```

**Cause**: Missing `.env` file in the `backend` folder

---

## ✅ SOLUTION - Choose Any Method:

### 🏆 METHOD 1: Double-Click Batch File (EASIEST!)

1. **Find the file**: `create-env.bat` (in your project root)
2. **Double-click it**
3. **Enter your MongoDB password** when prompted
4. **Press Enter**
5. **Done!** The `.env` file is created
6. **Restart your server**: `npm run dev`

### 🔧 METHOD 2: Run PowerShell Script

1. **Open PowerShell** in your project root
2. **Run**:
   ```powershell
   .\create-env.ps1
   ```
3. **Enter your MongoDB password** when prompted
4. **Done!** Restart server: `npm run dev`

### ✍️ METHOD 3: Create Manually

1. **Navigate to**: `C:\Users\lenovo\Downloads\NVM-Marketplace-main\NVM-Marketplace-main\backend`

2. **Create new file** named `.env`

3. **Paste this** (replace `YOUR_PASSWORD`):
```
MONGO_URI=mongodb+srv://ashleymashigo013_db_user:YOUR_PASSWORD@nvmmartketplace.s6zrw6q.mongodb.net/nvm-marketplace?appName=NVMmartketplace
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

4. **Save and restart server**

---

## 🔑 Where to Get MongoDB Password

1. Go to: https://cloud.mongodb.com
2. Login
3. **Database Access** → Find `ashleymashigo013_db_user`
4. **Edit** → **Edit Password**
5. Copy or create new password

---

## ✅ Expected Result

After creating `.env` file and restarting:

```
✅ MongoDB Connected successfully
🚀 Server running in development mode on port 5000
📍 API: http://localhost:5000
💬 Socket.IO ready for real-time chat

Frontend:
➜  Local:   http://localhost:5173/
```

**NO MORE CRASH!** 🎉

---

## 🆘 Troubleshooting

### Still crashing?

**Check 1**: File is in correct location
```
backend\.env  ✅ Correct
.env          ❌ Wrong location
```

**Check 2**: File name is exact
- Must be `.env` (with dot at start)
- Not `.env.txt`

**Check 3**: Password is correct
- No spaces in the connection string
- Special characters encoded if needed

**Check 4**: Server restarted
- Press `Ctrl+C` to stop
- Run `npm run dev` again

---

## 📞 Quick Start

**FASTEST WAY:**

1. Double-click `create-env.bat`
2. Enter MongoDB password
3. Run `npm run dev`
4. Open `http://localhost:5173`

**DONE!** 🚀

---

**Need help?** Check `CREATE_ENV_FILE.md` for detailed instructions.

