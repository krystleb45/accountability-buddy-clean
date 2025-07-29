# 🎯 Accountability Buddy

**Accountability Buddy** is a comprehensive web platform designed to help users achieve their goals through community support, progress tracking, and peer accountability. The platform includes specialized military support features with anonymous chat functionality and crisis resources.

## 📌 Table of Contents

- [🚀 Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [📥 Installation](#-installation)
- [⚙️ Environment Variables](#️-environment-variables)
- [🏃 Running the Project](#-running-the-project)
- [🛡️ Authentication & Security](#️-authentication--security)
- [🛠️ API Documentation](#️-api-documentation)
- [🚧 Current Status](#-current-status)
- [🐛 Known Issues](#-known-issues)
- [🤝 Contributing](#-contributing)
- [📞 Support](#-support)

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

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Payments**: [Stripe](https://stripe.com/)
- **Real-time**: Socket.IO Client
- **Deployment**: [Vercel](https://vercel.com/)

### **Backend**

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Real-time**: [Socket.IO](https://socket.io/)
- **Deployment**: [Railway](https://railway.app/)

### **Development Tools**

- **Language**: TypeScript
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git + GitHub
- **Environment**: Local development + cloud deployment
- **Workspace Management**: [Turborepo](https://turborepo.com/)

---

## 📂 Project Structure

```sh
accountability-buddy-clean/
├── apps/                    # Application workspace
│   ├── backend/             # Express.js API server
│   │   ├── src/
│   │   │   ├── api/         # API layer
│   │   │   ├── config/      # Database and app configuration
│   │   │   ├── constants/   # Application constants
│   │   │   ├── db/          # Database configuration
│   │   │   ├── jobs/        # Background jobs
│   │   │   ├── locales/     # Internationalization
│   │   │   ├── queues/      # Job queues
│   │   │   ├── scripts/     # Utility scripts
│   │   │   ├── sockets/     # Socket.IO configuration
│   │   │   ├── test/        # Test files
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   ├── utils/       # Utility functions
│   │   │   ├── validators/  # Input validation schemas
│   │   │   ├── app.ts       # Express app setup
│   │   │   └── server.ts    # Server entry point
│   │   ├── backup-models/   # Model backups
│   │   ├── public/          # Static assets
│   │   ├── uploads/         # File uploads
│   │   ├── .env.example     # Environment variables template
│   │   ├── nodemon.json     # Nodemon configuration
│   │   ├── railway.toml     # Railway deployment config
│   │   └── package.json
│   │
│   └── frontend/            # Next.js application
│       ├── src/
│       │   ├── app/         # Next.js App Router pages
│       │   ├── components/  # React components
│       │   ├── api/         # API client functions
│       │   ├── @types/      # TypeScript declarations
│       │   ├── config/      # Configuration files
│       │   ├── constants/   # Application constants
│       │   ├── context/     # React contexts
│       │   ├── data/        # Static data
│       │   ├── hooks/       # Custom React hooks
│       │   ├── providers/   # Context providers
│       │   ├── services/    # External service integrations
│       │   ├── settings/    # Application settings
│       │   ├── styles/      # CSS and styling
│       │   ├── types/       # TypeScript type definitions
│       │   ├── utils/       # Utility functions
│       │   └── env.client.ts # Client environment config
│       ├── public/          # Static assets
│       ├── scripts/         # Build and utility scripts
│       ├── cypress/         # E2E testing
│       ├── __mocks__/       # Jest mocks
│       ├── .env.example     # Environment variables template
│       ├── next.config.js   # Next.js configuration
│       ├── tailwind.config.js # Tailwind CSS configuration
│       └── package.json
│
├── docs/                    # Project documentation
│   ├── HANDOFF.md          # Developer handoff guide
│   ├── ISSUES.md           # Known issues and status
│   └── SETUP.md            # Detailed setup instructions
│
├── shared/                  # Shared utilities and types
│   ├── types/              # Shared TypeScript types
│   └── tsconfig.json       # Shared TypeScript config
│
├── .husky/                 # Git hooks
├── .editorconfig           # Editor configuration
├── .gitignore             # Git ignore rules
├── .prettierrc            # Prettier configuration
├── package.json           # Root package.json (workspace)
├── turbo.json             # Turborepo configuration
├── vercel.json            # Vercel deployment config
├── README.md              # This file
└── LICENSE                # Project license
```

---

## 📥 Installation

### **Prerequisites**

- **Node.js** 18+
- **MongoDB** (local installation or cloud instance)
- **Git**

### **Quick Start**

1. **Clone the repository**

   ```bash
   git clone https://github.com/krystleb45/accountability-buddy-clean.git
   cd accountability-buddy-clean
   ```

2. **Install dependencies**

   ```bash
   npm install turbo --global
   npm install # installs packages for both frontend and backend
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

- `turbo dev` - Start all development servers
- `turbo build` - Build all apps for production
- `turbo lint` - Run code linting across workspace
- `turbo test` - Run tests across workspace
- `npm run dev` - Individual app development (when in app directory)
- `npm run build` - Individual app build (when in app directory)

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

### **Key Endpoints**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `GET /api/military-support/resources` - Get support resources

---

## 🚧 Current Status

### **✅ Working Features**

- User registration and authentication
- Basic dashboard layout
- Group creation functionality
- Military support page structure
- Payment integration setup

### **🔄 In Progress**

- Groups authentication flow (401 errors after creation)
- Military support chat rooms
- WebSocket real-time connections
- Complete goals tracking system

### **📋 Planned Features**

- Advanced analytics dashboard
- Mobile app development
- Enhanced gamification
- Social features and sharing

For detailed status and known issues, see [docs/ISSUES.md](./docs/ISSUES.md).

---

## 🐛 Known Issues

- **Groups Authentication**: API calls return 401 after group creation
- **Chat Rooms**: WebSocket connections not establishing properly
- **Military Support**: Some endpoints returning 500 errors

See [docs/ISSUES.md](./docs/ISSUES.md) for complete issue tracking and status.

---

## 🤝 Contributing

### **Development Guidelines**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript and ESLint rules
4. Write clear commit messages
5. Submit a pull request

### **Code Style**

- **TypeScript** for all new code
- **Component naming**: PascalCase
- **File naming**: kebab-case for pages, PascalCase for components
- **ESLint + Prettier** for code formatting

---

## 📞 Support

### **Development Support**

- **Issues**: Create a GitHub issue for bugs or feature requests
- **Documentation**: Check [docs/](./docs/) folder for detailed guides
- **Setup Help**: See [docs/SETUP.md](./docs/SETUP.md) for troubleshooting

### **Contact**

- **Email**: [your-email@example.com]
- **Repository**: [GitHub Issues](https://github.com/krystleb45/accountability-buddy-clean/issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Express.js](https://expressjs.com/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- Real-time features powered by [Socket.IO](https://socket.io/)
- Authentication via [NextAuth.js](https://next-auth.js.org/)
- Database by [MongoDB](https://www.mongodb.com/)

---

**Last Updated**: July 30, 2025
**Version**: 1.0.0-dev
**Status**: In Active Development
