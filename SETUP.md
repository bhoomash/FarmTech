# Farming Fertilizer E-Commerce - Frontend Setup Guide

## Prerequisites

Before running the frontend, ensure you have:

1. **Node.js** (v18 or higher) installed
2. **Backend API** running on `http://localhost:5000`
3. **Razorpay** API key (same as backend)

## Installation Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the frontend directory:

```bash
cp .env.local.example .env.local
```

Then edit the `.env.local` file:

```env
# API Configuration - Backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Razorpay Configuration - Use the same key as backend
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Important:** 
- Variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Use the same Razorpay Key ID as your backend
- Never commit `.env.local` to version control

### 3. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Features Overview

### Public Pages
- **Home (/)** - Landing page with featured products
- **Products (/products)** - Product listing with filters
- **Product Detail (/products/[id])** - Individual product page
- **Login (/login)** - Email OTP login
- **Verify OTP (/verify-otp)** - OTP verification

### Protected Pages (Requires Login)
- **Cart (/cart)** - Shopping cart
- **Checkout (/checkout)** - Payment and shipping
- **Orders (/orders)** - Order history

### Admin Pages (Requires Admin Role)
- **Dashboard (/admin/dashboard)** - Admin overview
- **Manage Products (/admin/products)** - Product management
- **Add Product (/admin/products/new)** - Create new product
- **Manage Orders (/admin/orders)** - Order management

## Usage Guide

### For Customers

1. **Browse Products**
   - Visit homepage or products page
   - Filter by category, price range, or search
   - Click on a product to view details

2. **Add to Cart**
   - Click "Add to Cart" on product cards
   - Adjust quantity in cart
   - View cart summary

3. **Login/Register**
   - Click "Login" in navbar
   - Choose "New User" or "Existing User"
   - Enter email (and name for new users)
   - Receive OTP via email
   - Enter 6-digit OTP to login

4. **Checkout Process**
   - Review cart items
   - Click "Proceed to Checkout"
   - Fill shipping address
   - Click "Pay with Razorpay"
   - Complete payment (use Razorpay test cards in test mode)

5. **View Orders**
   - Click "My Orders" in navbar
   - View order status and details

### For Admins

1. **Access Admin Panel**
   - Login with admin account
   - Click "Admin" in navbar

2. **Manage Products**
   - View all products
   - Add new product with details
   - Edit existing products
   - Delete products
   - Update stock levels

3. **Manage Orders**
   - View all customer orders
   - Update order status (Pending → Confirmed → Shipped → Delivered)
   - View customer details and shipping info

## Razorpay Test Cards (Test Mode)

Use these test card details for payments in test mode:

### Successful Payment
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** 123456

### Failed Payment
- **Card Number:** 4111 1111 1111 1234
- **Expiry:** Any future date
- **CVV:** Any 3 digits

## Project Structure

```
frontend/
├── app/
│   ├── admin/
│   │   ├── dashboard/       # Admin dashboard
│   │   ├── orders/          # Order management
│   │   └── products/        # Product management
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout page
│   ├── login/               # Login page
│   ├── orders/              # User orders
│   ├── products/            # Product pages
│   ├── verify-otp/          # OTP verification
│   ├── globals.css          # Global styles
│   ├── layout.js            # Root layout
│   └── page.js              # Home page
├── components/
│   ├── admin/               # Admin components
│   ├── cart/                # Cart components
│   ├── layout/              # Layout components
│   └── products/            # Product components
├── context/
│   ├── AuthContext.js       # Authentication state
│   └── CartContext.js       # Cart state
├── services/
│   └── api.js               # API client
├── utils/
│   └── validators.js        # Zod validators
├── .env.local.example
├── next.config.js
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

## Styling

This project uses **Tailwind CSS** for styling:

- Responsive design (mobile-first)
- Custom primary color scheme (green theme)
- Utility-first CSS approach
- Pre-configured breakpoints

### Customizing Theme

Edit `tailwind.config.js` to customize colors, fonts, etc:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

## State Management

### Authentication (AuthContext)

- User login/logout
- JWT token management
- Role-based access control
- OTP sending and verification

```javascript
const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
```

### Cart (CartContext)

- Add/remove items
- Update quantities
- Calculate totals
- Sync with backend

```javascript
const { cart, cartItemCount, addToCart, removeFromCart } = useCart();
```

## API Integration

All API calls are centralized in `services/api.js`:

```javascript
import { productAPI, cartAPI, orderAPI } from '@/services/api';

// Fetch products
const products = await productAPI.getProducts();

// Add to cart
await cartAPI.addToCart({ productId, quantity });

// Create order
await orderAPI.createOrder(orderData);
```

## Troubleshooting

### Cannot Connect to Backend

- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled in backend

### Razorpay Not Loading

- Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Ensure key matches backend configuration
- Clear browser cache and reload

### OTP Not Received

- Verify backend email configuration
- Check spam/junk folder
- Ensure email service is working

### Images Not Loading

- Check image URLs are valid
- Update `next.config.js` domains if needed
- Use placeholder images for testing

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## Development Tips

1. **Hot Reload**: Changes auto-reload during development
2. **Error Overlay**: Detailed errors shown in browser
3. **Console Logs**: Check browser console for client-side logs
4. **Network Tab**: Monitor API calls in DevTools

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms

1. Build the project: `npm run build`
2. Start server: `npm start`
3. Configure environment variables
4. Point domain to the server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with Next.js
- Lazy loading of routes
- Image optimization
- Minimal bundle size

## Security

- JWT token stored in localStorage
- API requests include auth header
- Protected routes redirect to login
- Input validation with Zod

## Support

For issues:
- Check browser console for errors
- Verify backend is running
- Test API endpoints directly
- Clear browser cache and cookies
