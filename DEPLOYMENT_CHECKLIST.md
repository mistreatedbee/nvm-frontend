# 🚀 Deployment Checklist & Fixes

## ✅ **CORS Issue - FIXED!**

The CORS error is now resolved. Your backend accepts requests from:
- ✅ `http://localhost:5173` (local development)
- ✅ `https://nvm-frontend.vercel.app` (production)

---

## ❌ **Current Issue: 404 Errors**

### **Problem:**
Your frontend is calling:
```
https://nvm-backend-7dwf.onrender.com/products
https://nvm-backend-7dwf.onrender.com/vendors
https://nvm-backend-7dwf.onrender.com/auth/register
```

But your backend routes are at:
```
https://nvm-backend-7dwf.onrender.com/api/products   ← Missing /api
https://nvm-backend-7dwf.onrender.com/api/vendors    ← Missing /api
https://nvm-backend-7dwf.onrender.com/api/auth/register ← Missing /api
```

---

## 🔧 **SOLUTION: Update Environment Variables**

### **Option 1: Update Vercel Environment Variable (Recommended)**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your `nvm-frontend` project

2. **Go to Settings → Environment Variables**

3. **Find or Add `VITE_API_URL`:**
   ```
   VITE_API_URL = https://nvm-backend-7dwf.onrender.com/api
   ```
   ⚠️ **Important:** Make sure it ends with `/api`

4. **Save and Redeploy:**
   - After saving, go to **Deployments** tab
   - Click the **...** menu on the latest deployment
   - Click **"Redeploy"**

---

### **Option 2: Update Your Local .env and Push**

If you haven't set the environment variable in Vercel yet:

1. **Update your local `.env` file:**

```env
# .env (in project root)
VITE_API_URL=https://nvm-backend-7dwf.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

2. **Commit and push:**

```bash
git add .env
git commit -m "Add production API URL"
git push origin main
```

⚠️ **Wait!** - If `.env` is in `.gitignore` (which it should be), you need to set it in Vercel dashboard instead (see Option 1).

---

## 📋 **Complete Environment Variables for Vercel**

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these:

```
VITE_API_URL = https://nvm-backend-7dwf.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_your_stripe_key
```

Make sure to apply them to **Production**, **Preview**, and **Development** environments.

---

## 🔄 **Complete Deployment Checklist**

### **Backend (Render) ✅**

- [x] Deployed to Render
- [x] URL: https://nvm-backend-7dwf.onrender.com
- [x] CORS configured for Vercel frontend
- [ ] Environment variables set on Render:
  - [ ] `MONGO_URI` (your MongoDB connection string)
  - [ ] `JWT_SECRET` (random secret for JWT)
  - [ ] `FRONTEND_URL=https://nvm-frontend.vercel.app`
  - [ ] `NODE_ENV=production`

### **Frontend (Vercel) ⏳**

- [x] Deployed to Vercel
- [x] URL: https://nvm-frontend.vercel.app
- [ ] Environment variables set:
  - [ ] `VITE_API_URL=https://nvm-backend-7dwf.onrender.com/api` ← **MISSING**
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

### **Database (MongoDB Atlas) ⏳**

- [ ] IP Whitelist configured
  - [ ] Add `0.0.0.0/0` (allow from anywhere)
  - [ ] Or add Render's IP addresses
- [x] Connection string correct
- [ ] Database user has read/write permissions

---

## 🎯 **Quick Fix Steps**

### **Step 1: Update Vercel Environment Variable**

```
VITE_API_URL = https://nvm-backend-7dwf.onrender.com/api
                                                    ^^^^
                                            Don't forget /api!
```

### **Step 2: Redeploy on Vercel**

After adding the environment variable:
1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes

### **Step 3: Test**

Visit: https://nvm-frontend.vercel.app

You should now see data loading instead of 404 errors!

---

## 🔍 **Verify Your Backend Routes**

Test these URLs in your browser:

```
✅ Health Check:
https://nvm-backend-7dwf.onrender.com/api/health

✅ Products:
https://nvm-backend-7dwf.onrender.com/api/products

✅ Vendors:
https://nvm-backend-7dwf.onrender.com/api/vendors

✅ Categories:
https://nvm-backend-7dwf.onrender.com/api/categories
```

If these work, your backend is fine. The issue is just the frontend not using `/api` in the URL.

---

## 🆘 **If Still Getting 404s After Fix**

### **Check 1: Render Environment Variables**

Make sure these are set on Render:

1. Go to: https://dashboard.render.com/
2. Select your `nvm-backend` service
3. Go to **Environment** tab
4. Add/verify:
   ```
   MONGO_URI = mongodb+srv://ashleymashigo013_db_user:qFXdrSHolTF9Z608@nvm2.s7pikmj.mongodb.net/?appName=NVM2
   JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL = https://nvm-frontend.vercel.app
   NODE_ENV = production
   PORT = 5000
   ```

### **Check 2: Verify API Routes in Backend**

Your `server.js` should have:

```javascript
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
// etc...
```

All routes should be prefixed with `/api`.

### **Check 3: Clear Vercel Build Cache**

Sometimes Vercel caches old builds:

1. Go to Vercel Dashboard
2. Settings → General
3. Scroll down to **"Build & Development Settings"**
4. Click **"Clear Cache"**
5. Redeploy

---

## 📱 **Testing Locally Before Deploying**

To test with production backend locally:

1. **Update your local `.env`:**
   ```env
   VITE_API_URL=https://nvm-backend-7dwf.onrender.com/api
   ```

2. **Run frontend:**
   ```bash
   npm run dev
   ```

3. **Test at:** http://localhost:5173

If it works locally, it will work on Vercel!

---

## 🎉 **Expected Result After Fix**

After setting `VITE_API_URL` correctly and redeploying:

✅ No CORS errors
✅ No 404 errors
✅ Data loads from backend
✅ Can register/login
✅ Can view products and vendors
✅ Full functionality working

---

## 🔐 **Security Reminder**

Make sure these are set on Render (backend):

```
MONGO_URI = mongodb+srv://...
JWT_SECRET = a-long-random-string-min-32-characters
NODE_ENV = production
```

Never commit these to GitHub! They should only be in:
- Render dashboard (for backend)
- Vercel dashboard (for frontend)
- Local `.env` files (which are in `.gitignore`)

---

## 📊 **Deployment URLs Summary**

```
🌐 Frontend (Vercel):
   https://nvm-frontend.vercel.app

🔧 Backend (Render):
   https://nvm-backend-7dwf.onrender.com

📡 API Base URL:
   https://nvm-backend-7dwf.onrender.com/api

🗄️ Database (MongoDB Atlas):
   mongodb+srv://nvm2.s7pikmj.mongodb.net/
```

---

**Go set that `VITE_API_URL` environment variable in Vercel now! 🚀**

Add: `https://nvm-backend-7dwf.onrender.com/api` (with `/api` at the end!)

Then redeploy and you're done! ✨

