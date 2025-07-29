# 🛠️ Setup Guide - Accountability Buddy

Comprehensive setup instructions for developers to get the Accountability Buddy platform running locally.

## 📋 Prerequisites

### **Required Software**

- **Node.js**: Version 18.0.0 or higher

  ```bash
  node --version  # Should show v18+
  npm --version   # Should show v9+
  ```

- **MongoDB**: Local installation or cloud instance
- **Git**: For version control
- **Code Editor**: VS Code recommended

### **Optional but Recommended**

- **MongoDB Compass**: GUI for MongoDB
- **Postman**: For API testing
- **Docker**: For containerized MongoDB (alternative)

---

## 🚀 Quick Start (5 Minutes)

### **1. Clone and Install**

```bash
# Clone the repository
git clone https://github.com/krystleb45/accountability-buddy-clean.git
cd accountability-buddy-clean

# Install dependencies
npm install
```

### **2. Environment Setup**

```bash
# Backend environment
cd apps/backend
cp .env.example .env.development
# Edit .env.development with your values

# Frontend environment
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your values
```

### **3. Start Development Servers**

```bash
turbo dev
```

### **4. Verify Setup**

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5050>
- API Docs: <http://localhost:5050/api-docs>

---

## 📊 Database Setup

### **Option 1: Local MongoDB**

```bash
# Install MongoDB locally
# macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Verify connection
mongosh  # Should connect to mongodb://localhost:27017
```

### **Option 2: MongoDB Atlas (Cloud)**

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Get connection string
4. Add to your `.env.development`:

   ```bash
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@your-cluster.mongodb.net/accountability-buddy
   ```

### **Option 3: Docker MongoDB**

```bash
# Run MongoDB in Docker
docker run -d \
  --name accountability-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Connection string for Docker setup:
MONGODB_URI=mongodb://admin:password@localhost:27017/accountability-buddy?authSource=admin
```

---

## ⚙️ Environment Variables Setup

### **Backend (.env.development)**

```bash
# ======================
# Server Configuration
# ======================
PORT=5050
NODE_ENV=development

# ======================
# Database
# ======================
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/accountability-buddy

# OR Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accountability-buddy

# ======================
# Authentication
# ======================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# ======================
# CORS Configuration
# ======================
CORS_ORIGINS=http://localhost:3000

# ======================
# Optional Services
# ======================
# Email (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Socket.IO
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

### **Frontend (.env.local)**

```bash
# ======================
# NextAuth Configuration
# ======================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars

# ======================
# API Configuration
# ======================
# CRITICAL: Point to Next.js proxy routes, NOT Express directly
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Backend URL for server-side proxy forwarding
BACKEND_URL=http://localhost:5050
EXPRESS_API_URL=http://localhost:5050

# ======================
# Stripe (Public Keys)
# ======================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# ======================
# App Configuration
# ======================
NEXT_PUBLIC_APP_NAME=AccountabilityBuddy
NEXT_PUBLIC_APP_VERSION=1.0.0-dev
NEXT_PUBLIC_DEBUG=true
```

---

## 🔧 Detailed Setup Steps

### **Step 1: Backend Setup**

```bash
cd apps/backend

# Setup environment
cp .env.example .env.development
# Edit .env.development with your MongoDB URI and JWT secret

# Generate JWT Secret (minimum 32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Start development server
turbo dev

# Verify backend is running
curl http://localhost:5050/api/health
```

### **Step 2: Frontend Setup**

```bash
cd apps/frontend

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate NextAuth Secret
openssl rand -base64 32

# Start development server
turbo dev

# Verify frontend is running
open http://localhost:3000
```

### **Step 3: Database Initialization**

```bash
# The app will create collections automatically
# But you can verify connection by checking logs:

# Backend logs should show:
# ✅ Connected to MongoDB
# 🚀 Server listening on port 5050
```

---

## 🧪 Testing the Setup

### **1. Backend API Test**

```bash
# Health check
curl http://localhost:5050/api/health

# Register test user
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Check Swagger docs
open http://localhost:5050/api-docs
```

### **2. Frontend Test**

1. Open <http://localhost:3000>
2. Try registration/login
3. Navigate to dashboard
4. Create a test group
5. Check military support section

### **3. Full Stack Test**

1. Register new user on frontend
2. Create a goal
3. Join/create a group
4. Test military support chat

---

## 🚨 Troubleshooting

### **Common Issues & Solutions**

#### **Port Already in Use**

```bash
# Find process using port 3000 or 5050
lsof -i :3000
lsof -i :5050

# Kill process
kill -9 <PID>

# Or use different ports in your .env files
```

#### **MongoDB Connection Failed**

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Check connection
mongosh mongodb://localhost:27017
```

#### **Environment Variables Not Loading**

```bash
# Ensure file names are correct:
# backend/.env.development  (NOT .env.dev)
# frontend/.env.local       (NOT .env)

# Restart development servers after changing .env files
```

#### **Authentication Issues (401 Errors)**

```bash
# Verify NEXT_PUBLIC_API_URL points to Next.js, not Express:
# ✅ NEXT_PUBLIC_API_URL=http://localhost:3000/api
# ❌ NEXT_PUBLIC_API_URL=http://localhost:5050/api

# Check JWT secret is set in backend
# Check NEXTAUTH_SECRET is set in frontend
```

#### **CORS Errors**

```bash
# Ensure CORS_ORIGINS in backend includes frontend URL:
CORS_ORIGINS=http://localhost:3000

# Check browser network tab for preflight requests
```

### **Database Issues**

```bash
# Reset database (development only)
mongosh
use accountability-buddy
db.dropDatabase()

# Check database collections
mongosh
use accountability-buddy
show collections
```

### **Build Errors**

```bash
# Clear Next.js cache
cd apps/frontend
rm -rf .next
turbo dev

# Clear node_modules if needed
rm -rf node_modules
npm install
```

---

## 🔍 Development Tools

### **Recommended VS Code Extensions**

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- GitLens
- Prettier - Code formatter
- ESLint

### **Browser Development Tools**

- React Developer Tools
- Redux DevTools (if using Redux)
- MongoDB Compass for database management

### **API Testing**

```bash
# Test with curl
curl -X GET http://localhost:5050/api/health

# Or use Postman collection (if available)
# Import: docs/postman_collection.json
```

---

## 📱 Mobile Development (Future)

### **React Native Setup (Planned)**

```bash
# For future mobile app development
npm install -g @react-native-community/cli
npx react-native init AccountabilityBuddyMobile
```

---

## ☁️ Deployment Setup

### **Vercel (Frontend)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### **Railway (Backend)**

```bash
# Install Railway CLI
cd apps/backend
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### **Environment Variables for Production**

Remember to set all environment variables in your deployment platforms:

- Vercel: Add all `NEXT_PUBLIC_*` variables
- Railway: Add all backend environment variables
- Use production MongoDB URI and API keys

---

## 📞 Getting Help

### **If Setup Fails**

1. **Check the logs** in both terminal windows
2. **Verify environment variables** are correct
3. **Ensure MongoDB is running** and accessible
4. **Check port availability** (3000, 5050)
5. **Review this troubleshooting section**

### **Common Log Messages**

```bash
# ✅ Good logs to see:
"🚀 Server listening on port 5050"
"✅ Connected to MongoDB"
"✨ Ready on http://localhost:3000"

# ❌ Error logs to investigate:
"EADDRINUSE: address already in use"
"MongooseError: Connection failed"
"404 - API route not found"
```

### **Support Channels**

- **GitHub Issues**: For bugs and feature requests
- **Documentation**: Check [docs/](../docs/) folder
- **Code Review**: Submit PRs for improvements

---

**Last Updated**: July 30, 2025
**Setup Time**: ~15-30 minutes for experienced developers
**Difficulty**: Intermediate (requires Node.js and MongoDB knowledge)
