# Vercel Deployment Guide for FarmTech

## Prerequisites
1. A [Vercel account](https://vercel.com/signup)
2. MongoDB Atlas cluster (or any MongoDB instance)
3. Razorpay account for payment processing
4. Gmail account with App Password enabled (for OTP emails)

## Step-by-Step Deployment

### 1. Prepare Environment Variables

Before deploying, ensure you have all the required environment variables:

- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation (use a strong random string)
- `JWT_EXPIRE` - Token expiration time (e.g., "7d")
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Your Gmail App Password (not regular password)
- `RAZORPAY_KEY_ID` - Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret
- `NEXT_PUBLIC_API_URL` - Your Vercel deployment URL (add after first deployment)

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Configure environment variables in the deployment settings
5. Click "Deploy"

### 3. Configure Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add all the required environment variables:

   ```
   MONGO_URI = mongodb+srv://...
   JWT_SECRET = your-secret-key
   JWT_EXPIRE = 7d
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-app-password
   RAZORPAY_KEY_ID = rzp_...
   RAZORPAY_KEY_SECRET = your-secret
   NEXT_PUBLIC_API_URL = https://your-app.vercel.app
   ```

4. Make sure to select the appropriate environment (Production, Preview, Development)

### 4. Post-Deployment Configuration

After your first deployment:

1. Copy your Vercel deployment URL (e.g., `https://farmtech.vercel.app`)
2. Add `NEXT_PUBLIC_API_URL` environment variable with this URL
3. Redeploy the application for the changes to take effect

### 5. Database Seeding (Optional)

If you need to seed your database with initial products:

1. Set up your environment variables in a local `.env.local` file
2. Run the seed script:
   ```bash
   npm run seed
   ```

**Note:** Do not run the seed script in production. Seed locally or use a separate script.

## Important Notes

### MongoDB Atlas Configuration
- Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) or add Vercel's IP addresses
- Go to Network Access in MongoDB Atlas
- Add IP Address: 0.0.0.0/0 (or Vercel's IPs)

### Gmail App Password
- Regular Gmail password won't work
- Enable 2-Factor Authentication on your Google account
- Generate an App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Use this App Password as `EMAIL_PASS`

### Razorpay Configuration
- Use Test Mode credentials for testing
- Switch to Live Mode credentials for production
- Update webhook URLs in Razorpay dashboard to point to your Vercel URL

### Security Checklist
- ✅ Never commit `.env.local` or `.env` files to Git
- ✅ Use strong, random JWT_SECRET (at least 32 characters)
- ✅ Enable MongoDB authentication
- ✅ Use environment-specific Razorpay keys
- ✅ Review CORS settings if needed

## Troubleshooting

### Build Failures
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Route Issues
- Check Vercel Function logs
- Verify environment variables are set correctly
- Ensure MongoDB connection string is correct

### Image Loading Issues
- Images domains are configured in `next.config.js`
- Add any additional image domains if needed

### Connection Timeout
- MongoDB Atlas: Ensure IP whitelist includes 0.0.0.0/0
- Check if MongoDB cluster is active

## Monitoring and Logs

1. View deployment logs in Vercel Dashboard
2. Monitor function execution in the "Functions" tab
3. Set up error tracking (Sentry, LogRocket, etc.) for production

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Custom Domain (Optional)

1. Go to your project in Vercel
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_API_URL` to use custom domain

## Performance Optimization

- Images are optimized automatically by Next.js
- API routes run as serverless functions
- Static assets are served via Vercel's CDN
- Consider adding caching strategies for API responses

## Support

For issues specific to:
- Vercel: [Vercel Documentation](https://vercel.com/docs)
- Next.js: [Next.js Documentation](https://nextjs.org/docs)
- MongoDB: [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

**Ready to deploy!** 🚀

Once deployed, test all functionality:
- User registration and OTP verification
- Login and authentication
- Product browsing
- Cart operations
- Checkout and payment
- Order management
- Admin dashboard
