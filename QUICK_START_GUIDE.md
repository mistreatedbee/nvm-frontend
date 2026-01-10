# 🚀 NVM Marketplace - Quick Start Guide

## Overview
This guide will help you quickly start and test all the enhanced dashboard features with real-time data and Rand (R) currency formatting.

## Prerequisites
- Node.js installed
- MongoDB running
- Environment variables configured

## Installation

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ..
npm install
```

## Running the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend will run on: `http://localhost:5000`

### Terminal 2 - Frontend
```bash
npm run dev
```
Frontend will run on: `http://localhost:5173` (or the port shown in terminal)

## Testing Dashboards

### 🔐 Admin Dashboard

**Login Credentials** (use your admin account)
- Navigate to: `http://localhost:5173/login`
- Role: Admin

**Features to Test:**
1. **Dashboard Overview** (`/admin/dashboard`)
   - ✅ Total Vendors count
   - ✅ Pending Vendors count
   - ✅ Total Products count
   - ✅ Total Orders count
   - ✅ Total Revenue in **Rands (R)**
   - ✅ Vendor Map showing all vendors
   - ✅ Pending vendor approvals section
   - ✅ Recent orders section

2. **User Management** (`/admin/users`)
   - Click "Manage Users" button on dashboard
   - ✅ Search users by name or email
   - ✅ Filter by role (customer, vendor, admin)
   - ✅ View user details (avatar, email, role, status, join date)
   - ✅ Ban/Unban users (cannot ban admins)
   - ✅ Real-time data updates

3. **Product Management** (`/admin/products`)
   - Click "Manage Products" button on dashboard
   - ✅ View all products in grid layout
   - ✅ Product images and details
   - ✅ Pricing in **Rands (R)**
   - ✅ Stock levels with low stock warnings
   - ✅ Activate/Deactivate products
   - ✅ Delete products
   - ✅ Search and filter functionality

4. **Vendor Approval**
   - Find pending vendors on dashboard
   - Click "Approve" to approve a vendor
   - Click "Reject" to reject with reason
   - ✅ Real-time updates after action

### 🏪 Vendor Dashboard

**Login Credentials** (use your vendor account)
- Navigate to: `http://localhost:5173/login`
- Role: Vendor

**Features to Test:**
1. **Dashboard Overview** (`/vendor/dashboard`)
   - ✅ Total Products (with active count)
   - ✅ Total Sales count
   - ✅ Total Revenue in **Rands (R)**
   - ✅ Average Store Rating with review count
   - ✅ Vendor status badge (pending/approved)
   - ✅ Quick actions panel
   - ✅ Recent products display with **Rand** pricing

2. **Vendor Analytics** (`/vendor/analytics`)
   - Click "Analytics" in quick actions
   - ✅ Overview metrics (Revenue, Orders, Products, Rating)
   - ✅ Revenue chart with date range filters
   - ✅ Top selling products with **Rand** pricing
   - ✅ Order status breakdown
   - ✅ Review distribution (5-star breakdown)
   - ✅ Export button (UI ready)

3. **Date Range Filters**
   - Test: Last 7 Days
   - Test: Last 30 Days
   - Test: Last 90 Days
   - Test: Last Year
   - ✅ Chart updates with selected range

### 👤 Customer Dashboard

**Login Credentials** (use your customer account)
- Navigate to: `http://localhost:5173/login`
- Role: Customer

**Features to Test:**
1. **Dashboard Overview** (`/customer/dashboard`)
   - ✅ Total Orders count
   - ✅ Pending Orders count
   - ✅ Completed Orders count
   - ✅ Total Spent in **Rands (R)**
   - ✅ Quick actions (Browse, Wishlist, Profile, Settings)
   - ✅ Recent orders with status badges
   - ✅ Order totals in **Rands (R)**

2. **Order Details**
   - View order numbers
   - Check formatted dates (South African locale)
   - Verify status badges with icons
   - Confirm amounts in **Rands (R)**

## Currency Verification

### Check These Locations for Rand (R) Formatting:

1. **Admin Dashboard**
   - Total Revenue stat card: `R X,XXX.XX`

2. **Vendor Dashboard**
   - Total Revenue stat card: `R X,XXX.XX`
   - Recent products: `R X,XXX.XX` per product

3. **Vendor Analytics**
   - Total Revenue: `R X,XXX.XX`
   - Average Order Value: `R X,XXX.XX`
   - Revenue chart bars: `R X,XXX.XX`
   - Top products: `R X,XXX.XX` per product

4. **Customer Dashboard**
   - Total Spent: `R X,XXX.XX`
   - Order totals: `R X,XXX.XX` per order

5. **Product Pages**
   - All product prices: `R X,XXX.XX`

6. **Order Pages**
   - All order totals: `R X,XXX.XX`

## Real-time Data Verification

### Test Data Updates:

1. **Create a New Order**
   - Login as customer
   - Add products to cart
   - Complete checkout
   - Go to customer dashboard
   - ✅ Verify "Total Orders" increased
   - ✅ Verify "Total Spent" updated
   - ✅ Verify order appears in recent orders

2. **Approve a Vendor**
   - Login as admin
   - Go to admin dashboard
   - Approve a pending vendor
   - ✅ Verify "Pending Vendors" count decreased
   - ✅ Verify vendor removed from pending list

3. **Add a Product**
   - Login as vendor
   - Add a new product
   - Go to vendor dashboard
   - ✅ Verify "Total Products" increased
   - ✅ Verify product appears in recent products

4. **Ban a User**
   - Login as admin
   - Go to user management
   - Ban a user
   - ✅ Verify status changed to "Banned"
   - ✅ Verify action button changed to "Unban"

## Common Issues & Solutions

### Issue: Backend not connecting
**Solution:**
- Check MongoDB is running
- Verify `.env` file in backend folder
- Check backend console for errors

### Issue: Frontend not loading data
**Solution:**
- Check backend is running
- Verify API_URL in frontend `.env`
- Check browser console for errors
- Verify JWT token in localStorage

### Issue: Currency not showing as Rands
**Solution:**
- Check `src/lib/currency.ts` exists
- Verify `formatRands()` function is imported
- Check browser console for errors

### Issue: 401 Unauthorized errors
**Solution:**
- Login again to refresh token
- Check token expiration settings
- Verify user role permissions

## API Endpoints Reference

### Admin Endpoints
```
GET    /api/users                 - Get all users
GET    /api/users/stats           - User statistics
PUT    /api/users/:id/ban         - Ban user
PUT    /api/users/:id/unban       - Unban user
GET    /api/analytics/platform    - Platform analytics
PUT    /api/vendors/:id/approve   - Approve vendor
PUT    /api/vendors/:id/reject    - Reject vendor
```

### Vendor Endpoints
```
GET    /api/analytics/vendor/:id  - Vendor analytics
GET    /api/analytics/sales-over-time - Sales data
GET    /api/products              - Get products
POST   /api/products              - Create product
GET    /api/orders/vendor/orders  - Vendor orders
```

### Customer Endpoints
```
GET    /api/orders/my/orders      - Customer orders
POST   /api/orders                - Create order
GET    /api/products              - Browse products
```

## Feature Checklist

### Admin Features
- [x] Real-time dashboard statistics
- [x] Vendor approval/rejection
- [x] User management (ban/unban)
- [x] Product management (activate/deactivate/delete)
- [x] Revenue in Rands
- [x] Search and filter functionality

### Vendor Features
- [x] Real-time analytics dashboard
- [x] Revenue tracking in Rands
- [x] Sales statistics
- [x] Product management
- [x] Order tracking
- [x] Rating and review display
- [x] Date range filters

### Customer Features
- [x] Order history
- [x] Spending tracking in Rands
- [x] Order status tracking
- [x] Quick actions panel
- [x] Recent orders display

## Next Steps

1. **Test all features** using this guide
2. **Verify currency formatting** in all locations
3. **Check real-time data updates** after actions
4. **Test with different user roles** (admin, vendor, customer)
5. **Review documentation files** for detailed information

## Documentation Files

- `IMPLEMENTATION_COMPLETE.md` - Complete implementation summary
- `ADMIN_VENDOR_ENHANCEMENTS.md` - Detailed feature documentation
- `DASHBOARD_FEATURES_SUMMARY.md` - Feature summary
- `QUICK_START_GUIDE.md` - This file

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify environment variables
3. Ensure MongoDB is running
4. Check that all dependencies are installed
5. Review the documentation files

## Success Indicators

✅ All dashboards load without errors
✅ All statistics show real numbers (not 0 or undefined)
✅ All currency values display with "R" symbol
✅ All actions (approve, ban, delete) work correctly
✅ Data updates in real-time after actions
✅ Search and filter functions work
✅ Charts and visualizations display correctly
✅ Mobile responsive design works

---

**Ready to test!** 🎉

Start the backend and frontend, then follow this guide to test all features.

