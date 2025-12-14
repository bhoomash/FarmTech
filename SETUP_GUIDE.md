# Setup Guide - Full-Stack Next.js

## 🚀 Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- **Next.js 14** - Full-stack framework
- **React 18** - UI library
- **Mongoose** - MongoDB ODM
- **Razorpay** - Payment gateway
- **Nodemailer** - Email service
- **JWT** - Authentication
- **Zod** - Validation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

### 2. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster (Free tier available)
3. Get connection string
4. Replace `localhost` in `.env.local`

### 3. Environment Variables

Create `.env.local` in `frontend/` directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/farm-fertilizer
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/farm-fertilizer

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Gmail Setup (for OTP emails)

1. Enable 2-factor authentication in Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Use this password in `EMAIL_PASS`

### 5. Razorpay Setup

1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Generate test keys
4. Add to `.env.local`

### 6. Create Admin User

**Option A: Using MongoDB Compass**
1. Connect to your database
2. Go to `users` collection
3. Insert document:
```json
{
  "name": "Admin",
  "email": "admin@farmfertilizer.com",
  "role": "admin",
  "isVerified": true,
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

**Option B: Using MongoDB Shell**
```bash
mongosh
use farm-fertilizer
db.users.insertOne({
  name: "Admin",
  email: "admin@farmfertilizer.com",
  role: "admin",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 7. Add Sample Products (Optional)

Insert sample products in MongoDB:
```javascript
db.products.insertMany([
  {
    name: "NPK Fertilizer 19:19:19",
    description: "Balanced NPK fertilizer for all crops",
    category: "Fertilizer",
    price: 550,
    discount: 10,
    stock: 150,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Organic Compost",
    description: "100% organic compost",
    category: "Fertilizer",
    price: 320,
    discount: 5,
    stock: 200,
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

### 8. Run Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

## 🧪 Testing

### Test Authentication
1. Go to http://localhost:3000/login
2. Enter email
3. Check email for OTP (or check console if email not configured)
4. Enter OTP
5. Login successful!

### Test Shopping Flow
1. Browse products
2. Add items to cart
3. Go to checkout
4. Use Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date
5. Complete payment
6. View order in orders page

### Test Admin Features
1. Login with admin email
2. Access admin dashboard at http://localhost:3000/admin/dashboard
3. Add new products
4. Manage orders
5. View statistics

## 📝 Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running (`mongod`)

### Email Not Sending
**Solution**: 
- Check Gmail app password is correct
- Enable 2FA on Gmail account
- Check console for development OTP (emails disabled in dev mode if not configured)

### Razorpay Payment Failing
**Solution**:
- Use test mode keys
- Use test card numbers
- Check browser console for errors

### JWT Token Invalid
**Solution**:
- Make sure `JWT_SECRET` is set in `.env.local`
- Logout and login again
- Clear localStorage

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## 🔄 Build for Production

```bash
npm run build
npm start
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Environment Variables for Production
- Use MongoDB Atlas (not localhost)
- Use strong JWT_SECRET (generate with crypto)
- Switch Razorpay to live mode
- Use production email service

## 📚 Architecture Notes

This is a **full-stack Next.js application**:
- **Frontend**: React components in `app/` directory
- **Backend**: API routes in `app/api/` directory
- **Database**: MongoDB connection in `lib/db.js`
- **Authentication**: JWT-based with OTP
- **Payment**: Razorpay integration

Everything runs on **port 3000** - no separate backend server needed!

## 🎯 Next Steps

1. Customize the theme colors in `tailwind.config.js`
2. Add your own logo and branding
3. Configure production email service
4. Set up monitoring and analytics
5. Add more products through admin dashboard
6. Deploy to production!

## 🆘 Support

If you encounter issues:
1. Check console for errors
2. Verify all environment variables
3. Check MongoDB connection
4. Review Next.js and API route logs
5. Test with sample data first

---

Happy coding! 🌱
