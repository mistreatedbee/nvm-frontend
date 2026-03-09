# Deployment Instructions

## Repository Setup

This monorepo contains both frontend and backend. To deploy to the separate repositories:

### Frontend Repository: https://github.com/mistreatedbee/nvm-frontend
### Backend Repository: https://github.com/mistreatedbee/NVM-Backend

## Manual Deployment Steps

### 1. Push Backend

```bash
# Navigate to backend directory
cd nvm-marketplace-backend

# Initialize git if needed
git init

# Add backend remote
git remote add origin https://github.com/mistreatedbee/NVM-Backend.git

# Add all backend files
git add .

# Commit
git commit -m "Complete backend implementation with user management, orders, reviews"

# Push to backend repo
git push -u origin main --force
```

### 2. Push Frontend

```bash
# Navigate back to root
cd ..

# Create a temporary directory for frontend
mkdir ../nvm-frontend-temp
cp -r src ../nvm-frontend-temp/
cp -r public ../nvm-frontend-temp/
cp package.json ../nvm-frontend-temp/
cp package-lock.json ../nvm-frontend-temp/
cp tsconfig.json ../nvm-frontend-temp/
cp tsconfig.node.json ../nvm-frontend-temp/
cp vite.config.ts ../nvm-frontend-temp/
cp tailwind.config.js ../nvm-frontend-temp/
cp postcss.config.js ../nvm-frontend-temp/
cp index.html ../nvm-frontend-temp/
cp .eslintrc.cjs ../nvm-frontend-temp/
cp README.md ../nvm-frontend-temp/
cp FEATURE_IMPLEMENTATION_COMPLETE.md ../nvm-frontend-temp/
cp QUICK_START_GUIDE.md ../nvm-frontend-temp/

# Navigate to temp directory
cd ../nvm-frontend-temp

# Initialize git
git init

# Add frontend remote
git remote add origin https://github.com/mistreatedbee/nvm-frontend.git

# Add all files
git add .

# Commit
git commit -m "Complete frontend implementation with all features"

# Push
git push -u origin main --force
```

## Current Status

✅ All features implemented
✅ No linter errors
✅ Production ready
✅ Full documentation included
