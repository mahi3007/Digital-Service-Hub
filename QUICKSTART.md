# Quick Start Guide

Get Digital Service Hub up and running in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- MongoDB installed or MongoDB Atlas account
- Git installed

## Installation Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd Digital-Service-Hub-main

# Install all dependencies
npm run install:all
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with minimum required variables:
```env
MONGODB_URI=mongodb://localhost:27017/digital-service-hub
JWT_SECRET=your_secret_key_minimum_32_characters
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 3. Start the Application

```bash
# Start both backend and frontend
npm run dev:full
```

Or run separately:
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## First Steps

### 1. Register an Account
- Go to http://localhost:3000/register
- Choose "Customer" or "Service Provider"
- Fill in your details

### 2. For Customers (LVHF Flow)
1. Browse services at `/services`
2. Select a service
3. Click "Book Now"
4. Fill booking details
5. Complete payment

### 3. For Vendors (LVHF Flow)
1. Create vendor profile
2. Add your services
3. Set pricing and availability
4. Receive bookings
5. Complete jobs and get paid

### 4. For Event Planning (HVLF Flow)
1. Go to `/rfq/create`
2. Describe your event requirements
3. Wait for vendor proposals
4. Compare and select best proposal
5. Project gets created with milestones

## Test Data

### Test User Accounts
```javascript
// Customer
{
  email: "customer@test.com",
  password: "test123",
  role: "user"
}

// Vendor
{
  email: "vendor@test.com",
  password: "test123",
  role: "vendor"
}

// Admin
{
  email: "admin@test.com",
  password: "admin123",
  role: "admin"
}
```

## Common Commands

```bash
# Install dependencies
npm install

# Start backend only
npm run dev

# Start frontend only
cd client && npm start

# Build frontend
cd client && npm run build

# Run tests
npm test
```

## Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
cd client
rm -rf node_modules
npm install
```

## Next Steps

1. **Configure Payment Gateway**
   - Sign up for Razorpay/Stripe
   - Add API keys to `.env`

2. **Set Up Email**
   - Configure SMTP settings
   - Test email notifications

3. **Customize**
   - Update branding
   - Modify service categories
   - Adjust commission rates

4. **Deploy**
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

## API Testing

Import the Postman collection:
```bash
# File: POSTMAN_COLLECTION.json
```

Or use curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"+919876543210","password":"test123","role":"user"}'
```

## Project Structure

```
Digital-Service-Hub-main/
├── server/              # Backend (Node.js + Express)
│   ├── controllers/     # Business logic
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   └── index.js        # Server entry
├── client/             # Frontend (React)
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   └── store/      # Redux store
│   └── package.json
├── .env                # Environment variables
└── package.json        # Root dependencies
```

## Key Features to Try

### 1. Instant Booking (LVHF)
- Browse home services
- Book plumber, electrician, etc.
- Track booking status
- Complete payment
- Leave review

### 2. Event Planning (HVLF)
- Create RFQ for wedding/event
- Receive vendor proposals
- Compare quotes
- Select vendor
- Track project milestones

### 3. Vendor Features
- Create service listings
- Manage bookings
- Submit proposals to RFQs
- Track earnings
- Respond to reviews

### 4. Admin Features
- Verify vendors
- Manage disputes
- View analytics
- Monitor transactions

## Support

- **Documentation**: See [DOCUMENTATION.md](DOCUMENTATION.md)
- **API Reference**: See [API_REFERENCE.md](API_REFERENCE.md)
- **Issues**: Create an issue on GitHub
- **Email**: support@digitalservicehub.com

## What's Next?

- [ ] Complete vendor verification
- [ ] Add payment gateway credentials
- [ ] Customize service categories
- [ ] Set up email notifications
- [ ] Deploy to production
- [ ] Add custom branding
- [ ] Configure domain name

---

**Ready to build? Start coding! 🚀**
