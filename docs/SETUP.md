# 🛠️ Detailed Setup Guide

This guide provides comprehensive instructions for setting up the Accountability Buddy platform in different environments.

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Development Setup](#-quick-development-setup)
- [Docker Development Setup](#-docker-development-setup)
- [Environment Configuration](#️-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Development Tools](#-development-tools)
- [Troubleshooting](#-troubleshooting)
- [Production Deployment](#-production-deployment)

---

## 🔧 Prerequisites

### Required Software

- **Node.js 22+** (Current: v22.20.0)

  ```bash
  # Check version
  node --version
  npm --version
  
  # Install using nvm (recommended)
  nvm install 22
  nvm use 22
  ```

- **Git** (Latest version)

  ```bash
  git --version
  ```

- **MongoDB** (Community Edition 7.0+)
  - Option 1: [Local Installation](https://docs.mongodb.com/manual/installation/)
  - Option 2: [MongoDB Atlas](https://www.mongodb.com/atlas) (Cloud)
  - Option 3: Docker (see [Docker Setup](#-docker-development-setup))

### Optional Tools

- **Docker** & **Docker Compose** (for containerized development)
- **MongoDB Compass** (GUI for MongoDB)
- **Postman** or **Insomnia** (API testing)
- **VS Code** with recommended extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - MongoDB for VS Code

---

## ⚡ Quick Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/krystleb45/accountability-buddy.git
cd accountability-buddy
```

### 2. Install Dependencies

```bash
# Install Turborepo globally (optional)
npm install -g turbo

# Install all workspace dependencies
npm install
```

### 3. Setup Environment Files

```bash
# Frontend environment
cd apps/frontend
cp .env.example .env.local

# Backend environment
cd ../backend
cp .env.example .env.development
```

### 4. Configure Environment Variables

**Frontend (.env.local):**

```bash
# Minimal required configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5050
```

**Backend (.env.development):**

```bash
# Minimal required configuration
NODE_ENV=development
PORT=5050
MONGO_URI=mongodb://localhost:27017/accountability-buddy
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
FRONTEND_URL=http://localhost:3000
```

### 5. Start Development Servers

```bash
# From project root
turbo dev
```

**Access Points:**

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5050>
- API Documentation: <http://localhost:5050/api-docs>

---

## 🐳 Docker Development Setup

Use Docker Compose for a complete development environment with all services.

### 1. Start Services

```bash
# Start core services (MongoDB, Redis, MinIO)
docker-compose up -d

# Or start with admin tools included
docker-compose --profile tools up -d
```

### 2. Verify Services

```bash
docker-compose ps
```

### 3. Configure Backend for Docker

Update `apps/backend/.env.development`:

```bash
MONGO_URI=mongodb://admin:password@localhost:27017/accountability-buddy?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
AWS_ACCESS_KEY_ID=admin
AWS_SECRET_ACCESS_KEY=password123
AWS_ENDPOINT=http://localhost:9000
S3_BUCKET=accountability-uploads
```

### 4. Access Admin Tools

- **MongoDB Admin**: <http://localhost:8081> (admin/password)
- **Redis Admin**: <http://localhost:8082>
- **MinIO Console**: <http://localhost:9001> (admin/password123)

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed Docker configuration.

---

## ⚙️ Environment Configuration

### Frontend Environment Variables

```bash
# apps/frontend/.env.local

# ========================
# 🔐 Authentication (Required)
# ========================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # Generate: openssl rand -base64 32

# ========================
# 🚀 API Configuration (Required)
# ========================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5050

# ========================
# 📊 Optional Services
# ========================
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://example@sentry.io/project

# ========================
# 🎨 App Configuration
# ========================
NEXT_PUBLIC_APP_NAME=AccountabilityBuddy
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_THEME_MODE=dark
```

### Backend Environment Variables

```bash
# apps/backend/.env.development

# ========================
# 🌍 Environment
# ========================
NODE_ENV=development
PORT=5050

# ========================
# 🗄️ Database (Required)
# ========================
MONGO_URI=mongodb://localhost:27017/accountability-buddy

# ========================
# 🔐 JWT Secrets (Required)
# ========================
JWT_SECRET=your-jwt-secret-32-chars-min
ACCESS_TOKEN_SECRET=your-access-token-secret-64-chars-min
REFRESH_TOKEN_SECRET=your-refresh-token-secret-64-chars-min
JWT_EXPIRES_IN=7d

# ========================
# 🌐 CORS (Required)
# ========================
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# ========================
# 💳 Payment Processing (Optional)
# ========================
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ========================
# 📧 Email Service (Optional)
# ========================
MAILCHIMP_TRANSACTIONAL_API_KEY=your-mailchimp-key

# ========================
# 🗃️ File Storage (Optional)
# ========================
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET=your-bucket-name

# ========================
# 📊 Subscription Plans
# ========================
DEFAULT_TRIAL_DAYS=14
BASIC_MONTHLY_PRICE=5.00
PRO_MONTHLY_PRICE=15.00
ELITE_MONTHLY_PRICE=30.00
```

### Generating Secure Secrets

```bash
# JWT Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# NextAuth Secret
openssl rand -base64 32

# Session Secret
openssl rand -hex 32
```

---

## 🗄️ Database Setup

### Local MongoDB Setup

1. **Install MongoDB Community Edition**
   - [macOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
   - [Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
   - [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)

2. **Start MongoDB Service**

   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

3. **Verify Connection**

   ```bash
   mongosh mongodb://localhost:27017/accountability-buddy
   ```

### Database Seeding

```bash
# Navigate to backend directory
cd apps/backend

# Seed roles (required)
npm run seed:roles

# Seed test users (optional)
npm run seed:users

# Create admin user
npm run create:admin

# Seed complete development data
npm run seed:dev
```

### Database Management Scripts

```bash
# Cleanup and reset
npm run cleanup:all    # Remove all test data
npm run reset:dev     # Complete reset for development

# Individual operations
npm run cleanup:users
npm run cleanup:roles
npm run seed:test     # Test environment data
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Start all services
turbo dev

# Start individual services
cd apps/frontend && npm run dev
cd apps/backend && npm run dev
```

### Build for Production

```bash
# Build all applications
turbo build

# Build individual apps
cd apps/frontend && npm run build
cd apps/backend && npm run build
```

### Testing

```bash
# Run all tests
turbo test

# Frontend tests
cd apps/frontend && npm test

# Backend tests
cd apps/backend && npm test
```

---

## 🛠️ Development Tools

### Type Generation

```bash
# Generate TypeScript types from Mongoose models
npm run generate-mongoose-types
```

### Code Quality

```bash
# Lint all code
turbo lint

# Format all code
turbo format

# Type checking
turbo check-types
```

### Email Development

```bash
# Start email preview server
cd packages/transactional
npm run dev
# Access: http://localhost:3001
```

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :5050  # Backend
lsof -i :27017 # MongoDB

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

#### MongoDB Connection Failed

```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Check connection string format
mongodb://[username:password@]host[:port][/database][?options]

# For Docker MongoDB
mongodb://admin:password@localhost:27017/accountability-buddy?authSource=admin
```

#### Build Failures

```bash
# Clear all caches
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm -rf .turbo

# Reinstall
npm install
```

#### Environment Variables Not Loading

```bash
# Check file names and locations
ls -la apps/frontend/.env*
ls -la apps/backend/.env*

# Verify no syntax errors
cat apps/frontend/.env.local
```

### Debug Mode

#### Frontend Debug

```bash
# Enable Next.js debug mode
NEXT_PUBLIC_DEBUG=true npm run dev

# Check browser console for detailed logs
```

#### Backend Debug

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Check logs directory
tail -f apps/backend/logs/combined.log
```

### Performance Issues

#### Slow Database Queries

```bash
# Enable MongoDB profiling
mongosh --eval "db.setProfilingLevel(2)"

# Check slow queries
mongosh --eval "db.system.profile.find().sort({ts:-1}).limit(5)"
```

#### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

---

## 🚀 Production Deployment

### Environment Preparation

1. **Secure Environment Variables**

   ```bash
   # Generate production secrets
   JWT_SECRET=$(openssl rand -hex 32)
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   ```

2. **Database Configuration**
   - Use MongoDB Atlas or dedicated MongoDB instance
   - Enable authentication and SSL
   - Configure backup strategy

3. **Redis Configuration**
   - Use Redis Cloud or dedicated Redis instance
   - Enable authentication and SSL

### Build Process

```bash
# Production build
turbo build

# Test production build locally
cd apps/frontend && npm start
cd apps/backend && npm run start
```

### Deployment Platforms

#### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/frontend
vercel --prod
```

#### Railway (Backend)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd apps/backend
railway login
railway link
railway up
```

#### Docker Production

```bash
# Build backend image
docker build -f backend.Dockerfile -t accountability-backend .

# Run with production environment
docker run -d \
  --name accountability-backend \
  --env-file apps/backend/.env.production \
  -p 5050:5050 \
  accountability-backend
```

### Health Monitoring

```bash
# Backend health endpoint
curl http://localhost:5050/health

# Database connection check
curl http://localhost:5050/api/health/db
```

---

## 📚 Additional Resources

- **API Documentation**: <http://localhost:5050/api-docs>
- **Docker Setup**: [DOCKER_SETUP.md](./DOCKER_SETUP.md)
- **MongoDB Documentation**: <https://docs.mongodb.com/>
- **Next.js Documentation**: <https://nextjs.org/docs>
- **Turborepo Documentation**: <https://turbo.build/repo/docs>

---

**Need Help?**

- Create an issue: [GitHub Issues](https://github.com/krystleb45/accountability-buddy/issues)
- Check existing documentation in the `docs/` folder
- Review example environment files in each app directory

---

*Last updated: November 22, 2025*
