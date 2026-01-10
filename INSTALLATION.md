# 🚀 Installation Guide - NVM Marketplace

Complete setup guide for the NVM Marketplace with all new features.

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** v18 or higher
- **MongoDB** v6 or higher (local or Atlas)
- **npm** or **yarn**
- **Git**

---

## 🔧 Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd NVM-Marketplace-main
```

### 2. Install All Dependencies

```bash
# Install root dependencies (frontend)
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install:all
```

### 3. Set Up Environment Variables

#### Backend Configuration

```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Environment
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/nvm-marketplace
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nvm-marketplace

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
FROM_NAME=NVM Marketplace

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Frontend URL (for email links and CORS)
FRONTEND_URL=http://localhost:5173

# PayFast (South African payment gateway - optional)
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
```

#### Frontend Configuration

Create `.env.local` in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Set Up Email Service

#### Option A: Gmail (Development)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASSWORD`

#### Option B: Mailtrap (Development)

```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
```

#### Option C: SendGrid (Production)

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

### 5. Start MongoDB

#### Local MongoDB:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### MongoDB Atlas:
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Update `MONGODB_URI` in `.env`

### 6. Run Tests (Optional but Recommended)

```bash
cd backend
npm test
```

Expected output:
```
Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
```

### 7. Seed Initial Data

#### Seed Subscription Plans:

Start the backend server:
```bash
cd backend
npm run dev
```

In another terminal, seed the plans:
```bash
# Using curl
curl -X POST http://localhost:5000/api/subscriptions/seed-plans \
  -H "Content-Type: application/json"

# OR using Postman/Insomnia
POST http://localhost:5000/api/subscriptions/seed-plans
```

This creates 4 subscription plans:
- Free (R0/month)
- Basic (R299/month)
- Professional (R599/month)
- Enterprise (R1299/month)

### 8. Start the Application

#### Option A: Run Both (Recommended)

From the root directory:
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

#### Option B: Run Separately

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

### 9. Verify Installation

1. **Backend Health Check**:
   - Visit: http://localhost:5000/health
   - Should see: `{"success": true, "message": "NVM API is running"}`

2. **Frontend**:
   - Visit: http://localhost:5173
   - Should see the NVM Marketplace homepage

3. **Socket.IO**:
   - Check console: Should see "Socket.IO ready for real-time chat"

---

## 🧪 Testing the Features

### 1. Test Email Verification

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer"
  }'

# Check your email for verification link
```

### 2. Test Password Reset

```bash
# Request password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check your email for reset link
```

### 3. Test Chat (requires Socket.IO client)

See `FEATURES_ADDED.md` for Socket.IO integration examples.

### 4. Test Bulk Upload

1. Download CSV template:
   ```bash
   curl http://localhost:5000/api/bulk-upload/template \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -o template.csv
   ```

2. Edit the CSV with your products

3. Upload:
   ```bash
   curl -X POST http://localhost:5000/api/bulk-upload/products \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@template.csv"
   ```

### 5. Test Analytics

```bash
# Get vendor analytics
curl http://localhost:5000/api/analytics/vendor \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"
```

---

## 🔑 Creating Admin User

To create an admin user, you can either:

### Option 1: Via MongoDB

```javascript
// Connect to MongoDB
use nvm-marketplace

// Update a user to admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 2: Via API (after registration)

```bash
# 1. Register normally
# 2. Update in database as shown above
# 3. Login to get admin token
```

---

## 📦 Project Structure

```
NVM-Marketplace/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── socket/          # Socket.IO handlers
│   ├── tests/           # Test files
│   ├── uploads/         # CSV upload directory
│   ├── utils/           # Utility functions
│   ├── .env             # Environment variables
│   ├── package.json     # Backend dependencies
│   └── server.js        # Entry point
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── lib/             # Utilities & API
│   ├── utils/           # Helper functions
│   ├── App.tsx          # Main app component
│   └── index.tsx        # Entry point
├── public/              # Static assets
├── .env.local           # Frontend environment
├── package.json         # Frontend dependencies
└── vite.config.ts       # Vite configuration
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error**: `MongooseServerSelectionError`

**Solution**:
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl status mongod
```

### Email Not Sending

**Error**: `Error: Invalid login`

**Solution**:
1. Check email credentials in `.env`
2. For Gmail, use App Password (not regular password)
3. For development, use Mailtrap
4. Check firewall/antivirus settings

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find and kill the process
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Socket.IO Connection Failed

**Error**: `WebSocket connection failed`

**Solution**:
1. Check CORS settings in `backend/server.js`
2. Verify `FRONTEND_URL` in `.env`
3. Check firewall settings
4. Ensure backend is running

### Tests Failing

**Error**: Tests timeout or fail

**Solution**:
```bash
# Clear Jest cache
cd backend
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Check MongoDB Memory Server
npm test -- --detectOpenHandles
```

### CSV Upload Error

**Error**: `Only CSV files are allowed`

**Solution**:
1. Ensure file extension is `.csv`
2. Check file size (max 5MB)
3. Verify file format matches template
4. Check categories exist in database

---

## 🚀 Production Deployment

### Backend (Railway/Render/Heroku)

1. **Set Environment Variables**:
   - All variables from `.env`
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Use production email service

2. **Build Command**: `npm install`

3. **Start Command**: `npm start`

### Frontend (Vercel/Netlify)

1. **Build Command**: `npm run build`

2. **Output Directory**: `dist`

3. **Environment Variables**:
   - `VITE_API_URL`: Your production API URL
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Production Stripe key

### Database (MongoDB Atlas)

1. Create production cluster
2. Whitelist deployment IP addresses
3. Create database user
4. Get connection string
5. Update `MONGODB_URI`

---

## 📚 Next Steps

After installation:

1. ✅ **Read Documentation**:
   - `FEATURES_ADDED.md` - Comprehensive feature docs
   - `README_UPDATES.md` - Quick reference
   - `IMPLEMENTATION_SUMMARY.md` - Overview

2. ✅ **Build Frontend Components**:
   - Chat UI
   - Analytics dashboard
   - Subscription management
   - Bulk upload interface

3. ✅ **Configure Services**:
   - Email service (SendGrid/AWS SES)
   - File storage (Cloudinary/S3)
   - Payment processing (Stripe)
   - Monitoring (Sentry)

4. ✅ **Deploy**:
   - Set up CI/CD
   - Configure production environment
   - Test all features
   - Monitor performance

---

## 🆘 Getting Help

If you encounter issues:

1. Check this installation guide
2. Review `FEATURES_ADDED.md`
3. Check test files for examples
4. Review inline code comments
5. Open an issue on GitHub

---

## ✅ Installation Checklist

- [ ] Node.js and MongoDB installed
- [ ] Repository cloned
- [ ] Dependencies installed (frontend + backend)
- [ ] Environment variables configured
- [ ] Email service set up
- [ ] MongoDB running
- [ ] Tests passing
- [ ] Subscription plans seeded
- [ ] Application running
- [ ] Health check successful
- [ ] Features tested

---

**Installation complete!** 🎉

You're now ready to develop and deploy the NVM Marketplace with all new features!

For detailed feature documentation, see `FEATURES_ADDED.md`.

Happy coding! 💻✨

