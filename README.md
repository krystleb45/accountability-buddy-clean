# 🎯 Accountability Buddy

**Accountability Buddy** is a comprehensive web platform designed to help users achieve their goals through community support, progress tracking, and peer accountability. The platform includes specialized military support features with anonymous chat functionality and crisis resources.

## 📌 Table of Contents

- [🎯 Accountability Buddy](#-accountability-buddy)
  - [📌 Table of Contents](#-table-of-contents)
  - [🚀 Features](#-features)
    - [**Core Features**](#core-features)
    - [**Military Support Features**](#military-support-features)
    - [**Subscription \& Monetization**](#subscription--monetization)
  - [🛠 Tech Stack](#-tech-stack)
    - [**Frontend**](#frontend)
    - [**Backend**](#backend)
    - [**Development Tools**](#development-tools)
  - [📂 Project Structure](#-project-structure)
  - [📥 Installation](#-installation)
    - [**Prerequisites**](#prerequisites)
    - [**Quick Start**](#quick-start)
  - [⚙️ Environment Variables](#️-environment-variables)
    - [**Frontend (.env.local)**](#frontend-envlocal)
    - [**Backend (.env.development)**](#backend-envdevelopment)
  - [🏃 Running the Project](#-running-the-project)
    - [**Development**](#development)
    - [**Production Build**](#production-build)
    - [**Available Scripts**](#available-scripts)
  - [🛡️ Authentication \& Security](#️-authentication--security)
  - [🛠️ API Documentation](#️-api-documentation)

---

## 🚀 Features

### **Core Features**

✅ **Goal Tracking** – Set, monitor, and track progress toward personal and professional goals
✅ **Community Groups** – Create and join accountability groups for shared goal achievement
✅ **User Dashboard** – Comprehensive overview of goals, progress, and achievements
✅ **Gamification** – Earn rewards, badges, and points for achieving milestones
🔄 **Real-Time Notifications** – Stay updated with instant alerts *(in progress)*
✅ **Responsive Design** – Works seamlessly across desktop, tablet, and mobile

### **Military Support Features**

✅ **Anonymous Chat Rooms** – Peer support chat rooms for military members and veterans
✅ **Crisis Resources** – Integrated access to mental health and crisis support resources
✅ **Mood Check-in System** – Daily mood tracking with community insights
✅ **Military-Specific Resources** – Curated resources for VA services, benefits, and support

### **Subscription & Monetization**

✅ **Tiered Subscription Plans** – Basic, Pro, and Elite plans with free trial period
✅ **Stripe Integration** – Secure payment processing
🔄 **Premium Features** – Advanced analytics and exclusive content *(in development)*

---

## 🛠 Tech Stack

### **Frontend**

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript 5.9+
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query) (React Query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Payments**: [Stripe](https://stripe.com/)
- **Real-time**: Socket.IO Client
- **Charts**: [Recharts](https://recharts.org/)
- **Deployment**: [Vercel](https://vercel.com/)

### **Backend**

- **Runtime**: [Node.js 22+](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose 7](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: [Zod](https://zod.dev/) + [Express Validator](https://express-validator.github.io/)
- **Real-time**: [Socket.IO](https://socket.io/)
- **Job Queues**: [BullMQ](https://docs.bullmq.io/)
- **Email**: [Mailchimp Transactional](https://mailchimp.com/features/transactional-email/)
- **File Storage**: [AWS S3](https://aws.amazon.com/s3/)
- **Security**: Helmet, Rate Limiting, CORS, XSS Protection
- **Logging**: [Winston](https://github.com/winstonjs/winston)
- **Deployment**: [Railway](https://railway.app/)

### **Development Tools**

- **Language**: TypeScript 5.9+
- **Workspace Management**: [Turborepo](https://turborepo.com/)
- **Code Quality**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Type Generation**: [mongoose-tsgen](https://github.com/francescov1/mongoose-tsgen)
- **Testing**: [Jest](https://jestjs.io/) + [Cypress](https://www.cypress.io/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged)
- **Containerization**: [Docker](https://www.docker.com/) + Docker Compose
- **Version Control**: Git + GitHub

---

## 📂 Project Structure

```sh
accountability-buddy/
├── apps/                    # Application workspace
│   ├── backend/             # Express.js API server
│   │   ├── src/
│   │   │   ├── api/         # API layer (controllers, models, routes, services)
│   │   │   ├── config/      # Database and app configuration
│   │   │   ├── queues/      # Job queues and workers
│   │   │   ├── scripts/     # Utility scripts (seeding, cleanup)
│   │   │   ├── sockets/     # Socket.IO configuration
│   │   │   ├── test/        # Test files
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   ├── utils/       # Utility functions
│   │   │   ├── app.ts       # Express app setup
│   │   │   └── server.ts    # Server entry point
│   │   ├── logs/            # Application logs
│   │   ├── .env.example     # Environment variables template
│   │   ├── nodemon.json     # Nodemon configuration
│   │   ├── mtgen.config.json # Mongoose TypeScript generation
│   │   └── package.json
│   │
│   └── frontend/            # Next.js application
│       ├── src/
│       │   ├── app/         # Next.js App Router pages
│       │   ├── components/  # React components
│       │   ├── api/         # API client functions
│       │   ├── constants/   # Application constants
│       │   ├── context/     # React contexts
│       │   ├── data/        # Static data
│       │   ├── hooks/       # Custom React hooks
│       │   ├── lib/         # Library configurations
│       │   ├── types/       # TypeScript type definitions
│       │   └── utils/       # Utility functions
│       ├── public/          # Static assets
│       ├── cypress/         # E2E testing
│       ├── __mocks__/       # Jest mocks
│       ├── .env.example     # Environment variables template
│       ├── next.config.js   # Next.js configuration
│       ├── components.json  # shadcn/ui configuration
│       └── package.json
│
├── packages/                # Shared packages
│   ├── eslint-config/       # Shared ESLint configuration
│   ├── shared/              # Shared utilities and types
│   │   └── src/             # Socket events, pricing, categories
│   └── transactional/       # Email templates (React Email)
│       ├── emails/          # Email template components
│       └── types/           # Email-related types
│
├── docs/                    # Project documentation
│   ├── DOCKER_SETUP.md     # Docker setup instructions
│   └── SETUP.md            # Detailed setup instructions
│
├── .husky/                 # Git hooks
├── .vscode/                # VS Code workspace settings
├── .gitignore             # Git ignore rules
├── .prettierrc            # Prettier configuration
├── .nvmrc                 # Node version specification
├── backend.Dockerfile     # Backend Docker configuration
├── compose.yaml           # Docker Compose setup
├── package.json           # Root package.json (workspace)
├── turbo.json             # Turborepo configuration
├── railway.json           # Railway deployment config
├── README.md              # This file
└── LICENSE                # Project license
```

---

## 📥 Installation

### **Prerequisites**

- **Node.js** 22+ (Current: v22.20.0)
- **MongoDB** (local installation or cloud instance)
- **Git**
- **npm** 10+ (Current: v10.9.3)

### **Quick Start**

1. **Clone the repository**

   ```bash
   git clone https://github.com/krystleb45/accountability-buddy.git
   cd accountability-buddy
   ```

2. **Install dependencies**

   ```bash
   # Install Turborepo globally (optional)
   npm install turbo --global
   
   # Install all dependencies for the monorepo
   npm install
   ```

3. **Configure environment variables**

   ```bash
   # Frontend
   cd apps/frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration

   # Backend
   cd ../backend
   cp .env.example .env.development
   # Edit .env.development with your configuration
   ```

4. **Start development servers**

   ```bash
   turbo dev
   ```

5. **Access the application**
   - **Frontend**: <http://localhost:3000>
   - **Backend API**: <http://localhost:5050>
   - **API Documentation**: <http://localhost:5050/api-docs>

---

## ⚙️ Environment Variables

### **Frontend (.env.local)**

```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### **Backend (.env.development)**

```bash
# Server
PORT=5050
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/accountability-buddy

# Authentication
JWT_SECRET=your-jwt-secret-here
```

See `.env.example` files in each directory for complete variable lists.

---

## 🏃 Running the Project

### **Development**

```bash
turbo dev
```

### **Production Build**

```bash
# Build all apps using turbo
turbo build

# Or build individually
cd apps/backend && npm run build
cd apps/frontend && npm run build && npm start
```

### **Available Scripts**

- `npm run dev` / `turbo dev` - Start all development servers
- `npm run build` / `turbo build` - Build all apps for production
- `npm run lint` / `turbo lint` - Run code linting across workspace
- `npm run format` / `turbo format` - Format code with Prettier
- `npm run generate-mongoose-types` - Generate TypeScript types from Mongoose models
- `npm run prepare` - Set up Husky git hooks

---

## 🛡️ Authentication & Security

- **NextAuth.js** for frontend authentication
- **JWT tokens** for API authentication
- **Secure HTTP-only cookies** for session management
- **CORS configuration** for cross-origin requests
- **Rate limiting** on API endpoints
- **Input validation** and sanitization

---

## 🛠️ API Documentation

- **Swagger UI**: <http://localhost:5050/api-docs> (when backend is running)
- **API Base URL**: <http://localhost:5050/api>
- **Authentication**: Bearer token required for protected endpoints

---
**Last Updated**: November 22, 2025
**Version**: 1.0.0
**Status**: In Active Development
