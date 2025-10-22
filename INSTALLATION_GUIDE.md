# Installation Guide - Digital Service Hub

Complete step-by-step installation guide for setting up the Digital Service Hub marketplace platform.

---

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## 1. System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **MongoDB**: v4.4 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space

### Software Prerequisites
- Git
- Node.js and npm
- MongoDB (local) or MongoDB Atlas account
- Code editor (VS Code recommended)
- Postman (optional, for API testing)

---

## 2. Installation Steps

### Step 1: Install Node.js

**Windows:**
1. Download from https://nodejs.org/
2. Run the installer
3. Follow installation wizard
4. Verify installation:
```bash
node --version
npm --version
```

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 2: Install MongoDB

**Option A: Local Installation**

**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Install as Windows Service
5. Start MongoDB service

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster (free tier available)
4. Create database user
5. Whitelist IP address (0.0.0.0/0 for development)
6. Get connection string

### Step 3: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/Digital-Service-Hub.git

# Navigate to project directory
cd Digital-Service-Hub-main
```

### Step 4: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install

# Return to root directory
cd ..
```

**Alternative: Install all at once**
```bash
npm run install:all
```

---

## 3. Database Setup

### Local MongoDB Setup

1. **Start MongoDB**
```bash
# Windows (if not running as service)
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

2. **Verify MongoDB is running**
```bash
# Connect to MongoDB shell
mongo

# Or using mongosh (newer versions)
mongosh

# You should see MongoDB shell prompt
```

3. **Create Database (Optional)**
```javascript
// In MongoDB shell
use digital-service-hub

// Create initial collection
db.createCollection("users")

// Exit
exit
```

### MongoDB Atlas Setup

1. **Get Connection String**
   - Go to your cluster
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

2. **Example Connection String**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/digital-service-hub?retryWrites=true&w=majority
```

---

## 4. Environment Configuration

### Step 1: Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Open .env in your editor
```

### Step 2: Configure Environment Variables

**Minimum Required Configuration:**

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/digital-service-hub
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digital-service-hub

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_characters
JWT_EXPIRE=7d

# Commission Rates
COMMISSION_RATE_LVHF=0.10
COMMISSION_RATE_HVLF=0.15
```

**Optional Configuration (for full functionality):**

```env
# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Generate JWT Secret

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option 3: Online Generator**
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" or similar

### Step 4: Setup Payment Gateways (Optional)

**Razorpay:**
1. Sign up at https://razorpay.com/
2. Go to Settings → API Keys
3. Generate test keys
4. Add to .env file

**Stripe:**
1. Sign up at https://stripe.com/
2. Go to Developers → API keys
3. Get test keys
4. Add to .env file

### Step 5: Setup Email (Optional)

**Gmail:**
1. Enable 2-factor authentication
2. Generate app password:
   - Go to Google Account → Security
   - App passwords
   - Select "Mail" and "Other"
   - Generate password
3. Use generated password in SMTP_PASS

---

## 5. Running the Application

### Option 1: Run Both Frontend and Backend Together

```bash
# From root directory
npm run dev:full
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
# From root directory
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# From root directory
cd client
npm start
```

### Option 3: Production Build

```bash
# Build frontend
cd client
npm run build

# Start backend (serves built frontend)
cd ..
npm start
```

---

## 6. Verification

### Step 1: Check Backend

1. **Health Check**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-10-22T10:00:00.000Z"
}
```

2. **Check MongoDB Connection**
- Look for "✅ MongoDB connected successfully" in terminal

3. **Check Server Running**
- Look for "🚀 Server running on port 5000" in terminal

### Step 2: Check Frontend

1. Open browser: http://localhost:3000
2. You should see the home page
3. Check browser console for errors (F12)

### Step 3: Test Registration

1. Go to http://localhost:3000/register
2. Fill in registration form
3. Submit
4. Check if redirected to dashboard

### Step 4: Test API with Postman

1. Import `POSTMAN_COLLECTION.json`
2. Set `base_url` variable to `http://localhost:5000/api`
3. Test "Register User" endpoint
4. Test "Login" endpoint
5. Copy token from login response
6. Set `token` variable in Postman
7. Test protected endpoints

---

## 7. Troubleshooting

### Common Issues and Solutions

#### Issue 1: MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running:
```bash
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

2. Start MongoDB if not running
3. Check connection string in .env
4. For Atlas, check:
   - IP whitelist
   - Database user credentials
   - Network connectivity

#### Issue 2: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change port in .env:
```env
PORT=5001
```

2. Or kill process using port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

#### Issue 3: Module Not Found

**Error:** `Cannot find module 'express'`

**Solutions:**
1. Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

2. Clear npm cache:
```bash
npm cache clean --force
npm install
```

#### Issue 4: Frontend Not Loading

**Solutions:**
1. Check if backend is running
2. Check proxy in client/package.json:
```json
"proxy": "http://localhost:5000"
```

3. Clear browser cache
4. Check browser console for errors

#### Issue 5: JWT Secret Error

**Error:** `secretOrPrivateKey must have a value`

**Solution:**
- Ensure JWT_SECRET is set in .env
- Must be at least 32 characters
- No spaces or special characters that need escaping

#### Issue 6: Payment Gateway Errors

**Solutions:**
1. Verify API keys are correct
2. Check if using test keys in development
3. Ensure keys have no extra spaces
4. Check gateway dashboard for errors

#### Issue 7: Email Not Sending

**Solutions:**
1. Check SMTP credentials
2. For Gmail, use app password (not regular password)
3. Check firewall/antivirus blocking SMTP port
4. Verify SMTP settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

#### Issue 8: CORS Errors

**Solutions:**
1. Check CLIENT_URL in backend .env
2. Ensure CORS is configured in server/index.js
3. Clear browser cache
4. Check if frontend and backend URLs match

---

## 8. Post-Installation Steps

### Create Admin Account

1. Register a user through the UI
2. Connect to MongoDB:
```bash
mongo digital-service-hub
# or
mongosh digital-service-hub
```

3. Update user role:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Seed Sample Data (Optional)

Create a seed script or manually add:
- Sample services
- Sample vendors
- Test bookings

### Configure Payment Webhooks

**Razorpay:**
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events to listen

**Stripe:**
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select events

---

## 9. Development Tips

### Recommended VS Code Extensions
- ESLint
- Prettier
- MongoDB for VS Code
- Thunder Client (API testing)
- GitLens

### Useful Commands

```bash
# View logs
npm run dev  # Shows live logs

# Check for updates
npm outdated

# Update dependencies
npm update

# Run specific script
npm run <script-name>

# Clear cache
npm cache clean --force
```

### Database Management

**View Collections:**
```bash
mongosh
use digital-service-hub
show collections
db.users.find().pretty()
```

**Backup Database:**
```bash
mongodump --db digital-service-hub --out ./backup
```

**Restore Database:**
```bash
mongorestore --db digital-service-hub ./backup/digital-service-hub
```

---

## 10. Next Steps

After successful installation:

1. ✅ Read [QUICKSTART.md](QUICKSTART.md) for usage guide
2. ✅ Review [DOCUMENTATION.md](DOCUMENTATION.md) for features
3. ✅ Check [API_REFERENCE.md](API_REFERENCE.md) for API details
4. ✅ Test all features
5. ✅ Customize for your needs
6. ✅ Deploy to production (see [DEPLOYMENT.md](DEPLOYMENT.md))

---

## 11. Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review error messages carefully
3. Check GitHub Issues
4. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Screenshots

---

## 12. Success Checklist

- [ ] Node.js installed and verified
- [ ] MongoDB installed/configured
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] .env file created and configured
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can register new user
- [ ] Can login successfully
- [ ] API endpoints working
- [ ] Database connection successful

---

**Installation Complete! 🎉**

You're now ready to start using Digital Service Hub!
