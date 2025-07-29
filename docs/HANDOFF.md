# Accountability Buddy - Developer Handoff Documentation

## 🎯 Project Overview

**Accountability Buddy** is a web application that helps users achieve their goals through community support and tracking. It includes a military support section with anonymous chat functionality.

### Target Users

- People working on personal/professional goals
- Military personnel and veterans seeking peer support
- Individuals wanting accountability partnerships

## 🏗️ Technical Architecture

### Frontend (Next.js)

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **URL**: <https://accountability-buddy-clean.vercel.app>

### Backend (Express)

- **Framework**: Express.js + Node.js
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Deployment**: Railway
- **URL**: https://[your-railway-url]

### Repository Structure

```
accountability-buddy-clean/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   ├── components/      # React components
│   │   ├── api/             # API client functions
│   │   └── utils/           # Utility functions
│   ├── .env.local           # Environment variables
│   └── package.json
└── backend/                 # Express application
    ├── src/
    │   ├── api/
    │   │   ├── controllers/ # Route handlers
    │   │   ├── models/      # MongoDB schemas
    │   │   ├── routes/      # Express routes
    │   │   └── middleware/  # Auth, validation, etc.
    │   ├── config/          # Database config
    │   └── app.ts           # Express app setup
    ├── .env.development     # Environment variables
    └── package.json
```

## ✅ Current Status

### Working Features

- [x] User registration and login
- [x] Basic dashboard layout
- [x] Groups creation (with issues)
- [x] Military support page layout
- [x] Basic navigation and routing

### Broken/Incomplete Features

- [ ] **Groups authentication flow** - 401 errors after creation
- [ ] **Military support chat rooms** - WebSocket connection issues
- [ ] **Goals tracking system** - Incomplete implementation
- [ ] **User dashboard** - Missing core functionality
- [ ] **Achievements system** - Not implemented
- [ ] **Real-time notifications** - Not working

### Critical Issues to Fix

1. **Authentication Flow**: Groups work but subsequent API calls fail with 401
2. **API Proxy Routes**: Some military support endpoints missing
3. **WebSocket Connection**: Chat rooms not connecting properly
4. **Database Relationships**: User-goal-group associations need work
5. **State Management**: Inconsistent state handling across components

## 🚀 Development Setup

### Prerequisites

- Node.js 18+
- MongoDB instance
- Git

### Local Setup

1. Clone repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment files:

   ```bash
   cp .env.example .env.local
   cp .env.example .env.development
   ```

4. Update environment variables (see Environment Variables section)
5. Start development servers:

   ```bash
   turbo dev
   ```

### Environment Variables

**Frontend (.env.local):**

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[generate-secret]
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
BACKEND_URL=http://localhost:5050
```

**Backend (.env.development):**

```
PORT=5050
MONGODB_URI=[your-mongodb-connection]
JWT_SECRET=[generate-secret]
NODE_ENV=development
```

## 🎯 Scope of Work

### Phase 1: Critical Fixes (Week 1-2)

**Priority: HIGH**

- [ ] Fix groups authentication flow completely
- [ ] Resolve all 401 authentication errors
- [ ] Complete military support chat functionality
- [ ] Fix WebSocket connections
- [ ] Ensure all API endpoints work properly

### Phase 2: Core Features (Week 3-4)

**Priority: MEDIUM**

- [ ] Complete goals tracking system
- [ ] Implement user dashboard functionality
- [ ] Build achievements/rewards system
- [ ] Add user profile management
- [ ] Implement notifications system

### Phase 3: Polish & Launch (Week 5-6)

**Priority: LOW**

- [ ] UI/UX improvements and responsiveness
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Production deployment optimization
- [ ] Documentation and handover

## 🐛 Known Issues Log

### Authentication Issues

- **Issue**: Groups create successfully but subsequent API calls return 401
- **Root Cause**: Token not being properly forwarded through Next.js proxy routes
- **Status**: Partially fixed, needs completion

### Military Support

- **Issue**: Anonymous chat rooms not loading
- **Root Cause**: Missing API proxy routes and WebSocket connection issues
- **Status**: In progress

### Database Schema

- **Issue**: Inconsistent data relationships
- **Status**: Needs review and optimization

## 📚 Additional Resources

### Key Files to Review

- `/frontend/src/app/api/` - Next.js proxy routes
- `/backend/src/api/controllers/` - Backend controllers
- `/frontend/src/components/` - React components
- `/backend/src/api/models/` - Database schemas

### Documentation Links

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Socket.IO Docs](https://socket.io/docs/)

### Deployment URLs

- **Frontend**: [Vercel URL]
- **Backend**: [Railway URL]
- **Database**: [MongoDB Atlas URL]

## 🤝 Communication Expectations

### Preferred Communication

- **Primary**: [Your preferred method - Slack, email, etc.]
- **Code Reviews**: GitHub pull requests
- **Daily Updates**: [Your preference]

### Availability

- **Timezone**: [Your timezone]
- **Preferred Hours**: [Your available hours]
- **Response Time**: [Expected response time]

## 📝 Notes for Developer

### Code Style

- TypeScript strict mode enabled
- ESLint and Prettier configured
- Component naming: PascalCase
- File naming: kebab-case for pages, PascalCase for components

### Testing

- Currently no testing framework set up
- Would like tests implemented for core functionality

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design required

---

**Last Updated**: [Date]
**Project Owner**: [Your Name]
**Contact**: [Your Email]
