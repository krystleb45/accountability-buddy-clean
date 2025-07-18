# 🎯 Accountability Buddy Frontend

**Accountability Buddy** is a comprehensive goal-tracking and community platform that helps users achieve their objectives through accountability, progress tracking, and peer support. The platform includes specialized military support features with anonymous chat rooms and crisis resources.

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and modern React patterns for optimal performance and developer experience.

---

## 📌 Tech Stack

### **Core Framework**
- **[Next.js 14](https://nextjs.org/)** – App Router, SSR, API routes, and file-system routing
- **[TypeScript](https://www.typescriptlang.org/)** – Type safety and enhanced developer experience
- **[React 18](https://react.dev/)** – Latest React features with concurrent rendering

### **Styling & UI**
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** – Smooth animations and transitions
- **Custom Components** – Reusable UI components with consistent design

### **State Management & Data**
- **React Context API** – Local state management
- **Native fetch** – API communication with backend
- **Client-side caching** – Optimized data persistence

### **Authentication & Security**
- **[NextAuth.js](https://next-auth.js.org/)** – Secure authentication with JWT
- **Protected routes** – Route-level access control
- **CSRF protection** – Built-in security features

### **Payments & Subscriptions**
- **[Stripe](https://stripe.com/)** – Payment processing and subscription management
- **Tiered plans** – Free trial with premium features

### **Real-time Features**
- **[Socket.IO Client](https://socket.io/)** – Real-time communication for chat features
- **WebSocket connections** – Live updates and notifications

### **Development & Quality**
- **[ESLint](https://eslint.org/)** – Code quality and consistency
- **[Prettier](https://prettier.io/)** – Code formatting
- **TypeScript strict mode** – Enhanced type checking

---

## ✨ Features

### **Core Functionality**
- **Goal Management**: Create, edit, and track progress on personal and professional goals
- **Community Groups**: Join accountability groups for shared goal achievement
- **User Dashboard**: Comprehensive overview of progress, achievements, and activity
- **Progress Tracking**: Visual progress indicators and milestone celebrations

### **Military Support**
- **Anonymous Chat Rooms**: Peer support chat for military members and veterans
- **Crisis Resources**: Quick access to mental health and emergency resources
- **Mood Check-in System**: Daily mood tracking with community insights
- **Military Resources**: Curated links to VA services, benefits, and support

### **Gamification & Engagement**
- **Achievement System**: Earn rewards and badges for completing goals
- **Progress Visualization**: Charts and graphs for tracking improvement
- **Streak Tracking**: Maintain consistency with streak counters
- **Community Features**: Share progress and encourage others

### **Subscription Features**
- **Free Trial**: 14-day trial access to premium features
- **Tiered Plans**: Basic, Pro, and Elite subscription levels
- **Stripe Integration**: Secure payment processing
- **Feature Access Control**: Premium content and advanced analytics

### **Technical Features**
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **SEO Optimized**: Automatic metadata generation and search engine optimization
- **Accessibility**: ARIA support and keyboard navigation
- **Performance**: Optimized loading and caching strategies

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Backend**: Accountability Buddy backend server running

### Quick Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   - Frontend: http://localhost:3000
   - Ensure backend is running on http://localhost:5050

### Environment Configuration

Create `.env.local` from the template:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# API Configuration (IMPORTANT: Use Next.js proxy routes)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Backend URL (for server-side proxy forwarding)
BACKEND_URL=http://localhost:5050

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=AccountabilityBuddy
NEXT_PUBLIC_DEBUG=true
```

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # Next.js API routes (proxy to backend)
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── community/         # Community and groups pages
│   │   ├── goals/             # Goal management pages
│   │   ├── military-support/  # Military support features
│   │   └── auth/              # Authentication pages
│   │
│   ├── components/            # Reusable React components
│   │   ├── Dashboard/         # Dashboard-specific components
│   │   ├── Groups/            # Group management components
│   │   ├── MilitarySupport/   # Military support components
│   │   ├── UI/                # Generic UI components
│   │   └── Layout/            # Layout and navigation components
│   │
│   ├── api/                   # API client functions
│   │   ├── military-support/  # Military support API calls
│   │   └── auth/              # Authentication API calls
│   │
│   ├── utils/                 # Utility functions and helpers
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles and Tailwind config
│
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── tailwind.config.js         # Tailwind CSS configuration
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

---

## 🚀 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready application |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run type-check` | Run TypeScript type checking |

### Development Workflow

```bash
# Start development server
npm run dev

# The app will automatically reload when you make changes
# Check console for any errors or warnings
```

---

## 🔧 API Integration

### Next.js API Routes (Proxy)
The frontend uses Next.js API routes as a proxy layer to the Express backend:

```
Frontend → Next.js API Routes → Express Backend
```

**Why this approach?**
- ✅ Handles authentication automatically
- ✅ Provides CORS protection
- ✅ Enables server-side data fetching
- ✅ Centralizes API configuration

### Key API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/groups/*` - Group management
- `/api/military-support/*` - Military support features
- `/api/goals/*` - Goal tracking (planned)

---

## 🚧 Current Status

### ✅ Working Features
- User authentication (register/login)
- Basic dashboard layout
- Group creation and listing
- Military support page structure
- Responsive design implementation
- Payment integration setup

### 🔄 In Progress
- Complete group functionality (member management, messaging)
- Military support chat rooms
- Goal creation and tracking system
- Real-time notifications
- Advanced dashboard features

### 📋 Planned Features
- Advanced analytics and reporting
- Enhanced gamification features
- Mobile app version
- Social sharing capabilities
- AI-powered recommendations

For detailed status, see [../docs/ISSUES.md](../docs/ISSUES.md).

---

## 🎨 Styling & Components

### Tailwind CSS Configuration
- **Custom color palette** for brand consistency
- **Responsive breakpoints** for mobile-first design
- **Dark mode support** (planned)
- **Component-specific utilities**

### Component Library
```bash
# Example component usage
import { Button } from '@/components/UI/Button'
import { Card } from '@/components/UI/Card'
import { Modal } from '@/components/UI/Modal'
```

### Design System
- **Consistent spacing** using Tailwind's scale
- **Typography hierarchy** with defined font sizes
- **Color scheme** optimized for accessibility
- **Interactive states** for all UI elements

---

## 🔐 Authentication Flow

### NextAuth.js Integration
1. **User registration/login** through backend API
2. **JWT token** stored in secure HTTP-only cookies
3. **Automatic token refresh** for seamless sessions
4. **Protected route** middleware for access control

### Route Protection
```typescript
// Example protected page
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return <DashboardContent />
}
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (primary focus)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Touch-friendly interface elements
- Optimized navigation for small screens
- Progressive enhancement for larger displays

---

## 🧪 Testing (Planned)

### Testing Strategy
```bash
# Unit tests (planned)
npm run test

# E2E tests (planned)
npm run test:e2e

# Type checking
npm run type-check
```

### Testing Stack (Future)
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Cypress** - End-to-end testing
- **MSW** - API mocking

---

## 🚀 Deployment

### Vercel Deployment
This frontend is optimized for deployment on Vercel:

1. **Connect GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Automatic deployments** on push to main branch

### Environment Variables for Production
```bash
# Required for production
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
BACKEND_URL=https://your-backend-railway-url.com
```

---

## 🛠️ Development Guidelines

### Code Style
- **TypeScript** for all new components
- **Functional components** with hooks
- **Consistent naming**: PascalCase for components, camelCase for functions
- **Props interfaces** for all component props

### Component Patterns
```typescript
// Example component structure
interface ComponentProps {
  title: string
  onClick?: () => void
}

export default function Component({ title, onClick }: ComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      {onClick && (
        <button onClick={onClick} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Click me
        </button>
      )}
    </div>
  )
}
```

---

## 🤝 Contributing

### Development Process
1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow TypeScript** and ESLint guidelines
4. **Test thoroughly** in multiple browsers
5. **Update documentation** if needed
6. **Submit pull request**

### Code Review Checklist
- TypeScript types properly defined
- Components are accessible (ARIA attributes)
- Mobile responsiveness tested
- Performance optimized (no unnecessary re-renders)
- Error boundaries implemented where needed

---

## 📞 Support

### Getting Help
- **Setup Issues**: See [../docs/SETUP.md](../docs/SETUP.md)
- **API Issues**: Check backend documentation
- **UI Issues**: Inspect browser console for errors

### Common Issues
- **Environment variables not loading**: Restart development server
- **API calls failing**: Verify backend is running on port 5050
- **Authentication issues**: Check NEXTAUTH_SECRET configuration

---

**Last Updated**: [Current Date]
**Version**: 1.0.0-dev
**Next.js**: v14
**Node.js**: v18+
