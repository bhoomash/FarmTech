# Farming Fertilizer E-Commerce - Full-Stack Next.js 🌱

A complete, production-ready farming fertilizer e-commerce platform built entirely with **Next.js 14** (App Router), running on a **single port (3000)**. Features include email OTP authentication, shopping cart, Razorpay payment integration, and a full admin dashboard.

> **✨ New Architecture**: Everything consolidated into Next.js - no separate backend server needed!

## 🌟 Key Features

### **Full-Stack Architecture**
- ✅ **Next.js API Routes** - Backend and frontend in one application
- ✅ **Single Port (3000)** - No separate backend server needed
- ✅ **MongoDB Integration** - Database connection with Mongoose
- ✅ **Server Components** - Optimized performance

### **User Features**
- 🔐 Email OTP Authentication (No passwords)
- 🛍️ Browse products with filters (category, price, search)
- 🛒 Shopping cart with real-time updates
- 💳 Razorpay payment integration
- 📦 Order history and tracking
- 👤 User profile management

### **Admin Features**
- 📊 Dashboard with statistics (revenue, orders, users, products)
- ➕ Add/Edit/Delete products
- 📋 Manage orders and update status
- 👥 View all users and orders

## 🛠️ Tech Stack

**Framework**: Next.js 14 (App Router) - Full-stack React framework  
**Frontend**: React 18, Tailwind CSS (custom green theme)  
**Backend**: Next.js API Routes  
**Database**: MongoDB with Mongoose  
**Auth**: JWT + Nodemailer (Email OTP)  
**Payment**: Razorpay  
**Validation**: Zod  

## 📁 Project Structure

```
frontend/
├── app/
│   ├── api/                    # ⚡ Backend API Routes
│   │   ├── auth/
│   │   │   ├── send-otp/route.js
│   │   │   └── verify-otp/route.js
│   │   ├── products/
│   │   │   ├── route.js
│   │   │   └── [id]/route.js
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── payment/
│   │   └── user/
│   ├── (pages)/                # 🎨 Frontend Pages
│   │   ├── page.js
│   │   ├── login/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   └── admin/
│   ├── layout.js
│   └── globals.css
├── components/                 # React Components
├── context/                    # AuthContext, CartContext
├── lib/                        # 🔧 Utilities
│   ├── db.js                  # MongoDB connection
│   ├── auth.js                # Auth middleware
│   ├── jwt.js                 # JWT utilities
│   └── email.js               # Email service
├── models/                     # 📦 Mongoose Models
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
├── services/                   # API client
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account (for OTP)
- Razorpay account

### Installation

```bash
# 1. Navigate to frontend
cd "d:\fun pro\frontend"

# 2. Install dependencies
npm install

# 3. Create environment file
copy .env.local.example .env.local
# Edit .env.local with your credentials

# 4. Start MongoDB
mongod

# 5. Run development server
npm run dev
```

Visit **http://localhost:3000** 🎉

### Environment Variables (.env.local)

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/farm-fertilizer

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🔧 API Endpoints

All API routes available at `/api/*`:

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/send-otp` | Send OTP to email | ❌ |
| POST | `/api/auth/verify-otp` | Verify OTP & login | ❌ |
| GET | `/api/products` | Get products (with filters) | ❌ |
| GET | `/api/products/[id]` | Get single product | ❌ |
| POST | `/api/products` | Create product | 🔐 Admin |
| PUT | `/api/products/[id]` | Update product | 🔐 Admin |
| DELETE | `/api/products/[id]` | Delete product | 🔐 Admin |
| GET | `/api/cart` | Get user cart | 🔐 |
| POST | `/api/cart` | Add to cart | 🔐 |
| PUT | `/api/cart/[productId]` | Update quantity | 🔐 |
| DELETE | `/api/cart/[productId]` | Remove item | 🔐 |
| GET | `/api/orders` | Get orders | 🔐 |
| POST | `/api/orders` | Create order | 🔐 |
| PUT | `/api/orders/[id]` | Update status | 🔐 Admin |
| POST | `/api/payment/create-order` | Create Razorpay order | 🔐 |
| POST | `/api/payment/verify` | Verify payment | 🔐 |
| GET | `/api/user/profile` | Get profile | 🔐 |
| PUT | `/api/user/profile` | Update profile | 🔐 |

## 🎨 Features in Detail

### Email OTP Authentication
- No passwords - secure OTP-based login
- 6-digit OTP with 5-minute expiration
- JWT tokens for session management
- Automatic email sending via Nodemailer

### Shopping Experience
- Category filters (Fertilizer, Seeds, Pesticides, Tools)
- Price range filtering
- Search functionality
- Real-time cart updates
- Stock validation
- Discount calculations

### Payment Integration
- Razorpay Checkout modal
- Server-side signature verification
- Order confirmation emails
- Automatic inventory updates

### Admin Dashboard
- Total revenue calculation
- Order count and status tracking
- Product CRUD operations
- User management
- Order status updates

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
cd frontend
vercel
```

Add environment variables in Vercel dashboard.

### Production Checklist
- ✅ Use MongoDB Atlas
- ✅ Strong JWT_SECRET (32+ chars)
- ✅ Razorpay live mode
- ✅ Production email service
- ✅ HTTPS enabled
- ✅ Environment variables configured

## 🧪 Testing

### Razorpay Test Cards
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
```

### Test Flow
1. **User**: Register → Browse → Add to Cart → Checkout → Order
2. **Admin**: Login → Dashboard → Manage Products → Update Orders

## 🆚 Architecture Change

### Before (Separated - 2 Servers)
```
┌─────────────┐         ┌──────────────┐
│  Express.js │  ←──→   │   Next.js    │
│  Port 5000  │         │   Port 3000  │
└─────────────┘         └──────────────┘
     Backend                 Frontend
```

### After (Consolidated - 1 Server) ✅
```
┌────────────────────────────┐
│        Next.js 14          │
│        Port 3000           │
├────────────────────────────┤
│  Frontend (App Router)     │
│  Backend (API Routes)      │
│  MongoDB (Direct)          │
└────────────────────────────┘
```

## 🎯 Advantages

✅ **Single Deployment** - One platform, one server  
✅ **No CORS Issues** - Same-origin requests  
✅ **Better Performance** - No network latency  
✅ **Simpler Setup** - One dev server  
✅ **Cost Effective** - Single hosting plan  
✅ **Easier Debugging** - Everything in one codebase  

## 🔒 Security

- JWT authentication with expiration
- OTP-based passwordless login
- Payment signature verification
- Role-based access control (Admin/Customer)
- Input validation with Zod
- MongoDB injection prevention
- HTTPS in production

## 📚 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MongoDB with Next.js](https://www.mongodb.com/developer/languages/javascript/nextjs-with-mongodb/)

## 🐛 Common Issues

**MongoDB Connection Error**
```bash
# Make sure MongoDB is running
mongod
```

**Port 3000 in Use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Email Not Sending**
- Check Gmail app password
- Enable 2FA on Gmail
- Check console for dev OTP

## 🤝 Contributing

Contributions welcome! Open an issue or submit a PR.

## 📄 License

MIT License - Free for personal and commercial use.

---

**Built with ❤️ for farmers and agricultural businesses**

> **Note**: The `backend/` folder is deprecated. All backend logic is now in `frontend/app/api/`
#   F a r m T e c h  
 