# Digital Service Hub 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)

> A comprehensive full-stack MERN marketplace platform connecting users with verified service providers for both daily household services (LVHF) and large-scale event management (HVLF).

## 🎯 Overview

Digital Service Hub solves the challenge of finding reliable, skilled, and verified service providers by offering:

- **🏠 LVHF Services**: Instant booking for daily needs (plumbing, electrical, cleaning, etc.)
- **🎉 HVLF Services**: RFQ system for events (weddings, parties, corporate events, etc.)
- **🔐 Trust System**: Multi-step verification with Bronze, Silver, Gold badges
- **💳 Secure Payments**: Escrow-based payment system with multiple gateways
- **⭐ Reviews**: Comprehensive rating system with trust score impact
- **🛡️ Dispute Resolution**: 3-tier handling system

## ✨ Key Features

### For Customers
- Browse and book verified service providers
- Create RFQs for custom event requirements
- Compare vendor proposals
- Secure escrow payments
- Track bookings and projects in real-time
- Rate and review services

### For Vendors
- Create professional service listings
- Respond to RFQs with proposals
- Manage bookings and projects
- Track earnings and payouts
- Build reputation with reviews
- Milestone-based project payments

### For Admins
- Vendor verification system
- Dispute resolution management
- Platform analytics dashboard
- Transaction monitoring
- User management

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO (Real-time)
- Razorpay & Stripe (Payments)

**Frontend:**
- React 18 + Hooks
- Redux Toolkit
- React Router v6
- Axios
- Lucide Icons

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Digital-Service-Hub-main

# Install dependencies
npm run install:all

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start application
npm run dev:full
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

📖 **Detailed Setup**: See [QUICKSTART.md](QUICKSTART.md)

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes
- **[Complete Documentation](DOCUMENTATION.md)** - Full feature documentation
- **[API Reference](API_REFERENCE.md)** - Complete API documentation
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[Changelog](CHANGELOG.md)** - Version history

## 📁 Project Structure

```
Digital-Service-Hub-main/
├── server/                 # Backend API
│   ├── controllers/       # Request handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & validation
│   ├── utils/            # Helper functions
│   └── index.js          # Server entry
├── client/               # React frontend
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       ├── store/       # Redux store
│       └── utils/       # API utilities
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md           # This file
```

## 🔑 Key Workflows

### LVHF (Instant Booking)
1. Customer browses services
2. Selects service and books instantly
3. Payment held in escrow
4. Vendor completes service
5. Customer confirms completion
6. Payment released to vendor

### HVLF (RFQ Process)
1. Customer creates RFQ with requirements
2. Vendors submit proposals
3. Customer compares and selects vendor
4. Project created with milestones
5. Milestone-based payments
6. Project completion and review

## 💳 Payment Flow

- **Escrow System**: Funds held securely until service completion
- **Commission**: 10% (LVHF), 15% (HVLF)
- **Gateways**: Razorpay, Stripe
- **Methods**: UPI, Cards, Net Banking, Wallet

## 🔒 Security Features

- JWT-based authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Escrow payment protection

## 📊 Database Schema

**9 Main Collections:**
- Users (Authentication & profiles)
- Vendors (Business information)
- Services (Service listings)
- Bookings (LVHF transactions)
- RFQs (Event requests)
- Projects (HVLF management)
- Transactions (Payment records)
- Reviews (Ratings & feedback)
- Disputes (Resolution tracking)

## 🧪 Testing

```bash
# Backend tests
npm test

# Frontend tests
cd client && npm test

# API testing
# Import POSTMAN_COLLECTION.json into Postman
```

## 🚀 Deployment

**Backend:** Railway, Render, Heroku  
**Frontend:** Vercel, Netlify  
**Database:** MongoDB Atlas

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core marketplace features
- ✅ Dual service workflows
- ✅ Payment integration
- ✅ Admin dashboard

### Phase 2 (Planned)
- [ ] Mobile app (React Native)
- [ ] AI-based vendor matching
- [ ] Video consultations
- [ ] Multi-language support
- [ ] Advanced analytics

### Phase 3 (Future)
- [ ] Insurance integration
- [ ] Loyalty program
- [ ] Referral system
- [ ] Social media integration

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- MERN Stack Community
- Open source contributors
- Payment gateway providers

## 📞 Support

- **Documentation**: Full docs in `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/Digital-Service-Hub/issues)
- **Email**: support@digitalservicehub.com

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ using MERN Stack**