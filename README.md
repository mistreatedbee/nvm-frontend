# 🛍️ Ndingoho Vendor Markets (NVM)

**Your Marketplace for Every Business**

A modern, scalable, multi-vendor online marketplace where vendors, freelancers, and businesses can sell products or services, and customers can browse and purchase from them.

## 🚀 Features

### For Customers
- Browse products from multiple vendors
- Advanced search and filtering
- Shopping cart and wishlist
- Secure checkout
- Order tracking
- Product reviews and ratings

### For Vendors
- Create and manage store profiles
- Product/service listings
- Order management
- Revenue analytics
- Customer reviews
- Payout tracking

### For Admins
- Vendor approval workflow
- Product moderation
- Category management
- Dispute resolution
- Platform analytics
- User management

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with role-based access control
- **State Management**: Zustand
- **Storage**: Cloudinary for images
- **Payments**: Stripe & PayFast integration
- **Email**: Nodemailer

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd nvm-marketplace
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Configure environment variables**

**Backend (.env)**:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nvm-marketplace
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env.local)**:
Create a `.env.local` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on your system
mongod
```

Or use MongoDB Atlas (cloud):
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update MONGODB_URI in backend/.env

5. **Run the application**
```bash
# From root directory - runs both frontend and backend
npm run dev

# Or run them separately:
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
npm run dev:frontend
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
nvm-marketplace/
├── src/                   # Vite + React frontend
│   ├── components/       # React components
│   │   ├── ui/          # UI components
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── ProductCard.tsx
│   │   └── VendorCard.tsx
│   ├── pages/           # Page components
│   │   ├── MarketplaceHome.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── VendorStorefront.tsx
│   │   ├── ProductDetail.tsx
│   │   └── AdminDashboard.tsx
│   ├── lib/             # Utilities and helpers
│   │   ├── api.ts       # API integration
│   │   └── store.ts     # Zustand state management
│   ├── utils/           # Helper functions
│   ├── App.tsx          # Main app component
│   └── index.tsx        # Entry point
├── backend/              # Express backend API
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Category.js
│   │   ├── Transaction.js
│   │   ├── Notification.js
│   │   └── Dispute.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── vendors.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   ├── categories.js
│   │   ├── notifications.js
│   │   └── payments.js
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/           # Utility functions
│   │   ├── jwt.js
│   │   ├── email.js
│   │   └── cloudinary.js
│   ├── config/          # Configuration
│   │   └── database.js
│   └── server.js        # Entry point
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS config
└── package.json         # Dependencies
```

## 🎨 Design System

The platform features a vibrant African-inspired design:
- **Color Palette**: Green primary (#2D6A4F), Gold accents (#D4AF37), Earth tones
- **Typography**: System fonts for clarity and performance
- **Animations**: Smooth Framer Motion transitions
- **Patterns**: Kente, Mudcloth, and traditional African patterns
- **Mobile-first**: Responsive design for all devices

## 🔐 Security Features

- Password hashing with bcrypt
- JWT authentication with HTTP-only cookies support
- Role-based access control (Customer, Vendor, Admin)
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file uploads to Cloudinary
- CORS protection
- Helmet security headers
- MongoDB injection protection

## 📊 User Roles

### 1. Customer
- Browse products and vendors
- Add items to cart and wishlist
- Place orders
- Track order status
- Leave reviews and ratings
- Manage profile

### 2. Vendor
- Create and customize store
- List products/services
- Manage inventory
- Process orders
- View analytics
- Respond to reviews
- Track revenue

### 3. Admin
- Approve/reject vendors
- Moderate products and reviews
- Manage categories
- Handle disputes
- View platform analytics
- Manage users
- Configure platform settings

## 🚀 Quick Start Guide

### For Customers
1. Visit http://localhost:5173
2. Click "Sign Up" and choose "Shop as Customer"
3. Browse products in the marketplace
4. Add items to cart
5. Proceed to checkout

### For Vendors
1. Click "Sign Up" and choose "Sell as Vendor"
2. Complete vendor profile setup
3. Wait for admin approval
4. Start listing products
5. Manage orders from vendor dashboard

### For Admins
1. Use the admin credentials from backend/.env
2. Access admin panel at /admin
3. Approve pending vendors
4. Moderate content
5. View analytics

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Vendor)
- `PUT /api/products/:id` - Update product (Vendor)
- `DELETE /api/products/:id` - Delete product (Vendor)
- `GET /api/products/featured` - Get featured products

### Vendor Endpoints
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create vendor profile
- `PUT /api/vendors/:id` - Update vendor
- `PUT /api/vendors/:id/approve` - Approve vendor (Admin)

### Order Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders/my/orders` - Get customer orders
- `GET /api/orders/vendor/orders` - Get vendor orders
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Render/Heroku)
```bash
cd backend
# Follow your hosting provider's deployment guide
```

### Database (MongoDB Atlas)
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Whitelist IP addresses
3. Create database user
4. Get connection string
5. Update MONGODB_URI in environment variables

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 📈 Analytics & Monitoring

The platform includes built-in analytics for:
- Vendor performance metrics
- Sales analytics
- Traffic insights
- Conversion tracking
- Revenue reports

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🌟 Roadmap

- [x] Core marketplace functionality
- [x] Multi-vendor support
- [x] Shopping cart and checkout
- [x] Order management
- [x] Review system
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Live chat support
- [ ] Subscription products
- [ ] Auction system
- [ ] Social login (Google, Facebook)
- [ ] Progressive Web App (PWA)

## 🐛 Known Issues

- Mock data is used when API is not available
- Some dashboard features are in development
- Admin panel is under construction

## 📧 Support

For support:
- Email: support@nvm.com
- GitHub Issues: Open an issue
- Documentation: See `/docs` folder

## 🙏 Acknowledgments

- African pattern designs inspired by traditional textiles
- Color palette inspired by African markets
- UI/UX follows modern e-commerce best practices

---

**Built with ❤️ for African commerce** | NVM Team © 2024
