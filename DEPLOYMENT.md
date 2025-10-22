# Deployment Guide

## Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Payment gateway accounts (Razorpay/Stripe)
- Email service (Gmail/SendGrid)

## Environment Variables

Create `.env` file with all required variables:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-url.com

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

JWT_SECRET=your_production_jwt_secret_minimum_32_characters
JWT_EXPIRE=7d

RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

COMMISSION_RATE_LVHF=0.10
COMMISSION_RATE_HVLF=0.15
```

## Backend Deployment

### Option 1: Railway

1. Install Railway CLI
```bash
npm install -g @railway/cli
```

2. Login and initialize
```bash
railway login
railway init
```

3. Add environment variables
```bash
railway variables set MONGODB_URI=your_mongodb_uri
railway variables set JWT_SECRET=your_jwt_secret
# Add all other variables
```

4. Deploy
```bash
railway up
```

### Option 2: Render

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in dashboard
5. Deploy

### Option 3: Heroku

1. Install Heroku CLI
2. Login and create app
```bash
heroku login
heroku create your-app-name
```

3. Set environment variables
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# Add all other variables
```

4. Deploy
```bash
git push heroku main
```

## Frontend Deployment

### Option 1: Vercel

1. Install Vercel CLI
```bash
npm install -g vercel
```

2. Navigate to client folder
```bash
cd client
```

3. Deploy
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - `REACT_APP_API_URL=https://your-backend-url.com`

### Option 2: Netlify

1. Build the app
```bash
cd client
npm run build
```

2. Install Netlify CLI
```bash
npm install -g netlify-cli
```

3. Deploy
```bash
netlify deploy --prod --dir=build
```

4. Configure environment variables in Netlify dashboard

## MongoDB Atlas Setup

1. Create account at mongodb.com/cloud/atlas
2. Create new cluster (free tier available)
3. Database Access:
   - Create database user
   - Set username and password
4. Network Access:
   - Add IP address (0.0.0.0/0 for all - production should be specific)
5. Get connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace <password> with your password

## Payment Gateway Setup

### Razorpay
1. Sign up at razorpay.com
2. Complete KYC verification
3. Get API keys from dashboard
4. Enable required payment methods
5. Set webhook URL for payment notifications

### Stripe
1. Sign up at stripe.com
2. Complete account verification
3. Get API keys from dashboard
4. Configure webhook endpoints
5. Test with test keys before going live

## Email Service Setup

### Gmail
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use in SMTP_PASS environment variable

### SendGrid
1. Sign up at sendgrid.com
2. Verify sender identity
3. Get API key
4. Update email configuration in code

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test service creation and booking
- [ ] Test payment flow (use test mode first)
- [ ] Test RFQ creation and proposals
- [ ] Verify email notifications
- [ ] Test admin dashboard
- [ ] Check real-time chat functionality
- [ ] Verify escrow payment holding
- [ ] Test dispute creation
- [ ] Monitor error logs
- [ ] Set up backup strategy for database
- [ ] Configure SSL certificate
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure CDN for static assets

## Monitoring and Maintenance

### Logging
- Use Winston for structured logging
- Monitor error rates
- Track API response times

### Database
- Regular backups (MongoDB Atlas automated backups)
- Monitor query performance
- Index optimization

### Security
- Regular dependency updates
- Security audit with npm audit
- Monitor for suspicious activities
- Rate limiting configuration

## Scaling Considerations

### Backend
- Use PM2 for process management
- Implement caching (Redis)
- Database indexing
- Load balancing

### Frontend
- CDN for static assets
- Code splitting
- Image optimization
- Lazy loading

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check connection string format
- Verify network access settings
- Ensure database user has correct permissions

**Payment Gateway Errors**
- Verify API keys are correct
- Check webhook configuration
- Ensure test/live mode matches

**CORS Errors**
- Update CLIENT_URL in backend .env
- Check CORS configuration in server

**Build Failures**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all environment variables are set

## Support

For deployment issues:
- Check logs in deployment platform
- Review environment variables
- Test locally with production settings
- Contact platform support if needed
