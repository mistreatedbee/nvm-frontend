# NVM Marketplace - Quick Start Guide

## 🚀 Getting Started

This guide will help you set up and run the NVM Vendor Marketplace platform.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

### 1. Backend Setup

```bash
cd NVM-Marketplace-main/nvm-marketplace-backend

# Install dependencies
npm install

# Create environment file
# Copy ENV_TEMPLATE.txt to .env and fill in your values
cp ENV_TEMPLATE.txt .env

# Required environment variables:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# JWT_EXPIRE=30d
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password
# NODE_ENV=development

# Start the backend server
npm start
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd NVM-Marketplace-main

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Initial Setup

### 1. Create Admin User

```bash
cd nvm-marketplace-backend
node scripts/createAdmin.js
```

Follow the prompts to create your first admin account.

### 2. Seed Data (Optional)

You can manually create test data through the admin dashboard, or:
- Register as a customer
- Register as a vendor
- Create products
- Place test orders

## Features Overview

### For Customers
1. **Browse & Shop**
   - Browse products at `/marketplace`
   - View vendors at `/vendors`
   - Add items to cart
   - Complete checkout

2. **Account Management**
   - Register at `/register`
   - Login at `/login`
   - View profile at `/profile`
   - View orders at `/orders`

3. **Reviews**
   - Leave reviews on products
   - Rate products and vendors
   - Mark reviews as helpful

### For Vendors
1. **Registration**
   - Register at `/vendor/register`
   - Complete vendor profile setup
   - Wait for admin approval

2. **Store Management**
   - View dashboard at `/vendor/dashboard`
   - Manage products at `/vendor/products`
   - View orders at `/vendor/orders`
   - View analytics at `/vendor/analytics`

3. **Profile**
   - Update business details at `/profile`
   - Manage banking information
   - Update store information

### For Admins
1. **User Management**
   - View all users at `/admin/users`
   - Ban/unban users
   - Delete users
   - View user details

2. **Vendor Management**
   - Approve/reject vendors at `/admin/vendors`
   - View vendor details
   - Manage vendor status

3. **Product Management**
   - View all products at `/admin/products`
   - Moderate products

4. **Platform Analytics**
   - View dashboard at `/admin/dashboard`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/ban` - Ban user
- `PUT /api/users/:id/unban` - Unban user
- `DELETE /api/users/:id` - Delete user

### Vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `PUT /api/vendors/:id` - Update vendor
- `PUT /api/vendors/:id/approve` - Approve vendor
- `PUT /api/vendors/:id/reject` - Reject vendor

### Products
- `POST /api/products` - Create product
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my/orders` - Get customer orders
- `GET /api/orders/vendor/orders` - Get vendor orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/product/:productId` - Get product reviews
- `GET /api/reviews/vendor/:vendorId` - Get vendor reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `PUT /api/reviews/:id/helpful` - Mark review as helpful

### Invoices
- `GET /api/invoices/:orderId/data` - Get invoice data (JSON)
- `GET /api/invoices/:orderId` - Download invoice (PDF)

## Testing the Platform

### Test User Flow
1. Register a customer account
2. Browse products
3. Add items to cart
4. Complete checkout
5. View order
6. Download invoice
7. Leave a review

### Test Vendor Flow
1. Register a vendor account
2. Wait for approval (or approve via admin)
3. Complete vendor profile
4. Add products
5. Receive orders
6. Update order status
7. View analytics

### Test Admin Flow
1. Create admin account
2. Approve pending vendors
3. View all users
4. Ban/unban users
5. View all orders
6. Monitor platform analytics

## Troubleshooting

### Backend Issues
- **Connection refused**: Check MongoDB is running
- **JWT errors**: Verify JWT_SECRET in .env
- **Email errors**: Check email configuration in .env

### Frontend Issues
- **API errors**: Verify VITE_API_URL points to backend
- **404 errors**: Ensure backend is running
- **Auth errors**: Clear localStorage and login again

### Database Issues
- **Connection timeout**: Check MongoDB URI
- **Collection errors**: Ensure proper indexes
- **Slow queries**: Check database performance

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use production MongoDB instance
3. Set secure JWT_SECRET
4. Configure proper CORS origins
5. Use process manager (PM2)

### Frontend
1. Build: `npm run build`
2. Deploy dist folder to hosting
3. Update VITE_API_URL to production backend
4. Configure environment variables

### Recommended Hosting
- **Backend**: Heroku, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas

## Support

For issues or questions:
1. Check the documentation
2. Review error logs
3. Verify environment variables
4. Check API connectivity

## Next Steps

1. **Customize Branding**
   - Update colors in `tailwind.config.js`
   - Add your logo
   - Customize email templates

2. **Configure Payment**
   - Set up Stripe account
   - Add API keys
   - Test payment flow

3. **Enable PDF Invoices**
   - Install pdfkit: `npm install pdfkit`
   - Uncomment PDF code in invoiceController.js
   - Test PDF generation

4. **Add Analytics**
   - Integrate Google Analytics
   - Set up monitoring
   - Configure error tracking

5. **Optimize Performance**
   - Enable caching
   - Optimize images
   - Add CDN

## Security Recommendations

- ✅ Use HTTPS in production
- ✅ Set secure cookies
- ✅ Enable rate limiting
- ✅ Sanitize user inputs
- ✅ Regular security audits
- ✅ Keep dependencies updated

## Conclusion

You now have a fully functional vendor marketplace platform! All features are working:
- ✅ User authentication
- ✅ Vendor management
- ✅ Product catalog
- ✅ Shopping cart & checkout
- ✅ Order management
- ✅ Invoice generation
- ✅ Review system
- ✅ Admin dashboard

Happy selling! 🎉
