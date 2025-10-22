# Digital Service Hub - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Architecture](#architecture)
8. [Deployment](#deployment)

## 🎯 Overview

Digital Service Hub is a unified service marketplace platform that connects users with verified service providers for:
- **LVHF (Low-Value, High-Frequency)**: Daily household services (plumbing, electrical, cleaning, etc.)
- **HVLF (High-Value, Low-Frequency)**: Event-based services (weddings, parties, corporate events, etc.)

### Problem Statement
In today's busy lifestyle, individuals and event organizers face difficulties finding reliable, skilled, and verified service providers. This platform solves:
- Difficulty finding trusted professionals
- Managing multiple contacts and comparing prices
- Ensuring quality and secure payments
- Lack of digital presence for local workers

## ✨ Key Features

### Core Features
- **Dual Service Workflows**: Instant booking (LVHF) + RFQ system (HVLF)
- **Multi-Step Verification**: ID upload → Face verification → Admin approval
- **Trust Badge System**: Bronze, Silver, Gold badges based on reputation
- **Escrow Payment System**: Secure payment holding until service completion
- **Real-time Chat**: Socket.IO powered communication
- **Rating & Review System**: Comprehensive feedback with trust score impact
- **Dispute Resolution**: 3-tier handling (Automated → Mediation → Arbitration)
- **Admin Dashboard**: Complete platform management and analytics

### Payment Features
- Multiple payment gateways (Razorpay, Stripe)
- Escrow-based fund holding
- Automatic commission deduction (10% LVHF, 15% HVLF)
- Milestone-based payments for projects
- Refund and cancellation management

### User Roles
- **Customer**: Book services, create RFQs, manage bookings
- **Vendor**: Offer services, respond to RFQs, manage projects
- **Admin**: Platform oversight, verification, dispute resolution

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Socket.IO for real-time features
- Razorpay & Stripe for payments
- Bcrypt for password hashing
- Helmet, CORS, Rate Limiting

### Frontend
- React 18 with Hooks
- Redux Toolkit for state management
- React Router v6
- Axios with interceptors
- Lucide React icons
- React Hot Toast for notifications

## 🚀 Installation

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd Digital-Service-Hub-main
```

2. **Install dependencies**
```bash
# Root dependencies
npm install

# Client dependencies
cd client
npm install
cd ..
```

3. **Environment Configuration**
Create `.env` file in root directory:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/digital-service-hub

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Commission Rates
COMMISSION_RATE_LVHF=0.10
COMMISSION_RATE_HVLF=0.15
```

4. **Start the application**
```bash
# Development mode (both frontend and backend)
npm run dev:full

# Or separately:
# Backend: npm run dev
# Frontend: cd client && npm start
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "password123",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Services

#### Get All Services
```http
GET /api/services?serviceType=LVHF&category=plumbing&page=1&limit=10
```

#### Get Service by ID
```http
GET /api/services/:id
```

#### Create Service (Vendor only)
```http
POST /api/services
Authorization: Bearer <token>

{
  "name": "Emergency Plumbing",
  "description": "24/7 plumbing services",
  "category": "plumbing",
  "serviceType": "LVHF",
  "industry": "home_services",
  "pricingType": "fixed",
  "basePrice": 500,
  "bookingType": "instant",
  "availability": "immediate"
}
```

### Bookings (LVHF Flow)

#### Create Booking
```http
POST /api/bookings/create
Authorization: Bearer <token>

{
  "serviceId": "service_id",
  "scheduledDate": "2024-12-01",
  "scheduledTime": "10:00",
  "location": {
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "zipCode": "400001"
    },
    "instructions": "Ring doorbell twice"
  },
  "customerNotes": "Please bring necessary tools"
}
```

#### Get User Bookings
```http
GET /api/bookings/user/me?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

#### Update Booking Status
```http
PUT /api/bookings/:id/status
Authorization: Bearer <token>

{
  "status": "confirmed",
  "note": "Booking confirmed"
}
```

#### Complete Booking
```http
PUT /api/bookings/:id/complete
Authorization: Bearer <token>

{
  "verificationCode": "123456",
  "notes": "Job completed successfully"
}
```

### RFQ (HVLF Flow)

#### Create RFQ
```http
POST /api/rfq/create
Authorization: Bearer <token>

{
  "title": "Wedding Reception",
  "description": "Need catering and decoration for 200 guests",
  "category": "wedding_planning",
  "eventType": "wedding",
  "budget": {
    "min": 100000,
    "max": 200000
  },
  "eventDate": "2024-12-15",
  "guestCount": 200,
  "location": {
    "venue": "Grand Hotel",
    "address": {
      "city": "Mumbai",
      "state": "Maharashtra"
    }
  }
}
```

#### Get All RFQs
```http
GET /api/rfq?category=wedding_planning&page=1
Authorization: Bearer <token>
```

#### Submit Proposal (Vendor)
```http
POST /api/rfq/:rfqId/proposal
Authorization: Bearer <token>

{
  "quotedPrice": 150000,
  "breakdown": [
    {
      "item": "Catering",
      "quantity": 200,
      "unitPrice": 500,
      "total": 100000
    }
  ],
  "description": "Complete wedding package",
  "deliverables": ["Catering", "Decoration", "Photography"],
  "timeline": "2 weeks preparation"
}
```

#### Select Proposal
```http
POST /api/rfq/:rfqId/select/:proposalId
Authorization: Bearer <token>

{
  "milestones": [
    {
      "name": "Initial Setup",
      "amount": 50000,
      "dueDate": "2024-12-01"
    }
  ]
}
```

### Payments

#### Create Payment Order
```http
POST /api/payments/create-order
Authorization: Bearer <token>

{
  "bookingId": "booking_id",
  "amount": 5000,
  "paymentMethod": "upi",
  "gateway": "razorpay"
}
```

#### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer <token>

{
  "transactionId": "TXN123456",
  "gatewayPaymentId": "pay_xyz",
  "gatewayOrderId": "order_abc",
  "gatewaySignature": "signature_hash"
}
```

#### Process Refund
```http
POST /api/payments/refund/:transactionId
Authorization: Bearer <token>

{
  "reason": "Service not provided",
  "amount": 5000
}
```

### Reviews

#### Create Review
```http
POST /api/reviews/create
Authorization: Bearer <token>

{
  "vendorId": "vendor_id",
  "serviceId": "service_id",
  "bookingId": "booking_id",
  "rating": {
    "overall": 5,
    "quality": 5,
    "professionalism": 5,
    "communication": 5
  },
  "title": "Excellent Service",
  "comment": "Very professional and timely",
  "wouldRecommend": true
}
```

### Disputes

#### Create Dispute
```http
POST /api/disputes/create
Authorization: Bearer <token>

{
  "bookingId": "booking_id",
  "raisedAgainst": "vendor_user_id",
  "category": "service_not_provided",
  "title": "Service Not Completed",
  "description": "Vendor did not show up",
  "amount": {
    "disputed": 5000,
    "claimed": 5000
  }
}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

#### Verify Vendor
```http
PUT /api/admin/vendors/:id/verify
Authorization: Bearer <admin_token>

{
  "status": "approved"
}
```

## 🗄️ Database Schema

### Collections Overview

**Users**
- Authentication credentials
- Profile information
- Trust score & badge
- Wallet balance
- Verification documents

**Vendors**
- Business information
- Service offerings
- Portfolio & documents
- Rating & statistics
- Availability schedule

**Services**
- Service details
- Pricing configuration
- Category & type
- Booking settings

**Bookings**
- Service booking details
- Payment information
- Status tracking
- Timeline history

**RFQs**
- Event requirements
- Vendor proposals
- Budget & timeline
- Selection status

**Projects**
- Milestone tracking
- Escrow management
- Document sharing
- Progress monitoring

**Transactions**
- Payment records
- Escrow status
- Commission tracking
- Refund details

**Reviews**
- Rating breakdown
- Comments & feedback
- Trust impact
- Vendor responses

**Disputes**
- Issue details
- Evidence files
- Resolution tracking
- Timeline & outcomes

## 🏗️ Architecture

### Backend Architecture

**Horizontal Layer (Shared Infrastructure)**
- Authentication & Authorization (JWT)
- Trust Engine (Verification & Scoring)
- Payment & Escrow Management
- Search Engine
- Notifications & Chat
- Analytics

**LVHF Module**
- Instant booking endpoints
- Fixed pricing
- Quick payment processing
- Auto-generated invoices

**HVLF Module**
- RFQ workflow
- Proposal management
- Project tracking
- Milestone-based payments

### Frontend Architecture

**Shared Components**
- Navbar with role-based menu
- Footer
- Protected routes
- Common UI elements

**LVHF Flow**
- Service browsing
- Instant booking form
- Payment checkout
- Booking management

**HVLF Flow**
- RFQ creation wizard
- Proposal comparison
- Project dashboard
- Milestone tracking

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables
2. Build command: `npm install`
3. Start command: `npm start`
4. Ensure MongoDB connection string is set

### Frontend Deployment (Vercel/Netlify)

1. Build command: `cd client && npm install && npm run build`
2. Publish directory: `client/build`
3. Set environment variables (API URL)

### Database (MongoDB Atlas)

1. Create cluster
2. Whitelist IP addresses
3. Create database user
4. Get connection string
5. Update MONGODB_URI in .env

## 📊 Features Breakdown

### Phase 1 - MVP (LVHF Focus)
✅ Core authentication
✅ Service listing & search
✅ Instant booking
✅ Payment integration
✅ Basic reviews

### Phase 2 - HVLF Expansion
✅ RFQ system
✅ Proposal management
✅ Project tracking
✅ Milestone payments
✅ Advanced analytics

### Phase 3 - Enhancements
- Mobile app (React Native)
- Advanced AI matching
- Insurance integration
- Multi-language support
- Video consultations

## 🔒 Security Best Practices

- JWT tokens with expiration
- Password hashing (bcrypt, 12 rounds)
- Rate limiting on endpoints
- Input validation & sanitization
- CORS configuration
- Helmet security headers
- Escrow payment protection
- Role-based access control

## 📝 License

MIT License - Feel free to use this project for learning and commercial purposes.

## 👥 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@digitalservicehub.com

---

**Built with ❤️ using MERN Stack**
